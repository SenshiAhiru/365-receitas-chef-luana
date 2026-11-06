const plans = document.querySelector('#offer');
document.querySelectorAll('button.animate-pulse-cta:not(:disabled)').forEach(button => button.addEventListener('click', () => plans.scrollIntoView()));
const dots = [...document.querySelectorAll('button[aria-label^="Imagen "]')];
const slides = dots.length ? [...dots[0].parentElement.previousElementSibling.querySelectorAll('img')] : [];
let slide = 0;
function showSlide(index) {
  slide = index;
  slides.forEach((img,i) => { img.style.opacity = i===slide ? '1' : '0'; });
  dots.forEach((btn,i) => { btn.setAttribute('aria-pressed', String(i===slide)); btn.style.background = i===slide ? 'var(--brand-orange)' : '#cfd2c7'; btn.style.width=i===slide?'32px':'12px'; });
}
dots.forEach((btn,i) => btn.addEventListener('click', () => showSlide(i)));
if(slides.length){showSlide(0);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(!document.hidden)showSlide((slide+1)%slides.length)},4500);}
const scroller=document.querySelector('[aria-roledescription=carousel]>div');
const controls=document.createElement('div');
controls.className='es-controls';
for(const [dir,label] of [[-1,'Testimonio anterior'],[1,'Testimonio siguiente']]){
  const btn=document.createElement('button');btn.type='button';btn.textContent=dir===1?'→':'←';btn.setAttribute('aria-label',label);
  btn.onclick=()=>{const last=scroller.scrollWidth-scroller.clientWidth;const step=scroller.querySelector('[role=group]').getBoundingClientRect().width;const left=dir===1&&scroller.scrollLeft>=last-2?0:dir===-1&&scroller.scrollLeft<=2?last:scroller.scrollLeft+dir*step;scroller.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});};controls.append(btn);
}
scroller.parentElement.after(controls);
const faq=[...document.querySelectorAll('section:last-of-type button')].filter(b=>b.nextElementSibling?.classList.contains('grid'));
function expand(active){faq.forEach(b=>{const open=b===active;b.setAttribute('aria-expanded',String(open));const panel=b.nextElementSibling;panel.style.gridTemplateRows=open?'1fr':'0fr';panel.style.opacity=open?'1':'0';panel.setAttribute('aria-hidden',String(!open));const arrow=b.querySelector('span:last-child');if(arrow)arrow.style.transform=open?'rotate(180deg)':'rotate(0deg)';});}
faq.forEach(b=>b.onclick=()=>expand(b.getAttribute('aria-expanded')==='true'?null:b));expand(faq[0]);
