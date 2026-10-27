(function(){
 var box=document.getElementById('aiBox'),msg=document.getElementById('aiM'),st=document.getElementById('aiSt');
 function show(){box.style.display='flex';msg.textContent='';document.getElementById('aiK').focus();}
 function hide(){box.style.display='none';}
 async function status(auto){
  try{var h=await (await fetch('/api/health')).json();
   var any=h.groq||h.xai||h.gemini||h.claude||h.ollama;
   st.textContent=any?('AI ready: '+[h.groq&&'Groq',h.xai&&'Grok',h.claude&&'Claude',h.gemini&&'Gemini',h.ollama&&'Ollama'].filter(Boolean).join(', ')):'No AI key yet - tap AI Setup';
   st.style.color=any?'var(--ac)':'#fbbf24';
   if(auto&&!any&&h.can_setup&&!sessionStorage.getItem('ai_prompted')){sessionStorage.setItem('ai_prompted','1');show();}
  }catch(e){st.textContent=(location.protocol==='file:'?'You opened the file directly. ':'Server not connected. ')+'Run python server.py and open http://localhost:5000';st.style.color='#f87171';}
 }
 document.getElementById('aiS').onclick=show;
 document.getElementById('aiX').onclick=hide;
 document.getElementById('aiOK').onclick=async function(){
  msg.style.color='var(--mu)';msg.textContent='Checking...';
  try{var r=await fetch('/api/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:document.getElementById('aiK').value})});
   var j=await r.json();
   if(!r.ok)throw new Error(j.error||'Could not save');
   msg.style.color='var(--ac)';msg.textContent=j.message;document.getElementById('aiK').value='';
   var pv=document.getElementById('pv');if(pv){pv.value='auto';pv.dispatchEvent(new Event('change'));}
   status(false);setTimeout(hide,1200);
  }catch(e){var m=(e&&e.message)||'';if(/fetch|network|load failed/i.test(m))m='Cannot reach the Kisan Dost server. Make sure the black window is running (python server.py) and that you opened http://localhost:5000 - not the file itself.';msg.style.color='#f87171';msg.textContent=m;}
 };
 status(true);
})();
