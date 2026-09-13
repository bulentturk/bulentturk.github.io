"""Generate one owner-approved narration; never log keys or retry paid requests."""
from __future__ import annotations

import argparse
import base64
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import textwrap
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[2]
REQUEST_DIR = ROOT / 'automation/shorts/requests'
VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17'
MODEL_ID = 'eleven_multilingual_v2'
SETTINGS = dict(stability=0.5, similarity_boost=0.75, style=0.0,
                use_speaker_boost=True, speed=1.0)
MAX_CHARACTERS = 1500


class SafeError(Exception):
    """An error message safe for public Actions logs."""


def load_request(path: Path) -> dict:
    path = path.resolve()
    if path.parent != REQUEST_DIR.resolve() or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,59}\.json', path.name):
        raise SafeError('Request must be inside automation/shorts/requests.')
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('schema_version') != 1 or data.get('job_id') != path.stem:
        raise SafeError('Invalid request schema or job ID.')
    if data.get('approved_for_generation') is not True:
        raise SafeError('Owner approval is required before paid generation.')
    if data.get('commercial_plan_confirmed_by_user') is not True:
        raise SafeError('Commercial plan confirmation is required.')
    text = data.get('text')
    if not isinstance(text, str) or not 1 <= len(text.strip()) <= MAX_CHARACTERS:
        raise SafeError('Narration must contain 1-1500 characters.')
    if data.get('voice_id') != VOICE_ID or data.get('model_id') != MODEL_ID:
        raise SafeError('Voice/model changes require configuration review.')
    data['text'] = text.strip()
    return data


def first_attempt() -> None:
    if os.environ.get('GITHUB_RUN_ATTEMPT', '1') != '1':
        raise SafeError('Paid reruns disabled; inspect provider history before a new job.')


def plan() -> None:
    first_attempt()
    before, after = os.environ.get('PUSH_BEFORE', ''), os.environ.get('PUSH_AFTER', '')
    if not all(re.fullmatch(r'[0-9a-f]{40}', x) for x in (before, after)) or before == '0' * 40:
        raise SafeError('Expected a normal push, not a branch-creation event.')
    files = subprocess.check_output(
        ['git', 'diff', '--diff-filter=A', '--name-only', before, after,
         '--', 'automation/shorts/requests/'], cwd=ROOT, text=True).splitlines()
    files = [p for p in files if p.endswith('.json')]
    if len(files) > 1:
        raise SafeError('Only one new request per push is allowed.')
    output = Path(os.environ['GITHUB_OUTPUT'])
    if not files:
        with output.open('a', encoding='utf-8') as handle:
            handle.write('generate=false\n')
        print('No newly added request; no API call.')
        return
    data = load_request(ROOT / files[0])
    history = subprocess.check_output(
        ['git', 'log', '--diff-filter=A', '--format=%H', before, '--', files[0]],
        cwd=ROOT, text=True).strip()
    if history:
        raise SafeError('This request path has already been used; no repeat synthesis.')
    with output.open('a', encoding='utf-8') as handle:
        handle.write(f'generate=true\nrequest_file=automation/shorts/requests/{data["job_id"]}.json\n')
    print(f'Approved: {data["job_id"]}, {len(data["text"])} characters; at most ONE paid API call.')


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward credentials to a redirect destination.


def synthesize(data: dict, key: str) -> dict:
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format=mp3_44100_128'
    payload = dict(text=data['text'], model_id=MODEL_ID, voice_settings=SETTINGS,
                   seed=13092026, apply_text_normalization='auto')
    request = Request(url, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                      method='POST', headers={'xi-api-key': key, 'Content-Type': 'application/json',
                                              'Accept': 'application/json'})
    try:
        with build_opener(NoRedirect()).open(request, timeout=180) as response:
            raw = response.read(16_000_001)
        if len(raw) > 16_000_000:
            raise SafeError('Response too large. No automatic retry.')
        return json.loads(raw)
    except HTTPError as error:
        hints = {401: 'Check key validity, expiry and TTS permission.',
                 403: 'Check TTS permission and voice availability.',
                 404: 'Configured voice may be unavailable.',
                 422: 'Provider rejected a request setting.',
                 429: 'Check credits, key limits and rate limits.'}
        raise SafeError(f'ElevenLabs HTTP {error.code}. {hints.get(error.code, "Request failed.")} No automatic retry.') from None
    except (URLError, TimeoutError):
        raise SafeError('Network error: request may have been charged. Check history; no automatic retry.') from None


def words_from_alignment(alignment: dict) -> list[dict]:
    chars = alignment.get('characters', [])
    starts = alignment.get('character_start_times_seconds', [])
    ends = alignment.get('character_end_times_seconds', [])
    if not chars or len(chars) != len(starts) or len(chars) != len(ends):
        raise SafeError('Missing alignment; generated audio is preserved for review.')
    words, word, start, end, previous = [], '', 0.0, 0.0, -1.0
    for char, a, b in zip(chars, starts, ends):
        if not isinstance(char, str) or not all(isinstance(x, (int, float)) and math.isfinite(x) for x in (a, b)):
            raise SafeError('Invalid alignment types; audio preserved.')
        if a < 0 or b < a or a < previous:
            raise SafeError('Invalid alignment chronology; audio preserved.')
        previous = a
        if char.isspace():
            if word:
                words.append(dict(text=word, start=start, end=end))
                word = ''
        else:
            if not word:
                start = a
            word += char
            end = b
    if word:
        words.append(dict(text=word, start=start, end=end))
    if not words:
        raise SafeError('Alignment contains no words.')
    return words


def stamp(seconds: float) -> str:
    hours, rest = divmod(max(0, round(seconds * 1000)), 3_600_000)
    minutes, rest = divmod(rest, 60_000)
    seconds, millis = divmod(rest, 1000)
    return f'{hours:02}:{minutes:02}:{seconds:02},{millis:03}'


def captions(words: list[dict]) -> str:
    groups, group = [], []
    for word in words:
        length = sum(len(w['text']) + 1 for w in group) + len(word['text'])
        if group and (length > 58 or word['end'] - group[0]['start'] > 4.2 or word['start'] - group[-1]['end'] > 0.6):
            groups.append(group)
            group = []
        group.append(word)
        if word['text'].endswith(('.', '!', '?')):
            groups.append(group)
            group = []
    if group:
        groups.append(group)
    lines = []
    for index, group in enumerate(groups, 1):
        text = ' '.join(w['text'] for w in group)
        end = max(group[-1]['end'], group[0]['start'] + 0.04)
        if index < len(groups):
            end = min(end, groups[index][0]['start'])
        lines.append(f'{index}\n{stamp(group[0]["start"])} --> {stamp(end)}\n' +
                     textwrap.fill(text, width=30, break_long_words=False, break_on_hyphens=False))
    return '\n\n'.join(lines) + '\n'


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def generate(path: Path) -> None:
    first_attempt()
    data = load_request(path)
    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    if not key:
        raise SafeError('ELEVENLABS_API_KEY is missing; add the repository Actions secret.')
    output = ROOT / 'voice-output' / data['job_id']
    if output.exists():
        raise SafeError('Output exists; refusing duplicate synthesis.')
    output.mkdir(parents=True)
    write_json(output / 'request.json', data)
    (output / 'narration.txt').write_text(data['text'] + '\n', encoding='utf-8')
    result = synthesize(data, key)
    encoded = result.get('audio_base64', '')
    if not isinstance(encoded, str) or not encoded:
        raise SafeError('Provider returned no audio; no automatic retry.')
    audio = base64.b64decode(encoded, validate=True)
    if len(audio) < 1000:
        raise SafeError('Provider audio unexpectedly small.')
    (output / 'narration.mp3').write_bytes(audio)
    alignment = result.get('alignment') or result.get('normalized_alignment') or {}
    write_json(output / 'alignment.json', alignment)
    words = words_from_alignment(alignment)
    write_json(output / 'words.json', words)
    (output / 'captions.srt').write_text(captions(words), encoding='utf-8')
    write_json(output / 'manifest.json', {
        'job_id': data['job_id'], 'generated_at_utc': datetime.now(timezone.utc).isoformat(),
        'voice_id': VOICE_ID, 'model_id': MODEL_ID, 'voice_settings': SETTINGS,
        'input_characters': len(data['text']), 'speech_end_seconds': words[-1]['end'],
        'audio_sha256': hashlib.sha256(audio).hexdigest(),
        'text_sha256': hashlib.sha256(data['text'].encode('utf-8')).hexdigest(),
        'github_commit': os.environ.get('GITHUB_SHA'), 'github_run_id': os.environ.get('GITHUB_RUN_ID'),
        'commercial_plan_confirmed_by_user': True, 'provider_subscription_not_read': True,
        'requires_human_audio_review': True, 'published': False,
    })
    summary = f'Generated {data["job_id"]}: {len(data["text"])} characters; speech ends at {words[-1]["end"]:.2f}s. Review required; nothing published.'
    print(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a', encoding='utf-8') as handle:
            handle.write('## Algo Team voice output\n\n' + summary + '\n\nMP3, SRT, word timing and provenance are in the run artifact.\n')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'generate', 'validate'])
    parser.add_argument('--request', default=os.environ.get('REQUEST_FILE', ''))
    args = parser.parse_args()
    try:
        if args.mode == 'plan':
            plan()
        elif args.mode == 'generate':
            generate(ROOT / args.request)
        else:
            data = load_request(ROOT / args.request)
            print(f'Valid: {data["job_id"]}, {len(data["text"])} characters. No API call.')
        return 0
    except SafeError as error:
        print(f'ERROR: {error}', file=sys.stderr)
    except Exception:
        print('ERROR: validation/output processing failed; no automatic retry.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
