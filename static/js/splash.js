/* Kisan Dost intro (Hamza Ejaz): CSS draws the logo and the words, this canvas draws the sky, the sunrise glow, the field rows and drifting fireflies. */
(()=>{const sp=document.getElementById("splash");if(!sp)return;
const cv=sp.querySelector("canvas"),RM=matchMedia("(prefers-reduced-motion:reduce)").matches;let done=false;
const end=()=>{if(done)return;done=true;sp.classList.add("out");setTimeout(()=>sp.remove(),900)};
sp.onclick=end;const sk=document.getElementById("spskip");sk.onclick=e=>{e.stopPropagation();end()};
setTimeout(end,RM?1300:5400);
if(window.KDV&&KDV.uiLang()==="ur"){sk.textContent="چھوڑیں ›";const tg=sp.querySelector(".spt");tg.textContent="اپنی زبان میں پوچھیں۔ اعتماد کے ساتھ اگائیں۔";tg.dir="rtl";tg.style.fontFamily='"Noto Nastaliq Urdu",serif';tg.style.lineHeight="2"}
document.getElementById("sptitle").innerHTML=[..."Kisan Dost"].map((c,i)=>'<span style="animation-delay:'+(2.75+i*.055).toFixed(3)+'s">'+(c===" "?"&nbsp;":c)+"</span>").join("");
if(RM)return;
try{
const g=cv.getContext("2d"),TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=p=>1-Math.pow(1-p,3),rnd=(a,b)=>a+Math.random()*(b-a);
let W,H,D,hz,lx,ly,spr;
const sprite=()=>{const s=document.createElement("canvas");s.width=s.height=32;const x=s.getContext("2d"),r=x.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,"rgba(255,240,170,1)");r.addColorStop(.28,"rgba(255,214,90,.5)");r.addColorStop(1,"rgba(255,214,90,0)");x.fillStyle=r;x.fillRect(0,0,32,32);return s};
const parts=Array.from({length:46},()=>({x:Math.random(),y:rnd(.15,1.05),v:rnd(.012,.034),s:rnd(5,13),p:rnd(0,TAU),f:rnd(.8,2.2),g:Math.random()<.35}));
function layout(){D=Math.min(devicePixelRatio||1,2);W=cv.width=Math.round(innerWidth*D);H=cv.height=Math.round(innerHeight*D);hz=H*.83;
 const b=sp.querySelector(".spl").getBoundingClientRect();lx=(b.left+b.width/2)*D;ly=(b.top+b.height/2)*D}
spr=sprite();layout();addEventListener("resize",layout);
const t0=performance.now(),N=16;
const fr=now=>{if(done)return;const t=(now-t0)/1000;
 let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#020b07");gr.addColorStop(.72,"#04170e");gr.addColorStop(1,"#062414");g.fillStyle=gr;g.fillRect(0,0,W,H);
 /* sunrise glow behind the logo */
 const gp=ease(clamp((t-.9)/1.5));
 if(gp>0){const R=Math.max(W,H)*.6;gr=g.createRadialGradient(lx,ly,0,lx,ly,R);gr.addColorStop(0,"rgba(255,186,58,"+(.30*gp)+")");gr.addColorStop(.4,"rgba(255,160,40,"+(.08*gp)+")");gr.addColorStop(1,"rgba(255,160,40,0)");g.fillStyle=gr;g.fillRect(0,0,W,H)}
 /* ground */
 g.fillStyle="rgba(3,22,13,.85)";g.fillRect(0,hz,W,H-hz);
 /* crop rows drawn out from the vanishing point */
 const rp=ease(clamp((t-.45)/1.5));
 g.lineWidth=Math.max(1,D);
 for(let i=-N;i<=N;i++){const bx=W/2+i*W*.17,ex=W/2+(bx-W/2)*rp,ey=hz+(H-hz)*rp;
  const lg=g.createLinearGradient(W/2,hz,ex,ey);lg.addColorStop(0,"rgba(90,230,150,0)");lg.addColorStop(1,"rgba(90,230,150,"+(.34*Math.min(1,rp*1.4))+")");g.strokeStyle=lg;g.beginPath();g.moveTo(W/2,hz);g.lineTo(ex,ey);g.stroke()}
 /* horizon line */
 const hp=ease(clamp((t-.1)/.9)),hw=W*hp;
 if(hw>2){gr=g.createLinearGradient(W/2-hw/2,0,W/2+hw/2,0);gr.addColorStop(0,"rgba(255,212,90,0)");gr.addColorStop(.5,"rgba(255,212,90,.65)");gr.addColorStop(1,"rgba(255,212,90,0)");g.fillStyle=gr;g.fillRect(W/2-hw/2,hz-D*.5,hw,Math.max(1,D))}
 /* fireflies */
 for(const b of parts){const y=((b.y-t*b.v)%1.2+1.2)%1.2-.1,x=b.x+Math.sin(t*.6+b.p)*.02,a=(.25+.75*Math.max(0,Math.sin(t*b.f+b.p)))*clamp(t/1.2)*(y<.1?y*10:1),s=b.s*D;
  g.globalAlpha=Math.max(0,Math.min(1,a))*(b.g?.6:1);g.drawImage(spr,x*W-s/2,y*H-s/2,s,s)}
 g.globalAlpha=1;
 requestAnimationFrame(fr)};
requestAnimationFrame(fr)}catch(e){}
})();
