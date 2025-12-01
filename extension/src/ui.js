/* global chrome */
(function(){
  const UI={
    setStatus(t){const el=document.getElementById('status');if(el){const d=document.createElement('div');d.textContent=t;el.appendChild(d);el.scrollTop=el.scrollHeight;}console.log('[SiteForge]',t);},
    showError(t){const el=document.getElementById('error');if(el){el.style.display='block';el.textContent=t;}console.error('[SiteForge]',t);}
  };
  self.SiteForgeUI=UI;
  if(typeof chrome!=='undefined'&&chrome.runtime&&chrome.runtime.onMessage){
    chrome.runtime.onMessage.addListener(msg=>{
      if(!msg)return;
      if(msg.type==='SITEFORGE_STATUS')UI.setStatus(msg.text);
      else if(msg.type==='SITEFORGE_ERROR'){UI.showError(msg.text);const raw=document.getElementById('raw-output');if(raw&&msg.raw)raw.textContent=msg.raw;}
      else if(msg.type==='SITEFORGE_SNAPSHOT_PREVIEW'){const p=document.getElementById('snapshot-preview');if(p){const s=msg.snapshot;p.textContent=JSON.stringify({url:s.url,title:s.title,meta:s.meta,summary:s.summary,htmlPreview:(s.fullHtml||'').slice(0,500)},null,2);}}
    });
  }
})();
