/* Kisan Dost animated farm scene. Layers: sky, sun/moon, clouds, ridges, hills, canal, crop rows, tractor, swaying wheat.
   Static layers are pre-rendered once; only a few things move per frame, so it stays smooth on cheap phones.
   Modes: live (animated), calm (one still frame), off. Themes come from <html data-theme>. */
(function(){
const cv=document.getElementById("bgfarm");if(!cv)return;
const g=cv.getContext("2d"),TAU=Math.PI*2,rmq=matchMedia("(prefers-reduced-motion:reduce)");
const PAL={
 night:{oy:.2,sky:["#040b10","#0c2620","#1b4a37"],orb:"#f6f1d2",glow:"246,241,210",night:1,far:"#0d2a27",h1:"#123b2d",h2:"#17503a",rows:["#1b5c3d","#17503a"],canal:["#0f3d52","#1d6f8c"],wheat:"#d9bd55",cloud:"170,205,195",ca:.09,bird:"#a8c9bd"},
 day:{oy:.2,sky:["#7cc6f0","#bfe6f4","#f3f7d8"],orb:"#fff6bf",glow:"255,240,170",night:0,far:"#9ccbc0",h1:"#7dbd84",h2:"#5aab68",rows:["#49a05a","#56ae67"],canal:["#4fb0d8","#a2dcf0"],wheat:"#e8bd3a",cloud:"255,255,255",ca:.88,bird:"#35574a"},
 harvest:{oy:.4,sky:["#24122c","#9a3f2e","#f0a24a"],orb:"#ffdb8f",glow:"255,170,80",night:0,far:"#58303a",h1:"#693a2c",h2:"#7b4b22",rows:["#8b6a22","#7b5d1d"],canal:["#a9503a","#de8a50"],wheat:"#f6c544",cloud:"255,180,130",ca:.30,bird:"#2a1530"},
 canal:{oy:.2,sky:["#03121d","#0a3250","#1b6784"],orb:"#d9f3ff",glow:"150,220,255",night:1,far:"#0a2e3f",h1:"#0d4155",h2:"#12566a",rows:["#19685f","#16595a"],canal:["#1b7ea6","#52c8ea"],wheat:"#bfe3a0",cloud:"170,215,235",ca:.11,bird:"#9fd3e6"},
 mango:{oy:.24,sky:["#ffcf93","#ffe6bf","#fff5de"],orb:"#fff0b0",glow:"255,200,100",night:0,far:"#efc79b",h1:"#a6cd78",h2:"#85bb58",rows:["#76ae4e","#82b957"],canal:["#69bec8","#b3e2e5"],wheat:"#e09f2a",cloud:"255,255,255",ca:.8,bird:"#6a4020"}};
let theme=(document.documentElement.dataset.theme||"night"),mode="live",W=0,H=0,D=1,P=PAL.night,skyC,landC,t=0,last=0,raf=0,vis=true;
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(h,k)=>{const n=parseInt(h.slice(1),16),m=k<0?0:255,a=Math.abs(k);return"rgb("+[n>>16,n>>8&255,n&255].map(v=>Math.round(v+(m-v)*a))+")"};
let stars=[],clouds=[],birds=[],flies=[],stalks=[],tractor={x:.1};
function seed(){
 stars=Array.from({length:110},()=>({x:Math.random(),y:Math.random()*.5,r:rnd(.5,1.5),p:rnd(0,TAU),s:rnd(.6,2)}));
 clouds=Array.from({length:5},(_,i)=>({x:i/5+rnd(0,.1),y:rnd(.08,.3),s:rnd(.8,1.5),v:rnd(.003,.008)}));
 birds=Array.from({length:4},()=>({x:rnd(-.2,1),y:rnd(.12,.32),v:rnd(.012,.02),p:rnd(0,TAU),s:rnd(.8,1.2)}));
 flies=Array.from({length:26},()=>({x:Math.random(),y:rnd(.62,.95),p:rnd(0,TAU),s:rnd(.3,.9)}));}
function layer(){const c=document.createElement("canvas");c.width=Math.round(W*D);c.height=Math.round(H*D);const x=c.getContext("2d");x.setTransform(D,0,0,D,0,0);return[c,x]}
function ridge(x,base,amp,f,ph,col,studs){
 x.fillStyle=col;x.beginPath();x.moveTo(0,H);
 for(let i=0;i<=W;i+=6){const y=base-(Math.sin(i*f+ph)*.6+Math.sin(i*f*2.3+ph*1.7)*.28+Math.sin(i*f*5.1+ph)*.12)*amp;x.lineTo(i,y)}
 x.lineTo(W,H);x.closePath();x.fill();
 if(studs){ /* faint brick-stud dots along the crest: the Lego signature, kept subtle */
  x.fillStyle="rgba(255,255,255,.07)";const s=Math.max(16,H/38);
  for(let i=s/2;i<W;i+=s){const y=base-(Math.sin(i*f+ph)*.6+Math.sin(i*f*2.3+ph*1.7)*.28+Math.sin(i*f*5.1+ph)*.12)*amp+s*.7;x.beginPath();x.ellipse(i,y,s*.2,s*.08,0,0,TAU);x.fill()}}}
function build(){
 P=PAL[theme]||PAL.night;let a=layer(),x=a[1];skyC=a[0];
 const gr=x.createLinearGradient(0,0,0,H*.68);gr.addColorStop(0,P.sky[0]);gr.addColorStop(.55,P.sky[1]);gr.addColorStop(1,P.sky[2]);x.fillStyle=gr;x.fillRect(0,0,W,H);
 a=layer();x=a[1];landC=a[0];
 const hz=H*.5;
 ridge(x,hz,H*.07,.004,1,P.far,0);
 ridge(x,hz+H*.045,H*.05,.0065,3,P.h1,0);
 ridge(x,hz+H*.095,H*.04,.009,5,P.h2,0);
 /* canal */
 const cy=H*.64,ch=H*.035,cg=x.createLinearGradient(0,cy,0,cy+ch);cg.addColorStop(0,P.canal[0]);cg.addColorStop(1,P.canal[1]);
 x.fillStyle=mix(P.h2,-.25);x.fillRect(0,cy-3,W,ch+7);x.fillStyle=cg;x.fillRect(0,cy,W,ch);
 /* crop rows in perspective */
 const fy=cy+ch+3,vx=W*.55,vy=fy-H*.04;
 x.fillStyle=P.rows[0];x.fillRect(0,fy,W,H-fy);
 const n=26;for(let i=-n;i<=n*2;i++){const bx=vx+(i-n/2)*W/n*1.25,bx2=bx+W/n*.62;x.fillStyle=P.rows[1];x.beginPath();x.moveTo(vx+(bx-vx)*.04,vy+(fy-vy)*0);x.lineTo(vx+(bx2-vx)*.04,vy);x.lineTo(bx2,H);x.lineTo(bx,H);x.closePath();x.globalAlpha=.9;x.fill();x.globalAlpha=1}
 const sh=x.createLinearGradient(0,fy,0,H);sh.addColorStop(0,"rgba(0,0,0,.22)");sh.addColorStop(.35,"rgba(0,0,0,0)");sh.addColorStop(1,"rgba(0,0,0,.12)");x.fillStyle=sh;x.fillRect(0,fy,W,H-fy);
 /* soft haze at the horizon so the layers melt together */
 const hg=x.createLinearGradient(0,hz-H*.1,0,hz+H*.1);hg.addColorStop(0,"rgba("+P.glow+",0)");hg.addColorStop(.5,"rgba("+P.glow+","+(P.night?.05:.16)+")");hg.addColorStop(1,"rgba("+P.glow+",0)");x.fillStyle=hg;x.fillRect(0,hz-H*.1,W,H*.2);
 clouds.forEach(mkCloud);
 stalks=Array.from({length:Math.ceil(W/16)},(_,i)=>({x:i*16+rnd(-5,5),h:H*rnd(.035,.085),p:rnd(0,TAU),k:rnd(.7,1.3)}));
}
function mkCloud(c){const u=Math.max(7,c.s*H/620*15),w=Math.ceil(u*16),h=Math.ceil(u*7),k=document.createElement("canvas");k.width=w;k.height=h;const x=k.getContext("2d");
 try{x.filter="blur("+Math.round(u*.45)+"px)"}catch(e){}
 x.fillStyle="rgb("+P.cloud+")";[[3,3.6,2.4],[5.6,2.6,3],[8.4,3.7,2.6],[6,4.4,3.2],[3.2,4.6,2]].forEach(b=>{x.beginPath();x.ellipse(b[0]*u,b[1]*u,b[2]*u,b[2]*u*.55,0,0,TAU);x.fill()});c.k=k}
function cloud(c){const x=((c.x+t*c.v)%1.4-.2)*W,y=c.y*H;g.globalAlpha=P.ca;g.drawImage(c.k,x,y);g.globalAlpha=1}
function orb(){const x=W*.88,y=H*P.oy+Math.sin(t*.1)*3,r=Math.max(22,H*.052);
 const rg=g.createRadialGradient(x,y,r*.4,x,y,r*6);rg.addColorStop(0,"rgba("+P.glow+","+(P.night?.30:.55)+")");rg.addColorStop(1,"rgba("+P.glow+",0)");g.fillStyle=rg;g.fillRect(x-r*6,y-r*6,r*12,r*12);
 g.fillStyle=P.orb;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
 if(P.night){g.fillStyle="rgba(10,30,30,.16)";[[-.3,-.2,.22],[.25,.15,.16],[-.1,.35,.12]].forEach(c=>{g.beginPath();g.arc(x+c[0]*r,y+c[1]*r,c[2]*r,0,TAU);g.fill()})}}
function bird(b){const x=((b.x+t*b.v)%1.3-.15)*W,y=b.y*H+Math.sin(t*.7+b.p)*6,w=7*b.s*Math.max(.8,H/700),f=Math.sin(t*5+b.p)*w*.55;
 g.strokeStyle=P.bird;g.lineWidth=1.6;g.lineCap="round";g.beginPath();g.moveTo(x-w,y-f);g.quadraticCurveTo(x-w*.4,y-w*.5,x,y);g.quadraticCurveTo(x+w*.4,y-w*.5,x+w,y-f);g.stroke()}
function wheel(cx,cy,r,a){g.fillStyle="#12161d";g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
 g.fillStyle="#252d39";const n=Math.round(r*.9)+4;for(let i=0;i<n;i++){const q=a+i*TAU/n;g.save();g.translate(cx+Math.cos(q)*r*.9,cy+Math.sin(q)*r*.9);g.rotate(q);g.fillRect(-1.6,-r*.2,3.4,r*.4);g.restore()}
 g.fillStyle="#f2b632";g.beginPath();g.arc(cx,cy,r*.56,0,TAU);g.fill();
 g.strokeStyle="#b9820f";g.lineWidth=1.4;for(let i=0;i<5;i++){const q=a+i*TAU/5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(q)*r*.52,cy+Math.sin(q)*r*.52);g.stroke()}
 g.fillStyle="#3a2c08";g.beginPath();g.arc(cx,cy,r*.14,0,TAU);g.fill()}
function drawTractor(){const s=Math.max(.7,H/820)*1.2,x=((tractor.x+t*.012)%1.3-.15)*W,y=H*.8;
 g.save();g.translate(x,y);g.scale(s,s);
 g.fillStyle="rgba(0,0,0,.26)";g.beginPath();g.ellipse(8,2,52,5,0,0,TAU);g.fill();
 g.translate(0,Math.sin(t*16)*.6);
 g.fillStyle="#6f7a87";g.fillRect(46,-64,4,22);g.fillStyle="#4a535e";g.fillRect(45,-66,6,3);
 for(let i=0;i<4;i++){const p=(t*1.2+i*.25)%1;g.fillStyle="rgba(210,214,220,"+.34*(1-p)+")";g.beginPath();g.arc(48-p*11,-69-p*24,2+p*5,0,TAU);g.fill()}
 const gr=g.createLinearGradient(0,-46,0,-22);gr.addColorStop(0,"#ee5a43");gr.addColorStop(1,"#b52c1c");g.fillStyle=gr;
 g.beginPath();g.moveTo(16,-24);g.lineTo(16,-41);g.quadraticCurveTo(16,-46,22,-46);g.lineTo(54,-46);g.quadraticCurveTo(60,-46,62,-40);g.lineTo(66,-24);g.closePath();g.fill();
 g.fillStyle="rgba(255,255,255,.24)";g.fillRect(22,-45,32,2);
 g.fillStyle="#f2b632";g.fillRect(62,-37,4,10);g.fillStyle="#fff3b0";g.beginPath();g.arc(60,-34,2.2,0,TAU);g.fill();
 g.fillStyle="#2a323d";g.fillRect(-8,-26,72,6);
 g.fillStyle="rgba(176,222,246,.62)";g.beginPath();g.moveTo(-9,-30);g.lineTo(-6,-60);g.lineTo(14,-60);g.lineTo(17,-30);g.closePath();g.fill();
 g.fillStyle="rgba(255,255,255,.28)";g.beginPath();g.moveTo(-3,-58);g.lineTo(2,-58);g.lineTo(-2,-32);g.lineTo(-7,-32);g.closePath();g.fill();
 g.strokeStyle="#2a323d";g.lineWidth=2.6;g.lineJoin="round";g.beginPath();g.moveTo(-9,-30);g.lineTo(-6,-60);g.lineTo(14,-60);g.lineTo(17,-30);g.stroke();
 g.fillStyle="#2a323d";g.fillRect(-9,-65,28,6);
 wheel(2,-20,20,-t*4);wheel(52,-11,11,-t*7);
 g.restore()}
function canalShimmer(){const cy=H*.64,ch=H*.035;g.save();g.beginPath();g.rect(0,cy,W,ch);g.clip();g.strokeStyle="rgba(255,255,255,"+(P.night?.16:.38)+")";g.lineWidth=1.4;
 for(let i=0;i<14;i++){const x=((i/14+t*.015*(1+i%3*.3))%1.2-.1)*W,y=cy+ch*(.2+(i*37%7)/9);g.beginPath();g.moveTo(x,y);g.lineTo(x+W*.04,y);g.stroke()}g.restore()}
function wheat(){const y0=H+2;g.lineCap="round";
 stalks.forEach((s,i)=>{const sw=Math.sin(t*1.5*s.k+s.p+i*.18)*5*s.k+Math.sin(t*.5+i*.05)*3,hx=s.x+sw,hy=y0-s.h;
  g.strokeStyle=mix(P.rows[0],.1);g.lineWidth=2;g.beginPath();g.moveTo(s.x,y0);g.quadraticCurveTo(s.x+sw*.2,y0-s.h*.6,hx,hy);g.stroke();
  g.fillStyle=P.wheat;for(let k=0;k<4;k++){const px=hx+(k*.5)*sw*.02,py=hy-k*3.6;g.beginPath();g.ellipse(px-2.2,py,1.8,3.1,-.5,0,TAU);g.fill();g.beginPath();g.ellipse(px+2.2,py-1,1.8,3.1,.5,0,TAU);g.fill()}})}
function fireflies(){flies.forEach(f=>{const x=(f.x+Math.sin(t*f.s*.4+f.p)*.03)*W,y=(f.y+Math.cos(t*f.s*.5+f.p)*.02)*H,a=.35+.65*Math.max(0,Math.sin(t*f.s*1.6+f.p));
 const rg=g.createRadialGradient(x,y,0,x,y,9);rg.addColorStop(0,"rgba(255,244,150,"+a+")");rg.addColorStop(1,"rgba(255,244,150,0)");g.fillStyle=rg;g.fillRect(x-9,y-9,18,18)})}
function draw(){
 g.drawImage(skyC,0,0,W,H);
 if(P.night)stars.forEach(s=>{g.fillStyle="rgba(255,255,255,"+(.35+.55*Math.sin(t*s.s+s.p)**2)+")";g.beginPath();g.arc(s.x*W,s.y*H,s.r,0,TAU);g.fill()});
 orb();clouds.forEach(cloud);if(!P.night)birds.forEach(bird);
 g.drawImage(landC,0,0,W,H);canalShimmer();drawTractor();if(P.night)fireflies();wheat();
}
function size(){D=Math.min(devicePixelRatio||1,innerWidth<700?1.5:2);W=innerWidth;H=innerHeight;cv.width=Math.round(W*D);cv.height=Math.round(H*D);g.setTransform(D,0,0,D,0,0);build();draw()}
function frame(ts){raf=requestAnimationFrame(frame);if(!vis||ts-last<40)return;last=ts;t+=.04;draw()}
function run(){cancelAnimationFrame(raf);if(mode==="live"&&!rmq.matches)raf=requestAnimationFrame(frame);else{t=Math.max(t,2);draw()}}
document.addEventListener("visibilitychange",()=>{vis=!document.hidden});
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{size();run()},150)});
seed();size();run();
window.KDBG={theme(n){if(PAL[n]){theme=n;build();draw()}},mode(m){mode=m;document.body.classList.toggle("bg-off",m==="off");run()}};
})();
