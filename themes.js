/* Avena seasonal site themes — add-on for the Avena National ID app.
   Load it AFTER the main script:  <script src="themes.js"></script>  (just before </body>)
   - Official look is always the default. Themes are switched on by hand or (optionally) by date.
   - Activating a theme for everyone needs the authorization code and syncs through the app's GitHub sync.
   - Colours used for verdicts, statuses and lockdown screens are never changed by a theme. */
(function(){
'use strict';
if(window.__avenaThemes)return;window.__avenaThemes=1;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MONn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const rnd=(a,b)=>a+Math.random()*(b-a);
const pad=n=>String(n).padStart(2,'0');
const iso=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const nowMD=()=>{const d=new Date();return pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const MD=s=>{const m=/^(\d{1,2})-(\d{1,2})$/.exec(String(s||'').trim());if(!m)return null;const a=+m[1],b=+m[2];return(a<1||a>12||b<1||b>31)?null:pad(a)+'-'+pad(b)};
const mdFmt=s=>{const [m,d]=s.split('-').map(Number);return d+' '+MONn[m-1]};
const inWin=(a,b,md)=>a<=b?(md>=a&&md<=b):(md>=a||md<=b);
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const say=m=>{if(typeof toast==='function')toast(m)};

// ---------- the themes ----------
const SEAS=[
 {id:'remembrance',name:'Remembrance Day',def:['11-04','11-11'],greet:'Lest we forget',hdr:'linear-gradient(90deg,#1c1f24,#2a2d33 60%,#3a1518)',acc:'#8b1a1a',fx:null,icon:'poppy',blobs:['#5a1015','#26282c','#33363b']},
 {id:'xmas',name:'Christmas & Winter',def:['12-01','12-26'],greet:'Season’s greetings from the Government of Avena',hdr:'linear-gradient(90deg,#123a24,#0d1b2e 55%,#4a1118)',acc:'#a8232c',fx:'snow',icon:'snow',blobs:['#a8232c','#1d6b3a','#1b3a6b']},
 {id:'newyear',name:'New Year',def:['12-27','01-03'],greet:'Happy New Year, Avena',hdr:'linear-gradient(90deg,#0d1b2e,#1c2540 55%,#5a4510)',acc:'#a67c12',fx:'spark',icon:'fox',blobs:['#a67c12','#2a3a7a','#6a2a5a']},
 {id:'national',name:'Avena National Day',def:null,greet:'Viva l’Avena — happy National Day',hdr:'linear-gradient(90deg,#8e1a24,#0e5a36 50%,#173f8f)',acc:'#1747a6',fx:'conf',icon:'fox',blobs:null},
 {id:'halloween',name:'Halloween (subtle)',def:['10-24','10-31'],greet:'Happy Halloween from Avena',hdr:'linear-gradient(90deg,#1b1026,#0d1b2e 60%,#3b1d08)',acc:'#b85a12',fx:'ember',icon:'fox',blobs:['#b85a12','#4b2a7a','#1a1a1a']},
 {id:'autumn',name:'Autumn Harvest',def:['09-22','10-23'],greet:'Autumn greetings from Avena',hdr:'linear-gradient(90deg,#3d1d09,#0d1b2e 60%,#5a3a0c)',acc:'#a4531a',fx:'leaf',icon:'leaf',blobs:['#a4531a','#7a4a0c','#5a2a0a']},
 {id:'spring',name:'Spring',def:['03-20','04-20'],greet:'Happy spring, Avena',hdr:'linear-gradient(90deg,#0f3d2e,#0d1b2e 60%,#40264a)',acc:'#2f7d52',fx:'petal',icon:'leaf',blobs:['#2f7d52','#c2688a','#6a4fa0']},
 {id:'summer',name:'Summer',def:['06-21','08-15'],greet:'Enjoy the summer, Avena',hdr:'linear-gradient(90deg,#0a3b6b,#0d1b2e 55%,#6b4a08)',acc:'#1c6fb0',fx:'sun',icon:'fox',blobs:['#1c6fb0','#d9a010','#0f8a8a']}
];
const byId=id=>SEAS.find(t=>t.id===id)||null;

// ---------- settings: GT is shared (synced), DEV stays on this device ----------
let GT=Object.assign({auto:false,id:'',t:0,dates:{},nd:''},LS.get('avena.gtheme',{}));
const DEV=Object.assign({off:false},LS.get('avena.thdev',{}));
let prev='',prevT=0;
const saveGT=()=>LS.set('avena.gtheme',GT),saveDEV=()=>LS.set('avena.thdev',DEV);
function winOf(t){
 if(t.id==='national'){const n=MD(GT.nd);if(!n)return null;const [m,d]=n.split('-').map(Number),e=new Date(2001,m-1,d+2);return[n,pad(e.getMonth()+1)+'-'+pad(e.getDate())]}
 const o=GT.dates&&GT.dates[t.id];return(o&&MD(o[0])&&MD(o[1]))?[MD(o[0]),MD(o[1])]:t.def}
function activeTheme(){
 if(DEV.off)return null;
 if(prev&&Date.now()<prevT)return byId(prev);
 if(GT.id)return byId(GT.id);
 if(GT.auto){const md=nowMD();for(const t of SEAS){const w=winOf(t);if(w&&inWin(w[0],w[1],md))return t}}
 return null}
function why(){if(DEV.off)return'Official look is forced on this device.';if(prev&&Date.now()<prevT)return'Previewing on this device only.';if(GT.id)return'Switched on by hand for every device.';if(GT.auto&&activeTheme())return'Switched on automatically by its dates.';return''}

// ---------- look ----------
const BASE=`
#thfx,.idlefx{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:20}.idlefx{position:absolute;z-index:1}
.pt{position:absolute;top:-6vh;opacity:0;will-change:transform;animation:thfall linear infinite}
@keyframes thfall{0%{transform:translate3d(0,-6vh,0) rotate(0);opacity:0}10%,90%{opacity:var(--o,.7)}100%{transform:translate3d(var(--dx,30px),108vh,0) rotate(var(--r,360deg));opacity:0}}
.pt.up{top:auto;bottom:-6vh;animation-name:thrise}@keyframes thrise{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:var(--o,.7)}100%{transform:translate3d(var(--dx,30px),-108vh,0);opacity:0}}
.pt.tw{animation-name:thtw}@keyframes thtw{0%,100%{transform:scale(.15);opacity:0}50%{transform:scale(1);opacity:var(--o,.8)}}
.pt.snow{border-radius:50%;background:#fff;box-shadow:0 0 6px #fff9}.pt.leaf{border-radius:0 100% 0 100%}.pt.petal{border-radius:70% 0 70% 0;background:#ffb7c9}.pt.conf{border-radius:1px}
.pt.spark{border-radius:50%;background:radial-gradient(circle,#fff,#ffd45a 40%,transparent 70%)}.pt.ember{border-radius:50%;background:radial-gradient(circle,#ffd08a,#ff7a1a 55%,transparent 70%)}
@media(prefers-reduced-motion:reduce),print{#thfx,.idlefx{display:none}}
#thbar{background:#2a0d10;color:#fff;text-align:center;padding:7px 12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;font-size:13px}#thbar[hidden]{display:none}
.thbadge{display:flex;align-items:center;gap:8px;padding:5px 14px;border:1px solid #ffffff33;border-radius:99px;background:#ffffff14;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#fff}.thbadge svg{width:20px;height:20px;border-radius:0}
.thg{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.thc{display:flex;flex-direction:column;border:1px solid var(--ln);border-radius:10px;overflow:hidden;background:var(--in)}.thc.on{outline:2px solid var(--bl)}.thc .sw{height:42px}.thb{padding:10px 12px;display:grid;gap:6px;align-content:start}
.thd{display:grid;grid-template-columns:1fr 90px 90px;gap:8px 10px;align-items:center;margin-top:10px}.thd input{width:100%}
.th-xmas::before,.th-newyear::before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 38%,#fffa 50%,transparent 62%) 130% 0/250% 100% no-repeat;animation:sheen 5.5s ease-in-out infinite;pointer-events:none}
.th-xmas::after,.th-newyear::after,.th-remem::after{content:'';position:absolute;inset:8px;border:2px solid var(--a2);opacity:.75;border-radius:25px;pointer-events:none}
.th-xmas .idn{color:#7a1a20}.th-newyear .idn{color:#7a5c00}.th-remem .idn{color:#6a1212}
`;
function css(t){const a=t.acc,b=t.blobs;return `header{background:${t.hdr}}
.btn.pr,.seg .on{background:${a};border-color:${a}}
.pnl{border-top:2px solid color-mix(in srgb,${a} 50%,var(--ln))}
body{background-image:radial-gradient(ellipse at 50% -8%,color-mix(in srgb,${a} 16%,transparent),transparent 58%);background-attachment:fixed}
.thbadge svg{color:${t.id==='remembrance'?'#e0262f':'#fff'}}`+(b?`
#idle .id-b.r{background:${b[0]}}#idle .id-b.g{background:${b[1]}}#idle .id-b.b{background:${b[2]}}`:'')}
const FX={snow:{cls:'snow',n:26,s:[3,8],d:[10,20],m:'fall'},leaf:{cls:'leaf',n:16,s:[10,18],d:[11,20],m:'fall',col:['#c9742a','#a4531a','#d9a441','#8a3d0f']},petal:{cls:'petal',n:18,s:[8,13],d:[11,20],m:'fall',col:['#ffb7c9','#ffd6e0','#f4a6c0']},conf:{cls:'conf',n:24,s:[4,8],d:[9,16],m:'fall',col:['#c8202f','#138a4b','#1747a6','#ffffff']},spark:{cls:'spark',n:22,s:[8,18],d:[3,7],m:'tw'},sun:{cls:'spark',n:14,s:[8,16],d:[4,9],m:'tw'},ember:{cls:'ember',n:18,s:[4,9],d:[8,16],m:'up'}};
function fxFill(el,k){if(!el)return;el.textContent='';const f=FX[k];if(!f)return;const n=innerWidth<700?Math.ceil(f.n/2):f.n;
 for(let i=0;i<n;i++){const s=document.createElement('i'),sz=rnd(f.s[0],f.s[1]);s.className='pt '+f.cls+(f.m==='tw'?' tw':f.m==='up'?' up':'');
  s.style.cssText=`left:${rnd(0,100).toFixed(1)}%;width:${sz.toFixed(1)}px;height:${(f.cls==='conf'?sz*1.7:sz).toFixed(1)}px;animation-duration:${rnd(f.d[0],f.d[1]).toFixed(1)}s;animation-delay:-${rnd(0,f.d[1]).toFixed(1)}s;--dx:${Math.round(rnd(-60,60))}px;--r:${Math.round(rnd(180,720))}deg;--o:${(.45+Math.random()*.4).toFixed(2)}`+(f.m==='tw'?`;top:${rnd(5,90).toFixed(0)}%`:'')+(f.col?`;background:${f.col[Math.floor(Math.random()*f.col.length)]}`:'');
  el.appendChild(s)}}
let key='';
function apply(t){
 [...document.body.classList].forEach(c=>{if(c.indexOf('site-')===0)document.body.classList.remove(c)});
 const st=$('#thstyle'),old=$('#thbadge'),meta=document.querySelector('meta[name=theme-color]');if(old)old.remove();
 if(!t){st.textContent='';fxFill($('#thfx'),null);fxFill($('#thfx2'),null);if(meta)meta.content='#0d1b2e';return}
 document.body.classList.add('site-'+t.id);st.textContent=css(t);
 const bd=document.createElement('div');bd.id='thbadge';bd.className='thbadge';bd.innerHTML=`<svg><use href="#${t.icon}"/></svg><span>${esc(t.greet)}</span>`;
 const h1=document.querySelector('.hw h1');if(h1&&h1.parentElement)h1.parentElement.insertAdjacentElement('afterend',bd);
 fxFill($('#thfx'),t.fx);fxFill($('#thfx2'),t.fx);if(meta)meta.content='#1c1f24'}
function silence(){const t=activeTheme(),el=$('#thbar');let on=false;
 if(t&&t.id==='remembrance'){const w=winOf(t),d=new Date(),m=d.getHours()*60+d.getMinutes();on=!!w&&nowMD()===w[1]&&m>=650&&m<=665}
 el.hidden=!on;if(on)el.textContent='11:00 · A moment of silence'}
function refresh(force){const t=activeTheme(),k=(t?t.id:'')+'|'+iso();if(!force&&k===key){silence();return}key=k;apply(t);silence()}

// ---------- settings panel ----------
function build(){
 const sec=document.createElement('section');sec.className='pnl cl';sec.id='themes';
 sec.innerHTML=`<h2>Site Themes</h2><p class="mu" style="margin:0 0 12px">The Official look is the default. Pick a seasonal theme to switch it on for every connected device, or let themes switch on by their dates. Verdict colours, statuses, lockdown screens and printed cards are never changed by a theme.</p>
<div id="th_now" class="mu" style="margin-bottom:10px;font-size:14px"></div><div class="thg" id="th_list"></div>
<div class="row" style="margin-top:14px"><label class="sh"><input type="checkbox" id="th_auto"> Switch themes on automatically on their dates (all devices)</label></div>
<div class="row" style="margin-top:6px"><label class="sh"><input type="checkbox" id="th_off"> Always show the Official look on this device</label></div>
<div class="row" style="margin-top:12px"><span class="mu">Avena National Day (month-day)</span><input type="text" id="th_nd" placeholder="MM-DD" maxlength="5" style="width:90px"><button class="btn sm" id="th_ndb">Save date</button><span class="mu">The theme shows for 3 days from this date.</span></div>
<details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600">Change the dates themes switch on</summary><div class="thd" id="th_dates"></div><div class="row" style="margin-top:10px"><button class="btn sm pr" id="th_dsv">Save dates</button><span class="er" id="th_derr"></span></div></details>`;
 const set=$('#set');if(set)set.insertAdjacentElement('beforebegin',sec);else($('main')||document.body).appendChild(sec);
 const sl=document.querySelector('a[href="#set"]');if(sl)sl.insertAdjacentHTML('afterend','<a href="#themes" class="btn" style="text-decoration:none">Themes</a>');
 sec.addEventListener('click',onClick);$('#th_auto').onchange=async e=>{const on=e.target.checked;if(!await setGlobal({auto:on,id:on?'':GT.id}))e.target.checked=!on};
 $('#th_off').onchange=e=>{DEV.off=e.target.checked;saveDEV();refresh(true);panel()};
 $('#th_ndb').onclick=async()=>{const v=$('#th_nd').value.trim(),n=MD(v);if(v&&!n){say('Use month-day like 07-01');return}if(await setGlobal({nd:n||''}))say(n?'National Day set to '+mdFmt(n):'National Day date cleared')};
 $('#th_dsv').onclick=async()=>{const dates={};let bad='';SEAS.forEach(t=>{if(t.id==='national')return;const a=MD($(`#thd_${t.id}_a`).value),b=MD($(`#thd_${t.id}_b`).value);if(!a||!b)bad=t.name;else if(a!==t.def[0]||b!==t.def[1])dates[t.id]=[a,b]});
  if(bad){$('#th_derr').textContent='Check the dates for '+bad+' (month-day, like 12-01).';return}$('#th_derr').textContent='';if(await setGlobal({dates}))say('Dates saved')}}
function panel(){const cur=activeTheme(),box=$('#th_list');if(!box)return;
 const card=t=>{const w=winOf(t),when=t.id==='national'&&!w?'Set a date below':w?mdFmt(w[0])+' – '+mdFmt(w[1]):'',on=cur&&cur.id===t.id;
  return `<div class="thc${on?' on':''}"><div class="sw" style="background:${t.hdr}"></div><div class="thb"><b>${esc(t.name)}</b><span class="mu">${when}</span>${on?'<span class="tag" style="width:max-content">Showing now</span>':''}<div class="row"><button class="btn sm pr" data-th="act" data-id="${t.id}">Activate</button><button class="btn sm" data-th="pre" data-id="${t.id}">Preview here</button></div></div></div>`};
 box.innerHTML=`<div class="thc${!cur?' on':''}"><div class="sw" style="background:#0d1b2e"></div><div class="thb"><b>Official</b><span class="mu">The standard government look</span>${!cur?'<span class="tag" style="width:max-content">Showing now</span>':''}<div class="row"><button class="btn sm pr" data-th="off">Use Official</button></div></div></div>`+SEAS.map(card).join('');
 $('#th_now').innerHTML=(cur?'<b>'+esc(cur.name)+'</b> is showing. '+why():'The Official look is showing.')+(prev&&Date.now()<prevT?' <button class="btn sm" data-th="stop">Stop preview</button>':'');
 $('#th_auto').checked=!!GT.auto;$('#th_off').checked=!!DEV.off;$('#th_nd').value=GT.nd||'';
 $('#th_dates').innerHTML=SEAS.filter(t=>t.id!=='national').map(t=>{const w=winOf(t);return `<span>${esc(t.name)}</span><input type="text" id="thd_${t.id}_a" value="${w[0]}" maxlength="5"><input type="text" id="thd_${t.id}_b" value="${w[1]}" maxlength="5">`}).join('')}
async function onClick(e){const b=e.target.closest('[data-th]');if(!b)return;const a=b.dataset.th,id=b.dataset.id;
 if(a==='act'){if(await setGlobal({id,auto:false}))say(byId(id).name+' is now on for every device')}
 else if(a==='off'){if(await setGlobal({id:'',auto:false}))say('Back to the Official look')}
 else if(a==='pre'){prev=id;prevT=Date.now()+60000;refresh(true);panel();setTimeout(()=>{if(Date.now()>=prevT){prev='';refresh(true);panel()}},60500)}
 else if(a==='stop'){prev='';refresh(true);panel()}}
async function setGlobal(patch){
 if(typeof askCode==='function'&&!await askCode('Authorization required to change the site theme for every device.'))return false;
 GT=Object.assign({},GT,patch,{t:Date.now()});saveGT();prev='';refresh(true);panel();
 try{if(typeof S!=='undefined'&&S&&typeof schedulePush==='function')schedulePush()}catch(e){}return true}
function remote(t){if(!t||(t.t||0)<=(GT.t||0))return;GT=Object.assign({auto:false,id:'',dates:{},nd:''},t);saveGT();refresh(true);panel()}

// ---------- card styles that match the themes (limited editions) ----------
function inst(a,b){const y=new Date().getFullYear(),td=iso();for(const yy of[y-1,y,y+1]){const e=(b<a?yy+1:yy)+'-'+b;if(e>=td)return{from:yy+'-'+a,to:e}}return{from:y+'-'+a,to:y+'-'+b}}
function cardStyles(){
 if(typeof THEMES==='undefined'||!Array.isArray(THEMES))return;
 const dc=typeof deco==='function'?deco:()=>'',def=(o,a,b)=>{if(THEMES.some(x=>x.id===o.id))return;Object.defineProperty(o,'from',{get:()=>inst(a,b).from,enumerable:true});Object.defineProperty(o,'to',{get:()=>inst(a,b).to,enumerable:true});THEMES.push(o)};
 def({id:'xmas',name:'Christmas Edition',ed:'CHRISTMAS EDITION',a1:'#123a24',a2:'#a8232c',cbg:'linear-gradient(135deg,#fffdf9,#f4ece2 55%,#e4efe6)',deco:dc('snow',['right:60px;top:170px;width:96px','right:150px;top:330px;width:64px','right:28px;top:380px;width:52px'])},'12-01','12-26');
 def({id:'newyear',name:'New Year Edition',ed:'NEW YEAR EDITION',a1:'#1c2540',a2:'#a67c12',cbg:'linear-gradient(135deg,#fffdf6,#f3ead0 55%,#e8dcb0)',deco:''},'12-27','01-03');
 def({id:'remem',name:'Remembrance Edition',ed:'REMEMBRANCE EDITION',a1:'#262a30',a2:'#8b1a1a',cbg:'linear-gradient(135deg,#fbfbfb,#ececec 55%,#e0e0e0)',deco:dc('poppy',['right:70px;top:176px;width:90px','right:30px;top:300px;width:56px','right:140px;top:392px;width:70px'])},'11-04','11-11');
 const s=document.querySelector('[data-k=style]');if(s&&typeof themeOpts==='function'){const v=s.value;s.innerHTML=themeOpts(v);s.value=v}}

// ---------- start ----------
function init(){
 const st=document.createElement('style');st.id='thbase';st.textContent=BASE;document.head.appendChild(st);
 const st2=document.createElement('style');st2.id='thstyle';document.head.appendChild(st2);
 const defs=document.querySelector('svg[aria-hidden="true"] defs');
 if(defs&&!document.getElementById('poppy'))defs.insertAdjacentHTML('beforeend','<symbol id="poppy" viewBox="0 0 64 64"><g fill="#d9232d"><circle cx="22" cy="22" r="15"/><circle cx="42" cy="22" r="15"/><circle cx="22" cy="42" r="15"/><circle cx="42" cy="42" r="15"/></g><circle cx="32" cy="32" r="7.5" fill="#111"/><g fill="#111"><circle cx="32" cy="21" r="1.6"/><circle cx="32" cy="43" r="1.6"/><circle cx="21" cy="32" r="1.6"/><circle cx="43" cy="32" r="1.6"/></g></symbol>');
 const fx=document.createElement('div');fx.id='thfx';fx.setAttribute('aria-hidden','true');document.body.appendChild(fx);
 const idle=$('#idle');if(idle){const f2=document.createElement('div');f2.id='thfx2';f2.className='idlefx';f2.setAttribute('aria-hidden','true');idle.insertBefore(f2,idle.firstChild)}
 const bar=document.createElement('div');bar.id='thbar';bar.hidden=true;const hd=document.querySelector('header');if(hd)hd.insertAdjacentElement('afterend',bar);else document.body.insertBefore(bar,document.body.firstChild);
 build();cardStyles();panel();refresh(true);
 setInterval(()=>refresh(false),30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
 // greeting on the idle screen
 if(typeof idleLines==='function'){const il=idleLines;window.idleLines=function(){const L=il.apply(this,arguments),t=activeTheme();if(t){L.splice(L[0]&&/lockdown/i.test(L[0])?1:0,0,t.greet)}return L}}
 // share the theme through the app's GitHub sync (rides along inside the encrypted data file)
 if(typeof window.seal==='function'&&typeof window.unseal==='function'){const sl=window.seal,un=window.unseal;
  window.seal=function(o,pw){if(GT.t)o=Object.assign({},o,{theme:GT});return sl.call(this,o,pw)};
  window.unseal=async function(d,pw){const r=await un.call(this,d,pw);try{if(r&&r.theme)remote(r.theme)}catch(e){}return r}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
