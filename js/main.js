(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s){return document.querySelector(s);}
  function $$(s){return [].slice.call(document.querySelectorAll(s));}

  /* consent */
  var sh=$('#sheet'), ok=false;
  try{ ok=localStorage.getItem('mkc-consent')==='1'; }catch(e){}
  if(!ok){ sh.hidden=false; setTimeout(function(){sh.classList.add('show');}, reduce?0:600); }
  $('#agree').addEventListener('click',function(){ sh.classList.remove('show'); try{localStorage.setItem('mkc-consent','1');}catch(e){} setTimeout(function(){sh.hidden=true;}, reduce?0:600); });

  /* header: shadow, active link, mobile menu */
  var top=$('#top-bar'), links=$$('#nav a'), mb=$('#menu-btn');
  mb.addEventListener('click',function(){ var o=!top.classList.contains('open'); top.classList.toggle('open',o); mb.setAttribute('aria-expanded',o); });
  $$('#drawer a').forEach(function(a){ a.addEventListener('click',function(){ top.classList.remove('open'); mb.setAttribute('aria-expanded',false); }); });
  var secs=['practice','courts','contact','process','faq','gallery','about','career'].map(function(i){return document.getElementById(i);});

  /* reveals: only below-the-fold items start hidden */
  var vh=innerHeight, pend=[];
  if(!reduce){ $$('.rv,.fx-img').forEach(function(el){ if(el.getBoundingClientRect().top>vh*.92){ el.classList.add('pend'); pend.push(el);} }); }
  function onShow(el){
    $$('.mk',el).forEach(function(m){ m.classList.add('on'); });
    $$('[data-count]',el).forEach(count);
  }
  function count(el){
    if(el.dataset.done) return; el.dataset.done=1; if(reduce) return;
    var to=+el.dataset.count, from=+(el.dataset.from||0), t0=null;
    function f(t){ if(!t0) t0=t; var k=Math.min(1,(t-t0)/1200); k=1-Math.pow(1-k,3); el.textContent=Math.round(from+(to-from)*k); if(k<1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  var seen=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ onShow(e.target); seen.unobserve(e.target); } }); },{rootMargin:'0px 0px -12% 0px'});
  $$('.prose,.jsas').forEach(function(el){ seen.observe(el); });
  var pars=$$('[data-par]'), zooms=$$('[data-zoom]'), pic=$('.hero .fig'), mx=0,my=0,tmx=0,tmy=0;
  var fine=matchMedia('(pointer: fine)').matches;
  if(fine&&!reduce) addEventListener('mousemove',function(e){ mx=(e.clientX/innerWidth-.5)*2; my=(e.clientY/innerHeight-.5)*2; },{passive:true});

  var tl=$('#tl');
  function frame(){
    vh=innerHeight;
    top.classList.toggle('scrolled', scrollY>10);
    var cur=null; secs.forEach(function(s){ if(s.getBoundingClientRect().top < vh*.4) cur=s.id; });
    if(cur==='career') cur='about'; if(cur==='gallery'||cur==='faq'||cur==='process') cur='contact';
    links.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+cur); });
    if(pend.length) pend=pend.filter(function(el){ if(el.getBoundingClientRect().top<vh*.9){ el.classList.remove('pend'); onShow(el); return false;} return true; });
    if(!reduce){
      tmx+=(mx-tmx)*.08; tmy+=(my-tmy)*.08;
      var small=innerWidth<860;
      pars.forEach(function(el){ if(small){ el.style.transform=''; return; } var b=el.parentElement.getBoundingClientRect(), c=(b.top+b.height/2)-vh/2; el.style.transform='translate3d('+(tmx*(el.dataset.mx||0)).toFixed(1)+'px,'+(c*el.dataset.par+tmy*(el.dataset.mx||0)).toFixed(1)+'px,0)'; });
      if(pic){ pic.style.setProperty('--sx',(-tmx*12).toFixed(1)+'px'); pic.style.setProperty('--sy',(24-tmy*8).toFixed(1)+'px'); }
      zooms.forEach(function(z){ var b=z.getBoundingClientRect(); if(b.bottom<0||b.top>vh) return; var t=Math.max(0,Math.min(1,(vh-b.top)/(vh+b.height))); z.style.setProperty('--zs',(1.1-.1*t).toFixed(4)); });
    }
    var r=tl.getBoundingClientRect(); var p=Math.max(0,Math.min(1,(vh*.8-r.top)/(r.height+vh*.2)));
    tl.style.setProperty('--cp', reduce?1:p.toFixed(3));
    if(Math.abs(mx-tmx)>.002||Math.abs(my-tmy)>.002) want();
  }
  var queued=false;
  function want(){ if(!queued){ queued=true; requestAnimationFrame(function(){ queued=false; frame(); loop2(); }); } }
  addEventListener('scroll',want,{passive:true}); addEventListener('resize',want); if(fine&&!reduce) addEventListener('mousemove',want,{passive:true});
  setTimeout(want,50);


  /* practice cards: border that draws on hover */
  $$('.area').forEach(function(a){ a.insertAdjacentHTML('afterbegin','<svg class="fb" aria-hidden="true"><rect x="0" y="0" width="100%" height="100%" pathLength="1"/></svg>'); });

  /* magnetic buttons */
  if(fine && !reduce){
    $$('.mag').forEach(function(b){
      var ar=b.querySelector('.ar');
      b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(), dx=(e.clientX-r.left-r.width/2)/r.width, dy=(e.clientY-r.top-r.height/2)/r.height; b.style.translate=(dx*10).toFixed(1)+'px '+(dy*8).toFixed(1)+'px'; if(ar) ar.style.translate=(dx*6).toFixed(1)+'px 0'; });
      b.addEventListener('mouseleave',function(){ b.style.translate=''; if(ar) ar.style.translate=''; });
    });
  }

  /* page wipe when jumping to a section */
  var wipe=$('#wipe'), wlb=$('#wipe-lb'), busy=false;
  function jump(t){ var h=document.documentElement; h.style.scrollBehavior='auto'; t.scrollIntoView(); h.style.scrollBehavior=''; }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var t=document.getElementById(a.getAttribute('href').slice(1)); if(!t) return;
    e.preventDefault(); top.classList.remove('open'); mb.setAttribute('aria-expanded',false);
    if(reduce||busy){ jump(t); return; }
    busy=true; var lab=t.querySelector('.label'); wlb.textContent=lab?lab.textContent:(a.textContent||'').trim();
    wipe.className='wipe in';
    setTimeout(function(){ jump(t); wipe.className='wipe out'; setTimeout(function(){ wipe.className='wipe'; busy=false; },420); },380);
  });

  /* cursor */
  if(fine && !reduce){
    var cu=$('#cur'), cl=$('#cur-lb'), cx=-100,cy=-100,tx=-100,ty=-100;
    addEventListener('mousemove',function(e){ tx=e.clientX; ty=e.clientY; cu.style.opacity=1; },{passive:true});
    document.addEventListener('mouseleave',function(){ cu.style.opacity=0; });
    document.addEventListener('mouseover',function(e){
      var t=e.target, lab=t.closest('[data-cur]');
      cu.classList.remove('big','lab','img');
      if(lab){ cu.classList.add('lab'); cl.textContent=lab.dataset.cur; }
      else if(t.closest('.gal figure,.about .ph,.hero .fig')){ cu.classList.add('img'); }
      else if(t.closest('a,button,label,input,select,textarea,.court')){ cu.classList.add('big'); }
    });
    var cRun=false; function curLoop(){ cx+=(tx-cx)*.25; cy+=(ty-cy)*.25; cu.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)'; if(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3) requestAnimationFrame(curLoop); else cRun=false; }
    addEventListener('mousemove',function(){ if(!cRun){ cRun=true; requestAnimationFrame(curLoop); } },{passive:true});
  }



  /* ===== extra motion ===== */
  var wafab=$('.wa-fab'), prog=$('#prog'), ring=$('#totop'), strip=$('.strip .tr'), hero=$('.hero.cover'), lastY=scrollY, vel=0, sx=0;
  var allSecs=$$('.sec');
  var gfigs=$$('[data-gp]'), casc=$('.cascade');
  function loop2(){
    var y=scrollY, max=document.documentElement.scrollHeight-innerHeight, p=max>0?y/max:0;
    prog.parentNode.style.setProperty('--p',p.toFixed(4)); prog.style.transform='scaleX('+p.toFixed(4)+')';
    ring.style.setProperty('--p',p.toFixed(4)); ring.classList.toggle('show',y>innerHeight*.8); wafab.classList.toggle('show',y>innerHeight*.8);
    if(!reduce){
      if(innerWidth>=860) gfigs.forEach(function(f){ var b=f.getBoundingClientRect(); if(b.bottom<0||b.top>innerHeight) return; f.style.translate='0 '+(((b.top+b.height/2)-innerHeight/2)*f.dataset.gp).toFixed(1)+'px'; });
    }
    if(casc && !casc.dataset.clr && !casc.classList.contains('pend')){ casc.dataset.clr=1; setTimeout(function(){ $$('.cascade .court').forEach(function(c){ c.style.transitionDelay=''; }); },1400); }
    allSecs.forEach(function(sc){ if(!sc.classList.contains('seen') && sc.getBoundingClientRect().top<innerHeight*.8) sc.classList.add('seen'); });
  }
  loop2();
  if(fine && !reduce){
    hero.addEventListener('mousemove',function(e){ var r=hero.getBoundingClientRect(); hero.style.setProperty('--x',(e.clientX-r.left)+'px'); hero.style.setProperty('--y',(e.clientY-r.top)+'px'); });
    $$('.tilt').forEach(function(el){
      var g=document.createElement('span'); g.className='glare'; el.appendChild(g);
      el.addEventListener('mousemove',function(e){ var r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height; el.classList.add('tilting'); el.style.transform='perspective(900px) rotateX('+((.5-y)*7).toFixed(2)+'deg) rotateY('+((x-.5)*9).toFixed(2)+'deg) translateY(-4px)'; el.style.setProperty('--gx',(x*100)+'%'); el.style.setProperty('--gy',(y*100)+'%'); });
      el.addEventListener('mouseleave',function(){ el.classList.remove('tilting'); el.style.transform=''; });
    });
  }
  /* courts cascade delays */
  $$('.cascade .court').forEach(function(c,i){ c.style.transitionDelay=(i*60)+'ms'; });


  /* practice filter */
  var tabs=$$('.tabs button'), cards=$$('#areas .area');
  tabs.forEach(function(t){ t.addEventListener('click',function(){
    tabs.forEach(function(x){ x.classList.toggle('on',x===t); x.setAttribute('aria-pressed',x===t); });
    var f=t.dataset.f, n=0;
    cards.forEach(function(c){ var show=f==='all'||c.dataset.cat===f; c.classList.remove('pop','pend'); c.classList.toggle('hide',!show); c.classList.toggle('feat-off', f!=='all'); if(show&&!reduce){ void c.offsetWidth; c.style.setProperty('--pd',(n++*60)+'ms'); c.classList.add('pop'); } });
  }); });
  /* career runner after line starts */
  var tlEl=$('#tl'); new IntersectionObserver(function(es,o){ es.forEach(function(e){ if(e.isIntersecting){ tlEl.classList.add('go'); o.disconnect(); } }); },{threshold:.4}).observe(tlEl);


  /* opening screen: once per browser session */
  var intro=$('#intro'), played=document.documentElement.classList.contains('no-intro');
  try{ sessionStorage.setItem('mkc-intro','1'); }catch(e){}
  if(reduce||played){ intro.classList.add('done','gone'); }
  else { setTimeout(function(){ intro.classList.add('done'); setTimeout(function(){ intro.classList.add('gone'); },1050); },1300); }

  /* book on this area → prefill booking form */
  $$('.area .bk').forEach(function(a){ a.addEventListener('click',function(){
    var sel=$('#b-area'), v=a.dataset.area.replace(/&amp;/g,'&');
    [].slice.call(sel.options).forEach(function(o){ if(o.text===v) sel.value=o.value||o.text; });
    var pn=$('#book'); setTimeout(function(){ pn.classList.remove('flash'); void pn.offsetWidth; pn.classList.add('flash'); var n=$('#b-name'); try{ n.focus({preventScroll:true}); }catch(e){} },700);
  }); });

  /* section labels: split letters */
  if(!reduce){ $$('.sec-head .label').forEach(function(l){ var t=l.textContent; l.textContent=''; var wr=document.createElement('span'); l.appendChild(wr); t.split('').forEach(function(c,i){ var sp=document.createElement('span'); sp.className='lt'; sp.style.setProperty('--i',i); sp.textContent=c===' '?'\u00a0':c; wr.appendChild(sp); }); if(!l.closest('.pend')) l.classList.add('lbl-on'); }); }


  /* rotating practice line */
  var rw=$('#rw'), words=['Supreme Court appeals','corporate &amp; M&amp;A matters','cyber law','data protection','technology contracts','intellectual property','arbitration','insolvency &amp; banking'].map(function(w){return w.replace(/&amp;/g,'&');}), wi=0;
  if(!reduce) setInterval(function(){ rw.classList.add('out'); setTimeout(function(){ wi=(wi+1)%words.length; rw.textContent=words[wi]; rw.classList.remove('out'); rw.classList.add('in'); void rw.offsetWidth; rw.classList.remove('in'); },350); },2600);
  /* process line */
  var stp=$('#steps'); new IntersectionObserver(function(es,o){ es.forEach(function(e){ if(e.isIntersecting){ stp.style.setProperty('--sp',1); o.disconnect(); } }); },{threshold:.35}).observe(stp);
  /* toast on copy */
  var toast=$('#toast'), tt;
  function say(m){ toast.textContent=m; toast.classList.add('on'); clearTimeout(tt); tt=setTimeout(function(){ toast.classList.remove('on'); },1800); }
  $$('[data-copy]').forEach(function(b){ b.addEventListener('click',function(){ say((b.dataset.copy.indexOf('email')>-1?'Email':'Phone number')+' copied'); }); });


  /* gallery lightbox */
  var lb=$('#lb'), lbi=$('#lb-img'), lbc=$('#lb-c'), gfs=$$('.gal figure'), li=0, lastF=null;
  function show(i){ li=(i+gfs.length)%gfs.length; var im=gfs[li].querySelector('img'); lbi.src=im.src; lbi.alt=im.alt; var c=gfs[li].querySelector('figcaption'); lbc.textContent=c?c.textContent:''; lbi.style.animation='none'; void lbi.offsetWidth; lbi.style.animation=''; }
  function open(i){ lastF=document.activeElement; show(i); lb.hidden=false; document.body.style.overflow='hidden'; $('#lb-x').focus(); }
  function close(){ lb.hidden=true; document.body.style.overflow=''; if(lastF) lastF.focus(); }
  gfs.forEach(function(f,i){ f.tabIndex=0; f.setAttribute('role','button'); f.setAttribute('aria-label','View photo '+(i+1)); f.addEventListener('click',function(){ open(i); }); f.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(i); } }); });
  $('#lb-x').addEventListener('click',close); $('#lb-p').addEventListener('click',function(){ show(li-1); }); $('#lb-n').addEventListener('click',function(){ show(li+1); });
  lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
  addEventListener('keydown',function(e){ if(lb.hidden) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') show(li-1); if(e.key==='ArrowRight') show(li+1); });


  /* practice detail panel */
  var pm=$('#pm'), pmLast=null;
  function pmOpen(card){
    pmLast=document.activeElement;
    var b=card.querySelector('.more'), items=JSON.parse(b.dataset.items);
    $('#pm-img').src=card.querySelector('.im img').src;
    $('#pm-t').textContent=card.querySelector('h3').textContent;
    $('#pm-d').textContent=card.querySelector('.bd > p:not(.law)').textContent;
    $('#pm-law').textContent=card.querySelector('.law').textContent;
    var ul=$('#pm-l'); ul.innerHTML=''; items.forEach(function(t,i){ var li=document.createElement('li'); li.textContent=t; li.style.setProperty('--i',i); ul.appendChild(li); });
    $('#pm-book').dataset.area=card.querySelector('.bk').dataset.area;
    pm.hidden=false; document.body.style.overflow='hidden'; $('#pm-x').focus();
  }
  function pmClose(){ pm.hidden=true; document.body.style.overflow=''; if(pmLast) pmLast.focus(); }
  $$('.area .more').forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation(); pmOpen(b.closest('.area')); }); });
  $('#pm-x').addEventListener('click',pmClose);
  pm.addEventListener('click',function(e){ if(e.target===pm) pmClose(); });
  addEventListener('keydown',function(e){ if(!pm.hidden && e.key==='Escape') pmClose(); });
  $('#pm-book').addEventListener('click',function(){
    pm.hidden=true; document.body.style.overflow='';
    var sel=$('#b-area'), v=this.dataset.area.replace(/&amp;/g,'&'); [].slice.call(sel.options).forEach(function(o){ if(o.text===v) sel.value=o.value||o.text; });
    var pn=$('#book'); setTimeout(function(){ pn.classList.remove('flash'); void pn.offsetWidth; pn.classList.add('flash'); },700);
  });


  /* keep Tab inside whichever dialog is open */
  addEventListener('keydown',function(e){
    if(e.key!=='Tab') return; var dlg=!lb.hidden?lb:(!pm.hidden?pm:null); if(!dlg) return;
    var f=[].slice.call(dlg.querySelectorAll('a[href],button')).filter(function(x){ return x.offsetParent!==null; }); if(!f.length) return;
    var first=f[0], last=f[f.length-1], a=document.activeElement;
    if(e.shiftKey && (a===first||!dlg.contains(a))){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && (a===last||!dlg.contains(a))){ e.preventDefault(); first.focus(); }
  });


  /* date and time chips */
  var daysEl=$('#days'), slotsEl=$('#slots'), bd=$('#b-date'), bt=$('#b-time');
  var DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var t0=new Date(); var added=0, off=1;
  while(added<10){ var dd=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()+off++); if(dd.getDay()===0) continue;
    var b=document.createElement('button'); b.type='button'; b.setAttribute('role','radio'); b.setAttribute('aria-checked','false');
    var iso=dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')+'-'+String(dd.getDate()).padStart(2,'0');
    b.dataset.v=iso; b.dataset.l=DN[dd.getDay()]+' '+dd.getDate()+' '+MN[dd.getMonth()];
    b.innerHTML='<small>'+DN[dd.getDay()]+'</small><b>'+dd.getDate()+'</b><span>'+MN[dd.getMonth()]+'</span>';
    daysEl.appendChild(b); added++; }
  function pickIn(wrap,inp,btn){ [].slice.call(wrap.children).forEach(function(x){ x.setAttribute('aria-checked',x===btn); }); inp.value=btn.dataset.v; inp.dataset.label=btn.dataset.l||btn.dataset.v; wrap.classList.remove('bad'); }
  daysEl.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) pickIn(daysEl,bd,b); });
  ['10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'].forEach(function(t){ var b=document.createElement('button'); b.type='button'; b.setAttribute('role','radio'); b.setAttribute('aria-checked',t==='11:00 AM'); b.dataset.v=t; b.textContent=t; slotsEl.appendChild(b); });
  slotsEl.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) pickIn(slotsEl,bt,b); });
  /* mark empty required fields */
  $('#book-form').addEventListener('submit',function(){ ['b-name','b-phone'].forEach(function(id){ var el=document.getElementById(id); el.classList.toggle('bad',!el.value.trim()); }); daysEl.classList.toggle('bad',!bd.value); },true);
  $('#cb-form').addEventListener('submit',function(){ ['c-name','c-phone'].forEach(function(id){ var el=document.getElementById(id); el.classList.toggle('bad',!el.value.trim()); }); },true);
  $$('#book-form input,#cb-form input').forEach(function(el){ el.addEventListener('input',function(){ el.classList.remove('bad'); }); });

  /* save contact (vCard) — works once the site is hosted */
  var vc=$('#vcard'); var framed=false; try{ framed=window.top!==window.self; }catch(e){ framed=true; }
  if(framed){ vc.classList.add('hide'); }
  else vc.addEventListener('click',function(){
    var v=['BEGIN:VCARD','VERSION:3.0','N:Chowdhary;Manoj Kumar;;Adv.;','FN:Adv. Manoj Kumar Chowdhary','TITLE:Advocate, Supreme Court of India','TEL;TYPE=CELL:+919717195907','EMAIL:advmanojchowdhary@rediff.com','ADR;TYPE=WORK:;;Chamber 312, M.C. Setalvad Block, Supreme Court of India, Bhagwan Das Road;New Delhi;;110001;India','URL:https://www.linkedin.com/in/manoj-kumar-chowdhary-29441b160/','END:VCARD'].join('\r\n');
    var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([v],{type:'text/vcard'})); a.download='Manoj-Kumar-Chowdhary.vcf'; document.body.appendChild(a); a.click(); a.remove();
  });

  /* pause looping animations off screen */
  var offIO=new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('offscreen',!e.isIntersecting); }); });
  $$('.hero.cover,.strip,.courts,#callback,.vid,footer').forEach(function(el){ offIO.observe(el); });
  /* copy buttons */
  $$('[data-copy]').forEach(function(b){ b.addEventListener('click',function(){ var el=document.getElementById(b.dataset.copy), t=el.textContent.trim(); var reset=function(){ setTimeout(function(){b.textContent='Copy';},1400); }; var sel=function(){ var r=document.createRange(); r.selectNodeContents(el); var x=getSelection(); x.removeAllRanges(); x.addRange(r); b.textContent='Selected'; reset(); }; try{ navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';reset();},sel); }catch(e){ sel(); } }); });

  /* forms → a WhatsApp message to his number */
  var WA='https://wa.me/919717195907?text=';
  function send(msgEl,text,need,what){
    var miss=need.filter(function(id){ return !document.getElementById(id).value.trim(); });
    msgEl.hidden=false;
    if(miss.length){ msgEl.textContent='Please fill in '+what+'.'; document.getElementById(miss[0]).focus(); return; }
    var a=document.createElement('a'); a.href=WA+encodeURIComponent(text()); a.target='_blank'; a.rel='noopener'; a.textContent='Open WhatsApp to send it →';
    msgEl.textContent='Your request is ready. '; msgEl.appendChild(a);
  }
  $('#book-form').addEventListener('submit',function(e){
    e.preventDefault(); var f=this;
    send($('#book-msg'),function(){
      var mode=f.querySelector('input[name=mode]:checked').value;
      return 'Appointment request\nName: '+f.name.value+'\nPhone: '+f.phone.value+'\nDate: '+(f.date.dataset.label||f.date.value)+' at '+f.time.value+'\nMeeting: '+mode+'\nArea: '+f.area.value+(f.message.value.trim()?'\nMatter: '+f.message.value.trim():'');
    },['b-name','b-phone','b-date'],'your name, phone and preferred date');
  });
  $('#cb-form').addEventListener('submit',function(e){
    e.preventDefault(); var f=this;
    send($('#cb-msg'),function(){ return 'Call back request\nName: '+f.name.value+'\nPhone: '+f.phone.value+'\nBest time: '+f.when.value; },['c-name','c-phone'],'your name and phone');
  });
})();
