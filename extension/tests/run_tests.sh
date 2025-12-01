#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'));console.log('manifest ok')"
node - <<'NODE'
const fs=require('fs'),vm=require('vm');
const schemaCode=fs.readFileSync('src/schemaValidator.js','utf8');
const test=JSON.parse(fs.readFileSync('tests/test_schema.json','utf8'));
const ctx={self:{}};vm.createContext(ctx);vm.runInContext(schemaCode,ctx);
const v=ctx.self.SiteForgeSchemaValidator.validateProjectSchema(test);
if(!v.valid){console.error('schema invalid',v.errors);process.exit(1);} 
console.log('schema ok');
const zipCode=fs.readFileSync('src/zip.js','utf8');
vm.runInContext(zipCode,ctx);
const z=ctx.self.SiteForgeZip.createZipUint8FromFiles({'package.json':'{}'});
if(!z||!z.length){console.error('zip failed');process.exit(1);} 
console.log('zip ok');
NODE
