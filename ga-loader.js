/* Full-screen welcome. Only reveals website after essential page resources load. */
(function(){
  'use strict';
  var root=document.documentElement;
  var overlay=document.getElementById('ga-intro');
  if(!overlay)return;
  if(!root.classList.contains('ga-intro-pending')){overlay.remove();return;}
  var meter=document.getElementById('ga-intro-meter-fill');
  var skip=document.getElementById('ga-intro-skip');
  var started=Date.now(), minDuration=2300, maxDuration=8000;
  var complete=false, dismissed=false, lastProgress=0, raf=0;
  var timer=0, safety=0;
  function paint(value){
    var n=Math.min(100,Math.max(lastProgress,value));lastProgress=n;
    if(meter){meter.style.width=n+'%';meter.setAttribute('aria-valuenow',String(Math.round(n)));}
  }
  function dismiss(){
    if(dismissed)return;
    dismissed=true;window.clearTimeout(timer);window.clearTimeout(safety);
    if(raf)window.cancelAnimationFrame(raf);
    paint(100);
    try{sessionStorage.setItem('gaIntroSeen','1')}catch(e){}
    root.classList.add('ga-intro-ending');
    window.setTimeout(function(){
      root.classList.remove('ga-intro-pending','ga-intro-ending');
      overlay.remove();
    },350);
  }
  function markReady(){complete=true;}
  if(document.readyState==='complete')markReady();
  else window.addEventListener('load',markReady,{once:true});
  function tick(){
    if(dismissed)return;
    var elapsed=Date.now()-started;
    // This is visual progress capped at 92% until page-load completes.
    var target=Math.min(92,92*elapsed/minDuration);
    if(complete && elapsed>=minDuration){dismiss();return;}
    paint(Math.round(target));
    raf=window.requestAnimationFrame(tick);
  }
  raf=window.requestAnimationFrame(tick);
  if(skip)skip.addEventListener('click',dismiss);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')dismiss()});
  // Fail open for unavailable fonts/network assets rather than trapping a visitor.
  safety=window.setTimeout(dismiss,maxDuration);
})();
