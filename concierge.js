import {responsiveEditorial} from './editorial-media.js';

// Presentation only. The existing wizard, consent checks and API own submission.
export function setupConcierge({dialog,form,journeys,onEditStep}){
 const preview=dialog.querySelector('#concierge-preview');
 const steps=['The escape','The feeling','Your details'];
 function refresh(){
  const journey=journeys.find(j=>j.id===form.elements.destination.value);
  const date=form.elements.date.value;
  const parsed=date?new Date(`${date}T12:00:00+05:30`):null;
  const formatted=parsed&&Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(parsed):'Dates to be considered';
  const budget=form.elements.budget;
  const values={destination:journey?journey.name:'Something entirely my own',timing:`${formatted} · ${form.elements.travellers.value} traveller${form.elements.travellers.value==='1'?'':'s'}`,budget:budget.value?budget.selectedOptions[0].textContent:'To be considered together',pace:form.elements.pace.value};
  for(const node of dialog.querySelectorAll('[data-enquiry-summary]'))node.textContent=values[node.dataset.enquirySummary]||'';
  const src=journey?.image||'/media/coorg-cinematic.webp';
  if(preview.dataset.source!==src){const image=responsiveEditorial(src,'(max-width:760px) 100vw, 360px');preview.srcset=image.srcSet||'';preview.sizes=image.sizes||'100vw';preview.src=src;preview.style.objectPosition=journey?.position||'center';preview.alt=`AI-created mood inspired by ${journey?.place||'coffee country'}; not a verified view or confirmed stay`;preview.dataset.source=src;}
 }
 function step(number){
  refresh();dialog.dataset.enquiryStep=String(number);
  const meter=dialog.querySelector('#enquiry-progress');meter.setAttribute('aria-valuenow',String(number));meter.setAttribute('aria-valuetext',`Step ${number} of 3: ${steps[number-1]}`);meter.style.setProperty('--enquiry-progress',`${number/3*100}%`);
  dialog.querySelector('#enquiry-step-status').textContent=`0${number} OF 03 / ${steps[number-1].toUpperCase()}`;
  for(const node of dialog.querySelectorAll('[data-wizard-indicator]')){const index=Number(node.dataset.wizardIndicator);node.classList.toggle('is-complete',index<number);if(index===number)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');}
  dialog.scrollTo({top:0,behavior:'instant'});
 }
 form.addEventListener('change',refresh);
 form.addEventListener('input',event=>{if(['date','travellers'].includes(event.target.name))refresh();});
 dialog.addEventListener('click',async event=>{
  const edit=event.target.closest('[data-edit-enquiry]');if(edit){onEditStep(Number(edit.dataset.editEnquiry));return;}
  if(!event.target.closest('[data-copy-enquiry]'))return;
  const feedback=dialog.querySelector('#concierge-copy-feedback'),reference=dialog.querySelector('#enquiry-reference').textContent;
  if(!reference)return;
  try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(reference);feedback.textContent='Reference copied.';}
  catch{feedback.textContent='Select and copy the reference above.';}
 });
 return {refresh,step};
}
