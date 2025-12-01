(function(){
  const enc=new TextEncoder();
  function toBytes(v){return v instanceof Uint8Array?v:enc.encode(String(v));}
  function crc32(b){let c=-1;for(let i=0;i<b.length;i++){c^=b[i];for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;}
  function build(map){
    const locals=[],centrals=[];let offset=0,files=0;
    for(const name in map){if(!Object.prototype.hasOwnProperty.call(map,name))continue;files++;
      const n=enc.encode(name),d=toBytes(map[name]),crc=crc32(d),lSize=30+n.length+d.length,l=new Uint8Array(lSize),v=new DataView(l.buffer);
      v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,crc,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true);v.setUint16(28,0,true);
      l.set(n,30);l.set(d,30+n.length);locals.push(l);
      const cSize=46+n.length,c=new Uint8Array(cSize),cv=new DataView(c.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint32(16,crc,true);cv.setUint32(20,d.length,true);cv.setUint32(24,d.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);
      c.set(n,46);centrals.push(c);offset+=lSize;
    }
    const cTot=centrals.reduce((s,a)=>s+a.length,0),lTot=locals.reduce((s,a)=>s+a.length,0),eocd=new Uint8Array(22),ev=new DataView(eocd.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files,true);ev.setUint16(10,files,true);ev.setUint32(12,cTot,true);ev.setUint32(16,lTot,true);
    const out=new Uint8Array(lTot+cTot+22);let pos=0;
    locals.forEach(a=>{out.set(a,pos);pos+=a.length;});
    centrals.forEach(a=>{out.set(a,pos);pos+=a.length;});
    out.set(eocd,pos);return out;
  }
  self.SiteForgeZip={createZipBlobFromFiles(map){const b=build(map);return new Blob([b],{type:'application/zip'});},createZipUint8FromFiles(map){return build(map);}};
})();
