/* global chrome */
(function(){
  const KEY='siteforge_settings',last={};
  const U={
    log(...a){console.log('[SiteForge]',...a);},
    chunk(s,n){const r=[];for(let i=0;i<s.length;i+=n)r.push(s.slice(i,i+n));return r;},
    async rate(id,ms){const t=Date.now(),p=last[id]||0,w=p+ms-t;if(w>0)await new Promise(r=>setTimeout(r,w));last[id]=Date.now();},
    loadSettings(){return new Promise(res=>{if(!chrome||!chrome.storage||!chrome.storage.local){res({});return;}chrome.storage.local.get([KEY],v=>res(v[KEY]||{}));});},
    saveSettings(part){return new Promise((res,rej)=>{if(!chrome||!chrome.storage||!chrome.storage.local){rej(new Error('no storage'));return;}chrome.storage.local.get([KEY],v=>{const cur=v[KEY]||{},next={...cur,...part};chrome.storage.local.set({[KEY]:next},()=>{if(chrome.runtime&&chrome.runtime.lastError)rej(chrome.runtime.lastError);else res(next);});});});}
  };
  self.SiteForgeUtils=U;
})();
