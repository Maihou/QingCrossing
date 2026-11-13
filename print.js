const printCache=new Map();
function inkRandom(seed){
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
}
function facadePrint(kind,name){
 if(printCache.has(kind))return printCache.get(kind);
 const sheet=document.createElement('canvas');sheet.width=640;sheet.height=400;
 const c=sheet.getContext('2d'),rand=inkRandom(kind*913);
 const dark='#181715',white='#ebdfc3',green='#007c77',verm='#dc482d',accent=kind%2?green:verm;
 function fill(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
 function stroke(x,y,x2,y2,col,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=width;c.stroke()}
 function type(str,x,y,size,col){c.font='900 '+size+'px "Microsoft YaHei",sans-serif';c.fillStyle=col;c.fillText(str,x,y)}
 fill(0,0,640,400,dark);
 const display=kind===1||kind===3;
 // Ink panels, mullions and hand-cut shutters.
 for(let x=7;x<640;x+=47){fill(x,9,40,122,dark);stroke(x,9,x,135,white,1.8);
 for(let y=16;y<133;y+=29){fill(x+4,y,31,14,rand()>.59?white:dark);stroke(x,y+20,x+37,y+20,'#8e8576')}}
 const bx=display?75:233,bw=display?365:325;
 fill(bx+4,9,bw,120,verm);fill(bx,6,bw,118,accent);
 const titles=['施工中','QingSurface','QingBoard','QingPulse','施工中'];
 type(titles[kind],bx+12,91,kind>0&&kind<4?51:69,white);
 for(let i=0;i<22;i++)stroke(bx,8+i*5,bx+bw,8+i*5,'#25221c65');
 for(let i=0;i<3;i++){const x=(bx+bw+10+i*43)%603;fill(x,137,39,24,i%2?verm:green);type(['清','街','坊'][i],x+9,156,18,white)}
 fill(0,171,640,45,white);fill(0,215,640,5,accent);c.textAlign='center';type(name,320,205,33,dark);c.textAlign='left';
 for(let j=0;j<(kind===2?4:3);j++){const w=kind===2?145:193,x=10+j*(w+12),y=276;
 c.beginPath();c.moveTo(x,394);c.lineTo(x,y+10);c.quadraticCurveTo(x+w*.5,y-86,x+w,y+10);c.lineTo(x+w,394);c.strokeStyle=white;c.lineWidth=2;c.stroke();
 for(let k=0;k<10;k++)stroke(x+10,y+6+k*10,x+w-10,y+6+k*10,'#888072',1);
 fill(x+w*.19,y+11,w*.61,19,j%2?green:verm);type(['工 作 室','街 区','清 系 列'][j%3],x+w*.23,y+25,13,white);
 for(let k=0;k<4;k++){fill(x+16+k*13,359-(k%3)*6,10,20,k%2?white:accent)}
 }
 // Fine uninked scratches, broken horizontal cuts and misregistered ink.
 for(let i=0;i<3200;i++){
 const x=rand()*640,y=rand()*400;stroke(x,y,x+rand()*5,y+rand()*1.5,rand()>.5?'#f9efcf55':'#18151277',rand()+.3)}
 for(let i=0;i<110;i++){const x=rand()*640,y=rand()*400;stroke(x,y,x+rand()*40,y-.7,'#e7d9c46b',.8)}
 printCache.set(kind,sheet);return sheet
}
// Two clipped affine triangles keep the print attached to a perspective facade.
function paintPrint(img,p){
 const [a,b,c,d]=p;
 const cross=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);
 if(Math.abs(cross)<9)return;
 const corners=cross>0?[a,b,c,d]:[b,a,d,c];
 const [tl,tr,br,bl]=corners,w=img.width,h=img.height;
 function half(o,x,y,clip){
 g.save();g.beginPath();clip.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py));g.closePath();g.clip();
 g.transform(x[0]/w,x[1]/w,y[0]/h,y[1]/h,o[0],o[1]);g.drawImage(img,0,0);g.restore()}
 const sub=(l,r)=>[l[0]-r[0],l[1]-r[1]];
 half(tl,sub(tr,tl),sub(bl,tl),[tl,tr,bl]);
 half([tr[0]+bl[0]-br[0],tr[1]+bl[1]-br[1]],sub(br,bl),sub(br,tr),[br,bl,tr])
}
function addRainPrint(){
 const tile=document.createElement('canvas');tile.width=384;tile.height=384;
 const c=tile.getContext('2d'),rand=inkRandom(852);
 for(let i=0;i<7600;i++){c.fillStyle=i%3?'#fbecd217':'#0d090741';c.fillRect(rand()*384,rand()*384,rand()*1.9+.4,1)}
 for(let i=0;i<85;i++){const x=rand()*384,y=rand()*384;c.strokeStyle=i%4?'#e7dbc42c':'#ece0c869';c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y+3+rand()*10);c.stroke()}
 document.querySelector('section').style.setProperty('--rain-print','url('+tile.toDataURL()+')')
}
addRainPrint()

