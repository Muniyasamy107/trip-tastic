import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { stockFilm } from '../film-source.js';

// Legacy Pexels self-hosting only. Does not download the selected YouTube film.
// Never overwrites an installed owner film.
export async function installStockFilm({mediaRoot=path.resolve('public/media'),fetchImpl=fetch}={}) {
 fs.mkdirSync(mediaRoot,{recursive:true});
 const target=path.join(mediaRoot,'hero-road-trip.mp4');
 if(fs.existsSync(target))return {installed:false,message:'Existing hero-road-trip.mp4 preserved; no repeat download.'};
 const temporary=`${target}.${randomUUID()}.part`;
 try{
  const response=await fetchImpl(stockFilm.src,{signal:AbortSignal.timeout(120000),redirect:'error'});
  if(!response.ok||!response.headers.get('content-type')?.includes('video/mp4'))throw new Error('The source did not return an MP4.');
  const max=100*1024*1024;let size=0;const chunks=[];
  if(Number(response.headers.get('content-length'))>max)throw new Error('Film exceeds 100 MB limit.');
  for await(const chunk of response.body){size+=chunk.length;if(size>max)throw new Error('Film exceeds 100 MB limit.');chunks.push(chunk);}
  const body=Buffer.concat(chunks);
  if(size<1024||body.toString('ascii',4,8)!=='ftyp')throw new Error('Invalid or incomplete MP4; existing media was not changed.');
  fs.writeFileSync(temporary,body,{flag:'wx'});
  // A hard link atomically refuses to overwrite a file installed concurrently.
  fs.linkSync(temporary,target);
  return {installed:true,message:`Installed ${size} bytes of licensed Syam Krishnan / Pexels footage. Rebuild before production.`};
 }finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{console.log((await installStockFilm()).message);}catch(error){console.error(`Film download failed: ${error.message}\nThis does not change the selected YouTube embed. For legacy Pexels mode only, the original is at ${stockFilm.source} and save it as public/media/hero-road-trip.mp4.`);process.exitCode=1;}
}
