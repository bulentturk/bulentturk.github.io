# Algo Team Shorts: approved voice agent

## Current scope

This is a working execution framework for the voice-and-caption worker, NOT a completed autonomous research, video-rendering or YouTube-publishing agent. Live synthesis remains blocked until valid ElevenLabs authentication is provided. It runs on the isolated `automation/shorts-voice` branch, without changing the website's `main` branch or deploying Pages.

The owner's agreed editorial scope and branding are in `agent-contract.json`. The final video remains subject to the owner's review. No schedule or autonomous publication is enabled.

## One approved job

The owner approves narration and bounded synthesis. Add exactly one new UTF-8 JSON request to `automation/shorts/requests/` on this branch. A request-file push starts the worker. Code changes run offline tests but do not synthesize unless a new approved request is also added.

Request files, source and logs in this PUBLIC repository must contain public content only. Never add credentials, internal company information or customer data.

The worker takes `ELEVENLABS_API_KEY` from repository Actions Secrets and requests one MP3 with character-level timing. It produces SRT captions, word timing and a provenance manifest. Roger (`CwhRBWXzGAHq8TQ4Fs17`) and `eleven_multilingual_v2` remain fixed to the selected pilot configuration.

## Execution states

`validating -> generating -> awaiting_audio_review`

Failures stop at `blocked_configuration`, `blocked_provider` or `blocked_output_review`. The safe `agent-output/status.json` describes the last execution. Provider errors are classified without printing the response body, key, account identifiers or request headers. An error does not trigger another API call.

## Safeguards

- Generation approval and suitable-plan confirmation must both be true.
- One new request per push; maximum 1,500 characters and one provider POST per execution.
- No automatic API retries, model fallbacks or paid workflow reruns.
- Editing an existing request does not generate another recording.
- Previously added paths cannot be reused after deletion.
- Identical text under a NEW job ID is not automatically deduplicated: the operator must inspect prior outputs before approving a retry.
- HTTP redirects are refused. The endpoint is fixed to `api.elevenlabs.io`.
- The key is present only in the generation step, not stored in artifacts or source.
- The workflow token is read-only; checkout credentials are not persisted.
- Third-party Actions are pinned to commit SHAs.
- Provider-side credit limits and key expiry are managed in ElevenLabs; this TTS-only worker cannot inspect or change them.
- No automatic publishing, voice cloning or private-company content.

## Outputs

The workflow retains `algoteam-agent-<run-id>` for 30 days. On success it includes MP3, narration text, SRT, alignment, words, provenance manifest and agent status. On failure it preserves the status and any files already generated. Download accepted output before expiration; this is not a permanent archive.

The code records the owner's suitable-plan confirmation, not an independent subscription check or legal licensing certification. Audio pronunciation and technical content still require review before publication.

## Confirmed setup result - 2026-09-13

- Run `34759359566`: the secret was missing; no provider request was sent.
- Run `34759561983`: the secret was available to the job, but the provider returned HTTP 400 without an exposed reason.
- Run `34759716096`: bounded 85-character opening-only diagnostic. Provider returned HTTP 400, code `invalid_api_key`, category `authentication`. No audio was returned.

This is now an ElevenLabs authentication issue, not a missing GitHub repository secret. Increasing repository permissions does not change whether ElevenLabs accepts the stored value.

Recovery: replace the VALUE of the existing repository Actions secret `ELEVENLABS_API_KEY` with a valid ElevenLabs API key. Do not put the key in source, chat, logs, issues or screenshots. Then have the operator approve one fresh diagnostic request. Do not rerun failed paid executions or blindly regenerate the complete narration. If an earlier result is uncertain, inspect provider history first.

## Offline validation

```sh
python3 -m unittest discover -s automation/shorts -p 'test_*.py' -v
python3 automation/shorts/generate_voice.py validate --request automation/shorts/requests/pilot01-paid-v1.json
```

Neither command contacts ElevenLabs or consumes synthesis credits.

## Remaining integrations

1. Valid authentication and successful live MP3/SRT validation.
2. Connect the accepted video renderer and original logo, using word timing.
3. Add source discovery and editorial review, with primary-source evidence and image-use checks.
4. Connect a separately authorized YouTube upload stage; publication approval stays distinct from production approval.

## References

- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://elevenlabs.io/docs/eleven-api/resources/errors
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
