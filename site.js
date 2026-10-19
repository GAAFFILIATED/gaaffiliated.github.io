(() => {
  'use strict';
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const overlay = $('#overlay');
  const drawers = [$('#menu-drawer'), $('#bag-drawer'), $('#search-modal')].filter(Boolean);
  let activePanel = null;
  let lastTrigger = null;
  const setExpanded = (el, isOn) => { if(el) el.setAttribute('aria-expanded',String(isOn)); };
  function closePanels() {
    drawers.forEach(el => { el.classList.remove('is-open'); el.setAttribute('aria-hidden','true'); });
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
    setExpanded($('#menu-open'),false); setExpanded($('.inquiry-open'),false); setExpanded($('#search-open'),false);
    if(lastTrigger) lastTrigger.focus({preventScroll:true});
    activePanel = null;
  }
  function openPanel(id, trigger) {
    if(activePanel) closePanels();
    const panel = document.getElementById(id);if(!panel)return;
    activePanel=panel;lastTrigger=trigger;
    panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');
    if(overlay && id!=='search-modal')overlay.hidden=false;
    document.body.style.overflow='hidden';
    setExpanded(trigger,true);
    if(id==='search-modal') $('#search-input')?.focus(); else panel.focus();
  }
  $('#menu-open')?.addEventListener('click',e=>openPanel('menu-drawer',e.currentTarget));
  $('#search-open')?.addEventListener('click',e=>{openPanel('search-modal',e.currentTarget);searchUI('');});
  $$('.inquiry-open').forEach(btn=>btn.addEventListener('click',e=>openPanel('bag-drawer',e.currentTarget)));
  $$('[data-close]').forEach(btn=>btn.addEventListener('click',closePanels));
  overlay?.addEventListener('click',closePanels);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&activePanel){closePanels();return;}
    if(e.key!=='Tab'||!activePanel)return;
    const focusable=$$('button:not([disabled]),a[href],input,select,[tabindex="0"]',activePanel).filter(e=>e.getClientRects().length);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  $$('.drawer-nav a').forEach(a=>a.addEventListener('click',closePanels));

  const searchable = [
    ['The GA Custom Journey','#journey','custom process discover design'],
    ['Track & Field Uniforms','#collections','track singlet race kit custom'],
    ['Tackle Football Uniforms','#collections','football tackle'],
    ['7v7 Football Uniforms','#collections','7v7 flag football'],
    ['Basketball Uniforms','#collections','basketball jersey'],
    ['Men’s Black Sweatsuit Set','#shop','men black sweatsuit apparel'],
    ['Men’s Red Sweatsuit Set','#shop','men red sweatsuit apparel'],
    ['Men’s Green Sweatsuit Set','#shop','men green sweatsuit apparel'],
    ['Women’s Pink / Purple Sweatsuit Set','#shop','women pink purple sweatsuit apparel'],
    ['GA Ambassadors','ambassadors.html','athlete team ambassadors roster'],
    ['Contact GA','#contact','contact custom quote email']
  ];
  function searchUI(q) {
    const box=$('#search-results');if(!box)return;
    const matches=searchable.filter(item=>(item[0]+' '+item[2]).toLowerCase().includes(q.trim().toLowerCase())).slice(0,8);
    box.replaceChildren();
    if(!matches.length){const p=document.createElement('p');p.textContent='No matches. Try a sport or apparel color.';box.append(p);return;}
    for(const [name,url] of matches){const a=document.createElement('a');a.href=url;a.textContent=name;const arrow=document.createElement('span');arrow.textContent='↗';a.append(arrow);a.addEventListener('click',closePanels);box.append(a);}
  }
  $('#search-input')?.addEventListener('input',e=>searchUI(e.target.value));
  const inventory=[...$$('.product-add')].map(b=>({name:b.dataset.product,price:Number(b.dataset.price)}));
  let items={};
  try{const saved=JSON.parse(localStorage.getItem('gaInquiryBag')||'{}');if(saved&&typeof saved==='object'){for(const k of Object.keys(saved))if(inventory.some(p=>p.name===k)&&Number.isInteger(saved[k])&&saved[k]>0&&saved[k]<=99)items[k]=saved[k];}}catch{}
  const save=()=>{try{localStorage.setItem('gaInquiryBag',JSON.stringify(items));}catch{}};
  function renderBag(){
    const qty=Object.values(items).reduce((a,b)=>a+b,0),total=Object.entries(items).reduce((acc,[name,count])=>acc+(inventory.find(i=>i.name===name)?.price||0)*count,0);
    const count=$('#bag-count');if(count){count.hidden=!qty;count.textContent=String(qty);}
    const totalEl=$('#bag-total');if(totalEl)totalEl.textContent='$'+total;
    const root=$('#bag-items');if(root){root.replaceChildren();if(!qty){const p=document.createElement('p');p.className='empty-bag';p.textContent='Your inquiry bag is empty. Add an apparel set to request sizes and ordering details.';root.append(p);}else{
      for(const [name,n] of Object.entries(items)){
        const row=document.createElement('div');row.className='bag-line';
        const details=document.createElement('div');const h=document.createElement('h3');h.textContent=name;const price=document.createElement('p');price.textContent='$80 per set';details.append(h,price);
        const q=document.createElement('div');q.className='bag-quantity';
        const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','Remove one '+name);minus.addEventListener('click',()=>modify(name,-1));
        const amount=document.createElement('span');amount.textContent=String(n);
        const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label','Add one '+name);plus.addEventListener('click',()=>modify(name,1));
        q.append(minus,amount,plus);details.append(q);
        const right=document.createElement('div');const subtotal=document.createElement('strong');subtotal.textContent='$'+n*80;const remove=document.createElement('button');remove.className='bag-remove';remove.textContent='Remove';remove.addEventListener('click',()=>{delete items[name];save();renderBag();});right.append(subtotal,document.createElement('br'),remove);row.append(details,right);root.append(row);
      }
    }}
    const email=$('#email-inquiry');if(email){const lines=Object.entries(items).map(([name,n])=>`• ${name}: quantity ${n} ($${n*80} listed subtotal)`);const message=qty?`Hello GA Affiliated,\n\nI would like to inquire about the following apparel sets:\n\n${lines.join('\n')}\n\nListed total: $${total}.\nPlease confirm available sizes, inventory, taxes, shipping and how to order.\n\nThank you!`:'Hello GA Affiliated,\n\nI have a question about your apparel.';email.href='mailto:ga.affiliated@gmail.com?subject='+encodeURIComponent('GA Apparel Inquiry')+'&body='+encodeURIComponent(message);}
  }
  function modify(name,delta){const n=Math.max(0,Math.min(99,(items[name]||0)+delta));if(n)items[name]=n;else delete items[name];save();renderBag();}
  $$('.product-add').forEach(btn=>btn.addEventListener('click',()=>{modify(btn.dataset.product,1);openPanel('bag-drawer',btn);}));
  renderBag();
  const video=$('#feature-video'),sound=$('#video-sound');
  if(video&&sound){sound.addEventListener('click',()=>{video.muted=!video.muted;sound.innerHTML=video.muted?'SOUND OFF <span>◖</span>':'SOUND ON <span>◖</span>';sound.setAttribute('aria-label',video.muted?'Unmute video':'Mute video');});video.play().catch(()=>{});}
  const help=$('#help-panel');const helpBtn=$('#help-trigger');const hideHelp=()=>{if(help)help.hidden=true;helpBtn?.setAttribute('aria-expanded','false');};helpBtn?.addEventListener('click',()=>{if(!help)return;help.hidden=!help.hidden;helpBtn.setAttribute('aria-expanded',String(!help.hidden));});$('#help-close')?.addEventListener('click',hideHelp);
})();
