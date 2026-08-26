const TOTAL = 48;
const pagePath = n => `pages/page-${String(n).padStart(2,'0')}.png`;
let page = 1;
let busy = false;
let direction = 'next';
const base = document.getElementById('baseSpread');
const turning = document.getElementById('turningSpread');
const current = document.getElementById('current');
const total = document.getElementById('total');
const thumbs = document.getElementById('thumbs');
const thumbGrid = document.getElementById('thumbGrid');

total.textContent = String(TOTAL).padStart(2,'0');

function isPortrait(){ return window.matchMedia('(orientation: portrait) and (max-width:700px)').matches; }
function pageBg(n){ return `url("${pagePath(n)}")`; }
function render(){
  if(isPortrait()){
    base.style.backgroundImage = pageBg(page);
    base.style.backgroundSize = '200% 100%';
    base.style.backgroundPosition = 'left center';
    base.style.left='0'; base.style.width='50%';
  } else {
    base.style.backgroundImage = pageBg(page);
    base.style.backgroundSize='cover'; base.style.backgroundPosition='center';
    base.style.left='0'; base.style.width='100%';
  }
  current.textContent=String(page).padStart(2,'0');
  [...thumbGrid.children].forEach((el,i)=>el.classList.toggle('active',i===page-1));
}

function preload(n){ if(n<1||n>TOTAL)return; const im=new Image(); im.src=pagePath(n); }
function go(delta){
  if(busy) return;
  const next=page+delta;
  if(next<1||next>TOTAL)return;
  busy=true; direction=delta>0?'back':'next';
  turning.className='spread turning '+(direction==='back'?'back':'');
  turning.style.backgroundImage=pageBg(page);
  if(isPortrait()){
    turning.style.backgroundSize='200% 100%';
    turning.style.backgroundPosition='left center';
    turning.style.left='0'; turning.style.width='50%';
  }else{
    turning.style.backgroundSize='cover'; turning.style.backgroundPosition='center';
    turning.style.left='0'; turning.style.width='100%';
  }
  // The new page is placed underneath before the sheet turns.
  page=next; render();
  requestAnimationFrame(()=>turning.classList.add('active'));
  setTimeout(()=>{
    turning.className='spread turning';
    busy=false;
    preload(page+1); preload(page-1);
  },850);
}

document.getElementById('nextBtn').onclick=()=>go(1);
document.getElementById('prevBtn').onclick=()=>go(-1);
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='PageDown')go(1);
  if(e.key==='ArrowLeft'||e.key==='PageUp')go(-1);
  if(e.key==='Home'){page=1;render()}
  if(e.key==='End'){page=TOTAL;render()}
});

let sx=0,sy=0;
document.getElementById('viewer').addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});
document.getElementById('viewer').addEventListener('touchend',e=>{const t=e.changedTouches[0];const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go(dx<0?1:-1)},{passive:true});

function buildThumbs(){
  const frag=document.createDocumentFragment();
  for(let i=1;i<=TOTAL;i++){
    const b=document.createElement('button');b.className='thumb';b.setAttribute('aria-label',`第 ${i} 页`);
    b.innerHTML=`<img loading="lazy" src="${pagePath(i)}" alt=""><span>${String(i).padStart(2,'0')}</span>`;
    b.onclick=()=>{page=i;render();thumbs.classList.remove('open');thumbs.setAttribute('aria-hidden','true')};
    frag.appendChild(b);
  }
  thumbGrid.appendChild(frag);
}
buildThumbs();
document.getElementById('thumbBtn').onclick=()=>{thumbs.classList.add('open');thumbs.setAttribute('aria-hidden','false')};
document.getElementById('closeThumb').onclick=()=>{thumbs.classList.remove('open');thumbs.setAttribute('aria-hidden','true')};
document.getElementById('fullscreenBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
window.addEventListener('resize',()=>render());
render();
preload(2);
