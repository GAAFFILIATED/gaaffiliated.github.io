(() => {
  'use strict';
  const config = window.GA_STORE_CONFIG || {};
  const $ = id => document.getElementById(id);
  const currency = cents => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(cents/100);
  let catalog = [];
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('ga-affiliated-cart-v1') || '[]'); if(!Array.isArray(cart)) cart=[]; } catch{ cart=[]; }
  const safeImage = value => typeof value==='string' && (/^https:\/\//i.test(value) || /^assets\/[\w./-]+$/.test(value)) ? value : '';
  function el(tag, cls, text) {const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
  function save(){try{localStorage.setItem('ga-affiliated-cart-v1',JSON.stringify(cart));}catch{} }
  function variantFor(entry){return catalog.find(x=>x.id===entry.productId)?.variants.find(v=>v.id===entry.variantId);}
  function itemFor(entry){return catalog.find(x=>x.id===entry.productId);}
  function cleanCart() {
    cart=cart.filter(c=>c&&Number.isInteger(c.quantity)&&c.quantity>=1&&c.quantity<=20&&itemFor(c)&&variantFor(c));
    save();
  }
  function renderCart(){
    const box=$('cart-items');box.replaceChildren();let total=0,count=0;
    for(const entry of cart){
      const p=itemFor(entry),v=variantFor(entry);if(!p||!v)continue;
      total += v.priceCents*entry.quantity;count +=entry.quantity;
      const row=el('div','cart-item'),heading=el('div','cart-item-header');
      heading.append(el('span','cart-item-name',p.name),el('span','cart-item-price',currency(v.priceCents*entry.quantity)));
      row.append(heading,el('p','cart-item-meta',v.label+' · '+currency(v.priceCents)+' each'));
      const qty=el('div','qty-controls');
      const minus=el('button','', '−'),plus=el('button','', '+'),remove=el('button','remove','Remove');
      minus.type=plus.type=remove.type='button';minus.setAttribute('aria-label','Decrease quantity');plus.setAttribute('aria-label','Increase quantity');
      const n=el('span','',String(entry.quantity));
      minus.addEventListener('click',()=>updateQuantity(entry,-1));plus.addEventListener('click',()=>updateQuantity(entry,+1));
      remove.addEventListener('click',()=>{cart=cart.filter(c=>!(c.productId===entry.productId&&c.variantId===entry.variantId));save();renderCart();});
      qty.append(minus,n,plus,remove);row.append(qty);box.append(row);
    }
    if(!count)box.append(el('p','muted','Your bag is empty. Add some GA gear.'));
    $('cart-subtotal').textContent=currency(total);$('bag-count').textContent=String(count);
    $('checkout-button').disabled=!count;
  }
  function updateQuantity(entry,delta){entry.quantity=Math.min(20,Math.max(0,entry.quantity+delta));if(!entry.quantity)cart=cart.filter(c=>c!==entry);save();renderCart();}
  function addToCart(productId,variantId){
    const p=catalog.find(x=>x.id===productId),v=p?.variants.find(x=>x.id===variantId);
    if(!p||!v)return;
    const current=cart.find(x=>x.productId===productId&&x.variantId===variantId);
    if(current){if(current.quantity>=20)return;current.quantity++;}else cart.push({productId,variantId,quantity:1});
    save();renderCart();$('checkout-status').textContent=`Added ${p.name} (${v.label}) to bag.`;
  }
  function renderProducts(){
    const grid=$('products-grid'),q=$('search').value.trim().toLowerCase(),cat=$('category').value;
    const products=catalog.filter(p=>(!cat||p.category===cat)&&(!q||`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)));
    grid.replaceChildren();$('product-count').textContent=`${products.length} product${products.length===1?'':'s'}`;
    for(const p of products){
      const card=el('article','product-card'),photo=el('div','product-image');
      const img=safeImage(p.imageUrl);
      if(img){const node=el('img');node.src=img;node.loading='lazy';node.alt=p.name;node.addEventListener('error',()=>photo.replaceChildren(el('span','placeholder','GA')));photo.append(node);}
      else photo.append(el('span','placeholder','GA'));
      card.append(photo,el('div','product-category',p.category),el('h3','',p.name),el('p','product-desc',p.description||'GA Affiliated performance apparel.'));
      const bottom=el('div','product-bottom'),price=el('span','product-price'),label=el('label','', 'CHOOSE OPTION'),select=el('select');
      const selectId='v-'+p.id;select.id=selectId;label.htmlFor=selectId;
      for(const v of p.variants){const option=el('option','',`${v.label} — ${currency(v.priceCents)}`);option.value=v.id;select.append(option);}
      function setPrice(){price.textContent=currency(p.variants.find(v=>v.id===select.value)?.priceCents||0);}
      select.addEventListener('change',setPrice);setPrice();
      const button=el('button','', 'ADD TO BAG +');button.type='button';button.addEventListener('click',()=>addToCart(p.id,select.value));
      bottom.append(price,label,select,button);card.append(bottom);grid.append(card);
    }
    if(!products.length)grid.append(el('p','muted','No products found. Try another search or category.'));
  }
  async function checkout(){
    const btn=$('checkout-button'),status=$('checkout-status');btn.disabled=true;status.textContent='Opening secure Stripe Checkout…';
    try {
      const base=config.functionsBase;
      if(!base||base.includes('YOUR_'))throw new Error('Store payment setup is not complete yet.');
      const res=await fetch(base+'/createCheckout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart.map(({productId,variantId,quantity})=>({productId,variantId,quantity}))})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.url)throw new Error(data.error||'Checkout unavailable. Please try again.');
      if(!/^https:\/\/checkout\.stripe\.com\//.test(data.url))throw new Error('Invalid payment destination.');
      window.location.assign(data.url);
    }catch(e){status.textContent=e.message;btn.disabled=false;}
  }
  async function boot(){
    $('search').addEventListener('input',renderProducts);$('category').addEventListener('change',renderProducts);
    $('checkout-button').addEventListener('click',checkout);
    if(new URLSearchParams(location.search).get('checkout')==='cancelled')$('checkout-status').textContent='Checkout canceled — your bag is saved.';
    try {
      const base=config.functionsBase;
      if(!base||base.includes('YOUR_'))throw new Error('Store backend has not been connected. Configure shop-config.js.');
      const res=await fetch(base+'/getCatalog');if(!res.ok)throw new Error('Store catalog is temporarily unavailable.');
      const data=await res.json();catalog=Array.isArray(data.products)?data.products:[];
      catalog=catalog.filter(p=>p?.id&&Array.isArray(p.variants)&&p.variants.length);
      cleanCart();
      const categories=[...new Set(catalog.map(p=>p.category).filter(Boolean))].sort();
      for(const c of categories){const option=el('option','',c);option.value=c;$('category').append(option);}
      $('catalog-status').textContent=catalog.length?'':'No products are published yet. GA will add the collection soon.';
      renderProducts();renderCart();
    } catch(e) {$('catalog-status').textContent=e.message;renderCart();}
  }
  boot();
})();
