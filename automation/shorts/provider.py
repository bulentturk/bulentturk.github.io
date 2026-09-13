"""ElevenLabs transport with bounded requests and credential-safe diagnostics."""
from __future__ import annotations
import json
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

MAX_RESPONSE_BYTES = 16_000_000
CODES = {
    'invalid_api_key', 'missing_api_key', 'invalid_authorization', 'missing_permissions',
    'insufficient_permissions', 'permission_denied', 'voice_not_found', 'voice_not_allowed',
    'model_not_found', 'invalid_model_id', 'model_can_not_do_text_to_speech',
    'quota_exceeded', 'insufficient_credits', 'max_character_limit_exceeded',
    'too_many_concurrent_requests', 'rate_limit_exceeded', 'system_busy',
    'invalid_request', 'invalid_parameters', 'invalid_voice_settings',
    'invalid_output_format', 'voice_limit_reached', 'only_for_creator',
    'paid_plan_required', 'subscription_required', 'api_key_expired', 'key_expired',
    'api_key_limit_exceeded', 'detected_unusual_activity', 'unusual_activity',
    'invalid_text', 'invalid_language_code', 'unsupported_language',
    'text_to_speech_disabled', 'voice_requires_payment', 'request_invalid',
}

class ProviderError(Exception):
    def __init__(self, http_status=None, code='unknown', category='unknown', request_sent=True):
        self.http_status = http_status
        self.code = code
        self.category = category
        self.request_sent = request_sent
        super().__init__(f'Provider rejected request: HTTP {http_status}; code={code}; category={category}. No automatic retry.')

    def report(self):
        return dict(http_status=self.http_status, code=self.code, category=self.category,
                    request_sent=self.request_sent, automatic_retry=False,
                    raw_response_saved=False)

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def classify_error(raw: bytes, key: str) -> tuple[str, str]:
    """Never return provider-supplied text, identifiers or credentials."""
    try:
        data = json.loads(raw)
        detail = data.get('detail', data)
        if not isinstance(detail, dict):
            return 'unknown', 'validation' if isinstance(detail, list) else 'unknown'
        code = detail.get('code') or detail.get('status')
        safe_code = code if isinstance(code, str) and code in CODES and code != key else 'unknown'
        message = str(detail.get('message', '')).replace(key, '[redacted]') if key else ''
        text = f'{safe_code} {message}'.lower()
        checks = [
            ('authentication', ('invalid api key', 'invalid_api_key', 'missing_api_key', 'api_key_expired', 'expired api', 'authentication')),
            ('permission', ('permission', 'not allowed', 'scope')),
            ('quota', ('quota', 'credit limit', 'insufficient credits', 'not enough credits')),
            ('subscription', ('subscription', 'paid plan', 'creator tier', 'free tier', 'payment')),
            ('voice', ('voice',)), ('model', ('model',)),
            ('normalization', ('normalization',)), ('output_format', ('output_format', 'output format')),
            ('validation', ('validation', 'invalid parameter', 'invalid request', 'character limit')),
            ('rate_limit', ('rate limit', 'concurrent', 'system busy')),
            ('network_policy', ('unusual activity', 'proxy', 'blocked', 'firewall')),
        ]
        category = next((category for category, terms in checks if any(t in text for t in terms)), 'unknown')
        return safe_code, category
    except (ValueError, TypeError, AttributeError):
        return 'non_json_response', 'gateway_or_network'


def synthesize(data: dict, key: str) -> dict:
    """One POST only. No model fallback, redirects or hidden retries."""
    if not key or not key.isascii() or any(c.isspace() for c in key):
        raise ProviderError(code='invalid_key_format', category='configuration', request_sent=False)
    if data.get('voice_id') != 'CwhRBWXzGAHq8TQ4Fs17' or data.get('model_id') != 'eleven_multilingual_v2':
        raise ProviderError(code='unapproved_voice_model', category='configuration', request_sent=False)
    payload = {
        'text': data['text'], 'model_id': data['model_id'],
        'voice_settings': dict(stability=0.5, similarity_boost=0.75, style=0.0,
                               use_speaker_boost=True, speed=1.0),
    }
    url = 'https://api.elevenlabs.io/v1/text-to-speech/CwhRBWXzGAHq8TQ4Fs17/with-timestamps?output_format=mp3_44100_128'
    request = Request(url, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                      method='POST', headers={'xi-api-key': key, 'Content-Type': 'application/json',
                      'Accept': 'application/json', 'User-Agent': 'AlgoTeam-Shorts/1.0'})
    try:
        with build_opener(NoRedirect()).open(request, timeout=180) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            raise ProviderError(code='response_too_large', category='output_validation')
        result = json.loads(raw)
        if not isinstance(result, dict):
            raise ProviderError(code='invalid_response', category='output_validation')
        return result
    except HTTPError as error:
        code, category = classify_error(error.read(8192), key)
        raise ProviderError(error.code, code, category) from None
    except (URLError, TimeoutError, OSError):
        raise ProviderError(code='network_error', category='billing_status_uncertain') from None
    except (ValueError, TypeError):
        raise ProviderError(code='invalid_response', category='billing_status_uncertain') from None
