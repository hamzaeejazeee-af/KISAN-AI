(function(){
const $=s=>document.querySelector(s);
const USERS=()=>{try{return JSON.parse(localStorage.getItem("kdu_users")||"{}")}catch(e){return{}}};
const saveUsers=u=>localStorage.setItem("kdu_users",JSON.stringify(u));
const hex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
async function hashPw(pw,salt){
  if(window.crypto&&crypto.subtle){const e=new TextEncoder();const k=await crypto.subtle.importKey("raw",e.encode(pw),"PBKDF2",false,["deriveBits"]);return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:e.encode(salt),iterations:100000,hash:"SHA-256"},k,256))}
  let h=5381;const t=salt+pw;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return"x"+(h>>>0).toString(16)}
const rnd=()=>hex(crypto.getRandomValues?crypto.getRandomValues(new Uint8Array(12)):Array.from({length:12},()=>Math.random()*256|0));
let mode="login";
function acct(){const a=$("#acct");if(!a)return;
  if(KDU_SESS){a.innerHTML='<div class="acc"><span title="'+KDU_SESS.u+'"><b></b></span><button id="lo" type="button">Log out</button></div>';a.querySelector("b").textContent=KDU_SESS.n;$("#lo").onclick=()=>{localStorage.removeItem("kdu_sess");location.reload()}}
  else{a.innerHTML='<button id="su" type="button" class="accb">Sign up / Log in</button>';$("#su").onclick=()=>open("signup")}}
function setMode(m){mode=m;const s=m==="signup";$("#atl").classList.toggle("on",!s);$("#ats").classList.toggle("on",s);document.querySelectorAll(".onlysu").forEach(e=>e.style.display=s?"block":"none");$("#aerr").textContent="";$("#asub").textContent=s?"Create account":"Log in"}
function open(m){setMode(m||"login");$("#authm").classList.add("on");setTimeout(()=>{try{(m==="signup"?$("#an"):$("#au")).focus()}catch(e){}},60)}
function close(){$("#authm").classList.remove("on")}
function err(t){$("#aerr").textContent=t}
async function submit(){
  const u=$("#au").value.trim().toLowerCase(),pw=$("#ap1").value,db=USERS();
  if(!/^[a-z0-9_.]{3,20}$/.test(u))return err("Username: 3-20 letters, numbers, . or _");
  if(pw.length<6)return err("Password must be at least 6 characters.");
  if(mode==="signup"){
    const n=$("#an").value.trim();if(n.length<2)return err("Please enter your name.");
    if(pw!==$("#ap2").value)return err("Passwords do not match.");
    if(db[u])return err("That username is taken. Try another.");
    const salt=rnd();db[u]={n:n,s:salt,h:await hashPw(pw,salt),t:Date.now()};saveUsers(db);
    if($("#akeep").checked){["kd2_p","kd2_c","kd2_pr","kd2_a","kd2_r"].forEach(k=>{const v=localStorage.getItem(k);if(v!==null)localStorage.setItem(k+"__"+u,v)})}
    localStorage.setItem("kdu_sess",JSON.stringify({u:u,n:n}));localStorage.setItem("kdu_seen","1");location.reload()}
  else{
    const r=db[u];if(!r||await hashPw(pw,r.s)!==r.h)return err("Wrong username or password.");
    localStorage.setItem("kdu_sess",JSON.stringify({u:u,n:r.n}));localStorage.setItem("kdu_seen","1");location.reload()}}
acct();
$("#atl").onclick=()=>setMode("login");$("#ats").onclick=()=>setMode("signup");$("#asub").onclick=submit;
$("#agu").onclick=()=>{localStorage.setItem("kdu_seen","1");close()};
$("#authm").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.tagName==="INPUT")submit();if(e.key==="Escape")close()});
const sp=$("#splash");let shown=false;
function afterIntro(){if(shown||KDU_SESS||localStorage.getItem("kdu_seen"))return;shown=true;setTimeout(()=>open("signup"),500)}
if(!sp||sp.classList.contains("out")||getComputedStyle(sp).display==="none")afterIntro();
else{new MutationObserver(()=>{if(sp.classList.contains("out"))afterIntro()}).observe(sp,{attributes:true,attributeFilter:["class"]});setTimeout(()=>{if(!document.body.contains(sp)||getComputedStyle(sp).visibility==="hidden")afterIntro()},9000)}
})();
