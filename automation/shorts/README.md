# Algo Team Shorts: approved voice production

## Scope

This is the voice-and-caption part of the Shorts production pipeline, not a full research, video-rendering or YouTube-publishing agent. It runs on the isolated `automation/shorts-voice` branch. It does not change the website's `main` branch, deploy Pages, or upload videos to YouTube.

## One approved job

The owner approves a narration and its generation cost. Add exactly one new UTF-8 JSON request to `automation/shorts/requests/` on this branch. The push starts the workflow; adding approved requests is a paid action. Request files, source code and logs in this public repository must contain only public content. Never put credentials, customer data or internal company material in them.

The workflow takes `ELEVENLABS_API_KEY` from repository Actions Secrets, generates one MP3 with character-level timing, then builds SRT captions and word timings. It uses Roger (`CwhRBWXzGAHq8TQ4Fs17`) and `eleven_multilingual_v2` with the pilot's selected voice settings.

## Safeguards

- Both generation approval and suitable-plan confirmation must be true.
- One request per push; narration capped at 1,500 characters.
- No automatic API retry or GitHub run retry for a paid generation.
- Edited, reused or previously added request paths do not regenerate audio.
- HTTP redirects are refused to prevent credential forwarding.
- No raw provider error responses, request headers or secrets are logged.
- The key exists only in the generation step environment, not output artifacts.
- Workflow token permissions are read-only; checkout credentials are not persisted.
- Third-party Actions are pinned to commit SHAs.
- The key's provider-side 5,000-credit limit and expiry must be configured in ElevenLabs. This workflow cannot inspect or change those settings with a TTS-only key.

The code records the owner's paid-plan confirmation; it does not query the subscription API or certify licensing. Audio still requires a human pronunciation/content check before publication.

## Outputs

Actions saves `algoteam-voice-<run-id>` for 30 days. It contains MP3, original narration, SRT, alignment, words and a provenance manifest. Download accepted outputs before expiration. These artifacts are not a permanent content archive. No voice cloning, music generation, video generation or publishing is performed.

If a timeout occurs, the provider may already have charged the request. Check ElevenLabs history before approving a different job ID; do not blindly rerun.

## Offline validation

```sh
python3 -m unittest discover -s automation/shorts -p 'test_*.py' -v
python3 automation/shorts/generate_voice.py validate --request automation/shorts/requests/pilot01-paid-v1.json
```

Neither command calls ElevenLabs or consumes credits.

## References

- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
