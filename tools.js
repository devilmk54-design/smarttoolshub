/* SmartToolsHub tool logic. Pure functions live in Core (testable); DOM wiring is below. */
'use strict';
const Core = {
  wordStats(s){
    const t=s.trim();
    const words=t?t.split(/\s+/).length:0;
    const sentences=(t.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).filter(x=>x.trim()).length;
    const paragraphs=t?t.split(/\n\s*\n/).filter(x=>x.trim()).length:0;
    return {words,chars:s.length,noSpace:s.replace(/\s/g,'').length,sentences,paragraphs,minutes:words?Math.max(1,Math.ceil(words/200)):0};
  },
  rand(n){const max=Math.floor(4294967296/n)*n;const a=new Uint32Array(1);let x;do{crypto.getRandomValues(a);x=a[0];}while(x>=max);return x%n;},
  password(len,o){
    const sets={up:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',lo:'abcdefghijklmnopqrstuvwxyz',nu:'0123456789',sy:'!@#$%^&*()-_=+[]{};:,.?'};
    const act=Object.keys(sets).filter(k=>o[k]);
    if(!act.length)return null;
    const all=act.map(k=>sets[k]).join('');
    const out=act.map(k=>sets[k][Core.rand(sets[k].length)]);
    while(out.length<len)out.push(all[Core.rand(all.length)]);
    for(let i=out.length-1;i>0;i--){const j=Core.rand(i+1);const t=out[i];out[i]=out[j];out[j]=t;}
    return {text:out.slice(0,len).join(''),bits:len*Math.log2(all.length)};
  },
  parse(s){const p=s.split('-').map(Number);return {y:p[0],m:p[1],d:p[2],t:Date.UTC(p[0],p[1]-1,p[2])};},
  age(dobS,asS){
    const a=Core.parse(dobS),b=Core.parse(asS);
    if(b.t<a.t)return null;
    let months=(b.y-a.y)*12+b.m-a.m;
    if(b.d<a.d)months--;
    const am=a.m-1+months,ay=a.y+Math.floor(am/12),amo=((am%12)+12)%12;
    const last=new Date(Date.UTC(ay,amo+1,0)).getUTCDate();
    const anchor=Date.UTC(ay,amo,Math.min(a.d,last));
    const y=Math.floor(months/12),m=months%12,d=Math.round((b.t-anchor)/864e5);
    let ny=b.y,nb=Date.UTC(ny,a.m-1,a.d);
    if(nb<b.t){ny++;nb=Date.UTC(ny,a.m-1,a.d);}
    return {y,m,d,days:Math.round((b.t-a.t)/864e5),next:Math.round((nb-b.t)/864e5)};
  },
  bmi(unit,w,h){
    if(!(w>0&&h>0))return null;
    const v=unit==='metric'?w/Math.pow(h/100,2):703*w/(h*h);
    const hm=unit==='metric'?h/100:h*0.0254;
    return {bmi:v,cat:v<18.5?'Underweight':v<25?'Normal weight':v<30?'Overweight':'Obese',loKg:18.5*hm*hm,hiKg:24.9*hm*hm};
  },
  pctOf(x,y){return x/100*y;},
  pctWhat(x,y){return y===0?null:x/y*100;},
  pctChange(a,b){return a===0?null:(b-a)/Math.abs(a)*100;},
  UNITS:{length:{mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mi:1609.344},
    weight:{mg:1e-6,g:.001,kg:1,t:1000,oz:.028349523125,lb:.45359237},
    speed:{'m/s':1,'km/h':1/3.6,mph:.44704,knot:1852/3600},
    temperature:{C:1,F:1,K:1}},
  convert(cat,from,to,v){
    if(cat==='temperature'){
      const c=from==='C'?v:from==='F'?(v-32)*5/9:v-273.15;
      return to==='C'?c:to==='F'?c*9/5+32:c+273.15;
    }
    const u=Core.UNITS[cat];return v*u[from]/u[to];
  },
  fmt(n){return String(parseFloat(n.toPrecision(10)));},
  words(s){return s.replace(/([a-z0-9])([A-Z])/g,'$1 $2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);},
  toCase(k,s){
    switch(k){
      case 'upper':return s.toUpperCase();
      case 'lower':return s.toLowerCase();
      case 'title':return s.toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase());
      case 'sentence':return s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase());
      case 'camel':return Core.words(s).map((x,i)=>i?x[0].toUpperCase()+x.slice(1):x).join('');
      case 'snake':return Core.words(s).join('_');
      case 'kebab':return Core.words(s).join('-');
    }
    return s;
  },
  jsonFmt(s,indent){
    try{const o=JSON.parse(s);return {ok:true,text:JSON.stringify(o,null,indent)};}
    catch(e){return {ok:false,error:e.message};}
  },
  b64enc(s){
    const b=new TextEncoder().encode(s);let bin='';
    for(let i=0;i<b.length;i+=8192)bin+=String.fromCharCode.apply(null,b.subarray(i,i+8192));
    return btoa(bin);
  },
  b64dec(s){
    try{
      s=s.replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
      while(s.length%4)s+='=';
      const bin=atob(s);
      return {ok:true,text:new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))};
    }catch(e){return {ok:false,error:'This is not valid Base64 text.'};}
  },
  hexToRgb(h){
    h=h.trim().replace('#','');
    if(/^[0-9a-f]{3}$/i.test(h))h=h.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}$/i.test(h))return null;
    return [0,2,4].map(i=>parseInt(h.substr(i,2),16));
  },
  rgbToHex(r,g,b){return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');},
  rgbToHsl(r,g,b){
    r/=255;g/=255;b/=255;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;let h=0,s=0;
    if(d){
      s=d/(1-Math.abs(2*l-1));
      if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
      h*=60;if(h<0)h+=360;
    }
    return [Math.round(h)%360,Math.round(s*100),Math.round(l*100)];
  },
  hslToRgb(h,s,l){
    h=((h%360)+360)%360;s/=100;l/=100;
    const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let t;
    if(h<60)t=[c,x,0];else if(h<120)t=[x,c,0];else if(h<180)t=[0,c,x];else if(h<240)t=[0,x,c];else if(h<300)t=[x,0,c];else t=[c,0,x];
    return t.map(v=>Math.round((v+m)*255));
  }
};

if(typeof module!=='undefined')module.exports=Core;

if(typeof document!=='undefined'){
const g=id=>document.getElementById(id);
const on=(id,ev,fn)=>g(id).addEventListener(ev,fn);
const num=id=>parseFloat(g(id).value);
const pct4=n=>String(parseFloat(n.toFixed(4)));

document.addEventListener('click',function(e){
  const b=e.target.closest('[data-copy]');if(!b)return;
  const el=g(b.dataset.copy);if(!el||!el.value)return;
  const done=()=>{const o=b.textContent;b.textContent='Copied!';setTimeout(()=>{b.textContent=o;},1200);};
  const fallback=()=>{el.select();try{document.execCommand('copy');done();}catch(_){}};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(el.value).then(done,fallback);else fallback();
});

const T={
'word-counter'(){
  const upd=()=>{const s=Core.wordStats(g('wc-in').value);
    g('wc-words').textContent=s.words;g('wc-chars').textContent=s.chars;g('wc-nospace').textContent=s.noSpace;
    g('wc-sent').textContent=s.sentences;g('wc-para').textContent=s.paragraphs;g('wc-read').textContent=s.minutes+' min';};
  on('wc-in','input',upd);
  on('wc-clear','click',()=>{g('wc-in').value='';upd();g('wc-in').focus();});
  upd();
},
'password-generator'(){
  const gen=()=>{
    const r=Core.password(num('pw-len'),{up:g('pw-up').checked,lo:g('pw-lo').checked,nu:g('pw-nu').checked,sy:g('pw-sy').checked});
    if(!r){g('pw-out').value='';g('pw-strength').textContent='Select at least one character type.';return;}
    g('pw-out').value=r.text;const b=r.bits;
    g('pw-strength').textContent='Strength: '+(b<40?'Weak':b<60?'Fair':b<80?'Strong':'Very strong')+' (about '+Math.round(b)+' bits)';
  };
  on('pw-len','input',()=>{g('pw-len-v').textContent=g('pw-len').value;gen();});
  ['pw-up','pw-lo','pw-nu','pw-sy'].forEach(id=>on(id,'change',gen));
  on('pw-gen','click',gen);gen();
},
'age-calculator'(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  g('ag-asof').value=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  on('ag-go','click',()=>{
    const o=g('ag-out');
    if(!g('ag-dob').value||!g('ag-asof').value){o.textContent='Please choose both dates.';return;}
    const r=Core.age(g('ag-dob').value,g('ag-asof').value);
    if(!r){o.textContent='The date of birth must be on or before the “Age at date”.';return;}
    o.innerHTML='<strong>'+r.y+' years, '+r.m+' months, '+r.d+' days</strong><br>Total days lived: '+r.days.toLocaleString()+'<br>Days until next birthday: '+r.next.toLocaleString();
  });
},
'bmi-calculator'(){
  on('bm-unit','change',()=>{const m=g('bm-unit').value==='metric';
    g('bm-wl').textContent=m?'Weight (kg)':'Weight (lb)';g('bm-hl').textContent=m?'Height (cm)':'Height (in)';g('bm-out').textContent='';});
  on('bm-go','click',()=>{
    const u=g('bm-unit').value,r=Core.bmi(u,num('bm-w'),num('bm-h')),o=g('bm-out');
    if(!r){o.textContent='Please enter a weight and a height greater than zero.';return;}
    const k=u==='metric'?1:2.20462,wu=u==='metric'?'kg':'lb';
    o.innerHTML='<strong>BMI: '+r.bmi.toFixed(1)+' ('+r.cat+')</strong><br>Healthy weight for your height: '+(r.loKg*k).toFixed(1)+' to '+(r.hiKg*k).toFixed(1)+' '+wu;
  });
},
'percentage-calculator'(){
  const set=(id,v,suf)=>{g(id).textContent=(v===null||!isFinite(v))?'Not defined':pct4(v)+(suf||'');};
  const blank=(a,b)=>g(a).value===''||g(b).value==='';
  const u1=()=>{if(blank('pc-a1','pc-b1')){g('pc-r1').textContent='—';return;}set('pc-r1',Core.pctOf(num('pc-a1'),num('pc-b1')));};
  const u2=()=>{if(blank('pc-a2','pc-b2')){g('pc-r2').textContent='—';return;}set('pc-r2',Core.pctWhat(num('pc-a2'),num('pc-b2')),'%');};
  const u3=()=>{if(blank('pc-a3','pc-b3')){g('pc-r3').textContent='—';return;}set('pc-r3',Core.pctChange(num('pc-a3'),num('pc-b3')),'%');};
  [['pc-a1',u1],['pc-b1',u1],['pc-a2',u2],['pc-b2',u2],['pc-a3',u3],['pc-b3',u3]].forEach(x=>on(x[0],'input',x[1]));
},
'unit-converter'(){
  const lab=(c,k)=>c==='temperature'&&k!=='K'?'°'+k:k;
  const fill=()=>{const c=g('un-cat').value,ks=Object.keys(Core.UNITS[c]);
    ['un-from','un-to'].forEach((id,i)=>{g(id).innerHTML=ks.map(k=>'<option value="'+k+'">'+lab(c,k)+'</option>').join('');g(id).value=ks[i];});upd();};
  const upd=()=>{const c=g('un-cat').value,v=num('un-val'),o=g('un-out');
    if(isNaN(v)){o.textContent='Enter a number to convert.';return;}
    const f=g('un-from').value,t=g('un-to').value;
    o.innerHTML='<strong>'+Core.fmt(v)+' '+lab(c,f)+' = '+Core.fmt(Core.convert(c,f,t,v))+' '+lab(c,t)+'</strong>';};
  on('un-cat','change',fill);on('un-val','input',upd);on('un-from','change',upd);on('un-to','change',upd);
  on('un-swap','click',()=>{const f=g('un-from').value;g('un-from').value=g('un-to').value;g('un-to').value=f;upd();});
  fill();
},
'case-converter'(){
  let prev=null;
  document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{
    prev=g('cs-in').value;g('cs-in').value=Core.toCase(b.dataset.case,prev);}));
  on('cs-undo','click',()=>{if(prev!==null){g('cs-in').value=prev;prev=null;}});
},
'json-formatter'(){
  const run=ind=>{const m=g('js-msg');
    if(!g('js-in').value.trim()){m.textContent='Paste some JSON first.';m.className='note';return;}
    const r=Core.jsonFmt(g('js-in').value,ind);
    if(r.ok){g('js-out').value=r.text;m.textContent='Valid JSON.';m.className='note ok';}
    else{g('js-out').value='';m.textContent='Invalid JSON: '+r.error;m.className='note err';}};
  on('js-fmt','click',()=>run(2));on('js-min','click',()=>run(0));
  on('js-clear','click',()=>{g('js-in').value='';g('js-out').value='';g('js-msg').textContent='';});
},
'base64-tool'(){
  const show=r=>{const m=g('b6-msg');
    if(r.ok){g('b6-out').value=r.text;m.textContent='Done.';m.className='note ok';}
    else{g('b6-out').value='';m.textContent=r.error;m.className='note err';}};
  on('b6-enc','click',()=>show({ok:true,text:Core.b64enc(g('b6-in').value)}));
  on('b6-dec','click',()=>show(Core.b64dec(g('b6-in').value)));
},
'color-converter'(){
  const setAll=(rgb,src)=>{
    const r=rgb[0],gg=rgb[1],b=rgb[2],hsl=Core.rgbToHsl(r,gg,b),hex=Core.rgbToHex(r,gg,b);
    if(src!=='rgb'){g('cl-r').value=r;g('cl-g').value=gg;g('cl-b').value=b;}
    if(src!=='hsl'){g('cl-h').value=hsl[0];g('cl-s').value=hsl[1];g('cl-l').value=hsl[2];}
    if(src!=='hex')g('cl-hex').value=hex;
    g('cl-pick').value=hex;g('cl-sw').style.background=hex;
    g('cl-o-hex').value=hex.toUpperCase();g('cl-o-rgb').value='rgb('+r+', '+gg+', '+b+')';g('cl-o-hsl').value='hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';
  };
  const inr=(v,lo,hi)=>v>=lo&&v<=hi;
  on('cl-pick','input',()=>setAll(Core.hexToRgb(g('cl-pick').value),'pick'));
  on('cl-hex','input',()=>{const c=Core.hexToRgb(g('cl-hex').value);if(c)setAll(c,'hex');});
  ['r','g','b'].forEach(k=>on('cl-'+k,'input',()=>{const v=['r','g','b'].map(x=>num('cl-'+x));if(v.every(x=>inr(x,0,255)))setAll(v,'rgb');}));
  ['h','s','l'].forEach(k=>on('cl-'+k,'input',()=>{const v=['h','s','l'].map(x=>num('cl-'+x));
    if(inr(v[0],0,360)&&inr(v[1],0,100)&&inr(v[2],0,100))setAll(Core.hslToRgb(v[0],v[1],v[2]),'hsl');}));
  setAll([37,99,235],'');
}
};
const n=document.body.dataset.tool;
if(n&&T[n])T[n]();
}
