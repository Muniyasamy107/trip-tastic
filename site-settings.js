// Public data only: published price ranges and verified business social links.
export function setupSiteSettings({journeys,onPricesChanged}){
 let pending=false;
 const note=document.querySelector('#site-sync-status');
 function social(id,url){const link=document.querySelector(id);if(!link)return;const label=link.querySelector('small');if(label)label.textContent=id==='#footer-whatsapp'?(url?'PLAN SOMETHING PERSONAL':'CONTACT DETAILS TO FOLLOW'):(url?'FOLLOW THE SCENIC ROUTE':'PROFILE LINK TO FOLLOW');if(url){link.href=url;link.removeAttribute('aria-disabled');link.removeAttribute('tabindex');link.classList.add('is-ready');link.title='Opens the business contact channel in a new tab';}else{link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.tabIndex=-1;link.classList.remove('is-ready');link.title='Business contact details have not been published yet';}}
 async function refresh(){
  if(pending)return;pending=true;
  try{
   const response=await fetch('/api/site-settings',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Settings unavailable');const data=await response.json();
   if(!Array.isArray(data.prices)||!data.socials||data.prices.length!==journeys.length)throw new Error('Settings incomplete');
   let changed=false;
   for(const row of data.prices){const j=journeys.find(j=>j.id===row.id);if(!j||!Number.isSafeInteger(row.min)||!Number.isSafeInteger(row.max)||row.min<1||row.max<row.min||row.max>10000000)throw new Error('Invalid published price');if(j.budget[0]!==row.min||j.budget[1]!==row.max){j.budget=[row.min,row.max];changed=true;}}
   const {whatsapp,instagram}=data.socials;social('#footer-whatsapp',/^[1-9]\d{7,14}$/.test(whatsapp)?`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello Trip-Tastic Holidays, I would like to plan a journey.')}`:'');social('#footer-instagram',/^https:\/\/www\.instagram\.com\/[a-zA-Z0-9._]{1,30}\/$/.test(instagram)?instagram:'');
   if(note)note.hidden=true;if(changed)onPricesChanged();
  }catch{if(note){note.textContent='Current published prices could not be loaded. Shown ranges are preview estimates; please confirm your quote.';note.hidden=false;}}
  finally{pending=false;}
 }
 void refresh();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});return {refresh};
}
