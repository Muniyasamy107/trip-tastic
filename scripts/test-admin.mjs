import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'vite';
import {spawnSync} from 'node:child_process';
import {launchBrowser} from './browser.mjs';
import {thumbnailFixture} from './thumbnail-fixture.mjs';
fs.mkdirSync('.cache',{recursive:true});
const directory=fs.mkdtempSync('.cache/admin-qa-');process.env.DATA_DIR=path.resolve(directory);delete process.env.PUBLIC_ORIGIN;delete process.env.TRUST_PROXY;
const {api,db}=await import('../server/api.mjs');
const {createAdminAccount}=await import('../server/admin.mjs');
const server=await createServer({configFile:false,root:process.cwd(),logLevel:'error',server:{host:'127.0.0.1',port:4187,strictPort:false},plugins:[{name:'private-admin-qa-api',configureServer(s){s.middlewares.use(api);}}]});
let browser;
try{
 await server.listen();const base=`http://127.0.0.1:${server.httpServer.address().port}`;let cookie='',csrf='';
 async function request(url,method='GET',data,{authorized=true,token=true,origin=base}={}){const headers={};if(authorized&&cookie)headers.Cookie=cookie;if(method!=='GET'){headers['Content-Type']='application/json';if(origin)headers.Origin=origin;if(token&&csrf)headers['X-CSRF-Token']=csrf;}const response=await fetch(base+url,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});return {response,data:await response.json()};}
 assert.equal((await request('/api/admin/enquiries')).response.status,401);
 assert.equal((await request('/api/admin/login','POST',{username:'superadmin',password:'missing'})).response.status,503);
 const cliEnvironment={...process.env,DATA_DIR:path.join(process.env.DATA_DIR,'cli-only')};
 const cli=spawnSync(process.execPath,['scripts/admin-setup.mjs'],{env:cliEnvironment,encoding:'utf8'});assert.equal(cli.status,0);assert.match(cli.stdout,/Username: superadmin/);assert.match(cli.stdout,/Password: Tt!/);
 const twice=spawnSync(process.execPath,['scripts/admin-setup.mjs'],{env:cliEnvironment,encoding:'utf8'});assert.equal(twice.status,1);assert.match(twice.stderr,/already exists/);
 const rotated=spawnSync(process.execPath,['scripts/admin-setup.mjs','--reset'],{env:cliEnvironment,encoding:'utf8'});assert.equal(rotated.status,0);assert.notEqual(rotated.stdout,cli.stdout);
 const account=createAdminAccount(db);assert.equal(account.username,'superadmin');assert.ok(account.password.length>=24);assert.throws(()=>createAdminAccount(db),/already exists/);
 assert.equal((await request('/api/admin/login','POST',account,{origin:'https://evil.example'})).response.status,403);
 assert.equal((await request('/api/admin/login','POST',account,{origin:null})).response.status,403);
 assert.equal((await request('/api/admin/login','POST',{username:'superadmin',password:'wrong'})).response.status,401);
 const login=await request('/api/admin/login','POST',account);assert.equal(login.response.status,200);cookie=login.response.headers.get('set-cookie').split(';')[0];csrf=login.data.csrfToken;
 assert.match(login.response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);assert.equal(login.data.password,undefined);assert.ok(!db.prepare('SELECT password_hash FROM admin_users').get().password_hash.includes(account.password));assert.notEqual(db.prepare('SELECT token_hash FROM admin_sessions').get().token_hash,cookie.split('=')[1]);
 const initial=(await request('/api/admin/prices')).data.prices[0],pricePath=`/api/admin/prices/${initial.id}`;
 assert.equal((await request(pricePath,'PUT',{min:31000,max:42000,version:initial.version},{token:false})).response.status,403);
 assert.equal((await request(pricePath,'PUT',{min:-1,max:1,version:initial.version})).response.status,422);
 assert.equal((await request(pricePath,'PUT',{min:31000,max:42000,version:initial.version})).response.status,200);
 assert.equal((await request(pricePath,'PUT',{min:33000,max:44000,version:initial.version})).response.status,409);
 const published=(await request('/api/site-settings','GET',undefined,{authorized:false})).data;assert.equal(published.prices.find(p=>p.id===initial.id).min,31000);assert.equal(JSON.stringify(published).includes('password'),false);
 const version=(await request('/api/admin/settings')).data.version;
 assert.equal((await request('/api/admin/settings','PUT',{whatsapp:'123',instagram:'javascript:alert(1)',version})).response.status,422);
 assert.equal((await request('/api/admin/settings','PUT',{whatsapp:'+14155552671',instagram:'https://www.instagram.com/triptastic.qa/',version})).response.status,200);
 assert.equal((await request('/api/admin/settings','PUT',{whatsapp:'',instagram:'',version})).response.status,409);
 const date=new Date(Date.now()+45*86400000).toISOString().slice(0,10);
 const payload={name:'<img src=x onerror=window.__xss=1>',email:'owner-qa@example.test',phone:'+14155552671',destination:initial.id,date,travellers:2,budget:'25000-40000',pace:'A bit of both',notes:'Private test enquiry; not a real customer.',consent:true,whatsappConsent:true};
 assert.equal((await request('/api/enquiries','POST',{...payload,consent:false})).response.status,422);
 assert.equal((await request('/api/enquiries','POST',{...payload,phone:'9876543210'})).response.status,422);
 const saved=await request('/api/enquiries','POST',payload);assert.equal(saved.response.status,201);const ref=saved.data.reference;
 const list=await request('/api/admin/enquiries');assert.equal(list.data.enquiries[0].email,payload.email);assert.equal(list.data.enquiries[0].whatsapp_consent,1);
 assert.equal((await request('/api/enquiries')).response.status,405);assert.equal((await request('/api/admin/enquiries','GET',undefined,{authorized:false})).response.status,401);
 assert.equal(JSON.stringify((await request('/api/site-settings')).data).includes(payload.email),false);
 const noWhatsapp=await request('/api/enquiries','POST',{...payload,name:'No WhatsApp Permission',email:'no-whatsapp@example.test',whatsappConsent:false});assert.equal(noWhatsapp.response.status,201);
 const oversized=await fetch(base+'/api/admin/settings',{method:'PUT',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({value:'x'.repeat(17000)})});assert.equal(oversized.status,413);
 // The sandbox Chromium disables web security and omits automatic Origin;
 // provide the same-origin header a normal browser sends. Node tests above
 // independently verify that missing/cross-site Origin is rejected.
 browser=await launchBrowser();const context=await browser.newContext({viewport:{width:1440,height:1000},extraHTTPHeaders:{Origin:base}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/admin.html');await page.waitForFunction(()=>!document.querySelector('#login-form button').disabled);await page.locator('#login-form [name=username]').fill(account.username);await page.locator('#login-form [name=password]').fill(account.password);await page.locator('#login-form button').click();await page.locator(`[data-enquiry="${ref}"]`).waitFor({timeout:10000}).catch(async error=>{console.error("Admin UI diagnostics:",await page.locator("#login-error").textContent(),await page.locator("#studio-notice").textContent(),errors,await page.locator("#enquiry-list").textContent());throw error;});
 await page.locator(`[data-enquiry="${ref}"]`).click();assert.equal(await page.locator('.enquiry-detail h2').textContent(),payload.name);assert.equal(await page.evaluate(()=>window.__xss),undefined);
 assert.match(await page.locator('#email-draft').getAttribute('href'),/^mailto:/);assert.match(await page.locator('#whatsapp-draft').getAttribute('href'),/^https:\/\/wa.me\/14155552671/);
 await page.locator(`[data-enquiry="${noWhatsapp.data.reference}"]`).click();assert.equal(await page.locator('#whatsapp-draft').getAttribute('aria-disabled'),'true');assert.equal(await page.locator('#whatsapp-draft').getAttribute('href'),null);
 await page.locator(`[data-enquiry="${ref}"]`).click();await page.locator('#status-form select').selectOption('contacted');await page.locator('#status-form button').click();await page.locator('#studio-notice').filter({hasText:'Follow-up status saved'}).waitFor();assert.equal(db.prepare('SELECT status FROM enquiries WHERE id=?').get(ref).status,'contacted');
 await page.locator('[data-tab=pricing]').click();const priceForm=page.locator(`[data-price="${initial.id}"]`);await priceForm.locator('[name=min]').fill('32000');await priceForm.locator('[name=max]').fill('44000');await priceForm.locator('button').click();await priceForm.locator('.row-feedback').filter({hasText:'Saved.'}).waitFor();
 const publicPage=await context.newPage();await publicPage.emulateMedia({reducedMotion:'reduce'});await thumbnailFixture(publicPage);await publicPage.goto(base);await publicPage.locator(`[data-journey="${initial.id}"] .card-budget`).filter({hasText:'32,000'}).waitFor();assert.match(await publicPage.locator('#footer-whatsapp').getAttribute('href'),/14155552671/);assert.equal(await publicPage.locator('#footer-instagram').getAttribute('href'),'https://www.instagram.com/triptastic.qa/');await publicPage.close();
 await page.locator('[data-tab=settings]').click();await page.locator('#settings-form [name=whatsapp]').fill('+14155552672');await page.locator('#settings-form button').click();await page.locator('#studio-notice').filter({hasText:'contact links saved'}).waitFor();assert.equal(db.prepare('SELECT whatsapp FROM site_settings WHERE id=1').get().whatsapp,'14155552672');
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Admin overflow at ${width}`);}
 await page.screenshot({path:'.cache/admin-studio-settings.png'});
 await page.locator('[data-tab=inbox]').click();await page.locator(`[data-enquiry="${ref}"]`).click();page.once('dialog',d=>d.accept());await page.locator('#delete-enquiry').click();await page.locator('#studio-notice').filter({hasText:'Enquiry deleted'}).waitFor();assert.equal(db.prepare('SELECT id FROM enquiries WHERE id=?').get(ref),undefined);
 await page.locator('[data-tab=security]').click();await page.locator('#password-form [name=currentPassword]').fill(account.password);await page.locator('#password-form [name=newPassword]').fill('QA-owner-password-2026');await page.locator('#password-form [name=confirmPassword]').fill('QA-owner-password-2026');await page.locator('#password-form button').click();await page.locator('#login-screen').waitFor({state:'visible'});assert.equal((await request('/api/admin/session')).response.status,401);assert.equal(db.prepare('SELECT count(*) AS n FROM admin_sessions').get().n,0);assert.deepEqual(errors,[]);
 db.exec('DELETE FROM admin_login_limits');for(let i=0;i<5;i++)assert.equal((await request('/api/admin/login','POST',{username:'superadmin',password:'wrong'})).response.status,401);assert.equal((await request('/api/admin/login','POST',{username:'superadmin',password:'QA-owner-password-2026'})).response.status,429);
 const reset=createAdminAccount(db,{reset:true});const again=await request('/api/admin/login','POST',reset);assert.equal(again.response.status,200);cookie=again.response.headers.get('set-cookie').split(';')[0];csrf=again.data.csrfToken;
 assert.equal((await request('/api/admin/logout','POST',{})).response.status,200);assert.equal((await request('/api/admin/session')).response.status,401);
 console.log('PASS: isolated owner bootstrap/reset, scrypt credentials, private hashed sessions, login throttling, origin + CSRF guards, bounded body, price validation/conflict/public propagation, settings validation/footer links, consented enquiry-only inbox, WhatsApp opt-in, escaped XSS payload, manual contact drafts, status/delete, password session revocation, logout, responsive admin. No real credentials or customer data were used.');
}finally{if(browser)await browser.close();await server.close();db.close();fs.rmSync(directory,{recursive:true,force:true});}
