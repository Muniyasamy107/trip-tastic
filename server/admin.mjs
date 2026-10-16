import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {journeys} from '../journeys.js';
const SESSION_MS=8*60*60*1000;
const digest=value=>createHash('sha256').update(value).digest('hex');
const hashPassword=password=>{const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;};
const matches=(password,encoded)=>{try{const [salt,hash]=encoded.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hash,'hex'));}catch{return false;}};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
const cookie=(req,value,clear=false)=>`tt_admin_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:SESSION_MS/1000}${String(req.headers.origin||process.env.PUBLIC_ORIGIN||'').startsWith('https://')?'; Secure':''}`;
function originAllowed(req){try{const origin=new URL(req.headers.origin);return ['https:','http:'].includes(origin.protocol)&&(origin.host===req.headers.host||origin.origin===process.env.PUBLIC_ORIGIN)&&req.headers['sec-fetch-site']!=='cross-site';}catch{return false;}}
async function body(req){
 if(Number(req.headers['content-length'])>16000){req.resume();throw Object.assign(new Error('Request exceeds 16 KB.'),{status:413});}
 let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size<=16000)chunks.push(chunk);}
 if(size>16000)throw Object.assign(new Error('Request exceeds 16 KB.'),{status:413});
 let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(new Error('Expected a JSON object.'),{status:400});}
 if(!data||typeof data!=='object'||Array.isArray(data))throw Object.assign(new Error('Expected a JSON object.'),{status:400});return data;
}
export function initializeAdminSchema(db){
 db.exec(`CREATE TABLE IF NOT EXISTS admin_users(id INTEGER PRIMARY KEY CHECK(id=1),username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS admin_sessions(token_hash TEXT PRIMARY KEY,csrf_token TEXT NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS admin_login_limits(ip_hash TEXT PRIMARY KEY,attempts INTEGER NOT NULL,reset_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS journey_prices(id TEXT PRIMARY KEY,min INTEGER NOT NULL CHECK(min>0),max INTEGER NOT NULL CHECK(max>=min),version INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS site_settings(id INTEGER PRIMARY KEY CHECK(id=1),whatsapp TEXT NOT NULL DEFAULT '',instagram TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 0);
 INSERT OR IGNORE INTO site_settings(id) VALUES(1);
 CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY,created_at TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL);`);
 const columns=db.prepare('PRAGMA table_info(enquiries)').all().map(c=>c.name);
 if(!columns.includes('status'))db.exec("ALTER TABLE enquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'new'");
 if(!columns.includes('whatsapp_consent'))db.exec('ALTER TABLE enquiries ADD COLUMN whatsapp_consent INTEGER NOT NULL DEFAULT 0');
 const insert=db.prepare('INSERT OR IGNORE INTO journey_prices(id,min,max,updated_at) VALUES(?,?,?,?)');
 for(const j of journeys)insert.run(j.id,j.budget[0],j.budget[1],new Date().toISOString());
}
export function createAdminAccount(db,{username='superadmin',reset=false}={}){
 if(!/^[a-z0-9_.-]{3,32}$/.test(username))throw new Error('Username must be 3–32 lowercase letters, digits, dots, hyphens or underscores.');
 if(db.prepare('SELECT id FROM admin_users').get()&&!reset)throw new Error('An admin already exists. Use --reset explicitly to rotate the password and revoke every session.');
 const password=`Tt!${randomBytes(18).toString('base64url')}7`;
 db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO admin_users(id,username,password_hash,updated_at) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,password_hash=excluded.password_hash,updated_at=excluded.updated_at').run(username,hashPassword(password),new Date().toISOString());db.exec('DELETE FROM admin_sessions; DELETE FROM admin_login_limits;');db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
 return {username,password};
}
export function createAdminApi(db){
 initializeAdminSchema(db);
 const audit=(action,target)=>db.prepare('INSERT INTO admin_audit(created_at,action,target) VALUES(?,?,?)').run(new Date().toISOString(),action,target);
 const session=req=>{const raw=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('tt_admin_session='))?.slice('tt_admin_session='.length);if(!raw||!/^[a-f0-9]{64}$/.test(raw))return null;const hash=digest(raw);const row=db.prepare('SELECT * FROM admin_sessions WHERE token_hash=? AND expires_at>?').get(hash,Date.now());return row?{...row,hash}:null;};
 return async function adminApi(req,res){
  const url=new URL(req.url,'http://localhost'),pathname=url.pathname;
  if(pathname==='/api/site-settings'&&req.method==='GET'){try{return json(res,200,{prices:db.prepare('SELECT id,min,max,version FROM journey_prices').all(),socials:db.prepare('SELECT whatsapp,instagram,version FROM site_settings WHERE id=1').get()});}catch{return json(res,503,{error:'Published settings are temporarily unavailable.'});}}
  if(!pathname.startsWith('/api/admin/'))return json(res,404,{error:'Not found.'});
  const mutation=!['GET','HEAD'].includes(req.method);
  if(mutation&&!originAllowed(req))return json(res,403,{error:'Use this website to make admin changes.'});
  if(mutation&&!String(req.headers['content-type']).startsWith('application/json'))return json(res,415,{error:'Expected a JSON request.'});
  try{
   if(pathname==='/api/admin/login'&&req.method==='POST'){
    const raw=await body(req),username=String(raw.username||'').trim().toLowerCase(),password=String(raw.password||'');
    if(username.length>32||password.length>128)return json(res,400,{error:'Invalid sign-in details.'});
    const ip=process.env.TRUST_PROXY==='1'?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim():req.socket.remoteAddress;
    const ipHash=digest(String(ip)),now=Date.now();db.prepare('DELETE FROM admin_login_limits WHERE reset_at<?').run(now);db.prepare('DELETE FROM admin_sessions WHERE expires_at<?').run(now);
    const limit=db.prepare('SELECT * FROM admin_login_limits WHERE ip_hash=?').get(ipHash);
    if(limit?.attempts>=5){res.setHeader('Retry-After',String(Math.ceil((limit.reset_at-now)/1000)));return json(res,429,{error:'Too many sign-in attempts. Try again in 15 minutes, or use the owner reset command.'});}
    const user=db.prepare('SELECT * FROM admin_users WHERE id=1').get();
    if(!user)return json(res,503,{error:'Owner setup is required. Run npm run admin:setup in the private server terminal.'});
    const valid=matches(password,user.password_hash);
    if(!valid||username!==user.username){db.prepare('INSERT INTO admin_login_limits(ip_hash,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(ip_hash) DO UPDATE SET attempts=attempts+1').run(ipHash,now+15*60*1000);return json(res,401,{error:'Username or password is incorrect.'});}
    db.prepare('DELETE FROM admin_login_limits WHERE ip_hash=?').run(ipHash);
    const token=randomBytes(32).toString('hex'),csrfToken=randomBytes(24).toString('hex');
    db.prepare('INSERT INTO admin_sessions(token_hash,csrf_token,expires_at) VALUES(?,?,?)').run(digest(token),csrfToken,now+SESSION_MS);audit('login',user.username);res.setHeader('Set-Cookie',cookie(req,token));
    return json(res,200,{user:{username:user.username},csrfToken});
   }
   const auth=session(req);if(!auth)return json(res,401,{error:'Please sign in again.'});
   if(mutation){const csrf=String(req.headers['x-csrf-token']||'');if(!timingSafeEqual(Buffer.from(digest(csrf),'hex'),Buffer.from(digest(auth.csrf_token),'hex')))return json(res,403,{error:'Session verification failed. Reload and try again.'});}
   const user=db.prepare('SELECT username FROM admin_users WHERE id=1').get();
   if(pathname==='/api/admin/session'&&req.method==='GET')return json(res,200,{user,csrfToken:auth.csrf_token});
   if(pathname==='/api/admin/logout'&&req.method==='POST'){await body(req);db.prepare('DELETE FROM admin_sessions WHERE token_hash=?').run(auth.hash);res.setHeader('Set-Cookie',cookie(req,'',true));return json(res,200,{ok:true});}
   if(pathname==='/api/admin/password'&&req.method==='POST'){
    const raw=await body(req),current=String(raw.currentPassword||''),next=String(raw.newPassword||'');
    if(current.length>128||next.length<12||next.length>128||!/[a-z]/i.test(next)||!/[0-9]/.test(next))return json(res,422,{error:'Use 12–128 characters including letters and digits.'});
    if(!matches(current,db.prepare('SELECT password_hash FROM admin_users WHERE id=1').get().password_hash))return json(res,403,{error:'Current password is incorrect.'});
    db.prepare('UPDATE admin_users SET password_hash=?,updated_at=? WHERE id=1').run(hashPassword(next),new Date().toISOString());db.exec('DELETE FROM admin_sessions');audit('password.change',user.username);res.setHeader('Set-Cookie',cookie(req,'',true));return json(res,200,{ok:true,reauthenticate:true});
   }
   if(pathname==='/api/admin/prices'&&req.method==='GET')return json(res,200,{prices:db.prepare('SELECT * FROM journey_prices').all().map(p=>({...p,name:journeys.find(j=>j.id===p.id)?.name}))});
   const priceMatch=/^\/api\/admin\/prices\/([a-z0-9-]+)$/.exec(pathname);
   if(priceMatch&&req.method==='PUT'){
    const id=priceMatch[1];if(!journeys.some(j=>j.id===id))return json(res,404,{error:'Journey not found.'});const raw=await body(req);
    if(!Number.isInteger(raw.min)||!Number.isInteger(raw.max)||raw.min<1||raw.max<raw.min||raw.max>10000000||!Number.isInteger(raw.version))return json(res,422,{error:'Enter whole-rupee prices from 1 to 1,00,00,000, with maximum ≥ minimum.'});
    const result=db.prepare('UPDATE journey_prices SET min=?,max=?,version=version+1,updated_at=? WHERE id=? AND version=?').run(raw.min,raw.max,new Date().toISOString(),id,raw.version);
    if(!result.changes)return json(res,409,{error:'This price changed in another session. Reload prices before saving.'});audit('price.update',id);return json(res,200,{price:db.prepare('SELECT * FROM journey_prices WHERE id=?').get(id)});
   }
   if(pathname==='/api/admin/settings'&&req.method==='GET')return json(res,200,db.prepare('SELECT whatsapp,instagram,version FROM site_settings WHERE id=1').get());
   if(pathname==='/api/admin/settings'&&req.method==='PUT'){
    const raw=await body(req),phone=String(raw.whatsapp||'').replace(/[+\s()\-]/g,''),input=String(raw.instagram||'').trim();let instagram='';
    if(phone&&!/^[1-9]\d{7,14}$/.test(phone))return json(res,422,{error:'Use an international WhatsApp number with country code (8–15 digits).'});
    if(input){let u;try{u=new URL(input);}catch{}const match=u&&/^\/([a-zA-Z0-9._]{1,30})\/?$/.exec(u.pathname);if(!u||u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname)||u.port||u.username||u.password||u.search||u.hash||!match||['accounts','p','reel','reels','explore','direct','stories'].includes(match[1].toLowerCase()))return json(res,422,{error:'Use an https://www.instagram.com/your-profile/ link, without tracking parameters.'});instagram=`https://www.instagram.com/${match[1]}/`;}
    if(!Number.isInteger(raw.version))return json(res,422,{error:'Reload settings before saving.'});const result=db.prepare('UPDATE site_settings SET whatsapp=?,instagram=?,version=version+1 WHERE id=1 AND version=?').run(phone,instagram,raw.version);
    if(!result.changes)return json(res,409,{error:'Settings changed in another session. Reload before saving.'});audit('settings.update','socials');return json(res,200,{ok:true});
   }
   if(pathname==='/api/admin/enquiries'&&req.method==='GET'){
    const page=Number(url.searchParams.get('page')||1),q=String(url.searchParams.get('search')||'').trim().toLowerCase().slice(0,100),status=url.searchParams.get('status')||'';
    if(!Number.isInteger(page)||page<1||page>100000||!['','new','contacted','closed'].includes(status))return json(res,422,{error:'Invalid enquiry filters.'});
    const where="WHERE instr(lower(name||' '||email||' '||id),?)>0 AND (?='' OR status=?)";
    const total=db.prepare(`SELECT count(*) AS total FROM enquiries ${where}`).get(q,status,status).total;
    const enquiries=db.prepare(`SELECT * FROM enquiries ${where} ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?`).all(q,status,status,(page-1)*25);
    return json(res,200,{enquiries,total,page,pages:Math.max(1,Math.ceil(total/25)),stats:db.prepare("SELECT count(*) AS total,sum(status='new') AS new,sum(status='contacted') AS contacted FROM enquiries").get()});
   }
   const enquiryMatch=/^\/api\/admin\/enquiries\/(TT-[A-F0-9]{12})$/.exec(pathname);
   if(enquiryMatch&&['PATCH','DELETE'].includes(req.method)){
    const id=enquiryMatch[1],raw=await body(req);if(!db.prepare('SELECT id FROM enquiries WHERE id=?').get(id))return json(res,404,{error:'Enquiry not found.'});
    if(req.method==='DELETE'){if(raw.confirm!==id)return json(res,422,{error:'Confirm the enquiry reference to delete.'});db.prepare('DELETE FROM enquiries WHERE id=?').run(id);audit('enquiry.delete',id);return json(res,200,{ok:true});}
    if(!['new','contacted','closed'].includes(raw.status))return json(res,422,{error:'Choose a valid status.'});db.prepare('UPDATE enquiries SET status=? WHERE id=?').run(raw.status,id);audit('enquiry.status',id);return json(res,200,{ok:true});
   }
   return json(res,404,{error:'Not found.'});
  }catch(error){if(error.status)return json(res,error.status,{error:error.message});console.error('Admin request failed:',error.message);if(!res.headersSent)return json(res,500,{error:'The admin request could not be completed.'});}
 };
}
