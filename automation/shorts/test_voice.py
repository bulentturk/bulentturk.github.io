"""Offline tests: no credentials, provider requests or credit use."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import generate_voice as g


class VoiceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)
        self.request = dict(schema_version=1, job_id='test', approved_for_generation=True,
                            commercial_plan_confirmed_by_user=True, voice_id=g.VOICE_ID,
                            model_id=g.MODEL_ID, text='Merhaba.')

    def load(self, data):
        path = self.folder / 'test.json'
        path.write_text(json.dumps(data), encoding='utf-8')
        with patch.object(g, 'REQUEST_DIR', self.folder):
            return g.load_request(path)

    def test_valid(self):
        self.assertEqual(self.load(self.request)['text'], 'Merhaba.')

    def test_approval_required(self):
        data = copy.deepcopy(self.request)
        data['approved_for_generation'] = False
        with self.assertRaises(g.SafeError): self.load(data)

    def test_plan_confirmation_required(self):
        data = copy.deepcopy(self.request)
        data['commercial_plan_confirmed_by_user'] = False
        with self.assertRaises(g.SafeError): self.load(data)

    def test_character_limit(self):
        data = copy.deepcopy(self.request)
        data['text'] = 'a' * (g.MAX_CHARACTERS + 1)
        with self.assertRaises(g.SafeError): self.load(data)

    def test_voice_model_allowlist(self):
        for key in ('voice_id', 'model_id'):
            data = copy.deepcopy(self.request)
            data[key] = 'unexpected'
            with self.assertRaises(g.SafeError): self.load(data)

    def test_reject_outside_directory(self):
        with self.assertRaises(g.SafeError): g.load_request(Path('/tmp/test.json'))

    def test_reject_mismatched_id(self):
        data = copy.deepcopy(self.request)
        data['job_id'] = 'different'
        with self.assertRaises(g.SafeError): self.load(data)

    def test_alignment(self):
        text = 'Merhaba dunya!'
        a = dict(characters=list(text), character_start_times_seconds=[i / 10 for i in range(len(text))],
                 character_end_times_seconds=[(i + 1) / 10 for i in range(len(text))])
        words = g.words_from_alignment(a)
        self.assertEqual([w['text'] for w in words], ['Merhaba', 'dunya!'])
        srt = g.captions(words)
        self.assertIn('00:00:00,000 --> 00:00:01,400', srt)
        self.assertIn('Merhaba dunya!', srt)

    def test_bad_alignment(self):
        for a in ({}, dict(characters=['a'], character_start_times_seconds=[float('nan')],
                           character_end_times_seconds=[1])):
            with self.assertRaises(g.SafeError): g.words_from_alignment(a)

    def test_time_carry(self):
        self.assertEqual(g.stamp(59.9999), '00:01:00,000')

    def test_redirect_disabled(self):
        self.assertIsNone(g.NoRedirect().redirect_request(None, None, 302, None, None, 'https://example.com'))

    def test_no_paid_rerun(self):
        with patch.dict('os.environ', {'GITHUB_RUN_ATTEMPT': '2'}):
            with self.assertRaises(g.SafeError): g.generate(Path('unused'))


if __name__ == '__main__':
    unittest.main()
