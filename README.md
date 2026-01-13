# Twitch Chat Translator (Browser Extension)

This repository contains a Chrome-compatible browser extension that translates Twitch chat messages in real time.

## Features

- Watches Twitch chat for new messages and appends a translated line underneath.
- Toggle translations on/off from the popup.
- Configure source/target language codes (e.g., `auto` → `en`).
- Configure a LibreTranslate-compatible API endpoint and optional API key.

## Getting Started

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Visit a Twitch stream and open chat.
5. Use the extension popup to configure languages or disable translations.

## Notes

- The default translation endpoint is `https://libretranslate.com/translate`.
- Public translation endpoints may throttle heavy usage. Use your own endpoint for reliability.

## Files

- `manifest.json` — Extension manifest.
- `content-script.js` — Observes chat and performs translations.
- `popup.html` / `popup.js` — Quick settings.
- `options.html` / `options.js` — Advanced settings.

## Troubleshooting

- If translations do not appear, ensure the endpoint supports CORS and the language codes are supported.
- Try refreshing the Twitch page after changing settings.
