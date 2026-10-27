/* Kisan Dost voice + language helper (Hamza Ejaz).
   1) Text-to-speech that can always be stopped: Listen toggles to Stop, a floating Stop button shows while talking,
      and speech is cancelled on send, new chat, screen change, mic start, Escape, reload and leaving the page.
      Long answers are read sentence by sentence so Chrome does not cut them off.
   2) Language detection (English, Roman Urdu, Urdu, Punjabi, Pashto, Saraiki) used for the AI prompt, voice and mic.
   3) Interface language auto-pick (browser language, then the script the farmer types). */
(function () {
"use strict";
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const syn = window.speechSynthesis || null;
const isUr = () => !!(document.body && document.body.classList.contains("ur"));

/* ---------------------------------------------------------------- interface language */
function browserUI() {
  const l = String((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase();
  return /^(ur|pa|ps|sd|skr)(-|$)/.test(l) ? "ur" : "en";
}
function uiMode() {
  const m = LS.get("kd_ui_mode", "");
  if (m === "en" || m === "ur" || m === "auto") return m;
  const old = LS.get("kd_ui", "");               /* older versions saved a manual choice here */
  return old === "ur" ? "ur" : old === "en" ? "en" : "auto";
}
function uiLang() {
  const m = uiMode();
  if (m !== "auto") return m;
  return browserUI() === "ur" || LS.get("kd_auto_ur", "") === "1" ? "ur" : "en";
}

/* ---------------------------------------------------------------- language detection */
const AR = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, GU = /[\u0A00-\u0A7F]/g, LA = /[A-Za-z]/g;
const PS_CH = /[\u067C\u0689\u0693\u0696\u069A\u0685\u0681\u06BC\u06CD\u06AB\u06D0]/;       /* ټ ډ ړ ږ ښ څ ځ ڼ ۍ ګ ې */
const SK_CH = /[\u067B\u0684\u0759\u06B3\u0768]/;                                             /* ٻ ڄ ݙ ڳ ݨ */
const PA_W = /(^|[\s،۔؟!.])(وچ|نوں|کیہڑ\S*|ساڈ\S*|تسی|کتھے|کدوں|ایہہ|چنگ\S*|رہوے|ہووے|کِنی|کنی|دیاں|جے)(?=$|[\s،۔؟!.])/g;
const ROMAN = new Set(("kab kya kaise kese kesay hai hain hy mein main mei meri mera meray apni apna zameen zamin fasal fasl gandum gehun " +
  "kapas chawal dhan ganna makai pani khad kisan boun bona lagayen lagana lagaon karon karna kaun kon kyun kyu kitna kitni kitne ke ki ka ko se " +
  "aur bhi nahi nahin nhi chahiye batao bata batain aap ap mujhe mujhy hamein humein wala wali abhi aaj kal barish mausam paida wari beemari bimari " +
  "keera sundi tha thi hoga hogi kar kare karein karen lagta lagti sahi theek").split(" "));
const L = {
  en:       { code: "en",       name: "English",              tts: "en-US", rec: "en-US", script: "latin" },
  "ur-roman": { code: "ur-roman", name: "Roman Urdu",          tts: "en-IN", rec: "ur-PK", script: "latin" },
  ur:       { code: "ur",       name: "Urdu",                 tts: "ur-PK", rec: "ur-PK", script: "arabic" },
  pa:       { code: "pa",       name: "Punjabi",              tts: "pa-PK", rec: "pa-PK", script: "arabic" },
  "pa-gu":  { code: "pa-gu",    name: "Punjabi (Gurmukhi)",   tts: "pa-IN", rec: "pa-IN", script: "gurmukhi" },
  ps:       { code: "ps",       name: "Pashto",               tts: "ps-AF", rec: "ps-AF", script: "arabic" },
  skr:      { code: "skr",      name: "Saraiki",              tts: "ur-PK", rec: "ur-PK", script: "arabic" },
  und:      { code: "und",      name: "",                     tts: "en-US", rec: "en-US", script: "none" }
};
const FALL = {
  en: ["en-US", "en-GB", "en-IN", "en"], "ur-roman": ["en-IN", "en-GB", "en-US", "en"],
  ur: ["ur-PK", "ur-IN", "ur", "hi-IN"], pa: ["pa-PK", "pa-IN", "ur-PK", "ur-IN", "hi-IN"], "pa-gu": ["pa-IN", "pa-PK", "hi-IN"],
  ps: ["ps-AF", "ps", "ur-PK", "fa-IR", "hi-IN"], skr: ["ur-PK", "ur-IN", "hi-IN"], und: ["en-US"]
};
function detect(text, hint) {
  const t = String(text || "");
  const ar = (t.match(AR) || []).length, gu = (t.match(GU) || []).length, la = (t.match(LA) || []).length;
  if (!ar && !gu && !la) return L.und;
  if (gu > ar && gu > la) return L["pa-gu"];
  if (ar >= la) {
    if (PS_CH.test(t)) return L.ps;
    if (SK_CH.test(t)) return L.skr;
    if ((t.match(PA_W) || []).length >= 1) return L.pa;
    const h = String(hint || "");                  /* the answer-language box can settle Arabic-script text */
    if (/^Pash/i.test(h)) return L.ps;
    if (/^Punj/i.test(h)) return L.pa;
    if (/^Sara/i.test(h)) return L.skr;
    return L.ur;
  }
  const words = t.toLowerCase().match(/[a-z']+/g) || [];
  const hits = words.filter(w => ROMAN.has(w)).length;
  if (hits >= 2 || (words.length <= 3 && hits >= 1)) return L["ur-roman"];
  return L.en;
}

let last = null;
function recLang(sel) {
  const s = String(sel || "");
  if (/^English/i.test(s)) return "en-US";
  if (/^Roman|^Urdu/i.test(s)) return "ur-PK";
  if (/^Punj/i.test(s)) return "pa-PK";
  if (/^Pash/i.test(s)) return "ps-AF";
  if (/^Sara/i.test(s)) return "ur-PK";
  if (last && last.code !== "und") return last.rec;                    /* Auto: follow the farmer's last message */
  if (uiLang() === "ur") return "ur-PK";
  const n = navigator.language || "en-US";
  return /^en/i.test(n) ? n : "en-US";
}
function noteLang(det) {
  if (!det || det.code === "und") return;
  last = det;
  const o = document.querySelector("#lg option");
  if (o) o.text = "Auto (my language) \u00b7 " + det.name;
  if (uiMode() === "auto" && (det.script === "arabic" || det.script === "gurmukhi") && uiLang() === "en") {
    LS.set("kd_auto_ur", "1");
    document.dispatchEvent(new Event("kd-ui-auto"));
  }
}

/* ---------------------------------------------------------------- text-to-speech */
const T = {
  listen: ["\ud83d\udd0a Listen", "\ud83d\udd0a \u0633\u0646\u06cc\u06ba"], stop: ["\u23f9 Stop", "\u23f9 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba"],
  copy: ["\ud83d\udccb Copy", "\ud83d\udccb \u06a9\u0627\u067e\u06cc"], wa: ["\ud83d\udcf2 WhatsApp", "\ud83d\udcf2 \u0648\u0627\u0679\u0633 \u0627\u06cc\u067e"],
  pill: ["Stop speaking", "\u0622\u0648\u0627\u0632 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba"],
  novoice: ["No %s voice on this device, so the default voice is used. Add one in your phone's Text-to-speech settings.",
            "\u0627\u0633 \u0641\u0648\u0646 \u0645\u06cc\u06ba %s \u0622\u0648\u0627\u0632 \u0645\u0648\u062c\u0648\u062f \u0646\u06c1\u06cc\u06ba\u06d4 \u0688\u06cc\u0641\u0627\u0644\u0679 \u0622\u0648\u0627\u0632 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06c1\u0648 \u0631\u06c1\u06cc \u06c1\u06d2\u06d4"],
  nosupport: ["Voice is not supported in this browser", "\u0627\u0633 \u0628\u0631\u0627\u0624\u0632\u0631 \u0645\u06cc\u06ba \u0622\u0648\u0627\u0632 \u062f\u0633\u062a\u06cc\u0627\u0628 \u0646\u06c1\u06cc\u06ba"]
};
const t = k => T[k][isUr() ? 1 : 0];
const say = m => { try { if (typeof toast === "function") toast(m); } catch (e) {} };

let voices = [];
const loadVoices = () => { try { voices = syn ? syn.getVoices() : []; } catch (e) { voices = []; } };
if (syn) {
  loadVoices();
  try { syn.addEventListener("voiceschanged", loadVoices); } catch (e) { syn.onvoiceschanged = loadVoices; }
  try { syn.cancel(); } catch (e) {}                   /* flush anything left over from before a reload */
}
const norm = v => String(v.lang || "").toLowerCase().replace("_", "-");
function pickVoice(det) {
  if (!voices.length) loadVoices();
  const list = FALL[det.code] || FALL.en;
  for (const want of list) {
    const w = want.toLowerCase();
    const v = voices.find(x => norm(x) === w) || (w.length === 2 ? voices.find(x => norm(x).split("-")[0] === w) : null);
    if (v) return { voice: v, lang: v.lang, exact: list.indexOf(want) === 0 };
  }
  return { voice: null, lang: list[0], exact: false };
}

function prepare(text) {
  const lines = String(text || "").replace(/\n?FOLLOWUPS:[\s\S]*$/, "").split(/\n+/);
  const out = [];
  lines.forEach(line => {
    const c = line
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[*#_`>|~]+/g, " ")
      .replace(/^\s*[-\u2022]\s+/, "")
      .replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, " ")
      .replace(/\s{2,}/g, " ").trim();
    if (!c) return;
    const parts = c.match(/[^.!?\u06d4\u061f]+[.!?\u06d4\u061f]*/g) || [c];
    let cur = "";
    parts.forEach(p => {
      p = p.trim(); if (!p) return;
      if ((cur + " " + p).length > 170 && cur) { out.push(cur); cur = p; } else cur = cur ? cur + " " + p : p;
    });
    if (cur) out.push(cur);
  });
  const final = [];
  out.forEach(s => {                                 /* hard-wrap any very long run on a space */
    while (s.length > 220) { let i = s.lastIndexOf(" ", 200); if (i < 60) i = 200; final.push(s.slice(0, i)); s = s.slice(i).trim(); }
    if (s) final.push(s);
  });
  return final;
}

let tok = 0, speaking = false, btn = null, pill = null, warned = false;
function ensurePill() {
  if (pill) return pill;
  pill = document.createElement("button");
  pill.id = "spk"; pill.type = "button"; pill.setAttribute("aria-live", "polite");
  pill.innerHTML = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="tx"></span>';
  pill.onclick = e => { e.stopPropagation(); stop(); };
  document.body.appendChild(pill);
  return pill;
}
function paint() {
  if (btn && btn.isConnected) {
    if (!btn.dataset.l0) btn.dataset.l0 = btn.textContent;
    btn.textContent = speaking ? t("stop") : btn.dataset.l0;
    btn.classList.toggle("speaking", speaking);
    btn.setAttribute("aria-pressed", speaking ? "true" : "false");
  }
  if (speaking || pill) {
    const p = ensurePill();
    p.querySelector(".tx").textContent = t("pill");
    p.classList.toggle("on", speaking);
  }
}
function stop() {
  tok++;
  if (syn) { try { syn.cancel(); } catch (e) {} }
  const was = speaking, b = btn;
  speaking = false;
  if (b) { paint(); }
  btn = null;
  if (pill) pill.classList.remove("on");
  return was;
}
function speak(text, b) {
  if (!syn || typeof SpeechSynthesisUtterance === "undefined") { say(t("nosupport")); return; }
  stop();
  const hint = (document.querySelector("#lg") || {}).value;
  const chunks = prepare(text);
  if (!chunks.length) return;
  const det = detect(chunks.join(" "), hint), pv = pickVoice(det);
  if (!pv.voice && !warned && det.code !== "en" && det.code !== "und") { warned = true; say(t("novoice").replace("%s", det.name)); }
  const my = ++tok;
  btn = b || null; speaking = true; paint();
  let i = 0;
  const next = () => {
    if (my !== tok) return;
    if (i >= chunks.length) { stop(); return; }
    const piece = chunks[i++];
    const u = new SpeechSynthesisUtterance(piece);
    u.lang = pv.lang; if (pv.voice) u.voice = pv.voice; u.rate = det.code === "en" ? 1 : .95;
    let adv = false, wd = 0;
    const go = () => { if (adv) return; adv = true; clearTimeout(wd); if (my === tok) next(); };
    u.onend = go;
    u.onerror = e => { if (e && (e.error === "canceled" || e.error === "interrupted")) return; go(); };
    wd = setTimeout(() => { if (my === tok && !adv) { try { syn.cancel(); } catch (e) {} go(); } }, Math.max(7000, piece.length * 180));
    try { syn.speak(u); } catch (e) { stop(); }
  };
  setTimeout(next, 90);                              /* Chrome drops a speak() that comes straight after cancel() */
}
function toggle(b, text) { if (speaking && btn === b) stop(); else speak(text, b); }

addEventListener("pagehide", stop);
addEventListener("beforeunload", stop);
document.addEventListener("keydown", e => { if (e.key === "Escape" && speaking) stop(); });

window.KDV = { speak, stop, toggle, speaking: () => speaking, detect, noteLang, recLang, uiLang, uiMode, browserUI, t, last: () => last };
})();
