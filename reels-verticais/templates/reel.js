/* reels-verticais: cenas de Reel 9:16 desenhadas como funções puras do tempo (seek(t)),
   no mesmo contrato do motor motion-broll (window.DURATION, #stage, seek) para usar o render.js dele.
   Usa os helpers de mola do motion.js (M.S, M.eo, M.clamp). Dados: window.REEL (ver SKILL.md). */
(function(){
const R = window.REEL, M = window.M;
const stage = document.getElementById('stage');
const svgNS = 'http://www.w3.org/2000/svg';
const cl = M.clamp, eo = M.eo;
const mola = (t, t0) => M.S(t - t0, 10, 0.95);          // entrada suave, sem quique
const md = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*(.+?)\*/g,'<em>$1</em>');
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML = html; return e; };
const sv = (tag, at) => { const e = document.createElementNS(svgNS, tag); for(const k in at) e.setAttribute(k, at[k]); return e; };
const D = R.cor.destaque, T = R.cor.texto;

window.DURATION = R.cenas[R.cenas.length-1].fim;
const luz = el('div'); luz.id = 'luz'; stage.appendChild(luz);

// ---------- peças de arte ----------
function pendulo(svg, cx, cy, comp){
  const g = sv('g', {});
  g.appendChild(sv('circle', {cx, cy, r:7, fill:D}));
  const braco = sv('g', {});
  braco.appendChild(sv('line', {x1:cx, y1:cy, x2:cx, y2:cy+comp, stroke:D, 'stroke-width':3}));
  braco.appendChild(sv('path', {d:`M${cx} ${cy+comp-6} L${cx+34} ${cy+comp+38} L${cx} ${cy+comp+108} L${cx-34} ${cy+comp+38} Z`, fill:D}));
  braco.appendChild(sv('path', {d:`M${cx} ${cy+comp-6} L${cx} ${cy+comp+108}`, stroke:T, 'stroke-opacity':.35, 'stroke-width':2}));
  g.appendChild(braco); svg.appendChild(g);
  return (t)=>{ const amort = 0.45 + 0.55*Math.exp(-t/3.5); braco.setAttribute('transform', `rotate(${(Math.sin(t*2*Math.PI/1.7)*20*amort).toFixed(3)} ${cx} ${cy})`); };
}
function grafico(svg, cx, cy, r){
  const g = sv('g', {}); svg.appendChild(g);
  const aneis = [0.95,0.72,0.5,0.28].map((k,i)=>{ const c = sv('circle',{cx,cy,r:r*k,fill:'none',stroke:D,'stroke-width':i?2:3,opacity:1-i*.15});
    const L = 2*Math.PI*r*k; c.setAttribute('stroke-dasharray', L); g.appendChild(c); return [c,L]; });
  const raios = Array.from({length:24},(_,i)=>{ const a=i/24*2*Math.PI;
    const l = sv('line',{x1:cx+Math.cos(a)*r*.28,y1:cy+Math.sin(a)*r*.28,x2:cx+Math.cos(a)*r*.95,y2:cy+Math.sin(a)*r*.95,stroke:D,'stroke-width':1.5});
    g.appendChild(l); return l; });
  const nucleo = sv('circle',{cx,cy,r:10,fill:D}); g.appendChild(nucleo);
  return (t)=>{ const p = eo(t/1.4);
    aneis.forEach(([c,L],i)=>c.setAttribute('stroke-dashoffset', (L*(1-eo((t-i*.12)/1.2))).toFixed(1)));
    raios.forEach((l,i)=>l.setAttribute('opacity', (0.55*cl((t-0.3-i*0.03)/0.3)).toFixed(3)));
    g.setAttribute('transform', `rotate(${(t*7).toFixed(2)} ${cx} ${cy})`);
    nucleo.setAttribute('r', (10+Math.sin(t*4)*3)*p); };
}
function ondas(svg, cx, cy, rmax){
  const n = 4, cs = Array.from({length:n},()=>{ const c = sv('circle',{cx,cy,fill:'none',stroke:D,'stroke-width':3}); svg.appendChild(c); return c; });
  svg.appendChild(sv('circle',{cx,cy,r:14,fill:D}));
  return (t)=>cs.forEach((c,i)=>{ const f = ((t/2.4)+i/n)%1; c.setAttribute('r',(30+f*rmax).toFixed(1)); c.setAttribute('opacity',((1-f)*0.8*cl(t/0.6)).toFixed(3)); });
}
function icone(ok){
  const s = document.createElementNS(svgNS,'svg'); s.setAttribute('width',72); s.setAttribute('height',72); s.setAttribute('viewBox','0 0 72 72');
  s.appendChild(sv('circle',{cx:36,cy:36,r:32,fill:'none',stroke:ok?D:T,'stroke-width':4}));
  const p = ok ? sv('path',{d:'M21 37 L32 48 L52 25',fill:'none',stroke:D,'stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':50})
               : sv('path',{d:'M25 25 L47 47 M47 25 L25 47',fill:'none',stroke:T,'stroke-width':6,'stroke-linecap':'round','stroke-dasharray':64});
  s.appendChild(p); s.style.flexShrink = 0; return [s, p, ok?50:64];
}

// ---------- montagem das cenas ----------
const cenas = R.cenas.map((c)=>{
  const raiz = el('div','cena'); stage.appendChild(raiz);
  const arte = document.createElementNS(svgNS,'svg'); arte.setAttribute('class','arte'); raiz.appendChild(arte);
  const bloco = el('div','bloco'); raiz.appendChild(bloco);
  const anim = [];             // [elemento, atraso]
  const upd = [];              // funções (tLocal)
  const add = (e, atraso) => { bloco.appendChild(e); anim.push([e, atraso]); return e; };
  if(c.rotulo) add(el('div','rotulo', md(c.rotulo)), 0.0);
  if(c.titulo) add(el('div','titulo'+(c.tipo==='gancho'?' grande':''), md(c.titulo)), 0.15);
  if(c.tipo==='gancho'){
    const tr = add(el('div','traco'), 0.5); upd.push(t=>{ tr.style.width = (560*eo((t-0.5)/0.7))+'px'; });
    upd.push(pendulo(arte, 760, 1020, 300));
  }
  if(c.tipo==='busca'){
    const b = add(el('div','busca'), 0.1);
    b.innerHTML = '<svg width="44" height="44" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2.4" fill="none"/><line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span></span><span class="cur">|</span>';
    const txt = b.children[1], cur = b.children[2];
    upd.push(t=>{ const n = Math.floor(cl((t-0.5)/1.1)*c.consulta.length); M.setText(txt, c.consulta.slice(0,n)); cur.style.opacity = (Math.floor(t*3)%2)?0:1; cur.style.color = D; });
    if(c.metrica){
      const m = el('div','metrica'); raiz.appendChild(m);
      m.innerHTML = `<div class="num">${md(c.metrica)}</div><div class="leg">${md(c.metricaLegenda||'')}</div>`;
      anim.push([m, 2.0]);
    }
  }
  if(c.texto) add(el('div','texto', md(c.texto)), c.tipo==='busca'?2.4:0.6);
  if(c.tipo==='grafico'){ const f = grafico(arte, 540, 1180, 300); upd.push(t=>f(t-0.3)); }
  if(c.tipo==='ondas'){ const f = ondas(arte, 540, 1180, 330); upd.push(t=>f(t-0.3)); }
  if(c.tipo==='cartoes'){
    (c.itens||[]).forEach((it,i)=>{
      const k = el('div','cartao'+(it.ok?'':' nao')); const [s,p,L] = icone(it.ok);
      k.appendChild(s); k.appendChild(el('div','t', md(it.texto))); add(k, 0.6+i*0.9);
      upd.push(t=>p.setAttribute('stroke-dashoffset', (L*(1-eo((t-0.9-i*0.9)/0.5))).toFixed(1)));
    });
  }
  if(c.tipo==='final'){
    const tr = add(el('div','traco'), 0.6); upd.push(t=>{ tr.style.width = (320*eo((t-0.6)/0.7))+'px'; });
    if(c.assinatura) add(el('div','ass', md(c.assinatura)), 0.9);
    if(c.perfil) add(el('div','perfil', md(c.perfil)), 1.0);
    if(c.nota) add(el('div','nota', md(c.nota)), 1.4);
  }
  if(c.fonte) add(el('div','fonte', md(c.fonte)), c.tipo==='busca'?2.6:0.9);
  return {c, raiz, anim, upd};
});

// ---------- tempo ----------
const SAI = 0.35;   // saída mais rápida que a entrada
window.seek = function(t){
  luz.style.background = `radial-gradient(circle at ${50+Math.sin(t*0.25)*12}% ${58+Math.cos(t*0.2)*8}%, ${R.cor.luz} 0%, transparent 52%)`;
  for(const s of cenas){
    const {c} = s; const last = s === cenas[cenas.length-1];
    if(t < c.ini - 0.001 || t > c.fim + (last?1:0)){ s.raiz.style.display='none'; continue; }
    s.raiz.style.display='block';
    const tl = t - c.ini;
    const saida = last ? 1 : 1 - eo((t - (c.fim - SAI))/SAI);
    s.raiz.style.opacity = cl(saida).toFixed(4);
    for(const [e, a] of s.anim){ const p = mola(tl, a);
      e.style.opacity = cl(p).toFixed(4);
      e.style.transform = `translateY(${((1-p)*36).toFixed(2)}px)`;
      e.style.filter = p<0.98 ? `blur(${((1-cl(p))*8).toFixed(2)}px)` : 'none'; }
    for(const f of s.upd) f(tl);
  }
};
// prévia no navegador: toca em tempo real
if(!location.search.includes('render')){ const t0 = performance.now(); (function loop(){ seek(((performance.now()-t0)/1000) % DURATION); requestAnimationFrame(loop); })(); }
else seek(0);
})();
