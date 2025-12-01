/* global chrome,SiteForgeUI */
document.addEventListener('DOMContentLoaded',()=>{
  const ui=SiteForgeUI,KEY='siteforge_settings',f=document.getElementById('settings-form');
  const provider=document.getElementById('provider'),ok=document.getElementById('openaiKey'),om=document.getElementById('openaiModel'),ak=document.getElementById('anthropicKey'),am=document.getElementById('anthropicModel'),mt=document.getElementById('maxTokens'),gk=document.getElementById('geminiKey'),gm=document.getElementById('geminiModel'),ge=document.getElementById('geminiEndpoint'),ce=document.getElementById('customEndpoint'),ck=document.getElementById('customKey'),cm=document.getElementById('customModel'),chn=document.getElementById('customAuthHeaderName'),chv=document.getElementById('customAuthHeaderValue');
  chrome.storage.local.get([KEY],res=>{const s=res[KEY]||{};provider.value=s.provider||'openai';ok.value=s.openaiKey||'';om.value=s.openaiModel||'';ak.value=s.anthropicKey||'';am.value=s.anthropicModel||'';mt.value=s.maxTokens||'';gk.value=s.geminiKey||'';gm.value=s.geminiModel||'';ge.value=s.geminiEndpoint||'';ce.value=s.customEndpoint||'';ck.value=s.customKey||'';cm.value=s.customModel||'';chn.value=s.customAuthHeaderName||'';chv.value=s.customAuthHeaderValue||'';ui.setStatus('Loaded settings.');});
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const s={provider:provider.value,openaiKey:ok.value.trim(),openaiModel:om.value.trim(),anthropicKey:ak.value.trim(),anthropicModel:am.value.trim(),maxTokens:mt.value?Number(mt.value):undefined,geminiKey:gk.value.trim(),geminiModel:gm.value.trim(),geminiEndpoint:ge.value.trim(),customEndpoint:ce.value.trim(),customKey:ck.value.trim(),customModel:cm.value.trim(),customAuthHeaderName:chn.value.trim(),customAuthHeaderValue:chv.value.trim()};
    chrome.storage.local.set({[KEY]:s},()=>{if(chrome.runtime.lastError)ui.showError(chrome.runtime.lastError.message);else ui.setStatus('Saved.');});
  });
});
