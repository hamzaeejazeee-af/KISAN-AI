"""Kisan Dost backend: keeps API keys on the server, never in the browser."""
import os, re, time, requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__, static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 14 * 1024 * 1024  # photos are sent as base64; reject anything bigger
CLAUDE_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_VISION = os.getenv("OLLAMA_VISION_MODEL", "llama3.2-vision")


GROQ_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_VISION = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
XAI_KEY = os.getenv("XAI_API_KEY", "")
XAI_MODEL = os.getenv("XAI_MODEL", "grok-4")
_oa = {}  # remembered model fixes
OA = {"groq": ("https://api.groq.com/openai/v1", lambda: GROQ_KEY, lambda: GROQ_MODEL, "Groq"),
      "xai": ("https://api.x.ai/v1", lambda: XAI_KEY, lambda: XAI_MODEL, "Grok (xAI)")}


def _oa_pick(which):
    base, key, _, _ = OA[which]
    ids = [m["id"] for m in requests.get(base + "/models", headers={"Authorization": "Bearer " + key()}, timeout=20).json().get("data", [])]
    if which == "groq":
        for want in ("llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b"):
            if want in ids: return want
        ids = [i for i in ids if not re.search(r"whisper|tts|guard|embed|orpheus", i)]
    else:
        ids = [i for i in ids if "grok" in i and not re.search(r"image|imagine|video", i)]
    return ids[0] if ids else None


def call_openai_compat(which, messages, max_tokens=4000, image=None):
    """Groq / xAI Grok (OpenAI-style). messages = [{'role','content'}...]"""
    base, key, model_of, name = OA[which]
    msgs = [dict(m) for m in messages]
    model = _oa.get(which) or model_of()
    if image and msgs:
        if which == "xai":
            msgs[-1]["content"] = [{"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (image["type"], image["data"])}},
                                   {"type": "text", "text": msgs[-1]["content"]}]
        else:
            model = GROQ_VISION
            msgs[-1]["content"] = [{"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (image["type"], image["data"])}},
                                   {"type": "text", "text": msgs[-1]["content"]}]
    r = None
    for attempt in (0, 1):
        r = requests.post(base + "/chat/completions", headers={"Authorization": "Bearer " + key(), "content-type": "application/json"},
                          json={"model": model, "messages": msgs, "max_tokens": max_tokens}, timeout=180)
        if r.status_code in (400, 404) and attempt == 0 and not image:
            alt = _oa_pick(which)
            if alt and alt != model:
                model = _oa[which] = alt
                continue
        break
    if r.status_code == 401: raise RuntimeError("%s refused the key. Paste it again in .env (Groq keys start gsk_, xAI keys start xai-)." % name)
    if r.status_code in (402, 403) and which == "xai": raise RuntimeError("xAI says this key has no credit - Grok is paid. Use a free Groq key instead (console.groq.com/keys).")
    if r.status_code == 429: raise RuntimeError("%s limit reached for now. Wait a minute and try again." % name)
    if r.status_code == 413: raise RuntimeError("That was too much text for the %s free limit. Try shorter input or fewer tests." % name)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"] or ""

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
_gm = {"name": None}
NO_AI_MSG = ("No AI is set up yet. Easiest fix: get a FREE Groq key at https://console.groq.com/keys , "
             "open the .env file and write GROQ_API_KEY=your_key , then restart. (Or start Ollama for a no-key option.)")


def ollama_up():
    try:
        return requests.get(OLLAMA_URL + "/api/tags", timeout=1.2).ok
    except Exception:
        return False


def resolve_provider(p):
    """auto / missing-key choices fall back to whatever is actually available."""
    keys = {"groq": GROQ_KEY, "xai": XAI_KEY, "gemini": GEMINI_KEY, "claude": CLAUDE_KEY}
    if p == "ollama": return "ollama"
    if p in keys and keys[p]: return p
    for name in ("groq", "xai", "gemini", "claude"):
        if keys[name]: return name
    if ollama_up(): return "ollama"
    return None


def _gemini_pick_model():
    r = requests.get("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
                     headers={"x-goog-api-key": GEMINI_KEY}, timeout=20)
    names = [m["name"].replace("models/", "") for m in r.json().get("models", [])
             if "flash" in m["name"] and "generateContent" in m.get("supportedGenerationMethods", [])
             and not re.search(r"image|tts|live|audio|robotics|computer|embedding|exp", m["name"])]
    names.sort(key=lambda n: "preview" in n)
    return names[0] if names else None


def call_gemini(system, contents, max_tokens=8000, json_mode=False):
    """contents = [{'role': 'user'|'model', 'parts': [{'text': ..}, {'inline_data': ..}]}]"""
    body = {"contents": contents, "generationConfig": {"maxOutputTokens": max_tokens}}
    if system: body["system_instruction"] = {"parts": [{"text": system}]}
    if json_mode: body["generationConfig"]["responseMimeType"] = "application/json"
    r = None
    for attempt in (0, 1):
        model = _gm["name"] or GEMINI_MODEL
        r = requests.post("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % model,
                          headers={"x-goog-api-key": GEMINI_KEY, "content-type": "application/json"}, json=body, timeout=180)
        if r.status_code == 404 and attempt == 0:
            alt = _gemini_pick_model()
            if alt and alt != model:
                _gm["name"] = alt
                continue
        break
    if r.status_code == 429: raise RuntimeError("Gemini free limit reached for now. Wait a minute and try again.")
    if r.status_code in (400, 403):
        raise RuntimeError("Gemini refused the key. Create a fresh one at https://aistudio.google.com/apikey and put it in .env (%s)" % r.text[:120])
    r.raise_for_status()
    j = r.json()
    cand = (j.get("candidates") or [{}])[0]
    return "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
REGIONS = {"North Punjab": (31.52, 74.36), "South Punjab": (30.20, 71.47), "Potohar": (33.60, 73.05),
           "Sindh": (25.40, 68.37), "Thar Cholistan": (24.73, 69.80), "KP plains": (34.01, 71.58),
           "KP highlands": (34.77, 72.36), "Balochistan": (30.18, 66.99), "Makran coast": (25.13, 62.33),
           "Gilgit-Baltistan": (35.92, 74.31), "AJK": (34.37, 73.47)}

@app.get("/")
def home():
    return send_from_directory("static", "index.html")

def ask_claude(msgs, img):
    if not CLAUDE_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is missing in .env")
    if img:
        last = msgs[-1]
        last["content"] = [{"type": "image", "source": {"type": "base64", "media_type": img["type"], "data": img["data"]}},
                           {"type": "text", "text": last["content"]}]
    r = requests.post("https://api.anthropic.com/v1/messages",
                      headers={"x-api-key": CLAUDE_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                      json={"model": CLAUDE_MODEL, "max_tokens": 900, "messages": msgs}, timeout=90)
    r.raise_for_status()
    return "".join(b.get("text", "") for b in r.json()["content"])

def ask_gemini(msgs, img):
    system = "\n".join(m["content"] for m in msgs if m.get("role") == "system" and isinstance(m.get("content"), str))
    contents = []
    for m in msgs:
        if m.get("role") == "system": continue
        c = m.get("content")
        parts = [{"text": c}] if isinstance(c, str) else [{"text": str(c)}]
        contents.append({"role": "model" if m.get("role") == "assistant" else "user", "parts": parts})
    if img and contents:
        contents[-1]["parts"].insert(0, {"inline_data": {"mime_type": img["type"], "data": img["data"]}})
    return call_gemini(system, contents, 2000)


def ask_ollama(msgs, img):
    if img:
        msgs[-1]["images"] = [img["data"]]
    r = requests.post(OLLAMA_URL + "/api/chat",
                      json={"model": OLLAMA_VISION if img else OLLAMA_MODEL, "messages": msgs, "stream": False}, timeout=180)
    r.raise_for_status()
    return r.json()["message"]["content"]

_hits = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MIN", "30"))


def _too_many():
    """Simple per-visitor limit so nobody can drain your AI key when the app is public. Set RATE_LIMIT_PER_MIN in .env (0 = off)."""
    if RATE_LIMIT <= 0:
        return False
    ip = (request.headers.get("X-Forwarded-For") or request.remote_addr or "?").split(",")[0].strip()
    now = time.time()
    q = [x for x in _hits.get(ip, []) if now - x < 60]
    q.append(now)
    _hits[ip] = q
    if len(_hits) > 5000:
        _hits.clear()
    return len(q) > RATE_LIMIT


def _clean_messages(raw):
    """Only plain role/content text goes to the AI: right roles, capped length and count."""
    if not isinstance(raw, list) or not raw:
        raise ValueError("No question was sent.")
    out = []
    for m in raw[-12:]:
        if not isinstance(m, dict) or m.get("role") not in ("user", "assistant", "system") or not isinstance(m.get("content"), str):
            raise ValueError("That message could not be read.")
        out.append({"role": m["role"], "content": m["content"][:14000]})
    return out


def _clean_image(img):
    if not img:
        return None
    if not isinstance(img, dict) or not str(img.get("type", "")).startswith("image/") or not isinstance(img.get("data"), str):
        raise ValueError("That photo could not be read.")
    if len(img["data"]) > 11_000_000:
        raise ValueError("That photo is too large. Try a smaller one.")
    return {"type": img["type"], "data": img["data"]}


@app.after_request
def _headers(r):
    r.headers.setdefault("X-Content-Type-Options", "nosniff")
    r.headers.setdefault("Referrer-Policy", "same-origin")
    r.headers.setdefault("Permissions-Policy", "microphone=(self), camera=(self), geolocation=(self)")
    return r


@app.post("/api/chat")
def chat():
    if _too_many():
        return jsonify(error="Too many questions in a minute. Please wait a little and try again."), 429
    d = request.get_json(force=True, silent=True) or {}
    try:
        d["messages"] = _clean_messages(d.get("messages"))
        d["image"] = _clean_image(d.get("image"))
    except ValueError as e:
        return jsonify(error=str(e)), 400
    try:
        prov = resolve_provider(d.get("provider"))
        if not prov:
            raise RuntimeError(NO_AI_MSG)
        if prov in OA:
            return jsonify(text=call_openai_compat(prov, d["messages"], 1500, d.get("image")))
        fn = {"ollama": ask_ollama, "gemini": ask_gemini}.get(prov, ask_claude)
        return jsonify(text=fn(d["messages"], d.get("image")))
    except Exception as e:
        return jsonify(error=str(e)), 500

ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")


def _save_env(name, value):
    lines = open(ENV_PATH, encoding="utf-8").read().splitlines() if os.path.exists(ENV_PATH) else []
    for i, l in enumerate(lines):
        if re.match(r"\s*%s\s*=" % name, l):
            lines[i] = "%s=%s" % (name, value); break
    else:
        lines.append("%s=%s" % (name, value))
    open(ENV_PATH, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def _is_local():
    # Only the person at the computer running the app may use AI Setup. Off when online (proxy headers or DISABLE_SETUP=1).
    if os.getenv("DISABLE_SETUP") == "1" or request.headers.get("X-Forwarded-For") or request.headers.get("Forwarded"):
        return False
    return request.remote_addr in ("127.0.0.1", "::1")


@app.get("/api/health")
def health():
    return jsonify(groq=bool(GROQ_KEY), xai=bool(XAI_KEY), gemini=bool(GEMINI_KEY), claude=bool(CLAUDE_KEY),
                   ollama=ollama_up(), can_setup=_is_local())


@app.post("/api/setup")
def setup():
    """AI Setup box: saves a Groq (gsk_) or Grok (xai-) key into .env. Only works on the computer running the app."""
    global GROQ_KEY, XAI_KEY
    if not _is_local():
        return jsonify(error="AI Setup only works on the computer that runs the app. On a live website, add GROQ_API_KEY in the host's Environment settings instead."), 403
    key = str((request.get_json(force=True, silent=True) or {}).get("key", "")).strip()
    if key.startswith("gsk_"): which, env = "groq", "GROQ_API_KEY"
    elif key.startswith("xai-"): which, env = "xai", "XAI_API_KEY"
    else:
        return jsonify(error="That does not look right. A Groq key starts with gsk_ and a Grok (xAI) key starts with xai-."), 400
    note = ""
    try:
        r = requests.get(OA[which][0] + "/models", headers={"Authorization": "Bearer " + key}, timeout=15)
        if r.status_code == 401:
            return jsonify(error="That key was rejected. Copy it again from the website (no spaces)."), 400
    except Exception:
        note = " (could not double-check it online right now, but it is saved)"
    _save_env(env, key); os.environ[env] = key
    if which == "groq": GROQ_KEY = key
    else: XAI_KEY = key
    return jsonify(ok=True, provider=which, message="Saved. AI is ready" + note + ".")


_wx_cache = {}


@app.get("/api/weather")
def weather():
    """Open-Meteo forecast (free, no key). Returns a short text summary for the AI plus structured days for the Weather screen."""
    c = REGIONS.get(request.args.get("region", ""))
    try:
        lat, lon = float(request.args.get("lat", "")), float(request.args.get("lon", ""))
        if 23 <= lat <= 38 and 60 <= lon <= 78:
            c = (lat, lon)
    except ValueError:
        pass
    if not c:
        return jsonify(summary="unavailable")
    key = (round(c[0], 2), round(c[1], 2))
    hit = _wx_cache.get(key)
    if hit and time.time() - hit[0] < 600:
        return jsonify(hit[1])
    try:
        j = requests.get("https://api.open-meteo.com/v1/forecast", params={
            "latitude": c[0], "longitude": c[1], "timezone": "auto", "forecast_days": 7,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"}, timeout=15).json()
        n, d = j["current"], j["daily"]
        out = dict(
            summary=f"now {n['temperature_2m']}C, humidity {n['relative_humidity_2m']}%, wind {n['wind_speed_10m']} km/h; next 3 days max {d['temperature_2m_max'][:3]}C, min {d['temperature_2m_min'][:3]}C, rain {d['precipitation_sum'][:3]} mm",
            now=dict(t=n["temperature_2m"], h=n["relative_humidity_2m"], wind=n["wind_speed_10m"], code=n["weather_code"]),
            days=[dict(date=d["time"][i], code=d["weather_code"][i], max=d["temperature_2m_max"][i], min=d["temperature_2m_min"][i],
                       rain=d["precipitation_sum"][i], pop=d["precipitation_probability_max"][i], wind=d["wind_speed_10m_max"][i])
                  for i in range(len(d["time"]))])
        _wx_cache[key] = (time.time(), out)
        return jsonify(out)
    except Exception:
        return jsonify(summary="unavailable")


@app.get("/sw.js")
def service_worker():
    r = send_from_directory("static", "sw.js", mimetype="application/javascript")
    r.headers["Cache-Control"] = "no-cache"
    return r


@app.get("/manifest.webmanifest")
def manifest():
    return send_from_directory("static", "manifest.webmanifest", mimetype="application/manifest+json")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
