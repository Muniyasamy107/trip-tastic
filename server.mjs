import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { api } from './server/api.mjs';
const root=path.resolve('dist');
if(!fs.existsSync(path.join(root,'index.html')))throw new Error('Run npm run build before npm start.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 api(req,res,()=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed');}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 if(pathname==='/')file=path.join(root,'index.html');
 if(pathname==='/admin'||pathname==='/admin/')file=path.join(root,'admin.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
 const size=fs.statSync(file).size;const type=mime[path.extname(file)]||'application/octet-stream';
 res.setHeader('Content-Type',type);res.setHeader('Cache-Control',path.extname(file)==='.html'?'no-cache':'public, max-age=3600');res.setHeader('Accept-Ranges','bytes');
 const range=req.headers.range;
 if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
 const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),size-1):size-1;
 if(start> end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
 res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});if(req.method==='HEAD')return res.end();return fs.createReadStream(file,{start,end}).pipe(res);}
 res.writeHead(200,{'Content-Length':size});if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
 },{mediaRoot:path.join(root,'media')});
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Trip-Tastic is live on port ${process.env.PORT||3000}`));
