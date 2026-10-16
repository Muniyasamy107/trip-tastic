import {displayPhone} from './business-contacts.js';
// Public data only: published price ranges and owner-supplied business contacts.
export function setupSiteSettings({journeys,onPricesChanged}){
 let pending=false;
 const note=document.querySelector('#site-sync-status');
 function linkState(link,url,title){if(!link)return;if(url){link.href=url;link.removeAttribute('aria-disabled');link.removeAttribute('tabindex');link.classList.add('is-ready');link.title=title;}else{link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.tabIndex=-1;link.classList.remove('is-ready');link.title='Business contact details have not been published';}}
 function contacts({whatsapp,instagram,phone,email}){
  const wa=/^[1-9]\d{7,14}$/.test(whatsapp)?`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello Trip-Tastic Holidays, I would like to plan a journey.')}`:'';
  const ig=/^https:\/\/www\.instagram\.com\/[a-zA-Z0-9._]{1,30}\/$/.test(instagram)?instagram:'';
  const call=/^[1-9]\d{7,14}$/.test(phone)?`tel:+${phone}`:'';
  const mail=typeof email==='string'&&email.length<=160&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)?`mailto:${encodeURIComponent(email).replace(/%40/gi,'@')}`:'';
  const waLink=document.querySelector('#footer-whatsapp'),igLink=document.querySelector('#footer-instagram');
  linkState(waLink,wa,'Open the business WhatsApp chat');linkState(igLink,ig,'Open the business Instagram profile');
  if(waLink)waLink.querySelector('small').textContent=wa?'PLAN SOMETHING PERSONAL':'CONTACT DETAILS TO FOLLOW';
  if(igLink){igLink.querySelector('small').textContent=ig?'FOLLOW THE SCENIC ROUTE':'PROFILE LINK TO FOLLOW';const detail=igLink.querySelector('.channel-detail');if(detail)detail.textContent=ig?`@${new URL(ig).pathname.split('/')[1]}`:'Profile not published';}
  document.querySelectorAll('[data-business-phone]').forEach(link=>{linkState(link,call,call?`Call ${displayPhone(phone)}`:'Call number not published');const detail=link.querySelector('.channel-detail');if(detail)detail.textContent=call?displayPhone(phone):'Call number not published';});
  document.querySelectorAll('[data-business-email]').forEach(link=>{linkState(link,mail,'Open your email app');const detail=link.querySelector('.channel-detail');if(detail)detail.textContent=mail?email:'Email not published';});
 }
 async function refresh(){
  if(pending)return;pending=true;
  try{
   const response=await fetch('/api/site-settings',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Settings unavailable');const data=await response.json();
   if(!Array.isArray(data.prices)||!data.socials||data.prices.length!==journeys.length)throw new Error('Settings incomplete');
   let changed=false;
   for(const row of data.prices){const j=journeys.find(j=>j.id===row.id);if(!j||!Number.isSafeInteger(row.min)||!Number.isSafeInteger(row.max)||row.min<1||row.max<row.min||row.max>10000000)throw new Error('Invalid published price');if(j.budget[0]!==row.min||j.budget[1]!==row.max){j.budget=[row.min,row.max];changed=true;}}
   contacts(data.socials);if(note)note.hidden=true;if(changed)onPricesChanged();
  }catch{if(note){note.textContent='Current published prices could not be loaded. Shown ranges are preview estimates; please confirm your quote.';note.hidden=false;}}
  finally{pending=false;}
 }
 void refresh();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});return {refresh};
}
