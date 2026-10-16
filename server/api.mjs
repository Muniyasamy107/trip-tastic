import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { journeys } from '../journeys.js';
import { stockFilm } from '../film-source.js';
const dataDir = path.resolve(process.env.DATA_DIR || '.data');
fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(dataDir,'enquiries.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS enquiries (
 id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
 phone TEXT NOT NULL, destination TEXT NOT NULL, travel_date TEXT NOT NULL,
 travellers INTEGER NOT NULL, budget TEXT NOT NULL, pace TEXT NOT NULL, notes TEXT NOT NULL,
 consent INTEGER NOT NULL DEFAULT 1
);`);
const limits=new Map();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
function clean(value,max=200){return typeof value==='string'?value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').slice(0,max):'';}
export function api(req,res,next,{mediaRoot=path.resolve('public/media')}={}){
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(!pathname.startsWith('/api/'))return next?.();
 if(req.method==='GET' && pathname==='/api/health')return json(res,200,{ok:true,service:'Trip-Tastic enquiries'});
 if(req.method==='GET' && pathname==='/api/hero-film'){
  const file=path.join(mediaRoot,'hero-road-trip.mp4');
  try{
   const stat=fs.statSync(file);
   if(!stat.isFile()||stat.size===0)throw new Error('No installed film');
   const poster=fs.existsSync(path.join(mediaRoot,'hero-road-trip-poster.jpg'))?'/media/hero-road-trip-poster.jpg':null;
   return json(res,200,{available:true,src:'/media/hero-road-trip.mp4',revision:`${stat.size}-${stat.mtimeMs}`,poster});
  }catch{return json(res,200,{available:true,...stockFilm,delivery:'external-cdn'});}
 }

 if(pathname!=='/api/enquiries')return json(res,404,{error:'Not found.'});
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
 const origin=req.headers.origin;
 if(origin){let originHost;try{originHost=new URL(origin).host;}catch{return json(res,403,{error:'Invalid origin.'});}
 const host=req.headers.host;const publicOrigin=process.env.PUBLIC_ORIGIN;
 if(originHost!==host && origin!==publicOrigin)return json(res,403,{error:'Please send this request from the Trip-Tastic website.'});}
 if(!String(req.headers['content-type']).startsWith('application/json'))return json(res,415,{error:'Expected a JSON request.'});
 const ip=process.env.TRUST_PROXY==='1'?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim():req.socket.remoteAddress;
 const now=Date.now();for(const [key,value]of limits){if(value.reset<now)limits.delete(key);}
 const rate=limits.get(ip)||{count:0,reset:now+15*60*1000};
 if(rate.count>=12){res.setHeader('Retry-After','900');return json(res,429,{error:'You have sent several requests. Please try again in 15 minutes.'});}
 let body='',tooLarge=false;
 req.on('data',chunk=>{if(tooLarge)return;body+=chunk;if(Buffer.byteLength(body)>16000){tooLarge=true;json(res,413,{error:'This request is too large.'});}});
 req.on('error',()=>{if(!res.headersSent)json(res,400,{error:'The request could not be read.'});});
 req.on('end',()=>{
 if(tooLarge)return;
 let raw;try{raw=JSON.parse(body);}catch{return json(res,400,{error:'Invalid request. Please try again.'});}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return json(res,400,{error:'Invalid request.'});
 if(raw.website)return json(res,400,{error:'The request could not be accepted.'});
 const item={name:clean(raw.name,80),email:clean(raw.email,160).toLowerCase(),phone:clean(raw.phone,30),destination:clean(raw.destination,60),date:clean(raw.date,10),travellers:Number(raw.travellers),budget:clean(raw.budget,60),pace:clean(raw.pace,40),notes:clean(raw.notes,1500)};
 const errors={};
 if(item.name.length<2)errors.name='Please enter at least two characters.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email))errors.email='Please enter a valid email address.';
 if(item.phone && !/^[+\d\s()\-]{7,25}$/.test(item.phone))errors.phone='Please enter a valid phone number or leave it blank.';
 if(item.destination!=='custom'&&!journeys.some(j=>j.id===item.destination))errors.destination='Please choose a journey.';
 const date=new Date(item.date+'T12:00:00+05:30');
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=k=>parts.find(p=>p.type===k).value;const today=`${part('year')}-${part('month')}-${part('day')}`;
 const maxDate=new Date();maxDate.setFullYear(maxDate.getFullYear()+3);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==item.date||item.date<today||date>maxDate)errors.date='Choose a valid future date within the next three years.';
 if(!Number.isInteger(item.travellers)||item.travellers<1||item.travellers>12)errors.travellers='Choose 1 to 12 travellers.';
 if(!['18000-25000','25000-40000','40000-60000','60000+','discuss'].includes(item.budget))errors.budget='Please select a planning budget.';
 if(!['Slow & scenic','A little adventure','A bit of both'].includes(item.pace))errors.pace='Please choose your pace.';
 if(raw.consent!==true)errors.consent='Please agree to saving your enquiry.';
 if(Object.keys(errors).length)return json(res,422,{error:'Please check the highlighted details.',fields:errors});
 rate.count++;limits.set(ip,rate);
 try{
 const duplicate=db.prepare('SELECT id FROM enquiries WHERE email=? AND destination=? AND travel_date=? AND name=? AND phone=? AND travellers=? AND budget=? AND pace=? AND notes=? AND created_at>?').get(item.email,item.destination,item.date,item.name,item.phone,item.travellers,item.budget,item.pace,item.notes,new Date(now-10*60*1000).toISOString());
 if(duplicate)return json(res,200,{reference:duplicate.id,saved:true,duplicate:true});
 const id='TT-'+randomUUID().replaceAll('-','').slice(0,12).toUpperCase();
 db.prepare('INSERT INTO enquiries (id,created_at,name,email,phone,destination,travel_date,travellers,budget,pace,notes,consent) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)').run(id,new Date().toISOString(),item.name,item.email,item.phone,item.destination,item.date,item.travellers,item.budget,item.pace,item.notes);
 return json(res,201,{reference:id,saved:true});
 }catch(error){console.error('Enquiry storage failed:',error.message);return json(res,500,{error:'We could not save your enquiry. Please keep your details and try again.'});}
 });
}
export {db};
