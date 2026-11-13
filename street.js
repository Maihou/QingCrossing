const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const black='#171614',paper='#e9dfc5',teal='#008680',red='#e04d30',edge='#a59a84',slate='#262521';
const stops=[
 {name:'十字街',label:'街口',area:'清系列 · 街区全景',yaw:.16,pitch:.60,zoom:.86,x:0,z:0},
 {name:'QingSurface',label:'西北角',area:'西北街角',yaw:.35,pitch:.26,zoom:1.38,x:-128,z:80,desc:'把桌面文件归入透明格子，在桌面日历里安排事项。'},
 {name:'QingBoard',label:'东北角',area:'东北街角',yaw:-.48,pitch:.16,zoom:1.47,x:132,z:90,desc:'把截图、文字与链接收进采风板，关联稿件，安排图文发布。'},
 {name:'QingPulse',label:'东南角',area:'东南街角',yaw:-2.52,pitch:.49,zoom:1.24,x:118,z:-85,desc:'按来源采集网页内容与评论，在本地查看任务、整理结果并导出表格。'},
 {name:'施工中',label:'西南角',area:'西南街角',yaw:-3.56,pitch:.72,zoom:1.09,x:-100,z:-68}
];
let objects=[],parts,origin;function group(x,z,build){parts=[];origin=[x,z];build();objects.push({x,z,parts})}
function surface(points,color,text,tc){parts.push({p:points.map(([x,y,z])=>[x+origin[0],y,z+origin[1]]),color,text,tc})}
function ground(x,z,w,d,color,y=0){surface([[x,y,z],[x+w,y,z],[x+w,y,z+d],[x,y,z+d]],color)}
function wall(x,y,z,w,h,color,text,tc){surface([[x,y+h,z],[x+w,y+h,z],[x+w,y,z],[x,y,z]],color,text,tc)}
function cube(x,y,z,w,h,d,color,roof=color){
 wall(x,y,z,w,h,color);wall(x,y,z+d,w,h,color);
 for(const a of [x,x+w])surface([[a,y,z],[a,y+h,z],[a,y+h,z+d],[a,y,z+d]],slate);
 ground(x,z,w,d,roof,y+h)
}
function building(x,z,w,d,h,name,accent,kind){
 group(x,z,()=>{const a=-w/2,b=-d/2;cube(a,0,b,w,h,d,black,slate);
 for(const side of [-1,1]){const f=side*(d/2+.5),out=side;
 wall(a+1,1,f+out*3,w-2,h-2,black);
 const face=parts.at(-1);
 face.art=facadePrint(kind,name||'施工中');
 face.entry=kind||4;
 }
 for(let y=11;y<h-10;y+=23)for(let j=0;j<4;j++)for(const aSide of [a-.6,-a+.6])surface([[aSide,y,b+6+j*d/4],[aSide,y+13,b+6+j*d/4],[aSide,y+13,b+d/4+j*d/4],[aSide,y,b+d/4+j*d/4]],j%3?black:teal);
 cube(a-2,h,b-2,w+4,2,d+4,edge,slate);
 cube(a+9,h+2,b+8,w*.25,8,d*.3,black,edge);
 if(kind===1||kind===2){cube(-w*.32,h+3,-2,w*.65,30,3,accent);for(const s of [-1,1]){wall(-w*.32,h+4,s>0?1.6:-2.6,w*.65,28,accent,name,paper);parts.at(-1).entry=kind}}
 })
}
const sites=[[-188,140,165,88,131,1,teal],[186,142,163,92,167,2,red],[185,-147,162,89,99,3,teal],[-195,-148,160,86,76,4,red]];
for(const [x,z,w,d,h,i,color] of sites)building(x,z,w,d,h,stops[i].name,color,i);
for(const sign of [-1,1])for(let row=0;row<4;row++)for(const dir of [-1,1]){
 building(sign*(340+row*135),dir*150,120,86,70+(row%3)*29,'',row%2?teal:black,0);
 if(dir>0)building(sign*170,dir*(280+row*140),125,94,74+(row%3)*23,'',slate,0)
}
function car(x,z,color){group(x,z,()=>{cube(-15,3,-7,30,9,14,color,color);cube(-9,12,-5,17,6,10,black,color);wall(-11,1,-7.6,5,4,black);wall(7,1,-7.6,5,4,black)})}
car(-143,18,paper);car(160,-17,teal);car(22,178,red);
for(const xs of [-1,1])for(const zs of [-1,1]){
 group(xs*85,zs*76,()=>{cube(-1,0,-1,2,55,2,paper);cube(-9,48,-2,18,7,4,black);wall(-7,50,-2.5,4,3,red);wall(3,50,2.5,4,3,teal)});
 for(let j=0;j<18;j++){const x=xs*(86+(j*17)%85),z=zs*(68+(j*13)%33);group(x,z,()=>{cube(-1,0,-1,2,8,2,paper);cube(-2,7,-1,4,7,3,j%2?slate:teal);const c=[teal,red,black,paper][j%4];for(let v=0;v<8;v++){const t=v*Math.PI/4;surface([[0,20,0],[6*Math.cos(t),16,6*Math.sin(t)],[6*Math.cos(t+.786),16,6*Math.sin(t+.786)]],c)}});objects.at(-1).spread=zs*(j%6)*3}
}
let camera={},yawCos,yawSin,stage=0,currentScale=1,timer=0;
function view(x,z){return (x-camera.x)*yawSin+(z-camera.z)*yawCos}
let movingDepth=0;
// A level lens: at d=0 the scale is one at every field of view.
// Vertical lens shift keeps the focus plane fixed as the camera rises.
function project([x,y,z]){
 z+=movingDepth;
 const d=view(x,z),k=camera.distance/Math.max(35,camera.distance+d);
 return [((x-camera.x)*yawCos-(z-camera.z)*yawSin)*k,
         -y*k+camera.height*(k-1)]
}
let probe=null, picked=0;
function renderFace(f){
 const p=f.p.map(project);g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(probe&&g.isPointInPath(probe.x,probe.y))picked=f.entry||0;g.fillStyle=f.color;g.fill();g.strokeStyle=edge;g.lineWidth=.44;g.stroke();
 if(f.art){paintPrint(f.art,p);return}if(f.text){const [a,b,,d]=p;const w=Math.hypot(b[0]-a[0],b[1]-a[1]),h=Math.hypot(d[0]-a[0],d[1]-a[1]);if(w<15||h<4)return;const first=b[0]>a[0]?a:b;g.save();g.transform(Math.abs(b[0]-a[0])/w,(b[1]-a[1])*Math.sign(b[0]-a[0])/w,(d[0]-a[0])/h,(d[1]-a[1])/h,...first);g.fillStyle=f.tc;g.font='bold '+h*.77+'px "Microsoft YaHei",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(f.text,w/2,h*.52,w*.92);g.restore()}
}
// Elevated rail crossing the distant street. Keep the archway open.
group(0,255,()=>{
 cube(-375,59,-9,750,14,18,black,edge);
 wall(-80,59,-10,160,14,paper,'QingCrossing',black);
 for(let x=-355;x<370;x+=66){if(Math.abs(x)>54)cube(x,0,-5,5,60,10,slate)}
 for(let x=-260;x<205;x+=75){cube(x,74,0,71,20,15,teal,black);for(let n=0;n<7;n++)wall(x+3+n*9,81,-1,7,8,paper)}
});
group(0,0,()=>{
 ground(-1700,-1700,3400,3400,black);
 for(const x of [-1,1])for(const z of [-1,1])ground(x<0?-1700:80,z<0?-1700:67,1620,1633,'#353530');
 for(let j=-6;j<=6;j++)for(const sign of [-1,1]){ground(j*10-3,sign*56-8,6,16,paper);ground(sign*68-9,j*8-2,18,5,paper)}
 for(let i=-800;i<=800;i+=40)if(Math.abs(i)>95){ground(i,0,20,1.2,edge);ground(0,i,1.2,20,edge)}
 for(let i=0;i<650;i++){const x=(i*271%1081)-540,z=(i*179%811)-405;ground(x,z,2+i%9,.35,i%8===0?teal:slate)}
 for(let i=0;i<800;i++){
 const x=(i*173%721)-360,z=(i*107%491)-245;
 if(Math.abs(x)>78&&Math.abs(z)>66)continue;
 const tone=[edge,slate,teal,slate,paper,slate,red][i%7];
 ground(x,z,2+(i*19%24),.2+(i%4)*.19,tone)
 }
 for(const r of [24,15,6])surface([[-r,0,0],[0,0,r],[r,0,0],[0,0,-r]],r===15?black:paper)
});const road=objects.pop();
for(const obj of objects)for(const face of obj.parts){
 const center=face.p.reduce((s,p)=>s.map((v,i)=>v+p[i]),[0,0,0]).map(v=>v/face.p.length);
 [face.cx,face.cy,face.cz]=center
}
function draw(){
 const W=canvas.clientWidth,H=canvas.clientHeight,r=Math.min(2,devicePixelRatio);
 if(canvas.width!==Math.round(W*r)||canvas.height!==Math.round(H*r)){canvas.width=Math.round(W*r);canvas.height=Math.round(H*r)}
 movingDepth=0; yawCos=Math.cos(camera.yaw);yawSin=Math.sin(camera.yaw);
 currentScale=Math.min(W/(W<600?595:900),H/390)*camera.zoom;
 g.setTransform(r*currentScale,0,0,r*currentScale,W*r*.5,H*r*.68);
 g.fillStyle=black;g.fillRect(-W/currentScale,-H/currentScale,2*W/currentScale,2*H/currentScale);
 road.parts.forEach(renderFace);
 const sortDepth=f=>f.cx*yawSin+f.cz*yawCos-.45*camera.pitch*f.cy;
 for(const obj of objects)obj.shift=(obj.spread||0)*camera.layout;
 objects.sort((a,b)=>view(b.x,b.z+b.shift)-view(a.x,a.z+a.shift)).forEach(obj=>{
 movingDepth=obj.shift;
 if(view(obj.x,obj.z+obj.shift)<-camera.distance+110)return;
 const [sx,sy]=project([obj.x,0,obj.z]);if(Math.abs(sx)>W/currentScale*.5+200||sy>H/currentScale*.32+240)return;
 obj.parts.map(f=>[sortDepth(f),f]).sort((a,b)=>b[0]-a[0]).forEach(pair=>renderFace(pair[1]))
 })
}
const nav=document.querySelector('nav');
let shown=-1;
function displayStop(){
 if(shown===stage)return;shown=stage;
 [...nav.children].forEach((button,i)=>button.setAttribute('aria-current',String(i===stage)))
}
// Integer positions are matched orthographic elevations. Between them the
// very same vertices fan out in depth and reveal the crossing.
let position=0, destination=0;
const count=stops.length;
const wrap=n=>((n%count)+count)%count;
const smooth=t=>t*t*(3-2*t);
const flatYaw=[0,0,0,-Math.PI,-Math.PI];
function compose(value){
 const floor=Math.floor(value),left=wrap(floor),right=wrap(floor+1);
 const phase=value-floor,from=stops[left],to=stops[right];
 const blend=(v)=>smooth(Math.min(1,Math.max(0,v)));
 // Open the street before swinging to the next corner; settle on a flat hold.
 const relief=blend((phase-.08)/.29)*(1-blend((phase-.72)/.23));
 const turn=blend((phase-.32)/.55);
 const angle=flatYaw[right]-flatYaw[left];
 const fov=2+58*relief;
 const distance=430/Math.tan(fov*Math.PI/360);
 const height=125+290*relief;
 camera={x:from.x+(to.x-from.x)*turn,z:from.z+(to.z-from.z)*turn,
   distance,height,pitch:height/distance,relief,
   yaw:flatYaw[left]+angle*turn+.18*relief*(right%2?1:-1),
   zoom:1.18+.20*((left!==0)*(1-turn)+(right!==0)*turn)};
 // Only shift the row of umbrellas during the long-lens hold.
 camera.layout=(left%2)+(right%2-left%2)*blend(phase/.08);
 stage=wrap(Math.round(value));displayStop();draw()
}
let flying=false,queuedScroll=0;
function move(index){
 const next=wrap(index),base=Math.round(position),goal=base+wrap(next-wrap(base)+2)-2;
 const from={...camera},to=stops[next],endYaw=flatYaw[next];
 if(!flying&&position===goal)return;
 cancelAnimationFrame(timer);easing=false;flying=true;queuedScroll=0;
 destination=goal;stage=next;displayStop();
 const angle=Math.atan2(Math.sin(endYaw-from.yaw),Math.cos(endYaw-from.yaw));
 const start=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1150;
 function fly(now){
  const t=Math.min(1,(now-start)/duration),u=smooth(t),lift=Math.sin(Math.PI*u);
  if(t===1){position=goal;flying=false;compose(goal);if(queuedScroll)scrub(queuedScroll);return}
  const mix=(a,b)=>a+(b-a)*u;
  const relief=from.relief*(1-u)+.78*lift;
  const distance=430/Math.tan((2+58*relief)*Math.PI/360),height=125+290*relief;
  camera={x:mix(from.x,to.x),z:mix(from.z,to.z),yaw:from.yaw+angle*u,
   relief,distance,height,pitch:height/distance,zoom:mix(from.zoom,next?1.38:1.18),layout:mix(from.layout,next%2)};
  draw();timer=requestAnimationFrame(fly)
 }
 timer=requestAnimationFrame(fly)
}
function address(i){return (i===4?'construction':stops[i].name)+'.html'}
function remember(){history.replaceState({position},'')}
stops.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.label;b.onclick=()=>move(i);nav.append(b)});
document.querySelector('#prev').onclick=()=>move(stage-1);document.querySelector('#next').onclick=()=>move(stage+1);
let easing=false;
function scrub(delta){
 if(flying){queuedScroll+=delta;return}
 destination+=delta;
 if(easing)return;
 cancelAnimationFrame(timer);easing=true;
 let last=performance.now();
 function glide(now){
  const dt=Math.min(60,Math.max(1,now-last));last=now;
  position+=(destination-position)*(1-Math.exp(-dt/155));
  if(Math.abs(destination-position)<.00025){position=destination;easing=false}
  compose(position);if(easing)timer=requestAnimationFrame(glide)
 }
 timer=requestAnimationFrame(glide)
}
canvas.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;e.preventDefault();
 scrub(e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1)/1500)
},{passive:false});
let touch=null,startX=0,startY=0,dragged=false;
canvas.onpointerdown=e=>{touch=startY=e.clientY;startX=e.clientX;dragged=false;canvas.setPointerCapture(e.pointerId)};
canvas.onpointermove=e=>{
 if(touch===null)return;
 if(Math.hypot(e.clientX-startX,e.clientY-startY)>5)dragged=true;
 if(dragged){scrub((touch-e.clientY)/440);touch=e.clientY}
};
canvas.onpointerup=e=>{
 touch=null;if(dragged)return;
 const rect=canvas.getBoundingClientRect();
 probe={x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height};
 picked=0;draw();probe=null;
 if(picked){remember();enterPage(address(picked))}
};
canvas.onpointercancel=()=>touch=null;
window.addEventListener('keydown',e=>{const step={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(step){e.preventDefault();move(stage+step)}});
position=destination=Number(history.state?.position)||0;compose(position);new ResizeObserver(draw).observe(canvas)







