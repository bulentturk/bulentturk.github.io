"""Credential-safe diagnostic. Never synthesizes, retries or exposes a key."""
from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ENDPOINT = 'https://api.elevenlabs.io/v1/user'
LABELS = {'algoteam-shorts', 'elevenlabs_api_key', 'your_api_key',
          'your_elevenlabs_api_key', 'api_key', 'xi-api-key'}
SAFE_CODES = {'invalid_api_key', 'missing_api_key', 'invalid_authorization',
              'api_key_expired', 'key_expired', 'missing_permissions',
              'insufficient_permissions', 'permission_denied',
              'detected_unusual_activity', 'unusual_activity'}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def inspect_shape(raw: str) -> str:
    """Return fixed categories only: no value, length, prefix or fingerprint."""
    value = raw.strip()
    if not value:
        return 'missing'
    if value.casefold() in LABELS:
        return 'copied_name_or_placeholder'
    if any(marker in value for marker in ('*', '...', '\u2022', '\u2026')):
        return 'masked_or_truncated_copy'
    if value.startswith(('\"', "'", '`', '{', '[')):
        return 'quoted_or_structured_value'
    if value.casefold().startswith(('bearer ', 'xi-api-key:', 'elevenlabs_api_key=', 'export ')):
        return 'copied_header_or_assignment'
    if not value.isascii() or any(c.isspace() for c in value):
        return 'non_ascii_or_internal_whitespace'
    return 'no_obvious_copy_format_error'


def safe_error_code(raw: bytes) -> str:
    try:
        data = json.loads(raw)
        detail = data.get('detail', data)
        if not isinstance(detail, dict):
            return 'unknown'
        code = detail.get('code') or detail.get('status')
        return code if isinstance(code, str) and code in SAFE_CODES else 'unknown'
    except (ValueError, TypeError, AttributeError):
        return 'unknown'


def check(key: str) -> dict:
    report = {'synthesis_requests': 0, 'authentication_requests': 0,
              'secret_value_logged': False, 'automatic_retry': False,
              'credential_shape': inspect_shape(key)}
    if report['credential_shape'] != 'no_obvious_copy_format_error':
        report['state'] = 'blocked_copy_format'
        return report
    key = key.strip()
    request = Request(ENDPOINT, method='GET', headers={
        'xi-api-key': key, 'Accept': 'application/json',
        'User-Agent': 'AlgoTeam-Credential-Check/1.0'})
    report['authentication_requests'] = 1
    try:
        with build_opener(NoRedirect()).open(request, timeout=25) as response:
            # Do not read, log or save the returned account data.
            report['http_status'] = response.status
            report['state'] = 'authentication_accepted'
    except HTTPError as error:
        report['http_status'] = error.code
        report['provider_code'] = safe_error_code(error.read(8192))
        if report['provider_code'] in {'missing_permissions', 'insufficient_permissions', 'permission_denied'}:
            report['state'] = 'read_endpoint_scope_restricted'
        elif report['provider_code'] in {'invalid_api_key', 'missing_api_key', 'invalid_authorization', 'api_key_expired', 'key_expired'}:
            report['state'] = 'authentication_rejected'
        else:
            report['state'] = 'provider_rejected'
    except (URLError, TimeoutError, OSError):
        report['state'] = 'network_failure'
    except Exception:
        report['state'] = 'diagnostic_failure'
    return report


def self_test() -> None:
    cases = [('', 'missing'), ('AlgoTeam-Shorts', 'copied_name_or_placeholder'),
             ('ELEVENLABS_API_KEY', 'copied_name_or_placeholder'),
             ('sk_****abcd', 'masked_or_truncated_copy'),
             ('sk_...abcd', 'masked_or_truncated_copy'),
             ('\u2022\u2022abcd', 'masked_or_truncated_copy'),
             ('\"fictional\"', 'quoted_or_structured_value'),
             ('xi-api-key: fictional', 'copied_header_or_assignment'),
             ('ELEVENLABS_API_KEY=fictional', 'copied_header_or_assignment'),
             ('a b', 'non_ascii_or_internal_whitespace'),
             ('fictional-test-input-only', 'no_obvious_copy_format_error')]
    for value, expected in cases:
        assert inspect_shape(value) == expected
    assert check('AlgoTeam-Shorts')['authentication_requests'] == 0
    assert safe_error_code(b'{"detail":{"status":"invalid_api_key"}}') == 'invalid_api_key'
    assert safe_error_code(b'{"detail":{"code":"DO_NOT_LOG_UNTRUSTED_TEXT"}}') == 'unknown'
    assert safe_error_code(b'invalid json') == 'unknown'
    assert NoRedirect().redirect_request(None, None, 302, None, None, 'https://example.com') is None
    print('16 offline diagnostic checks passed. No HTTP or synthesis requests.')


def main() -> int:
    if '--self-test' in sys.argv:
        self_test()
        return 0
    report = check(os.environ.get('ELEVENLABS_API_KEY', ''))
    report['checked_at_utc'] = datetime.now(timezone.utc).isoformat()
    report['github_run_id'] = os.environ.get('GITHUB_RUN_ID')
    output = Path('credential-check-output')
    output.mkdir(exist_ok=True)
    rendered = json.dumps(report, indent=2) + '\n'
    (output / 'status.json').write_text(rendered, encoding='utf-8')
    print(rendered)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with Path(summary).open('a', encoding='utf-8') as handle:
            handle.write('## Credential check (no synthesis)\n\n```json\n' + rendered + '```\n')
    # A completed diagnostic does not mean authentication succeeded; read state.
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
