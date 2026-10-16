import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installStockFilm } from './download-film.mjs';
import { stockFilm } from '../film-source.js';
fs.mkdirSync('.cache',{recursive:true});
const root=fs.mkdtempSync('.cache/film-installer-');
const target=`${root}/hero-road-trip.mp4`;
const body=fs.readFileSync(new URL('./fixtures/player-test.mp4',import.meta.url));
const response=()=>new Response(body,{headers:{'content-type':'video/mp4'}});
try{
 let calls=0;
 const fetchImpl=async url=>{assert.equal(url,stockFilm.src);calls++;return response();};
 assert.equal((await installStockFilm({mediaRoot:root,fetchImpl})).installed,true);
 assert.deepEqual(fs.readFileSync(target),body);
 assert.equal((await installStockFilm({mediaRoot:root,fetchImpl})).installed,false);assert.equal(calls,1);
 fs.unlinkSync(target);
 await assert.rejects(installStockFilm({mediaRoot:root,fetchImpl:async()=>new Response('unavailable',{status:503})}),/MP4/);
 await assert.rejects(installStockFilm({mediaRoot:root,fetchImpl:async()=>new Response('not a film',{headers:{'content-type':'video/mp4'}})}),/Invalid/);
 await assert.rejects(installStockFilm({mediaRoot:root,fetchImpl:async()=>new Response(body,{headers:{'content-type':'video/mp4','content-length':String(101*1024*1024)}})}),/100 MB/);
 await assert.rejects(installStockFilm({mediaRoot:root,fetchImpl:async()=>{fs.writeFileSync(target,'owner film');return response();}}),/EEXIST/);
 assert.equal(fs.readFileSync(target,'utf8'),'owner film');
 assert.deepEqual(fs.readdirSync(root),['hero-road-trip.mp4']);
 console.log('PASS: optional film installer validation, atomic save, bounded download, no duplicate fetch or overwrite, failure cleanup.');
}finally{fs.rmSync(root,{recursive:true,force:true});}
