"""Run the approved voice worker and always write a safe machine-readable status."""
from __future__ import annotations
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys
import generate_voice as voice
import provider


def main() -> int:
    report = dict(state='validating', started_at_utc=datetime.now(timezone.utc).isoformat(),
                  run_id=os.environ.get('GITHUB_RUN_ID'), auto_publish=False,
                  automatic_retry=False, secret_value_logged=False)
    code = 1
    try:
        voice.first_attempt()
        request_file = os.environ.get('REQUEST_FILE', '')
        data = voice.load_request(voice.ROOT / request_file)
        report['job_id'] = data['job_id']
        report['input_characters'] = len(data['text'])
        report['state'] = 'generating'
        voice.synthesize = provider.synthesize
        voice.generate(voice.ROOT / request_file)
        report['state'] = 'awaiting_audio_review'
        report['next_step'] = 'Human audio review, then video rendering. No YouTube publication.'
        report['output_directory'] = f'voice-output/{data["job_id"]}'
        code = 0
    except provider.ProviderError as error:
        report['state'] = 'blocked_provider'
        report['provider_error'] = error.report()
        report['next_step'] = 'Resolve the classified error before approving any new paid request.'
        print(str(error), file=sys.stderr)
    except voice.SafeError as error:
        report['state'] = 'blocked_configuration'
        report['error'] = str(error)
        print(str(error), file=sys.stderr)
    except Exception:
        report['state'] = 'blocked_output_review'
        report['error'] = 'Unexpected processing error. Check existing audio before any new synthesis.'
        print(report['error'], file=sys.stderr)
    finally:
        report['finished_at_utc'] = datetime.now(timezone.utc).isoformat()
        output = voice.ROOT / 'agent-output'
        output.mkdir(exist_ok=True)
        (output / 'status.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        summary = os.environ.get('GITHUB_STEP_SUMMARY')
        if summary:
            with Path(summary).open('a', encoding='utf-8') as handle:
                handle.write('\n## Agent status\n\n```json\n' + json.dumps(report, indent=2) + '\n```\n')
    return code

if __name__ == '__main__':
    raise SystemExit(main())
