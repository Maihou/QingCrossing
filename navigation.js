function enterPage(url){
 if(document.body.classList.contains('leaving'))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){location.assign(url);return}
 document.body.classList.add('leaving');
 setTimeout(()=>location.assign(url),170)
}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');
 if(!link||link.hasAttribute('download')||link.hash&&link.pathname===location.pathname||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();enterPage(link.href)
});
window.addEventListener('pageshow',()=>document.body.classList.remove('leaving'));

