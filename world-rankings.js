'use strict';
const EVENTS=['50m','55m','60m','100m','200m','300m','400m','600m','800m','1000m','1500m','1600m','Mile','2000m','3000m','3200m','5000m','10000m','80m Hurdles','100m Hurdles','110m Hurdles','200m Hurdles','300m Hurdles','400m Hurdles','2000m Steeplechase','3000m Steeplechase','High Jump','Pole Vault','Long Jump','Triple Jump','Shot Put','Discus','Hammer','Javelin','Turbo Javelin','Race Walk 800m','Race Walk 1500m','Race Walk 3000m','Race Walk 5000m','Pentathlon','Heptathlon','Decathlon'];
const LIMIT_PER_AGE=25;
const AGE_GROUPS=Array.from({length:12},(_,i)=>i+7);
const $=id=>document.getElementById(id);
$('age').add(new Option('All ages — Top 25 each','all'));
for(const a of AGE_GROUPS)$('age').add(new Option(`Age ${a}`,String(a)));
$('age').value='all';
EVENTS.forEach(e=>$('event').add(new Option(e,e)));
$('event').value='100m';
let records=[],hasLoaded=false;
function parseCSV(t){let lines=[],row=[],cell='',quoted=false;for(let i=0;i<t.length;i++){let c=t[i];if(c==='"'){if(quoted&&t[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&t[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))lines.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);lines.push(row)}let h=(lines.shift()||[]).map(x=>x.trim().replace(/^\uFEFF/,''));return lines.map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()]))) }
function safeLink(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function isField(event){return /Jump|Vault|Put|Discus|Hammer|Javelin|athlon/i.test(event)}
function isEligible(r){
  if(r.status!=='verified'||!Number.isFinite(Number(r.sort_value))||!safeLink(r.source_url))return false;
  // Wind-aided (+2.0 m/s or greater) results are ineligible for standard legal-wind sprint/horizontal jump rankings.
  // If wind is unreported, keep the performance but show its missing wind (do not falsely claim legal wind).
  if(/^(100m|200m|80m Hurdles|100m Hurdles|110m Hurdles|Long Jump|Triple Jump)$/.test(r.event)){
    const w=String(r.wind||'').replace('m/s','').trim();
    if(w&&Number.isFinite(Number(w))&&Number(w)>2.0)return false;
  }
  return true;
}
function addCell(tr,text){const cell=document.createElement('td');cell.textContent=String(text);tr.appendChild(cell);return cell}
function addGroupHeading(age,found,allAges){
  if(!allAges)return;
  const tr=document.createElement('tr');tr.className='group-heading';
  const td=document.createElement('td');td.colSpan=7;td.textContent=`AGE ${age}  ·  ${found} of 25 spots populated`;
  tr.appendChild(td);$('rows').appendChild(tr);
}
function addResult(r,rank){
  const tr=document.createElement('tr');
  addCell(tr,rank);addCell(tr,r.athlete);addCell(tr,r.country);
  const mark=addCell(tr,r.mark);
  if(r.implement_spec){let spec=document.createElement('small');spec.textContent=r.implement_spec;mark.appendChild(spec)}
  addCell(tr,r.wind||'Not reported');addCell(tr,r.date);
  const last=addCell(tr,'');
  const link=document.createElement('a');link.href=safeLink(r.source_url);link.target='_blank';link.rel='noopener noreferrer';link.textContent='View official result ↗';
  link.setAttribute('aria-label',`Check ${r.athlete}'s ${r.event} mark at ${r.meet}`);last.appendChild(link);
  const source=document.createElement('small');source.textContent=r.meet;last.appendChild(source);
  $('rows').appendChild(tr);
}
function render(){
  const mode=$('mode').value, gender=$('gender').value, ageChoice=$('age').value,
    event=$('event').value,country=$('country').value.toLowerCase().trim(),venue=$('venue').value;
  const ages=ageChoice==='all'?AGE_GROUPS:[Number(ageChoice)];
  const allAges=ageChoice==='all';
  const resultPool=records.filter(r=>isEligible(r)&&r.gender===gender&&r.event===event&&
    (mode==='alltime'||r.date.startsWith('2026'))&&(!country||r.country.toLowerCase().includes(country))&&
    (venue==='all'||r.venue===venue));
  $('rows').replaceChildren();
  let total=0, populated=0;
  for(const age of ages){
    const candidates=resultPool.filter(r=>Number(r.age)===age);
    candidates.sort((x,y)=>{
      const v=isField(event)?Number(y.sort_value)-Number(x.sort_value):Number(x.sort_value)-Number(y.sort_value);
      return v||String(x.date).localeCompare(String(y.date));
    });
    const used=new Set(),top=[];
    for(const r of candidates){
      const key=r.athlete.trim().toLocaleLowerCase()+'|'+r.country.toLowerCase();
      if(used.has(key))continue;
      used.add(key);top.push(r);
      if(top.length===LIMIT_PER_AGE)break;
    }
    addGroupHeading(age,top.length,allAges);
    if(top.length){populated++;total+=top.length;top.forEach((r,index)=>addResult(r,index+1));}
    else if(allAges){const tr=document.createElement('tr');tr.className='empty-group';const td=document.createElement('td');td.colSpan=7;td.textContent='No verified performances imported for this age, event and filter selection.';tr.appendChild(td);$('rows').appendChild(tr)}
  }
  $('count').textContent=allAges?`${total} athletes shown · ${populated} of 12 ages have data · max 25 per age`:`${total} of 25 spots populated · Age ${ageChoice}`;
  if(!total&&!allAges){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent=hasLoaded?'No verified performances have been imported for this selection. This does not mean there are no eligible athletes worldwide.':'Could not load results CSV. Check that world-rankings-data.csv is beside this page.';tr.appendChild(td);$('rows').appendChild(tr)}
}
['mode','gender','age','event','country','venue'].forEach(id=>$(id).addEventListener(id==='country'?'input':'change',render));
fetch('world-rankings-data.csv',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(`Dataset HTTP ${r.status}`);return r.text()})
.then(t=>{records=parseCSV(t);hasLoaded=true;const valid=records.filter(isEligible);$('stat-marks').textContent=valid.length.toLocaleString();$('stat-countries').textContent=new Set(valid.map(r=>r.country)).size;$('stat-events').textContent=new Set(valid.map(r=>r.event)).size;$('updated').textContent='2026 season + imported historical results';render()})
.catch(err=>{$('stat-marks').textContent='—';$('stat-countries').textContent='—';$('stat-events').textContent='—';$('updated').textContent='Dataset unavailable';console.error('Rankings error:',err);render()});
