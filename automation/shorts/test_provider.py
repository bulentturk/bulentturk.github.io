"""Credential-safe diagnostics tests. These tests never contact ElevenLabs."""
import io
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError
import provider

class ProviderTests(unittest.TestCase):
    def data(self):
        return dict(text='Merhaba.', voice_id='CwhRBWXzGAHq8TQ4Fs17', model_id='eleven_multilingual_v2')

    def test_legacy_code(self):
        raw=json.dumps({'detail':{'status':'invalid_api_key','message':'secret-value'}}).encode()
        self.assertEqual(provider.classify_error(raw,'secret-value'), ('invalid_api_key','authentication'))

    def test_current_code(self):
        raw=json.dumps({'detail':{'code':'quota_exceeded','message':'Private account details'}}).encode()
        self.assertEqual(provider.classify_error(raw,'secret-value'), ('quota_exceeded','quota'))

    def test_untrusted_code_is_not_returned(self):
        raw=json.dumps({'detail':{'code':'sk_private','message':'sk_private'}}).encode()
        self.assertNotIn('sk_private', str(provider.classify_error(raw,'sk_private')))

    def test_non_json(self):
        self.assertEqual(provider.classify_error(b'<html>private</html>','key'), ('non_json_response','gateway_or_network'))

    def test_permission_category(self):
        raw=json.dumps({'detail':{'code':'unlisted_error','message':'Missing text to speech permission'}}).encode()
        self.assertEqual(provider.classify_error(raw,'key'), ('unknown','permission'))

    def test_redirects_disabled(self):
        self.assertIsNone(provider.NoRedirect().redirect_request(None,None,302,None,None,'https://example.com'))

    def test_reject_bad_key_before_network(self):
        with patch.object(provider,'build_opener') as opener:
            with self.assertRaises(provider.ProviderError) as caught:
                provider.synthesize(self.data(),'bad\nkey')
            self.assertFalse(caught.exception.request_sent)
            opener.assert_not_called()

    def test_one_attempt_and_no_raw_error(self):
        raw=json.dumps({'detail':{'status':'invalid_api_key','message':'top-secret'}}).encode()
        err=HTTPError('https://api.elevenlabs.io',400,'Bad Request',{},io.BytesIO(raw))
        with patch.object(provider,'build_opener') as opener:
            opener.return_value.open.side_effect=err
            with self.assertRaises(provider.ProviderError) as caught:
                provider.synthesize(self.data(),'top-secret')
            self.assertEqual(opener.return_value.open.call_count,1)
            self.assertNotIn('top-secret',str(caught.exception))
            self.assertEqual(caught.exception.http_status,400)

    def test_network_error_not_retried(self):
        with patch.object(provider,'build_opener') as opener:
            opener.return_value.open.side_effect=URLError('private details')
            with self.assertRaises(provider.ProviderError) as caught:
                provider.synthesize(self.data(),'top-secret')
            self.assertEqual(opener.return_value.open.call_count,1)
            self.assertEqual(caught.exception.category,'billing_status_uncertain')

if __name__ == '__main__':
    unittest.main()
