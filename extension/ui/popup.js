/* global chrome,SiteForgeUI */
document.addEventListener('DOMContentLoaded',()=>{
  const ui=SiteForgeUI;
  
  document.getElementById('btn-preview').addEventListener('click',()=>{
    ui.setStatus('Requesting snapshot preview...');
    chrome.runtime.sendMessage({type:'SITEFORGE_SCRAPE_PREVIEW'},res=>{
      if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);
      else if(!res||!res.ok)ui.showError('Background rejected preview request');
    });
  });
  
  document.getElementById('btn-build').addEventListener('click',()=>{
    ui.setStatus('Requesting scrape & export (Next.js)...');
    chrome.runtime.sendMessage({type:'SITEFORGE_SCRAPE_BUILD',format:'nextjs'},res=>{
      if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);
      else if(!res||!res.ok)ui.showError('Background rejected build request');
    });
  });
  
  document.getElementById('btn-wp-theme').addEventListener('click',()=>{
    ui.setStatus('Requesting WordPress theme export...');
    chrome.runtime.sendMessage({type:'SITEFORGE_SCRAPE_BUILD',format:'wp-theme'},res=>{
      if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);
      else if(!res||!res.ok)ui.showError('Background rejected build request');
    });
  });
  
  document.getElementById('btn-multi-page').addEventListener('click',()=>{
    ui.setStatus('Requesting multi-page crawl...');
    chrome.runtime.sendMessage({type:'SITEFORGE_SCRAPE_BUILD',format:'nextjs',multiPage:true},res=>{
      if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);
      else if(!res||!res.ok)ui.showError('Background rejected build request');
    });
  });
  
  document.getElementById('btn-vercel').addEventListener('click',()=>{
    ui.setStatus('Opening Vercel import...');
    chrome.runtime.sendMessage({type:'SITEFORGE_VERCEL'},res=>{
      if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);
    });
  });
});
