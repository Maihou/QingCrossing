const photos = {
  appearance: [['较通透','light','同一张山湖壁纸上的海岸手册文件格，山脊穿过较淡的底色'],['较浓实','dense','加深同一格子的底色，文件名与背景分离']],
  files: [['','files','海岸手册格子中排列着印刷素材、封面设计、校样资料与打样清单等文件']],
  calendar: [['双周','weeks','两周日历上的封面选色、校样和交付安排'],['日程清单','agenda','同一批事项按日期和时间排列']],
  reminder: [['','reminder','校样事项从十四点开始，按日期提前三十分钟提醒']],
  search: [['','search','搜索“校样”，返回校样资料文件夹和海岸手册校样事项']],
  clear: [['清屏前','overview','清屏前的日历与文件格'],['清屏后','clear','清屏后的同一桌面，只显示山湖壁纸']]
};
const shot = document.querySelector('#shot');
const choices = document.querySelector('#variants');
const zoom = document.querySelector('#zoom');
const selected = new Map();
function present(article) {
  const scene = article.dataset.scene;
  const views = photos[scene];
  function select(index) {
    selected.set(scene,index);
    const [,file,alt] = views[index];
    shot.src = 'surface-media/' + file + '.png';
    shot.alt = alt;
    for (const [n,button] of [...choices.children].entries()) button.setAttribute('aria-pressed',String(n===index));
  }
  choices.replaceChildren();
  if (views.length > 1) for (const [n,[label]] of views.entries()) {
    const button = document.createElement('button');
    button.type='button';
    button.textContent=label;
    button.addEventListener('click',()=>select(n));
    choices.append(button);
  }
  select(selected.get(scene) ?? 0);
}
document.querySelector('#enlarge').addEventListener('click',()=>{
  const full = zoom.querySelector('img'); full.src=shot.src; full.alt=shot.alt;
  zoom.showModal();
});
zoom.querySelector('button').addEventListener('click',()=>zoom.close());
zoom.addEventListener('click',event=>{if(event.target===zoom)zoom.close()});
const articles=[...document.querySelectorAll('.rail article')],viewer=document.querySelector('.viewer');
let current=-1,queued=false;
function show(i){
 if(i===current)return;current=i;
 articles.forEach((a,n)=>a.classList.toggle('active',n===i));
 document.querySelector('#scene-name').textContent=articles[i].querySelector('small').textContent;
 document.querySelector('#count').textContent=String(i+1).padStart(2,'0')+' / '+String(articles.length).padStart(2,'0');
 present(articles[i]);
 document.querySelector('#prev').disabled=i===0;document.querySelector('#next').disabled=i===articles.length-1
}
function focusLine(){return matchMedia('(max-width:750px)').matches?Math.min(innerHeight*.8,62+viewer.offsetHeight+innerHeight*.17):innerHeight*.53}
function update(){
 queued=false;const line=focusLine();
 const distances=articles.map(a=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-line));
 show(distances.indexOf(Math.min(...distances)))
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
function go(i){const a=articles[i];if(a)window.scrollBy({top:a.getBoundingClientRect().top+a.offsetHeight/2-focusLine(),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}
document.querySelector('#prev').onclick=()=>go(current-1);document.querySelector('#next').onclick=()=>go(current+1);
articles.forEach((a,i)=>a.addEventListener('click',()=>go(i)));
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);update();
