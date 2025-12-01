/* global chrome */
(function(){
  const S=self.SiteForgeScraper;
  chrome.runtime.onMessage.addListener((msg,_s,send)=>{
    if(!msg||msg.type!=='SITEFORGE_SNAPSHOT')return;
    (async()=>{try{const snap=await S.createSnapshot({screenshots:msg.screenshots,maxNodes:800});send({ok:true,snapshot:snap});}catch(e){console.error('SiteForge snapshot error',e);send({ok:false,error:String(e.message||e)});}})();
    return true;
  });
})();
