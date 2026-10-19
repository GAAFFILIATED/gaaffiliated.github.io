(function(){'use strict';
const catalog={
'Sprints':['50m','55m','60m','100m','200m','300m','400m'],
'Middle & Long Distance':['600m','800m','1000m','1500m','1600m','1 Mile','3000m','3200m','5000m','10000m','2000m Steeplechase','3000m Steeplechase'],
'Hurdles':['55m Hurdles','60m Hurdles','80m Hurdles','100m Hurdles','110m Hurdles','200m Hurdles','300m Hurdles','400m Hurdles'],
'Jumps':['Standing Long Jump','Long Jump','Triple Jump','High Jump','Pole Vault'],
'Throws':['Softball Throw','Shot Put','Discus Throw','Turbo Javelin','Javelin Throw','Hammer Throw','Weight Throw'],
'Racewalk':['400m Racewalk','800m Racewalk','1500m Racewalk','1600m Racewalk','3000m Racewalk','5000m Racewalk'],
'Relays':['4x100m Relay','4x200m Relay','4x400m Relay','4x800m Relay','4x1500m Relay','4x1 Mile Relay','Sprint Medley Relay','Distance Medley Relay','Shuttle Hurdle Relay'],
'Combined Events':['Triathlon','Tetrathlon','Pentathlon','Heptathlon','Decathlon']
};
const fieldEvents=new Set(catalog.Jumps.concat(catalog.Throws));
const pointsEvents=new Set(catalog['Combined Events']);
const windEvents=new Set(['100m','200m','80m Hurdles','100m Hurdles','110m Hurdles','Long Jump','Triple Jump']);
const ageWrap=document.getElementById('rank-age-options'),gender=document.getElementById('rank-gender'),category=document.getElementById('rank-category'),eventPick=document.getElementById('rank-event'),season=document.getElementById('rank-season'),region=document.getElementById('rank-region'),search=document.getElementById('rank-search');
const tbody=document.getElementById('rank-table-body'),empty=document.getElementById('rank-empty'),emptyTitle=document.getElementById('rank-empty-title'),emptyDesc=document.getElementById('rank-empty-description'),status=document.getElementById('rank-data-status'),ctx=document.getElementById('rank-board-context'),count=document.getElementById('rank-count-display'),selection=document.getElementById('rank-selection-label'),more=document.getElementById('rank-load-more');
let selectedAge=12,loaded=[],visibleRows=25,loadError=false;
const norm=s=>String(s??'').trim();
function option(value,text){let o=document.createElement('option');o.value=value;o.textContent=text;return o;}
function setOptions(el,values){el.replaceChildren(...values.map(v=>option(v,v.toUpperCase())));}
function buildCategories(){setOptions(category,Object.keys(catalog));category.value='Sprints';updateEvent();}
function updateEvent(preferred){const available=catalog[category.value]||[];setOptions(eventPick,available);eventPick.value=available.includes(preferred)?preferred:available.includes('100m')?'100m':(available[0]||'');}
function buildAges(){for(let age=7;age<=18;age++){const b=document.createElement('button');b.type='button';b.textContent=age;b.setAttribute('aria-label','Age '+age);b.setAttribute('aria-pressed',String(age===selectedAge));b.addEventListener('click',()=>{selectedAge=age;for(const button of ageWrap.children)button.setAttribute('aria-pressed',String(Number(button.textContent)===age));selectPopulatedEvent();change();});ageWrap.append(b);}}
function csvRows(csv){const rows=[];let current=[],cell='',quoted=false;for(let i=0;i<csv.length;i++){const c=csv[i];if(quoted){if(c==='"'&&csv[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"'){quoted=true;}else if(c===','){current.push(cell);cell='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&csv[i+1]==='\n')i++;current.push(cell);if(current.some(x=>x.trim()))rows.push(current);current=[];cell='';}else{cell+=c;}}
current.push(cell);if(current.some(x=>x.trim()))rows.push(current);
if(!rows.length)return[];
const keys=rows.shift().map(s=>s.trim().replace(/^\uFEFF/,''));return rows.map(cols=>Object.fromEntries(keys.map((key,i)=>[key,norm(cols[i])])));
}
function parseTime(raw){const normalized=raw.toLowerCase().replace(/seconds?|secs?|s(?=$)/g,'').trim();const parts=normalized.split(':');if(parts.length>3||parts.some(p=>!/^\d+(?:\.\d+)?$/.test(p)))return NaN;let v=0;for(const p of parts)v=v*60+Number(p);return v;}
function parseMark(raw,eventName){let cleaned=norm(raw).replace(/\s/g,'');if(pointsEvents.has(eventName)){if(!/^\d+(?:\.\d+)?$/.test(cleaned))return NaN;return Number(cleaned);}
if(fieldEvents.has(eventName)){cleaned=cleaned.replace(/meters?$|m$/i,'');if(!/^\d+(?:\.\d+)?$/.test(cleaned))return NaN;return Number(cleaned);}
return parseTime(cleaned);}
function knownEvent(name){return Object.values(catalog).some(events=>events.includes(name));}
function canonicalGender(s){s=norm(s).toLowerCase();return ['girls','female','f','women','girl'].includes(s)?'Girls':['boys','male','m','men','boy'].includes(s)?'Boys':'';}
function makeRecord(r){let ev=norm(r.event),age=Number(r.age),sex=canonicalGender(r.gender),athlete=norm(r.athlete),mark=norm(r.mark),year=norm(r.date).slice(0,4),url=norm(r.source_url),state=norm(r.state).toUpperCase(),verified=norm(r.status).toLowerCase()==='verified';
if(!athlete||!Number.isInteger(age)||age<7||age>18||!sex||!knownEvent(ev)||!/^(20\d\d)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(norm(r.date))||!/^(19|20)\d\d$/.test(year)||!/^https:\/\/[^\s]+$/i.test(url)||!verified)return null;
const numeric=parseMark(mark,ev);if(!Number.isFinite(numeric)||numeric<=0)return null;
let wind=norm(r.wind);if(windEvents.has(ev)&&wind){const w=Number(wind.replace(/m\/s/i,''));if(!Number.isFinite(w)||w>2.0)return null;}
return {athlete,age,gender:sex,event:ev,mark,score:numeric,meet:norm(r.meet),date:norm(r.date),state,team:norm(r.team),url,wind,year,athleteId:norm(r.athlete_id)};
}
function selectPopulatedEvent(){
 if(!loaded.length) return;
 const available=loaded.filter(r=>r.age===selectedAge&&r.gender===gender.value&&(season.value==='all'||r.year===season.value)&&(region.value==='all'||r.state==='FL'));
 if(available.some(r=>r.event===eventPick.value))return;
 const favorite=['100m','200m','400m','800m','1500m','Long Jump','Shot Put'];
 const found=favorite.find(name=>available.some(r=>r.event===name))||(available[0]||{}).event;
 if(!found)return;
 const cat=Object.keys(catalog).find(k=>catalog[k].includes(found));
 if(cat){category.value=cat;updateEvent(found);}
}
function eligible(r){return r.age===selectedAge&&r.gender===gender.value&&r.event===eventPick.value&&(season.value==='all'||season.value===r.year)&&(region.value==='all'||r.state==='FL');}
function bestForFilter(){const matches=loaded.filter(eligible);const map=new Map();const higherIsBetter=fieldEvents.has(eventPick.value)||pointsEvents.has(eventPick.value);
for(const row of matches){const key=(row.athleteId||row.athlete.toLowerCase()+'|'+row.state)+'|'+row.gender+'|'+row.age+'|'+row.event+(season.value==='all'?'':'|'+row.year);const prior=map.get(key);if(!prior||(higherIsBetter?row.score>prior.score:row.score<prior.score))map.set(key,row);}
return [...map.values()].sort((a,b)=>(higherIsBetter?b.score-a.score:a.score-b.score)||a.athlete.localeCompare(b.athlete));}
function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;}
function buildRow(r,rank){const tr=el('tr'),p=el('td','rank-place','#'+rank),person=el('td');person.append(el('span','rank-athlete-name',r.athlete));person.append(el('span','rank-athlete-meta',[r.team,r.state].filter(Boolean).join(' · ')||'Independent'));
const performance=el('td');performance.append(el('span','rank-mark',r.mark));if(r.wind)performance.append(el('span','rank-wind','Wind: '+r.wind+' m/s'));
const meet=el('td',null,r.meet||'Published result');meet.append(el('span','rank-athlete-meta',r.date));
const source=el('td');const a=el('a','rank-source','VIEW RESULT ↗');a.href=r.url;a.rel='noopener noreferrer';a.target='_blank';source.append(a);
tr.append(p,person,performance,meet,source);return tr;}
function render(){visibleRows=Math.max(25,visibleRows);const rows=bestForFilter();const filtered=rows.filter(r=>!search.value.trim()||(r.athlete+' '+r.team).toLowerCase().includes(search.value.trim().toLowerCase())).slice(0,100);
let label=gender.value.toUpperCase()+' · AGE '+selectedAge+' · '+eventPick.value.toUpperCase()+' · '+(season.value==='all'?'ALL SEASONS':season.value);if(region.value==='FL')label+=' · FLORIDA';ctx.textContent=label;selection.textContent=label;tbody.replaceChildren(...filtered.slice(0,visibleRows).map((r,i)=>buildRow(r,i+1)));
let noRows=filtered.length===0;empty.hidden=!noRows;document.querySelector('.rank-table-scroll').hidden=noRows;count.textContent=filtered.length+' RANKED RESULT'+(filtered.length===1?'':'S');more.hidden=filtered.length<=visibleRows;
if(noRows){emptyTitle.textContent=loadError?'RESULTS FILE UNAVAILABLE.':loaded.length===0?'AWAITING VERIFIED RESULTS.':'NO MATCHES FOR THESE FILTERS.';emptyDesc.textContent=loadError?'Could not retrieve the rankings CSV. Check that rankings-data.csv exists alongside this page on GitHub Pages.':loaded.length===0?'No official meet marks have been added yet. Upload reviewed results to rankings-data.csv to populate this Top 100 leaderboard.':'Try a different age, event, season, region, or athlete name. Only sourced, editor-verified performances appear here.';}
status.textContent=loadError?'DATA FILE ERROR':loaded.length===0?'AWAITING RESULTS':filtered.length+' VERIFIED MARKS (GA SELECTION)';}
function change(){visibleRows=25;render();}
async function load(){try{const response=await fetch('rankings-data.csv?v=2',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const content=await response.text();const raw=csvRows(content);loaded=raw.map(makeRecord).filter(Boolean);loadError=false;selectPopulatedEvent();}catch(e){loaded=[];loadError=true;console.warn('GA Top 100: rankings data unavailable',e);}document.getElementById('rank-loaded-count').textContent=String(loaded.length);render();}
buildCategories();buildAges();category.addEventListener('change',()=>{updateEvent();change()});gender.addEventListener('change',()=>{selectPopulatedEvent();change()});[eventPick,season,region].forEach(item=>item.addEventListener('change',change));search.addEventListener('input',change);
document.getElementById('rank-reset').addEventListener('click',()=>{selectedAge=12;for(const b of ageWrap.children)b.setAttribute('aria-pressed',String(b.textContent==='12'));gender.value='Girls';category.value='Sprints';updateEvent('100m');season.value='2026';region.value='all';search.value='';change();});
more.addEventListener('click',()=>{visibleRows+=25;render();});document.getElementById('rank-print').addEventListener('click',()=>window.print());load();
})();