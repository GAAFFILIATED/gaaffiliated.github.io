import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const cfg = window.GA_STORE_CONFIG || {};
const $ = id=>document.getElementById(id);
const money = c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((Number(c)||0)/100);
const el=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;n.textContent=text||'';return n;};
let auth, products=[];
function status(msg){$('app-status').textContent=msg;}
function formatAddress(details){
  const a=details?.address||details?.shipping_details?.address||null;
  if(!a)return 'Address will appear when collected from Stripe (if provided).';
  return [details?.name,a.line1,a.line2,a.city,a.state,a.postal_code,a.country].filter(Boolean).join(', ');
}
function authHeader(){return auth.currentUser.getIdToken(true).then(token=>({'Authorization':'Bearer '+token}));}
async function api(path, method='GET', payload){
  const headers=await authHeader();
  if(payload!==undefined)headers['Content-Type']='application/json';
  const response=await fetch(cfg.functionsBase+'/adminApi'+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(result.error||('HTTP '+response.status));
  return result;
}
function label(text){const x=el('strong','',text);return x;}
function detail(title,text){const x=el('div');x.append(label(title),document.createTextNode(text||'—'));return x;}
function inputWrap(title,value,placeholder=''){
  const l=el('label');l.append(document.createTextNode(title));
  const field=el('input');field.value=value||'';field.placeholder=placeholder;l.append(field);
  return {l,field};
}
async function fetchOrders(){
  status('Loading recent orders…');
  const data=await api('/orders');
  $('order-count').textContent=data.orders.length+' recent order(s)';
  const root=$('orders');root.replaceChildren();
  if(!data.orders.length)root.append(el('p','muted','No checkout orders have been created yet.'));
  for(const order of data.orders){
    const card=el('article','order-card'),header=el('div','order-top'),left=el('div');
    left.append(el('div','order-number','Order '+order.id),el('span','pill '+(order.paymentStatus==='paid'?'paid':''),order.paymentStatus||'unknown'));
    header.append(left,el('div','order-total',money(order.stripeTotalCents??order.subtotalCents)));card.append(header);
    const items=el('ul','order-items');
    for(const i of order.items||[])items.append(el('li','',`${i.quantity} × ${i.name} (${i.variant}) · ${money(i.priceCents)}`));
    card.append(items);
    const info=el('div','order-details');
    info.append(detail('Customer',`${order.customerName||'—'} | ${order.customerEmail||'Email pending'}`),
      detail('Order created',order.createdAt?new Date(order.createdAt).toLocaleString():'—'),
      detail('Shipping',formatAddress(order.shippingDetails)),
      detail('Fulfillment',order.fulfillmentStatus||'unfulfilled'));
    card.append(info);
    if(order.paymentStatus==='paid'){
      const controls=el('div','fulfillment-controls'),selWrap=el('label');
      selWrap.append(document.createTextNode('Fulfillment status'));
      const sel=el('select');
      for(const x of ['unfulfilled','processing','shipped','delivered']){
        const opt=el('option','',x);opt.value=x;opt.selected=x===order.fulfillmentStatus;sel.append(opt);
      }
      selWrap.append(sel);
      const carrier=inputWrap('Carrier',order.carrier,'USPS / UPS / FedEx');
      const tracking=inputWrap('Tracking number',order.trackingNumber,'Tracking number');
      const url=inputWrap('Tracking HTTPS URL',order.trackingUrl,'https://');
      const save=el('button','outline-button','SAVE FULFILLMENT');save.type='button';
      save.addEventListener('click',async()=>{save.disabled=true;status('Saving order '+order.id+'…');try{
        await api('/orders/'+encodeURIComponent(order.id),'PATCH',{
          fulfillmentStatus:sel.value,carrier:carrier.field.value,
          trackingNumber:tracking.field.value,trackingUrl:url.field.value
        });status('Order '+order.id+' saved.');
      }catch(e){status('Save failed: '+e.message);}finally{save.disabled=false;}});
      controls.append(selWrap,carrier.l,tracking.l,url.l,save);card.append(controls);
    } else card.append(el('p','note','Not eligible for fulfillment until verified as paid by Stripe.'));
    root.append(card);
  }
  status('Admin dashboard ready.');
}
function priceToCents(value){
  const text=value.trim();
  if(!/^\d+(?:\.\d{1,2})?$/.test(text))throw new Error('Prices must look like 80 or 80.00.');
  const [whole,fraction='']=text.split('.');
  return Number(whole)*100+Number(fraction.padEnd(2,'0'));
}
function parseVariants(){
  const lines=$('product-variants').value.trim().split('\n').map(s=>s.trim()).filter(Boolean);
  if(!lines.length)throw new Error('Please provide one or more variants.');
  return lines.map(line=>{
    const [id,label,price,sku=''] = line.split('|').map(s=>s.trim());
    if(!id||!label||!price)throw new Error('Variant format: id | label | price | SKU.');
    return {id,label,priceCents:priceToCents(price),sku,active:true};
  });
}
function setForm(product){
  $('product-id').value=product?.id||'';$('product-name').value=product?.name||'';
  $('product-category').value=product?.category||'Apparel';$('product-image').value=product?.imageUrl||'';
  $('product-description').value=product?.description||'';$('product-active').checked=product?.active!==false;
  $('product-variants').value=(product?.variants||[]).map(v=>`${v.id} | ${v.label} | ${(v.priceCents/100).toFixed(2)} | ${v.sku||''}`).join('\n');
  $('product-id').readOnly=Boolean(product);
}
async function fetchProducts(){
  const d=await api('/products');products=d.products;
  const root=$('existing-products');root.replaceChildren();
  for(const p of products){
    const b=el('button','',`${p.name} · ${p.active?'Published':'Hidden'} · ${p.variants?.length||0} variants — Edit`);
    b.type='button';b.addEventListener('click',()=>{setForm(p);$('product-form').scrollIntoView({behavior:'smooth'});});root.append(b);
  }
  if(!products.length)root.append(el('p','muted','No products created yet. Add your first product below.'));
}
function installHandlers(){
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();status('Signing in…');
    try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value);$('password').value='';}
    catch(e){status('Sign-in failed. Check your email, password, and authorized admin status.');}
  });
  $('logout').addEventListener('click',()=>signOut(auth));
  $('refresh-orders').addEventListener('click',()=>fetchOrders().catch(e=>status(e.message)));
  $('refresh-products').addEventListener('click',()=>fetchProducts().catch(e=>status(e.message)));
  $('new-product').addEventListener('click',()=>setForm(null));
  $('product-form').addEventListener('submit',async event=>{
    event.preventDefault();status('Saving product…');
    try{
      const id=$('product-id').value.trim();
      const data={name:$('product-name').value.trim(),category:$('product-category').value.trim(),
        description:$('product-description').value.trim(),imageUrl:$('product-image').value.trim(),
        active:$('product-active').checked,variants:parseVariants()};
      await api('/products/'+encodeURIComponent(id),'PUT',data);
      status('Saved product '+id+'.');setForm(null);await fetchProducts();
    }catch(e){status('Product save failed: '+e.message);}
  });
}
function boot(){
  if(!cfg.functionsBase||cfg.functionsBase.includes('YOUR_')||!cfg.firebase?.apiKey||cfg.firebase.apiKey.includes('YOUR_')){
    status('Configure shop-config.js with your Firebase website settings before using this dashboard.');return;
  }
  try{auth=getAuth(initializeApp(cfg.firebase));}catch(e){status('Firebase configuration is invalid.');return;}
  installHandlers();
  onAuthStateChanged(auth,async user=>{
    $('login-panel').hidden=Boolean(user);$('logout').hidden=!user;$('admin-content').hidden=true;
    if(!user){status('Sign in with your approved GA administrator account.');return;}
    status('Verifying administrator access…');
    try{
      const claims=await user.getIdTokenResult(true);
      if(claims.claims.admin!==true){status('This account has no GA admin permission. Ask an authorized operator to grant it.');await signOut(auth);return;}
      $('admin-content').hidden=false;
      await Promise.all([fetchOrders(),fetchProducts()]);status('Admin dashboard ready.');
    }catch(e){status('Could not load administrator data: '+e.message);}
  });
}
boot();
