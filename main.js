(function(){
var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
var b=document.querySelector('.menu-btn'),n=document.getElementById('nav');
if(b&&n)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);});
var f=document.getElementById('contact-form');
if(f)f.addEventListener('submit',function(e){e.preventDefault();
var body='Name: '+document.getElementById('c-name').value+'\nEmail: '+document.getElementById('c-mail').value+'\n\n'+document.getElementById('c-msg').value;
window.location.href='mailto:'+f.dataset.email+'?subject='+encodeURIComponent('SmartToolsHub message')+'&body='+encodeURIComponent(body);});
})();
