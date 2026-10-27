/* Kisan Dost features: themes, Urdu interface, Today card, weather + spray check, fertilizer and profit calculators, sharing, install. */
(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const html=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>{const n=parseFloat(v);return isFinite(n)?n:0};
const rs=n=>"Rs "+Math.round(n).toLocaleString("en-US");

/* ------------------------------------------------------------------ language */
const I18N={
 en:{chat:"Chat",weather:"Weather",soil:"Soil",calendar:"Calendar",water:"Water",fert:"Fertilizer",profit:"Profit",plan:"Crop plan",projects:"Projects",journal:"Journal",reminders:"Reminders",dashboard:"Dashboard",evaluation:"Evaluation",help:"Help",lawn:"Lawn & Home",uilang:"Language",ui_auto:"Auto",ui_en:"English",ui_ur:"اردو",tag:"AI farming friend",newchat:"New chat",chats:"Chats",myfarm:"My farm & AI settings",welcome:"Welcome to Kisan Dost",welcome_s:"Your farming friend. Ask in English, اردو, Roman Urdu, پنجابی, پښتو or سرائیکی and get an answer in the same language.",today:"Today on your farm",try:"Or try asking",ph:"Ask about your farm, in any language",look:"Appearance",theme:"Theme",bg:"Background",bg_live:"Animated",bg_calm:"Still",bg_off:"Off",size:"Text size",th_auto:"Auto",th_night:"Field night",th_day:"Morning",th_harvest:"Harvest",th_canal:"Canal blue",th_mango:"Mango",a_scan:"Scan my crop",a_scan_s:"Photo of a sick leaf",a_voice:"Ask by voice",a_voice_s:"Urdu, Punjabi, Pashto",a_spray:"Can I spray today?",a_spray_s:"Wind and rain check",a_fert:"Fertilizer bags",a_fert_s:"How much for my land",wx_sub:"Seven-day forecast for your farm, with plain advice on watering, spraying and frost.",use_loc:"Use my location",fert_sub:"How many 50 kg bags of urea and DAP your land needs, and when to put them on.",prof_sub:"Put in your costs per acre and the price you expect. See profit, and the lowest price that still covers your costs."},
 ur:{chat:"چیٹ",weather:"موسم",soil:"مٹی",calendar:"کیلنڈر",water:"پانی",fert:"کھاد",profit:"منافع",plan:"فصل کا منصوبہ",projects:"فارم",journal:"روزنامچہ",reminders:"یاد دہانی",dashboard:"ڈیش بورڈ",evaluation:"جانچ",help:"مدد",lawn:"لان اور گھر",uilang:"زبان",ui_auto:"خودکار",ui_en:"English",ui_ur:"اردو",tag:"آپ کا زرعی دوست",newchat:"نئی چیٹ",chats:"چیٹس",myfarm:"میرا کھیت اور سیٹنگز",welcome:"کسان دوست میں خوش آمدید",welcome_s:"آپ کی کھیتی باڑی کا ساتھی۔ اردو، انگریزی، پنجابی، پښتو یا سرائیکی میں پوچھیں، جواب اسی زبان میں ملے گا۔",today:"آج آپ کے کھیت میں",try:"یہ پوچھ کر دیکھیں",ph:"اپنے کھیت کے بارے میں کچھ بھی پوچھیں",look:"ظاہری شکل",theme:"تھیم",bg:"پس منظر",bg_live:"متحرک",bg_calm:"ساکن",bg_off:"بند",size:"لکھائی کا سائز",th_auto:"خودکار",th_night:"کھیت کی رات",th_day:"صبح",th_harvest:"کٹائی",th_canal:"نہر کا نیلا",th_mango:"آم",a_scan:"فصل کی تصویر",a_scan_s:"بیمار پتے کی تصویر لیں",a_voice:"بول کر پوچھیں",a_voice_s:"اردو، پنجابی، پښتو",a_spray:"کیا آج سپرے کروں؟",a_spray_s:"ہوا اور بارش کی جانچ",a_fert:"کھاد کے تھیلے",a_fert_s:"میری زمین کو کتنی چاہیے",wx_sub:"آپ کے کھیت کے لیے سات دن کا موسم، اور پانی، سپرے اور پالے کے سادہ مشورے۔",use_loc:"میری لوکیشن",fert_sub:"آپ کی زمین کو یوریا اور ڈی اے پی کے کتنے 50 کلو تھیلے چاہییں اور کب ڈالنے ہیں۔",prof_sub:"ایکڑ کے خرچے اور متوقع قیمت لکھیں۔ منافع اور وہ کم از کم قیمت دیکھیں جس پر خرچہ پورا ہو۔"}
};
let UIMODE=KDV.uiMode(),UI=KDV.uiLang();
const T=k=>(I18N[UI]&&I18N[UI][k])||I18N.en[k]||k;
/* short phrases used by the Today card and advice; Urdu falls back to English if missing */
const PH={
 en:{sow:"Sow now",harv:"Harvest time",none:"Nothing this month",due:"reminders due",nodue:"Nothing due today",setloc:"Set your location",setloc_s:"Tap to get the weather and spray advice",spray_g:"Good day to spray",spray_w:"Spray with care",spray_b:"Do not spray today",
  i_skip:"Skip irrigation and clear drains",i_delay:"Delay irrigation 2 days",i_heat:"Hot day: irrigate in the evening",i_ok:"Irrigate on your normal schedule",frost:"Frost risk tonight",cold:"Cold night",nofert:"Do not put urea before rain",heat:"Extreme heat",
  s_g:"Wind is light and no rain is expected. Spray early morning or evening.",s_w:"Wind or rain chance is high. Wait for a calmer, dry window if you can.",s_b:"Strong wind or rain will carry the spray away or wash it off.",
  i_skip_s:"Heavy rain is forecast. Water will stand in the field.",i_delay_s:"Some rain is coming. Check soil moisture before watering.",i_heat_s:"Water in the evening and mulch to cut losses.",i_ok_s:"Little rain is expected. Dig 6 inches to check moisture.",
  frost_s:"Water lightly before dark and cover nurseries and young plants.",cold_s:"Young plants may suffer. Watch vegetables and nurseries.",nofert_s:"Rain washes urea away. Wait until the soil has drained.",heat_s:"Avoid field work from 11 am to 4 pm. Give animals shade and water.",
  wind:"Wind",hum:"Humidity",feels:"Now",today:"Today",tomorrow:"Tomorrow",rainsoon:"Heavy rain on"},
 ur:{sow:"اب بوئیں",harv:"کٹائی کا وقت",none:"اس مہینے کچھ نہیں",due:"یاد دہانیاں باقی ہیں",nodue:"آج کچھ باقی نہیں",setloc:"اپنی جگہ بتائیں",setloc_s:"موسم اور سپرے کا مشورہ لینے کے لیے دبائیں",spray_g:"آج سپرے کے لیے اچھا دن ہے",spray_w:"احتیاط سے سپرے کریں",spray_b:"آج سپرے نہ کریں",
  i_skip:"پانی نہ لگائیں، نالیاں صاف کریں",i_delay:"پانی 2 دن آگے کریں",i_heat:"گرم دن: شام کو پانی لگائیں",i_ok:"معمول کے مطابق پانی لگائیں",frost:"آج رات پالے کا خطرہ",cold:"ٹھنڈی رات",nofert:"بارش سے پہلے یوریا نہ ڈالیں",heat:"شدید گرمی",
  s_g:"ہوا ہلکی ہے اور بارش کا امکان نہیں۔ صبح سویرے یا شام کو سپرے کریں۔",s_w:"ہوا یا بارش کا امکان زیادہ ہے۔ ہو سکے تو پرسکون خشک وقت کا انتظار کریں۔",s_b:"تیز ہوا یا بارش سپرے کو اڑا دے گی یا دھو دے گی۔",
  i_skip_s:"تیز بارش کی پیش گوئی ہے۔ کھیت میں پانی کھڑا ہو سکتا ہے۔",i_delay_s:"کچھ بارش آ رہی ہے۔ پانی لگانے سے پہلے نمی دیکھ لیں۔",i_heat_s:"شام کو پانی دیں اور ملچنگ کریں۔",i_ok_s:"بارش کم متوقع ہے۔ 6 انچ کھود کر نمی دیکھیں۔",
  frost_s:"اندھیرے سے پہلے ہلکا پانی لگائیں اور نرسری اور چھوٹے پودے ڈھانپ دیں۔",cold_s:"چھوٹے پودوں کو نقصان ہو سکتا ہے۔ سبزیوں اور نرسری کا خیال رکھیں۔",nofert_s:"بارش یوریا کو بہا لے جاتی ہے۔ زمین سوکھنے کا انتظار کریں۔",heat_s:"صبح 11 سے شام 4 بجے تک کھیت کا کام نہ کریں۔ جانوروں کو سایہ اور پانی دیں۔",
  wind:"ہوا",hum:"نمی",feels:"ابھی",today:"آج",tomorrow:"کل",rainsoon:"تیز بارش"}};
const p=k=>(PH[UI]&&PH[UI][k])||PH.en[k];
function applyI18n(){
 document.documentElement.lang=UI==="ur"?"ur":"en";document.body.classList.toggle("ur",UI==="ur");
 $$("[data-i18n]").forEach(e=>{const k=e.dataset.i18n;if(k==="welcome"&&(typeof KDU_SESS!=="undefined"&&KDU_SESS))return;e.textContent=T(k)});
 $$("[data-i18n-ph]").forEach(e=>e.placeholder=T(e.dataset.i18nPh));
 const h=$("#hi");if(h&&(typeof KDU_SESS!=="undefined"&&KDU_SESS))h.textContent=(UI==="ur"?"السلام علیکم، ":"Assalam o Alaikum, ")+KDU_SESS.n;
 $("#uill").textContent=UI==="ur"?"English":"اردو";
 const cur=$(".nv.on");if(cur)$("#vt").textContent=cur.querySelector("span").textContent;
 renderToday();syncUiSeg();document.dispatchEvent(new Event("kd-lang"));
}
function syncUiSeg(){$$("#uiseg button").forEach(b=>b.classList.toggle("on",b.dataset.ui===UIMODE))}
function setUIMode(m){UIMODE=m;ls.set("kd_ui_mode",m);if(m==="auto")ls.set("kd_auto_ur","");UI=KDV.uiLang();applyI18n();if(wxData)drawWx()}
$("#uil").onclick=()=>setUIMode(UI==="ur"?"en":"ur");
$$("#uiseg button").forEach(b=>b.onclick=()=>setUIMode(b.dataset.ui));
document.addEventListener("kd-ui-auto",()=>{const was=UI;UI=KDV.uiLang();if(UI!==was){applyI18n();if(wxData)drawWx();toast(UI==="ur"?"انٹرفیس اردو میں بدل گیا (خودکار)۔ ظاہری شکل میں تبدیل کریں۔":"Interface switched to Urdu (Auto). Change it in Appearance.")}});

/* ------------------------------------------------------------------ theme, background, text size */
const root=document.documentElement,pop=$("#pop");
const resolve=t=>t==="auto"?(matchMedia("(prefers-color-scheme: light)").matches?"day":"night"):t;
function setTheme(choice,save){
 if(save!==false)ls.set("kd_theme",choice);
 const r=resolve(choice);root.dataset.theme=r;window.KDBG&&KDBG.theme(r);
 $$("#sw button").forEach(b=>b.classList.toggle("on",b.dataset.th===choice));
 requestAnimationFrame(()=>{const m=$("#themecolor");if(m)m.content=getComputedStyle(root).getPropertyValue("--bg").trim()||"#0a130f"});
}
matchMedia("(prefers-color-scheme: light)").addEventListener&&matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{if(ls.get("kd_theme","auto")==="auto")setTheme("auto",false)});
$$("#sw button").forEach(b=>b.onclick=()=>setTheme(b.dataset.th));
const lowEnd=(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2);
function setBg(m,save){if(save!==false)ls.set("kd_bg",m);window.KDBG&&KDBG.mode(m);$$("#bgseg button").forEach(b=>b.classList.toggle("on",b.dataset.bg===m))}
$$("#bgseg button").forEach(b=>b.onclick=()=>setBg(b.dataset.bg));
const fsz=$("#fsz");fsz.value=parseFloat(getComputedStyle(root).getPropertyValue("--fs"))||1;
fsz.oninput=()=>{root.style.setProperty("--fs",fsz.value);ls.set("kd_fs",fsz.value)};
const apb=$("#apb");
const togglePop=on=>{pop.classList.toggle("on",on);apb.setAttribute("aria-expanded",on)};
apb.onclick=e=>{e.stopPropagation();togglePop(!pop.classList.contains("on"))};
document.addEventListener("click",e=>{if(!pop.contains(e.target)&&!apb.contains(e.target))togglePop(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")togglePop(false)});

/* ------------------------------------------------------------------ navigation titles + view hooks */
const _go=window.go;
window.go=function(v){KDV.stop();_go(v);const b=$('.nv[data-v="'+v+'"]');if(b){const s=b.querySelector("span");$("#vt").dataset.i18n=s.dataset.i18n;$("#vt").textContent=s.textContent}
 if(v==="chat")renderToday();if(v==="wx")openWx();if(v==="fert")prepFert();if(v==="prof")prepProf();
 const sc=$("#v-"+v);if(sc&&v!=="chat")sc.scrollTop=0};
$$(".nv").forEach(n=>n.onclick=()=>window.go(n.dataset.v));

/* ------------------------------------------------------------------ weather */
const WC=c=>c===0?["☀️","Clear"]:c<=2?["🌤️","Mostly clear"]:c===3?["☁️","Cloudy"]:c<=48?["🌫️","Fog"]:c<=57?["🌦️","Drizzle"]:c<=67?["🌧️","Rain"]:c<=77?["🌨️","Snow"]:c<=82?["🌧️","Showers"]:c<=86?["🌨️","Snow showers"]:["⛈️","Thunderstorm"];
const wxCache={};let wxData=null;
async function getWx(){
 const reg=P.reg||"",gps=P.gps;if(!reg&&!gps)return null;
 const q=wxq(reg),c=wxCache[q];if(c&&Date.now()-c.t<300000)return c.d;
 try{const r=await fetch("/api/weather?"+q);const d=await r.json();if(!d.days)return null;wxCache[q]={t:Date.now(),d};return d}catch(e){return null}
}
function sprayVerdict(d){
 if(d.wind>25||d.rain>=2||d.pop>=60)return{l:"bad",e:"🚫",h:p("spray_b"),s:p("s_b")};
 if(d.wind>15||d.pop>=40||d.rain>=0.5)return{l:"warn",e:"⚠️",h:p("spray_w"),s:p("s_w")};
 return{l:"good",e:"✅",h:p("spray_g"),s:p("s_g")};
}
function advice(d,days){
 const a=[],sp=sprayVerdict(d);a.push({...sp,k:"spray"});
 if(d.rain>=25)a.push({l:"warn",e:"🌧️",h:p("i_skip"),s:p("i_skip_s")});
 else if(d.rain>=10)a.push({l:"warn",e:"🌦️",h:p("i_delay"),s:p("i_delay_s")});
 else if(d.max>=40)a.push({l:"warn",e:"🥵",h:p("i_heat"),s:p("i_heat_s")});
 else a.push({l:"good",e:"💧",h:p("i_ok"),s:p("i_ok_s")});
 if(d.min<=4)a.push({l:"bad",e:"🥶",h:p("frost"),s:p("frost_s")});else if(d.min<=7)a.push({l:"warn",e:"🧣",h:p("cold"),s:p("cold_s")});
 if(d.rain>=10||(days&&days.slice(1,3).some(x=>x.rain>=10)))a.push({l:"warn",e:"🧪",h:p("nofert"),s:p("nofert_s")});
 if(d.max>=44)a.push({l:"bad",e:"🔥",h:p("heat"),s:p("heat_s")});
 return a;
}
const dayName=(s,i)=>i===0?p("today"):i===1?p("tomorrow"):new Date(s+"T12:00").toLocaleDateString(UI==="ur"?"ur-PK":"en",{weekday:"short"});
function drawWx(){
 const o=$("#wxout"),w=wxData;if(!w){return}
 const n=w.now,[e,lab]=WC(n.code),d0=w.days[0],ad=advice(d0,w.days);
 o.innerHTML='<div class="res"><div class="wxhero"><div class="wxbig">'+e+' '+Math.round(n.t)+'<small>°C</small></div><div class="wxmeta"><b>'+lab+'</b><br>'+p("wind")+' '+Math.round(n.wind)+' km/h · '+p("hum")+' '+n.h+'%<br>'+Math.round(d0.min)+'° / '+Math.round(d0.max)+'° · '+(d0.pop!=null?d0.pop+'% rain':'')+'</div></div>'+
 '<div class="days">'+w.days.map((d,i)=>{const [de]=WC(d.code);return'<div class="dy"><div>'+dayName(d.date,i)+'</div><div class="e">'+de+'</div><b>'+Math.round(d.max)+'°</b> <span style="color:var(--mu)">'+Math.round(d.min)+'°</span><div class="r">'+(d.rain>0.1?d.rain.toFixed(0)+' mm':'&nbsp;')+'</div></div>'}).join("")+'</div></div>'+
 '<div class="advs" id="advs">'+ad.map(x=>'<div class="adv '+x.l+'"><span class="e">'+x.e+'</span><div><b>'+html(x.h)+'</b><span>'+html(x.s)+'</span></div></div>').join("")+'</div>'+
 '<button class="go" id="wxask">💬 Ask Kisan Dost about this weather</button><p class="note">Forecast from Open-Meteo. Advice follows simple field rules. For warnings about floods or heatwaves, check pmd.gov.pk.</p>';
 $("#wxask").onclick=()=>{window.go("chat");send("Weather for my farm: "+w.days.slice(0,3).map(d=>d.date+" max "+d.max+"C min "+d.min+"C rain "+d.rain+"mm wind "+d.wind+"km/h").join("; ")+". What should I do on my farm in the next 3 days?")};
}
async function openWx(){
 const sel=$("#wxreg");if(!sel.options.length){fillReg("#wxreg")}
 if(P.reg&&!P.gps)sel.value=P.reg;
 const o=$("#wxout");
 if(!P.reg&&!P.gps){o.innerHTML='<div class="res">Choose your area above, or tap <b>'+html(T("use_loc"))+'</b>.</div>';return}
 o.innerHTML='<div class="res">Loading the forecast…</div>';
 wxData=await getWx();
 if(!wxData){o.innerHTML='<div class="res">The forecast is not reachable right now. Check your internet and try again, or visit pmd.gov.pk.<br><button class="go" id="wxretry">Try again</button></div>';$("#wxretry").onclick=openWx;return}
 drawWx();
}
$("#wxreg").onchange=e=>{P.reg=e.target.value;delete P.gps;$("#reg").value=P.reg;save();openWx()};
function askGps(then){
 if(!navigator.geolocation){toast("This browser cannot share your location");return}
 toast("Finding your location…");
 navigator.geolocation.getCurrentPosition(pos=>{P.gps={lat:+pos.coords.latitude.toFixed(3),lon:+pos.coords.longitude.toFixed(3)};save();toast("Location saved");then&&then()},()=>toast("Location blocked. Choose your area from the list instead."),{timeout:12000,maximumAge:600000});
}
$("#wxgps").onclick=()=>askGps(openWx);

/* ------------------------------------------------------------------ Today card */
async function renderToday(){
 const tg=$("#tg");if(!tg)return;
 const m=new Date().getMonth()+1,sow=CAL.filter(c=>c[1].includes(m)).map(c=>c[0]),harv=CAL.filter(c=>c[2].includes(m)).map(c=>c[0]);
 const due=rems.filter(r=>!r.done&&r.d<=new Date().toISOString().slice(0,10)).length;
 const cell=(cls,e,b,s,id)=>'<div class="tc '+cls+'"'+(id?' id="'+id+'" style="cursor:pointer"':'')+'><div class="ico">'+e+'</div><div><b>'+html(b)+'</b><span>'+html(s)+'</span></div></div>';
 const rest=cell("","🌱",sow.length?p("sow"):p("none"),sow.slice(0,4).join(", ")+(harv.length?"\n"+p("harv")+": "+harv.slice(0,3).join(", "):""))+cell(due?"warn":"good","⏰",due?due+" "+p("due"):p("nodue"),due?"":"✔");
 const paint=h=>{tg.innerHTML=h+rest;const l=$("#tc-loc");if(l)l.onclick=()=>askGps(renderToday);const sp=$("#tc-spray");if(sp)sp.onclick=()=>window.go("wx")};
 if(!(P.reg||P.gps)){paint(cell("warn","📍",p("setloc"),p("setloc_s"),"tc-loc"));return}
 paint(cell("","⏳","…",""));
 const w=await getWx();
 if(!w){paint(cell("warn","📡","—","Weather not reachable"));return}
 wxData=w;const d0=w.days[0],[e,lab]=WC(w.now.code),sp=sprayVerdict(d0);
 paint(cell("","<span>"+e+"</span>",Math.round(w.now.t)+"°C "+lab,Math.round(d0.min)+"° / "+Math.round(d0.max)+"°  ·  "+p("wind")+" "+Math.round(w.now.wind)+" km/h")+cell(sp.l,sp.e,sp.h,sp.s.split(".")[0]+".","tc-spray"));
}

/* ------------------------------------------------------------------ quick actions */
$("#a-scan").onclick=()=>{window.go("chat");const f=$("#f");f.setAttribute("capture","environment");if(!$("#t").value)$("#t").value="What is wrong with my crop? Please look at the photo.";f.click()};
$("#clip").addEventListener("click",()=>$("#f").removeAttribute("capture"),true);
$("#a-voice").onclick=()=>{window.go("chat");$("#mic").click()};
$("#a-spray").onclick=()=>{window.go("wx")};
$("#a-fert").onclick=()=>window.go("fert");

/* ------------------------------------------------------------------ fertilizer calculator */
/* kg of nutrient per acre (N, P2O5, K2O): typical guide values for irrigated Punjab-type conditions. Always confirm with a soil test. */
const FERT={
 Wheat:[50,35,0,"At sowing: all the DAP and one third of the urea. Give the rest of the urea with the first and second irrigation."],
 Rice:[40,25,0,"At transplanting: all the DAP. Split the urea in three: at transplanting, three weeks later, and when panicles start."],
 Cotton:[60,25,25,"At sowing: all the DAP. Urea in three doses: at thinning, first flower and boll setting. Too much urea late makes pests worse."],
 Maize:[80,45,0,"At sowing: all the DAP and a quarter of the urea. Give the rest at knee-high stage and at tasseling."],
 Sugarcane:[70,40,0,"At planting: all the DAP. Urea in three doses, the last one before the monsoon rains."],
 Potato:[80,50,50,"At planting: all the DAP, the potash and half of the urea. The rest at earthing up, about 30 days later."],
 Canola:[40,25,0,"At sowing: all the DAP and half of the urea. The rest with the first irrigation."],
 Chickpea:[8,25,0,"At sowing: all the DAP. Chickpea makes its own nitrogen, so it usually needs no urea."]
};
Object.keys(FERT).forEach(c=>{$("#f1").add(new Option(c));});
function prepFert(){if(P.cr&&FERT[P.cr])$("#f1").value=P.cr;if(P.ac&&!$("#fres").innerHTML)$("#f2").value=P.ac}
let lastFert=null;
$("#fgo").onclick=()=>{
 const c=$("#f1").value,a=Math.max(.25,num($("#f2").value)||1),[N,Pp,K,sch]=FERT[c];
 const dap=Pp/.46,nd=dap*.18,urea=Math.max(0,(N-nd)/.46),mop=K/.6;
 const bags=kg=>Math.round(kg*a/50*2)/2,uB=bags(urea),dB=bags(dap),mB=bags(mop);
 const up=num($("#f3").value),dp=num($("#f4").value),cost=uB*up+dB*dp;
 lastFert={a,cost};
 $("#fres").innerHTML='<div class="res"><h3>'+c+' on '+a+' acre</h3><div class="stat"><div><b>'+uB+' bags</b>Urea ('+Math.round(urea*a)+' kg)</div><div><b>'+dB+' bags</b>DAP ('+Math.round(dap*a)+' kg)</div>'+(K?'<div><b>'+mB+' bags</b>Potash SOP/MOP ('+Math.round(mop*a)+' kg)</div>':'')+((up||dp)?'<div><b>'+rs(cost)+'</b>Fertilizer cost</div>':'')+'</div>'+
 '<b>When to put it on</b><p style="margin:.3rem 0">'+html(sch)+'</p><div class="leg"><span>Nutrients per acre: nitrogen '+N+' kg, phosphorus (P₂O₅) '+Pp+' kg'+(K?', potash (K₂O) '+K+' kg':'')+'</span></div>'+
 '<p class="note">Bags are rounded to the nearest half bag. These are typical guide rates, not a prescription. A soil test from your Agriculture Department lab gives the real need'+(K?'':', and potash is only worth adding if the test says it is low')+'.</p>'+
 '<div class="row">'+((up||dp)?'<button class="btn ghost" id="fuse">Use cost in profit calculator</button>':'')+'<button class="btn ghost" id="fask">💬 Ask Kisan Dost</button></div></div>';
 const fu=$("#fuse");if(fu)fu.onclick=()=>{$("#p0").value=c;$("#p1").value=a;$("#pr3").value=Math.round(cost/a);window.go("prof")};
 $("#fask").onclick=()=>{window.go("chat");send("I will grow "+c+" on "+a+" acre. The calculator says "+uB+" bags urea and "+dB+" bags DAP. Is this right for my area and how should I split it?")};
};

/* ------------------------------------------------------------------ profit calculator */
const YH={Wheat:"25 to 40",Rice:"35 to 60",Cotton:"15 to 25",Maize:"60 to 100",Sugarcane:"500 to 900",Potato:"100 to 200",Canola:"12 to 20",Chickpea:"8 to 15"};
Object.keys(YH).concat(["Other crop"]).forEach(c=>$("#p0").add(new Option(c)));
const PCAT=["Land rent","Ploughing and sowing","Seed","Fertilizer","Spray and medicine","Water, electricity or diesel","Labour","Harvest and transport"],PCOL=["#8b7cf6","#c98a4b","#e0b43c","#4fb87a","#e0645a","#43a8d8","#d17fb0","#8a97a6"];
function hint(){const c=$("#p0").value;$("#pyh").textContent=YH[c]?"Typical in Pakistan: "+YH[c]+" maan per acre. It changes a lot with variety and season. Use your own past yield if you have it.":""}
$("#p0").onchange=hint;
function saveProf(){ls.set("kd_prof",JSON.stringify({c:$("#p0").value,a:$("#p1").value,k:$$(".pc").map(x=>x.value),y:$("#py").value,p:$("#pp").value}))}
function prepProf(){hint()}
try{const sv=JSON.parse(ls.get("kd_prof","null"));if(sv){$("#p0").value=sv.c;$("#p1").value=sv.a;$$(".pc").forEach((x,i)=>x.value=sv.k[i]||"");$("#py").value=sv.y;$("#pp").value=sv.p}}catch(e){}
$("#pgo").onclick=()=>{
 saveProf();
 const a=Math.max(.25,num($("#p1").value)||1),k=$$(".pc").map(x=>num(x.value)),c=k.reduce((s,v)=>s+v,0),y=num($("#py").value),pr=num($("#pp").value);
 if(!c||!y||!pr){toast("Fill in some costs, the yield and the price");return}
 const rev=y*pr,prof=rev-c,be=c/y,bey=c/pr,mg=prof/rev*100,crop=$("#p0").value;
 const sens=[["Price 10% lower",y*pr*.9-c],["Price 10% higher",y*pr*1.1-c],["Yield 10% lower",y*.9*pr-c]];
 $("#pres").innerHTML='<div class="res"><h3>'+html(crop)+' on '+a+' acre</h3><div class="stat"><div class="'+(prof>=0?"pos":"neg")+'"><b>'+rs(prof*a)+'</b>'+(prof>=0?"Profit":"Loss")+' on all your land</div><div class="'+(prof>=0?"pos":"neg")+'"><b>'+rs(prof)+'</b>per acre ('+mg.toFixed(0)+'% of sales)</div><div><b>'+rs(be)+'</b>Lowest price per maan that covers costs</div><div><b>'+bey.toFixed(1)+' maan</b>Lowest yield per acre at your price</div></div>'+
 '<b>Where the money goes</b><div class="mix">'+k.map((v,i)=>v?'<i style="width:'+v/c*100+'%;background:'+PCOL[i]+'" title="'+PCAT[i]+'"></i>':"").join("")+'</div><div class="leg">'+k.map((v,i)=>v?'<span><b style="background:'+PCOL[i]+'"></b>'+PCAT[i]+' '+Math.round(v/c*100)+'%</span>':"").join("")+'</div>'+
 '<p style="margin:.9rem 0 .2rem"><b>If things change (per acre)</b></p><div class="stat">'+sens.map(s=>'<div class="'+(s[1]>=0?"pos":"neg")+'"><b>'+rs(s[1])+'</b>'+s[0]+'</div>').join("")+'</div>'+
 '<div class="row"><button class="btn ghost" id="pjn">📓 Save to journal</button><button class="btn ghost" id="pask">💬 How can I earn more?</button></div><p class="note">Your numbers only. This is a planning tool, not a guarantee. Market prices move.</p></div>';
 $("#pjn").onclick=()=>{const pj=projects.find(x=>x.id==apid);if(!pj){toast("Open a project first (Projects)");go("proj");return}
  const d=new Date().toLocaleDateString();(pj.j=pj.j||[]).push({k:"Note",t:"Profit plan "+crop+": cost "+rs(c*a)+", expected sales "+rs(rev*a)+", profit "+rs(prof*a),a:0,d});save();toast("Saved to journal")};
 $("#pask").onclick=()=>{window.go("chat");send("My "+crop+" costs Rs "+Math.round(c)+" per acre and I expect "+y+" maan at Rs "+pr+" per maan. Profit is about Rs "+Math.round(prof)+" per acre. How can I lower costs or earn more safely?")};
};

/* ------------------------------------------------------------------ share + install */
$("#shapp").onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent("Kisan Dost: free AI farming help in Urdu, Punjabi, Pashto and English. Weather, spray advice, fertilizer and profit calculators. "+location.origin),"_blank","noopener");
let deferred=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("#instb").style.display="inline-flex"});
$("#instb").onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;$("#instb").style.display="none"};
if("serviceWorker"in navigator&&location.protocol!=="file:")addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

/* ------------------------------------------------------------------ boot */
setTheme(ls.get("kd_theme","auto"),false);
setBg(ls.get("kd_bg",lowEnd?"calm":"live"),false);
applyI18n();
})();
