(function(){
  function isS(x){return typeof x==='string'&&x.length>0;}
  function vProj(p){
    const e=[];
    if(!p||typeof p!=='object'){e.push('project must be object');return e;}
    if(!isS(p.name))e.push('name');
    if(!isS(p.version))e.push('version');
    if(!isS(p.packageManager))e.push('packageManager');
    if(!Array.isArray(p.files))e.push('files must be array');
    else if(!p.files.length)e.push('files must not be empty');
    else p.files.forEach((f,i)=>{if(!isS(f.path))e.push('files['+i+'].path');if(!isS(f.content))e.push('files['+i+'].content');});
    if(p.assets&&Array.isArray(p.assets)){
      p.assets.forEach((a,i)=>{if(!isS(a.path))e.push('assets['+i+'].path');if(!isS(a.dataUri)&&!isS(a.url))e.push('assets['+i+'] dataUri/url');});
    }
    return e;
  }
  const API={validateProjectSchema(o){const e=[];if(!o||typeof o!=='object')return{valid:false,errors:['root']};const p=o.project||o;if(!p)return{valid:false,errors:['project field']};e.push(...vProj(p));return{valid:!e.length,errors:e};}};
  self.SiteForgeSchemaValidator=API;
})();
