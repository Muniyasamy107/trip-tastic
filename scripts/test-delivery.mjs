import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import {gunzipSync,gzipSync} from 'node:zlib';
const base=process.env.TEST_URL||'http://localhost:4173',manifest=JSON.parse(fs.readFileSync('dist/.vite/manifest.json','utf8'));
const main=manifest['index.html'];assert.ok(main?.isEntry);
const initial=new Set();function walk(key){if(initial.has(key))return;initial.add(key);for(const child of manifest[key]?.imports||[])walk(child);}walk('index.html');
assert.equal([...initial].some(key=>/three-engine|react-three-renderer|react-runtime|motion-/.test(manifest[key].file)),false,'React/Three/Framer remain lazy, not entry imports');
const mainBytes=fs.readFileSync('dist/'+main.file);assert.ok(gzipSync(mainBytes).length<115000,'Initial app JS compressed budget stays below 115KB');
const three=Object.values(manifest).find(row=>row.file.includes('three-engine-'));assert.ok(three);const bytes=fs.readFileSync('dist/'+three.file);assert.ok(gzipSync(bytes).length<230000,'Lazy Three engine compressed budget below 230KB');
function request(path,headers={},method='GET'){return new Promise((resolve,reject)=>{http.request(new URL(path,base),{headers,method},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));}).on('error',reject).end();});}
let res=await request('/'+three.file,{'Accept-Encoding':'gzip'});assert.equal(res.status,200);assert.equal(res.headers['content-encoding'],'gzip');assert.equal(res.headers.vary,'Accept-Encoding');assert.deepEqual(gunzipSync(res.body),bytes);assert.ok(res.body.length<bytes.length/2);
res=await request('/'+three.file,{'Accept-Encoding':'gzip;q=0'});assert.equal(res.headers['content-encoding'],undefined);assert.deepEqual(res.body,bytes);
res=await request('/'+three.file,{'Accept-Encoding':'gzip'},'HEAD');assert.equal(res.status,200);assert.equal(res.headers['content-encoding'],'gzip');assert.equal(res.body.length,0);
res=await request('/'+three.file,{'Accept-Encoding':'gzip',Range:'bytes=0-31'});assert.equal(res.status,206);assert.equal(res.headers['content-encoding'],undefined);assert.deepEqual(res.body,bytes.subarray(0,32));
res=await request('/api/admin/enquiries',{'Accept-Encoding':'gzip'});assert.equal(res.status,401);assert.equal(res.headers['content-encoding'],undefined);assert.equal(res.headers['cache-control'],'no-store');
console.log('PASS: lazy React/Three/Framer bundle graph, entry/engine compressed budgets, actual production gzip round-trip, q=0, HEAD, byte ranges and uncompressed private API guard.');
