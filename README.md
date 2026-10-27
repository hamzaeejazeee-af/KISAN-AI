# Kisan Dost - a project by Hamza Ejaz
Copyright (c) 2026 Hamza Ejaz. All rights reserved.

## Standalone version
1. `pip install -r requirements.txt`
2. Copy `.env.example` to `.env`, then paste your key after `ANTHROPIC_API_KEY=` (get one at https://console.anthropic.com/settings/keys).
3. `python server.py`, then open http://localhost:5000
## Ollama (free, offline)
Install from https://ollama.com/download, then run `ollama pull llama3.2` and `ollama pull llama3.2-vision`. Pick "AI: Ollama (local)" in the sidebar.
## Weather
Live forecasts come from Open-Meteo (no key). Set your region in the sidebar.
## Safety
The key stays in `.env` on the server. Never put it in the HTML or share the file.


## Easiest start
Run `start.bat` (Windows) or `./start.sh`. See HOW-TO-RUN.txt. Free Groq key: https://console.groq.com/keys (Grok/xAI also supported, paid). "Auto" picks whatever is available.

## What's new (v2 look and tools)
- **Five themes** plus Auto (Field night, Morning, Harvest, Canal blue, Mango) and a redrawn farm background: Appearance button, top right. Background can be Animated, Still or Off (Still is chosen automatically on weak phones).
- **Urdu interface** switch (top right) and a text size slider.
- **Today card** on the chat home: weather, spray verdict, what to sow or harvest this month, reminders due.
- **Weather**: 7-day forecast, GPS or region, plain advice for watering, spraying, frost and fertilizer.
- **Fertilizer**: bags of urea, DAP and potash for your acres, with when to apply. Guide rates only: confirm with a soil test.
- **Profit**: costs per acre vs. sales, break-even price and yield, what-if lines. Saves to the journal.
- **Scan my crop** (camera), **WhatsApp share** on every answer, installable on Android (PWA), opens offline.
- Server: per-visitor rate limit on the AI (`RATE_LIMIT_PER_MIN` in `.env`) so strangers cannot drain your key.

## Files
`static/index.html` page, `static/css/app.css` themes and styles, `static/js/app.js` chat and farm tools, `static/js/features.js` new tools, `static/js/bg.js` background scene, `static/js/splash.js` LEGO intro.


## What's new in v3
- **New logo and intro**: a sprout rising in front of a sunrise (vector, sharp at every size, new app icons). The intro is now about 5 seconds and can be skipped.
- **Sharper look**: crisp buttons, cards and a redrawn tractor instead of the old brick style; the background renders at higher resolution.
- **Lawn & Home panel** (new): month-by-month lawn planner (water, mowing, urea, reminders), kitchen-garden sowing guide, and a pots/indoor plant problem-solver. English and Urdu.
- **Auto language**: the interface follows your browser language, then switches to Urdu if you type in Urdu script (Appearance > Language > Auto). Replies, voice answers and the microphone follow the language you write or speak.
- **Voice fix**: Listen now turns into Stop, a floating "Stop speaking" button appears, and speech also stops when you send a message, start a new chat, change screen, use the mic, press Esc, or reload.
- **Other fixes**: Save chat now downloads a file, answer text shows lists and headings properly, the server validates input sizes and sends security headers.
