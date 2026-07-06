// ---- Mobile menu toggle ----
(function(){
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  if(!burger || !menu) return;
  burger.addEventListener('click', ()=>{
    burger.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ---- Hero canvas: ambient gradient blobs ----
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize);
  resize();
  const blobs = [
    {x:0.2,y:0.3,r:280,c:'rgba(255,107,74,0.35)',dx:0.00018,dy:0.00013,t:0},
    {x:0.75,y:0.6,r:320,c:'rgba(47,191,143,0.28)',dx:-0.00015,dy:0.0002,t:2},
    {x:0.5,y:0.15,r:220,c:'rgba(255,107,74,0.18)',dx:0.0001,dy:-0.00016,t:4},
  ];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(time){
    ctx.clearRect(0,0,w,h);
    ctx.filter = 'blur(60px)';
    blobs.forEach(b=>{
      const t = reduced ? 0 : time;
      const x = (b.x + Math.sin(t*b.dx + b.t)*0.08) * w;
      const y = (b.y + Math.cos(t*b.dy + b.t)*0.08) * h;
      const grad = ctx.createRadialGradient(x,y,0,x,y,b.r);
      grad.addColorStop(0,b.c);
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x,y,b.r,0,Math.PI*2); ctx.fill();
    });
    if(!reduced) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ---- Animated counters ----
function animateCount(el){
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  function step(now){
    const p = Math.min((now-start)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.round(target*eased);
    el.textContent = prefix + val + suffix;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function animateBar(el){ el.style.width = el.dataset.width + '%'; }

// ---- Scroll reveal + trigger counters/bars once ----
(function(){
  const revealEls = document.querySelectorAll('.reveal');
  const countEls = document.querySelectorAll('.stat-num, .big-stat .n, .mini-stat .n');
  const barEls = document.querySelectorAll('.bar-fill');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        countEls.forEach(el=>{ if(!el.dataset.done){ el.dataset.done='1'; animateCount(el); }});
        barEls.forEach(el=>{ if(!el.dataset.done){ el.dataset.done='1'; animateBar(el); }});
        io.unobserve(entry.target);
      }
    });
  },{threshold:0.2});
  revealEls.forEach(el=>io.observe(el));
})();

// ---- Growth arc: draw path + phase nodes ----
(function(){
  const svg = document.getElementById('arc-svg');
  if(!svg) return;
  const path = document.getElementById('arcPath');
  const detail = document.getElementById('phaseDetail');
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  const phases = [
    {k:'Phase 01', h:'Diagnose', p:'We audit brand, catalog, and market fit before spending a single dollar — every engagement starts with data, not guesses.'},
    {k:'Phase 02', h:'Position', p:'We rebuild pricing, packaging logic, and listing content around how US Hispanic shoppers actually search and buy.'},
    {k:'Phase 03', h:'Launch', p:'Marketplace and paid media go live together, sequenced so early signal compounds instead of competing for attention.'},
    {k:'Phase 04', h:'Optimize', p:'Weekly iteration on creative, bids, and inventory health — the unglamorous work that protects margin at scale.'},
    {k:'Phase 05', h:'Scale', p:'Once unit economics hold, we expand SKUs, channels, and geographies without resetting the learning curve.'},
    {k:'Phase 06', h:'Compound', p:'Retention, repeat purchase, and brand equity turn one good launch into a durable US market position.'}
  ];
  const svgNS = 'http://www.w3.org/2000/svg';
  phases.forEach((ph, i)=>{
    const frac = i/(phases.length-1);
    const pt = path.getPointAtLength(len*frac);
    const g = document.createElementNS(svgNS,'g');
    g.setAttribute('class','phase-node' + (i===0?' active':''));
    g.setAttribute('data-i', i);
    const circle = document.createElementNS(svgNS,'circle');
    circle.setAttribute('class','phase-dot');
    circle.setAttribute('cx', pt.x); circle.setAttribute('cy', pt.y); circle.setAttribute('r', 16);
    const text = document.createElementNS(svgNS,'text');
    text.setAttribute('class','phase-num');
    text.setAttribute('x', pt.x); text.setAttribute('y', pt.y+4);
    text.setAttribute('text-anchor','middle');
    text.textContent = i+1;
    g.appendChild(circle); g.appendChild(text);
    g.addEventListener('mouseenter', ()=>selectPhase(i));
    g.addEventListener('click', ()=>selectPhase(i));
    svg.appendChild(g);
  });
  function selectPhase(i){
    document.querySelectorAll('.phase-node').forEach(n=>n.classList.remove('active'));
    svg.querySelector('.phase-node[data-i="'+i+'"]').classList.add('active');
    const ph = phases[i];
    detail.innerHTML = '<div class="k">'+ph.k+'</div><h4>'+ph.h+'</h4><p>'+ph.p+'</p>';
  }
  const arcIo = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ path.style.strokeDashoffset = 0; arcIo.unobserve(entry.target); }
    });
  },{threshold:0.3});
  arcIo.observe(svg);
})();

// ---- Coverage map (contact page) ----
(function(){
  const svg = document.getElementById('coverage-map');
  if(!svg) return;
  const detail = document.getElementById('mapDetail');
  const countries = svg.querySelectorAll('.map-country');
  const data = {
    usa:{name:'United States', brands:[['KSK Mexico','Amazon US'],['Grisi','Amazon US, Walmart'],['Revance','Amazon US']]},
    mexico:{name:'Mexico', brands:[['KSK Mexico','Amazon MX, Mercado Libre'],['Klass','Mercado Libre'],['Kevala','Amazon MX']]},
    colombia:{name:'Colombia', brands:[['Kevala','Mercado Libre'],['Klass','Amazon CO']]},
    argentina:{name:'Argentina', brands:[['Grisi','Mercado Libre']]},
    spain:{name:'Spain', brands:[['Revance','Amazon ES']]},
    brazil:{name:'Brazil', brands:[['Klass','Mercado Libre']]}
  };
  function select(key){
    countries.forEach(c=>c.classList.remove('active'));
    const el = svg.querySelector('.map-country[data-country="'+key+'"]');
    if(el) el.classList.add('active');
    const d = data[key];
    if(!d || !detail) return;
    const rows = d.brands.map(b=>'<div class="brand-row"><span>'+b[0]+'</span><span>'+b[1]+'</span></div>').join('');
    detail.innerHTML = '<div class="k">Execution Coverage</div><h4>'+d.name+'</h4>'+rows;
  }
  countries.forEach(c=>{
    const key = c.getAttribute('data-country');
    c.addEventListener('mouseenter', ()=>select(key));
    c.addEventListener('click', ()=>select(key));
  });
  const first = countries[0];
  if(first) select(first.getAttribute('data-country'));
})();

// ---- Contact form (demo — replace action with real endpoint) ----
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.textContent;
    btn.textContent = 'SENT ✓';
    btn.style.background = 'var(--jade)';
    setTimeout(()=>{ btn.textContent = original; btn.style.background = ''; form.reset(); }, 2400);
  });
})();
