/* global fetch */
(function(){
  const U=self.SiteForgeUtils,V=self.SiteForgeSchemaValidator,B=self.SiteForgeBuilder;
  const SCHEMA_TEXT=`Rebuild this website as a Next.js 14 + Tailwind project. Output ONLY in TOON format (NOT JSON):

files[7]{path,content}:
  package.json,{"name":"site","version":"1.0.0","scripts":{"dev":"next dev"},"dependencies":{"next":"14","react":"^18","react-dom":"^18"},"devDependencies":{"tailwindcss":"^3","postcss":"^8","autoprefixer":"^10"}}
  next.config.js,module.exports={}
  tailwind.config.cjs,module.exports={content:['./app/**/*.{js,jsx}'],theme:{},plugins:[]}
  postcss.config.cjs,module.exports={plugins:{tailwindcss:{},autoprefixer:{}}}
  app/globals.css,@tailwind base;@tailwind components;@tailwind utilities;
  app/page.jsx,export default function Page(){return <main className="min-h-screen bg-white p-4"><h1>Welcome</h1></main>}
  README.md,# Site

CRITICAL: Output ONLY the TOON table above. Do NOT output JSON, do NOT output markdown, do NOT output any other text.`;
  function summary(s){return JSON.stringify({url:s.url,title:s.title,meta:s.meta,summary:s.summary},null,2);} 
  function parseProjectJson(raw){
    let t=raw;
    try{return JSON.parse(t);}catch(_){/* fall through */}
    t=(raw||'').trim();
    const fence=t.match(/^```[a-zA-Z0-9_\-]*\s*([\s\S]*?)```$/);
    if(fence){t=fence[1].trim();try{return JSON.parse(t);}catch(_){}}
    const firstBrace=t.indexOf('{');
    const firstBracket=t.indexOf('[');
    let start=-1;
    if(firstBrace!==-1&&firstBracket!==-1)start=Math.min(firstBrace,firstBracket);
    else if(firstBrace!==-1)start=firstBrace;else if(firstBracket!==-1)start=firstBracket;
    if(start>=0){
      t=t.slice(start);
      const lastCurly=t.lastIndexOf('}');
      const lastBracket=t.lastIndexOf(']');
      const end=Math.max(lastCurly,lastBracket);
      if(end>=0){
        const sliced=t.slice(0,end+1);
        try{return JSON.parse(sliced);}catch(_){/* final fallthrough */}
      }
    }
    for(let i=t.length-1;i>=0;i--){
      try{
        const slice=t.slice(0,i+1);
        return JSON.parse(slice);
      }catch(_){
        continue;
      }
    }
    for(let i=t.length-1;i>=0;i--){
      try{
        let slice=t.slice(0,i+1);
        const openQuotes=(slice.match(/"/g)||[]).length;
        if(openQuotes%2===1) slice+='"';
        const openBraces=(slice.match(/{/g)||[]).length-(slice.match(/}/g)||[]).length;
        for(let j=0;j<openBraces;j++) slice+='}';
        const openBrackets=(slice.match(/\[/g)||[]).length-(slice.match(/\]/g)||[]).length;
        for(let j=0;j<openBrackets;j++) slice+=']';
        return JSON.parse(slice);
      }catch(_){
        continue;
      }
    }
    throw new Error('could not parse JSON from AI response');
  }
  function parseProjectFromFileBlocks(raw){
    const text=String(raw||'');
    const re=/FILE:\s*([^\n]+)\n```[^\n]*\n([\s\S]*?)```/g;
    const files=[];
    let m;
    while((m=re.exec(text))!==null){
      const path=(m[1]||'').trim();
      const content=m[2]||'';
      if(path)files.push({path,content});
    }
    if(!files.length)throw new Error('no FILE blocks found');
    return{
      project:{
        name:'siteforge-project',
        version:'1.0.0',
        packageManager:'npm',
        files,
        assets:[]
      }
    };
  }
  function parseProjectFromTOON(raw){
    const text=String(raw||'');
    const lines=text.split('\n').map(l=>l.trim()).filter(l=>l);
    const files=[];
    let inTable=false;
    for(const line of lines){
      if(line.startsWith('files[')){
        inTable=true;
        continue;
      }
      if(inTable&&line.length>0&&!line.startsWith('files')){
        const parts=line.split(',');
        if(parts.length===2){
          const path=parts[0].trim();
          const content=parts[1].trim();
          if(path&&content)files.push({path,content});
        }
      }
    }
    if(!files.length)throw new Error('no TOON files found');
    return{
      project:{
        name:'siteforge-project',
        version:'1.0.0',
        packageManager:'npm',
        files,
        assets:[]
      }
    };
  }
  async function callOpenAI(set,snap,cb){
    if(!set.openaiKey)throw new Error('OpenAI key not set');
    const msgs=[{role:'system',content:'You rebuild websites as minimal Next.js 14 + Tailwind projects.'},{role:'user',content:'Snapshot summary:\n'+summary(snap)}];
    const txt=JSON.stringify(snap),parts=U.chunk(txt,8000);
    parts.forEach((p,i)=>msgs.push({role:'user',content:'Snapshot JSON part '+(i+1)+'/'+parts.length+':\n'+p}));
    msgs.push({role:'user',content:SCHEMA_TEXT});
    await U.rate('ai',3000);cb&&cb('Calling OpenAI...');
    const r=await fetch(set.openaiEndpoint||'https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+set.openaiKey},body:JSON.stringify({model:set.openaiModel||'gpt-4.1-mini',messages:msgs,temperature:0})});
    if(!r.ok)throw new Error('OpenAI HTTP '+r.status);
    const j=await r.json(),c=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(!c)throw new Error('OpenAI empty response');return c.trim();
  }
  async function callAnthropic(set,snap,cb){
    if(!set.anthropicKey)throw new Error('Anthropic key not set');
    const parts=U.chunk(JSON.stringify(snap),8000),content=[{type:'text',text:'Snapshot summary:\n'+summary(snap)}];
    parts.forEach((p,i)=>content.push({type:'text',text:'Snapshot JSON part '+(i+1)+'/'+parts.length+':\n'+p}));
    content.push({type:'text',text:SCHEMA_TEXT});
    await U.rate('ai',3000);cb&&cb('Calling Anthropic...');
    const r=await fetch(set.anthropicEndpoint||'https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':set.anthropicKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:set.anthropicModel||'claude-3-5-sonnet-20240620',max_tokens:set.maxTokens||4096,messages:[{role:'user',content}]})});
    if(!r.ok)throw new Error('Anthropic HTTP '+r.status);
    const j=await r.json(),txt=(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
    if(!txt)throw new Error('Anthropic empty response');return txt;
  }
  async function callGemini(set,snap,cb){
    const key=set.geminiKey;
    if(!key) throw new Error('Gemini API key not set');
    const model=(set.geminiModel||'gemini-1.5-flash').trim();
    const base=(set.geminiEndpoint||'https://generativelanguage.googleapis.com/v1beta/models').replace(/\/$/,'');
    const endpoint=`${base}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const txt=JSON.stringify(snap);
    const parts=U.chunk(txt,8000);
    const prompt=[
      'You are SiteForge AI. Convert a website snapshot into a Next.js 14 + Tailwind project. Output JSON only matching the schema.\n',
      'Snapshot summary:\n',
      JSON.stringify({url:snap.url,title:snap.title,meta:snap.meta,summary:snap.summary},null,2),
      '\n\n',
      'Snapshot JSON (chunked):\n'
    ];
    parts.forEach((p,i)=>{prompt.push(`--- chunk ${i+1}/${parts.length} ---\n`);prompt.push(p);prompt.push('\n');});
    prompt.push('\nSchema and requirements:\n');
    prompt.push(SCHEMA_TEXT);
    await U.rate('ai',3000); cb&&cb('Calling Gemini...');
    const body={
      contents:[{role:'user',parts:[{text:prompt.join('') }]}],
      generationConfig:{temperature:0,maxOutputTokens:set.maxTokens||4096}
    };
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok){let t='';try{t=await r.text();}catch(_){}throw new Error('Gemini HTTP '+r.status+(t?(' — '+t.slice(0,300)):''));}
    const data=await r.json();
    const cand=(data.candidates&&data.candidates[0])||null;
    if(!cand||!cand.content||!cand.content.parts||!cand.content.parts.length) throw new Error('Gemini empty response');
    const text=cand.content.parts.map(p=>p.text||'').join('\n').trim();
    if(!text) throw new Error('Gemini response missing text');
    return text;
  }
  async function callCustom(set,snap,cb){
    if(!set.customKey)throw new Error('Custom API key not set');
    if(!set.customEndpoint)throw new Error('Custom endpoint not set');
    const snapInfo=`Website: ${snap.title}\nHTML:\n${(snap.fullHtml||'').slice(0,800)}\nCSS:\n${(snap.inlineStyles||'').slice(0,400)}`;
    const msgs=[{role:'user',content:snapInfo+'\n\n'+SCHEMA_TEXT}];
    await U.rate('ai',3000);cb&&cb('Calling custom provider...');
    const headers={'Content-Type':'application/json'};
    let headerName=(set.customAuthHeaderName||'Authorization').trim();
    if(!/^[A-Za-z0-9\-]+$/.test(headerName)) headerName='Authorization';
    let prefix=typeof set.customAuthHeaderValue==='string'?set.customAuthHeaderValue:'Bearer ';
    if(!prefix) prefix='Bearer ';
    headers[headerName]=prefix+set.customKey;
    U.log('Custom provider debug: endpoint='+set.customEndpoint+', header='+headerName+', keyLen='+set.customKey.length);
    const payload={model:set.customModel||'gpt-4.1-mini',messages:msgs,temperature:0,max_tokens:512};
    if(set.maxTokens) payload.max_tokens=Math.max(512,set.maxTokens);
    if((set.customEndpoint||'').indexOf('openrouter.ai')!==-1){
      payload.response_format={type:'json_object'};
    }
    const r=await fetch(set.customEndpoint,{method:'POST',headers,body:JSON.stringify(payload)});
    if(!r.ok){let t='';try{t=await r.text();}catch(_){}throw new Error('Custom provider HTTP '+r.status+(t?(' — '+t.slice(0,300)):''));}
    const j=await r.json(),c=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(!c)throw new Error('Custom provider empty response');return c.trim();
  }
  async function buildProjectFromSnapshot(snap,cb){
    const set=await U.loadSettings(),prov=set.provider||'openai';
    const raw=prov==='anthropic'?await callAnthropic(set,snap,cb):prov==='custom'?await callCustom(set,snap,cb):prov==='gemini'?await callGemini(set,snap,cb):await callOpenAI(set,snap,cb);
    cb&&cb('Parsing AI JSON...');
    let parsed;
    try{
      parsed=parseProjectJson(raw);
    }catch(e){
      try{
        parsed=parseProjectFromTOON(raw);
      }catch(e2){
        try{
          parsed=parseProjectFromFileBlocks(raw);
        }catch(e3){
          throw new Error('AI did not return JSON, TOON, or FILE blocks: '+e3.message+'\n'+raw.slice(0,1000));
        }
      }
    }
    const res=V.validateProjectSchema(parsed);if(!res.valid)throw new Error('Schema validation failed: '+res.errors.join(', ')+'\n'+raw.slice(0,1000));
    const project=parsed.project||parsed;cb&&cb('Building ZIP...');const blob=await B.buildProjectZip(project);return{blob,project,raw};
  }
  self.SiteForgeAPI={buildProjectFromSnapshot};
})();
