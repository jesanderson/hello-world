(function(){
"use strict";
var W=1920,H=1080,KEY="east_screen_v1";
var $=function(s){return document.querySelector(s);};

// ---------- saved settings (this browser only) ----------
var st=(function(){
  var d={day:"auto",section:"auto",voice:0,cares:"Cooperation",sound:"calypso",sheetUrl:"",seatingUrl:"",sheetCache:null};
  try{var s=JSON.parse(localStorage.getItem(KEY)||"{}");for(var k in s)d[k]=s[k];}catch(e){}
  return d;
})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}

// ---------- helpers ----------
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function safeUrl(u){u=String(u||"").trim();return /^https?:\/\//i.test(u)?u:"";}
function pad(n){return String(n).padStart(2,"0");}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function parseYmd(s){var p=s.split("-").map(Number);return new Date(p[0],p[1]-1,p[2]);}
function normDate(s){
  s=String(s||"").trim();if(!s)return "";
  if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)){var a=s.split("-");return a[0]+"-"+pad(+a[1])+"-"+pad(+a[2]);}
  var m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(m){var y=+m[3];if(y<100)y+=2000;return y+"-"+pad(+m[1])+"-"+pad(+m[2]);}
  return "";
}
function fmtDt(s){return parseYmd(s).toLocaleDateString("en-US",{weekday:"short",month:"numeric",day:"numeric"});}
function toMin(s){var p=s.split(":");return +p[0]*60+ +p[1];}
function fmt12(s){var p=s.split(":"),h=+p[0];return (h>12?h-12:h)+":"+p[1];}
function soon(){return '<span class="ph">Coming soon <i>/ Próximamente</i></span>';}
function bi(en,es){return en?'<div class="en">'+esc(en)+'</div>'+(es?'<div class="es">'+esc(es)+'</div>':""):soon();}

// ---------- lesson data (built-in + Google Sheet) ----------
var sheetMsg="";
function sheetRows(){return (st.sheetCache&&st.sheetCache.rows)||{};}
function sheetUrl(){
  var p=new URLSearchParams(location.search).get("sheet");
  var u=safeUrl(st.sheetUrl||p||CLASS_INFO.sheetCsvUrl);
  // A regular Sheet link (shared "anyone with the link can view") is read through Google's CSV endpoint.
  var m=u.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if(m&&m[1]!=="e")return "https://docs.google.com/spreadsheets/d/"+m[1]+"/gviz/tq?tqx=out:csv&headers=1";
  return u;
}
function videoUrl(d){return safeUrl((d&&d.videoUrl)||st.videoUrl||CLASS_INFO.videoUrl);}
function ytId(u){var m=String(u||"").match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);return m?m[1]:"";}
function seatUrl(){return safeUrl(st.seatingUrl||CLASS_INFO.seatingUrl);}
function dayNums(){
  var set={};U2.forEach(function(u){set[u.n]=1;});
  Object.keys(sheetRows()).forEach(function(k){set[k]=1;});
  return Object.keys(set).map(Number).sort(function(a,b){return a-b;});
}
function getDay(n){
  var d=baseDay(n);
  if(!d){d={};for(var k in DAY_DEFAULTS)d[k]=DAY_DEFAULTS[k];d.day=n;d.date="";d.topic="";d.standards="";d.studysync="";d.lessonPlanUrl=CLASS_INFO.planFolder;}
  var r=sheetRows()[n];
  if(r){for(var c in r){var v=String(r[c]==null?"":r[c]).trim();if(v!=="")d[c]=v;}}
  d.date=normDate(d.date);
  d.doNowMins=parseInt(d.doNowMins,10)||5;
  var ov=(st.dnOv||{})[n];if(ov){d.doNow=ov.doNow;d.doNowEs=ov.doNowEs||"";d.dnOv=true;}
  return d;
}
function currentDayN(now){
  var nums=dayNums();
  if(st.day!=="auto"&&nums.indexOf(st.day)>-1)return st.day;
  var t=ymd(now);
  for(var i=0;i<nums.length;i++){var d=getDay(nums[i]);if(d.date&&d.date>=t)return nums[i];}
  return nums[nums.length-1];
}
function sectionInfo(now){
  var m=now.getHours()*60+now.getMinutes(),sec=null;
  for(var i=0;i<SECTIONS.length;i++){var s=SECTIONS[i];
    if(st.section==="auto"?(m>=toMin(s.start)&&m<toMin(s.end)):s.id===st.section){sec=s;break;}}
  var minsIn=null,left=null;
  if(sec&&m>=toMin(sec.start)&&m<toMin(sec.end)){minsIn=m-toMin(sec.start);left=toMin(sec.end)-m;}
  return {sec:sec,minsIn:minsIn,left:left};
}
function agendaItems(d){
  return (d.agenda||AGENDA_DEFAULT).split("|").map(function(x){return x.trim();}).filter(Boolean).map(function(raw){
    var m=raw.match(/^(\d+)\s*-\s*(\d+)\s+(.*)$/),text=m?m[3]:raw,p=text.split("/");
    return {a:m?+m[1]:null,b:m?+m[2]:null,en:p[0].trim(),es:(p[1]||"").trim()};
  });
}
function stdItems(d){
  var s=String(d.standards||"").trim();if(!s)return [];
  var parts=s.indexOf("|")>-1?s.split(/\n|;/):s.split(/[,;\n]/);
  return parts.map(function(p){return p.trim();}).filter(Boolean).map(function(p){
    var i=p.indexOf("|");
    return i>-1?{code:p.slice(0,i).trim(),text:p.slice(i+1).trim()}:{code:p,text:STD[p]||""};
  });
}
function words(d){
  var en=String(d.wordBank||"").split(",").map(function(s){return s.trim();}).filter(Boolean);
  var es=String(d.wordBankEs||"").split(",").map(function(s){return s.trim();});
  return en.map(function(w,i){return {w:w,es:es[i]||""};});
}
function vocab(w){return VOCAB[w]||VOCAB[w.toLowerCase()]||null;}

// ---------- Google Sheet loading ----------
function parseCSV(t){
  var rows=[],row=[],f="",q=false;
  for(var i=0;i<t.length;i++){var c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;
    else if(c===","){row.push(f);f="";}
    else if(c==="\n"){row.push(f);rows.push(row);row=[];f="";}
    else if(c!=="\r")f+=c;
  }
  if(f!==""||row.length){row.push(f);rows.push(row);}
  return rows;
}
function setSheetMsg(m){sheetMsg=m;var el=$("#sheetMsg");if(el)el.textContent=m;}
function loadSheet(){
  var u=sheetUrl();
  if(!u){setSheetMsg("No Sheet linked yet. Using the built-in lessons.");return;}
  setSheetMsg("Loading the Sheet…");
  fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("error "+r.status);return r.text();}).then(function(t){
    if(/^\s*</.test(t))throw new Error("that link is a web page, not a CSV");
    var rows=parseCSV(t),head=(rows.shift()||[]).map(function(h){return h.trim().toLowerCase();});
    var keyOf={};SHEET_COLUMNS.forEach(function(c){keyOf[c.toLowerCase()]=c;});
    var out={};
    rows.forEach(function(r){
      var o={};head.forEach(function(h,i){if(keyOf[h])o[keyOf[h]]=r[i]==null?"":r[i];});
      var n=parseInt(o.day,10);if(n)out[n]=o;
    });
    if(!Object.keys(out).length)throw new Error("no rows with a day number");
    st.sheetCache={rows:out,at:Date.now()};save();
    setSheetMsg("Loaded "+Object.keys(out).length+" days at "+new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+".");
    render();if(OV&&OV!=="settings")renderOv();
  }).catch(function(e){
    setSheetMsg("Could not load the Sheet ("+e.message+"). Check that it is shared as Anyone with the link can view. Using the last saved copy for now.");
  });
}

// ---------- sound (built in, no files) ----------
var AC=null;
function ensureAudio(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){}}
function mf(m){return 440*Math.pow(2,(m-69)/12);}
function note(out,t,f,dur,vol,parts,type){
  parts.forEach(function(p){
    var o=AC.createOscillator(),g=AC.createGain();
    o.type=type||"sine";o.frequency.value=f*p[0];
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol*p[1],t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur*(p[2]||1));
    o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+0.1);
  });
}
var SOUNDS=[["calypso","Calypso"],["ocean","Ocean waves"],["marimba","Marimba"],["off","No sound"]];
// Soundboard: id, English, Spanish, icon. Attention getters first.
var BOARD=[["eagle","Eagle","Águila","🦅"],["chime","Attention chime","Campanitas","🔔"],["bowl","Quiet bowl","Cuenco de calma","🧘"],
  ["countdown","3, 2, 1","3, 2, 1","⏱️"],["doorbell","Ding-dong","Timbre","🛎️"],["airhorn","Air horn","Bocina","📯"],["drumroll","Drumroll","Redoble","🥁"],
  ["correct","Correct!","¡Correcto!","✅"],["wrong","Try again","Intenta otra vez","❌"],["levelup","Level up!","¡Subiste de nivel!","⭐"],
  ["tada","Ta-da!","¡Tarán!","🎉"],["applause","Applause","Aplausos","👏"],["sadtrombone","Sad trombone","Trombón triste","🎺"],["dundun","Dun dun DUN","Momento dramático","😮"],
  ["crickets","Crickets","Grillos","🦗"],["boom","Boom","Bum","💥"],["scratch","Record scratch","Rayón de disco","💿"],["rimshot","Ba-dum-tss","Ba-dum-tss","😂"],
  ["waterfall","Waterfall","Cascada","🏞️"],["rain","Rain","Lluvia","🌧️"],["thunder","Thunder","Trueno","⛈️"],["birds","Birdsong","Pájaros","🐦"],
  ["windchimes","Wind chimes","Campanas de viento","🎐"],["gong","Gong","Gong","🌕"],["schoolbell","School bell","Timbre escolar","🏫"],["whistle","Whistle","Silbato","⚽"],
  ["clock","Clock ticking","Reloj","🕰️"],["sparkle","Magic sparkle","Magia","✨"],
  ["avalanche","Avalanche","Avalancha","🏔️"],["chickens","Chickens","Gallinas","🐔"],["battle","Battle sounds","Sonidos de batalla","⚔️"],
  ["calypso","Calypso","Calipso","🌴"],["ocean","Ocean waves","Olas del mar","🌊"],["marimba","Marimba","Marimba","🎵"]];
var bus=null,fileAudio=[];
function getBus(){if(!bus){bus=AC.createGain();bus.gain.value=1;bus.connect(AC.destination);}return bus;}
function stopSounds(){if(bus){try{bus.disconnect();}catch(e){}bus=null;}fileAudio.forEach(function(a){try{a.pause();}catch(e){}});fileAudio=[];}
function noiseBuf(sec){var b=AC.createBuffer(1,Math.floor(AC.sampleRate*sec),AC.sampleRate),c=b.getChannelData(0);for(var i=0;i<c.length;i++)c[i]=Math.random()*2-1;return b;}
function noise(out,t,sec,type,freq,env,q){
  var s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=noiseBuf(sec);f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
  g.gain.setValueAtTime(0.0001,t);env(g.gain,t);
  s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+sec);
  return f;
}
function reverb(out,sec,decay){
  var c=AC.createConvolver(),len=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,len,AC.sampleRate);
  for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
  c.buffer=b;c.connect(out);return c;
}
function hit(out,t,vol,decay){return function(p){p.exponentialRampToValueAtTime(vol,t+0.004);p.exponentialRampToValueAtTime(0.0001,t+decay);};}
function tom(out,t,f0,f1,dur,vol){
  var o=AC.createOscillator(),g=AC.createGain();o.type="sine";
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+0.05);
}
function crash(out,t,vol,dur){
  noise(out,t,dur,"highpass",5000,function(p,t){p.exponentialRampToValueAtTime(vol,t+0.005);p.exponentialRampToValueAtTime(0.0001,t+dur);});
  noise(out,t,dur*0.6,"bandpass",9000,function(p,t){p.exponentialRampToValueAtTime(vol*0.6,t+0.005);p.exponentialRampToValueAtTime(0.0001,t+dur*0.6);},0.7);
}
// A raspy, descending hawk-style scream: several detuned sawtooth voices,
// fast amplitude flutter for the rasp, breath noise, and outdoor reverb.
function hawk(out,wet,t,dur,f0,f1,vol,deep){
  var am=AC.createGain(),hp=AC.createBiquadFilter(),pk=AC.createBiquadFilter(),g=AC.createGain();
  hp.type="highpass";hp.frequency.value=deep?550:1100;pk.type="peaking";pk.frequency.value=deep?1900:3200;pk.gain.value=9;pk.Q.value=1.2;
  am.gain.value=0.55;
  var fl=AC.createOscillator(),fg=AC.createGain();fl.type="square";fl.frequency.setValueAtTime(deep?70:95,t);fl.frequency.linearRampToValueAtTime(deep?105:140,t+dur);
  fg.gain.value=0.45;fl.connect(fg);fg.connect(am.gain);fl.start(t);fl.stop(t+dur+0.05);
  var vib=AC.createOscillator(),vg=AC.createGain();vib.frequency.value=9;vg.gain.value=40;vib.connect(vg);vib.start(t);vib.stop(t+dur+0.05);
  [-14,0,11].forEach(function(det){
    var o=AC.createOscillator();o.type="sawtooth";o.detune.value=det;
    o.frequency.setValueAtTime(f0*0.8,t);o.frequency.linearRampToValueAtTime(f0,t+0.1);
    o.frequency.linearRampToValueAtTime(f0*0.96,t+dur*0.3);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    vg.connect(o.frequency);o.connect(am);o.start(t);o.stop(t+dur+0.05);
  });
  var env=function(p,t,v){p.setValueAtTime(0.0001,t);p.exponentialRampToValueAtTime(v,t+0.06);p.setValueAtTime(v,t+dur*0.4);p.exponentialRampToValueAtTime(v*0.6,t+dur*0.75);p.exponentialRampToValueAtTime(0.0001,t+dur);};
  env(g.gain,t,vol);
  am.connect(hp);hp.connect(pk);pk.connect(g);g.connect(out);g.connect(wet);
  var br=noise(g,t,dur,"bandpass",3400,function(p,t){p.exponentialRampToValueAtTime(0.5,t+0.06);p.exponentialRampToValueAtTime(0.0001,t+dur);},1.5);
}
function brass(out,t,midi,dur,vol,bend){
  var lp=AC.createBiquadFilter(),g=AC.createGain();lp.type="lowpass";lp.frequency.setValueAtTime(500,t);lp.frequency.linearRampToValueAtTime(1800,t+0.08);lp.frequency.linearRampToValueAtTime(900,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.04);g.gain.setValueAtTime(vol,t+dur*0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  [0,-7,6].forEach(function(det){var o=AC.createOscillator();o.type="sawtooth";o.detune.value=det;o.frequency.setValueAtTime(mf(midi),t);if(bend)o.frequency.linearRampToValueAtTime(mf(midi)*bend,t+dur);o.connect(lp);o.start(t);o.stop(t+dur+0.05);});
  lp.connect(g);g.connect(out);return lp;
}
function playSound(name){
  ensureAudio();if(!AC||name==="off")return;
  if(typeof SOUND_FILES!=="undefined"&&SOUND_FILES[name]){var a=new Audio(SOUND_FILES[name]);fileAudio.push(a);a.play().catch(function(){});return;}
  var out=AC.createGain();out.gain.value=0.6;out.connect(getBus());
  var t0=AC.currentTime+0.05,bell=[[1,1],[2.76,.35,.6],[5.4,.15,.4]],i,s;
  switch(name){
  case "calypso":
    var e=0.17,pan=[[1,1],[2,.45,.7],[3,.16,.45]],bass=[[1,.7],[2,.12,.6]];
    var mel=[[0,67],[1,72],[2,76],[3,79],[4.5,76],[5,79],[6,81],[7,79],[8,77],[9.5,74],[10,76],[11,74],[12,72]];
    var low=[[0,48],[2,55],[4,53],[6,53],[8,55],[10,55],[12,48]];
    [0,13*e+0.3].forEach(function(off){
      mel.forEach(function(m,i){note(out,t0+off+m[0]*e,mf(m[1]),i===mel.length-1?1.4:0.7,.28,pan);});
      low.forEach(function(m){note(out,t0+off+m[0]*e,mf(m[1]),0.45,.35,bass,"triangle");});
    });break;
  case "ocean":
    var len=7,buf=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),ch=buf.getChannelData(0),last=0;
    for(i=0;i<ch.length;i++){last=(last+0.02*(Math.random()*2-1))/1.02;ch[i]=last*3.5;}
    var src=AC.createBufferSource(),lp=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=buf;lp.type="lowpass";lp.frequency.value=700;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(.9,t0+1.8);g.gain.linearRampToValueAtTime(.2,t0+3.3);
    g.gain.linearRampToValueAtTime(.8,t0+5);g.gain.linearRampToValueAtTime(0.0001,t0+len);
    src.connect(lp);lp.connect(g);g.connect(out);src.start(t0);src.stop(t0+len);
    [1.4,4.8].forEach(function(s){note(out,t0+s,1046.5,2.6,.12,[[1,1],[1.5,.5]]);});break;
  case "marimba":
    [0,1.1].forEach(function(off){[72,76,79,84].forEach(function(m,i){note(out,t0+off+i*0.15,mf(m),0.6,.4,[[1,1],[4,.12,.3]]);});});break;
  case "eagle":
    // Deep, majestic call over a canyon: wind, a wing sweep, a long low scream, and echoes
    var rv=reverb(out,4.5,2.2),wet=AC.createGain();wet.gain.value=0.55;wet.connect(rv);
    var dl=AC.createDelay(1),fb=AC.createGain(),dlp=AC.createBiquadFilter();dl.delayTime.value=0.42;fb.gain.value=0.38;dlp.type="lowpass";dlp.frequency.value=2200;
    wet.connect(dl);dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(out);
    noise(out,t0,6,"lowpass",450,function(p,t){p.linearRampToValueAtTime(0.25,t+1.5);p.linearRampToValueAtTime(0.15,t+4);p.linearRampToValueAtTime(0.0001,t+6);});
    var ws=noise(out,t0,0.9,"bandpass",300,function(p,t){p.exponentialRampToValueAtTime(0.5,t+0.35);p.exponentialRampToValueAtTime(0.0001,t+0.9);},1.2);
    ws.frequency.setValueAtTime(250,t0);ws.frequency.exponentialRampToValueAtTime(1400,t0+0.45);ws.frequency.exponentialRampToValueAtTime(400,t0+0.9);
    hawk(out,wet,t0+0.6,2.5,2100,900,.45,true);
    hawk(out,wet,t0+3.4,1.7,1900,950,.3,true);break;
  case "chime":
    [84,88,91].forEach(function(m,i){note(out,t0+i*0.35,mf(m),2.4,.3,bell);});break;
  case "bowl":
    note(out,t0,196,7,.35,[[1,1],[2.71,.45,.7],[5.2,.18,.5]]);note(out,t0,196*1.004,7,.25,[[1,1],[2.71,.3,.7]]);break;
  case "countdown":
    [0,1,2].forEach(function(s){note(out,t0+s,880,0.3,.35,[[1,1]]);});note(out,t0+3,1760,0.9,.4,[[1,1],[2,.2]]);break;
  case "doorbell":
    note(out,t0,mf(76),1.8,.4,bell);note(out,t0+0.6,mf(72),2.2,.4,bell);break;
  case "drumroll":
    // Timpani roll that builds, then a big hit and cymbal crash
    var rv2=reverb(out,2,2.5),w2=AC.createGain();w2.gain.value=0.3;w2.connect(rv2);
    for(s=0;s<2.2;s+=0.06){var v=0.12+0.55*(s/2.2);tom(out,t0+s,105,78,0.3,v);tom(w2,t0+s,105,78,0.3,v*0.5);
      noise(out,t0+s,0.05,"lowpass",700,hit(out,t0+s,v*0.25,0.05));}
    tom(out,t0+2.25,95,45,1.6,0.9);tom(w2,t0+2.25,95,45,1.6,0.5);crash(out,t0+2.25,0.45,2.8);break;
  case "tada":
    var lp2=AC.createBiquadFilter();lp2.type="lowpass";lp2.frequency.value=2400;lp2.connect(out);
    [60,64,67,72].forEach(function(m){note(lp2,t0,mf(m),0.16,.08,[[1,1]],"sawtooth");note(lp2,t0+0.22,mf(m),1.4,.09,[[1,1]],"sawtooth");});break;
  case "airhorn":
    var sh=AC.createWaveShaper(),cv=new Float32Array(256);for(i=0;i<256;i++){var x=i/128-1;cv[i]=Math.tanh(3*x);}sh.curve=cv;sh.connect(out);
    [[0,0.28],[0.36,0.28],[0.72,1.1]].forEach(function(b){[0,1].forEach(function(k){var o=AC.createOscillator(),g=AC.createGain();o.type="sawtooth";
      o.frequency.setValueAtTime(k?587:466,t0+b[0]);o.frequency.linearRampToValueAtTime((k?587:466)*0.97,t0+b[0]+b[1]);
      g.gain.setValueAtTime(0.0001,t0+b[0]);g.gain.exponentialRampToValueAtTime(0.16,t0+b[0]+0.02);g.gain.setValueAtTime(0.16,t0+b[0]+b[1]-0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+b[0]+b[1]);
      o.connect(g);g.connect(sh);o.start(t0+b[0]);o.stop(t0+b[0]+b[1]+0.05);});});break;
  case "correct":
    note(out,t0,mf(88),0.9,.35,bell);note(out,t0+0.14,mf(93),1.4,.35,bell);break;
  case "wrong":
    [110,116.5].forEach(function(f){var o=AC.createOscillator(),g=AC.createGain(),l=AC.createBiquadFilter();o.type="square";o.frequency.value=f;l.type="lowpass";l.frequency.value=1400;
      g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.12,t0+0.02);g.gain.setValueAtTime(0.12,t0+0.7);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.8);
      o.connect(l);l.connect(g);g.connect(out);o.start(t0);o.stop(t0+0.85);});break;
  case "levelup":
    [60,64,67,72,76,79,84].forEach(function(m,i){note(out,t0+i*0.07,mf(m),0.12,.12,[[1,1]],"square");});
    [72,76,79,84].forEach(function(m){note(out,t0+0.55,mf(m),0.8,.07,[[1,1]],"square");});break;
  case "applause":
    for(s=0;s<3.2;s+=0.012+Math.random()*0.02){var a=Math.min(1,s/0.5)*Math.min(1,(3.2-s)/1.2);
      noise(out,t0+s,0.05,"bandpass",1200+Math.random()*1400,hit(out,t0+s,0.05+0.25*a*Math.random(),0.04),0.9);}break;
  case "sadtrombone":
    [[62,0,0.45],[61,0.5,0.45],[60,1.0,0.45],[59,1.5,1.4]].forEach(function(n){
      var f=brass(out,t0+n[1],n[0]-12,n[2],0.2);
      if(n[2]>1){var w=AC.createOscillator(),wg=AC.createGain();w.frequency.value=6;wg.gain.value=300;w.connect(wg);wg.connect(f.frequency);w.start(t0+n[1]+0.3);w.stop(t0+n[1]+n[2]);}});break;
  case "dundun":
    [[0,0.28],[0.4,0.28],[0.8,2.2]].forEach(function(b,k){var ch=k<2?[43,55]:[39,51,58];ch.forEach(function(m){brass(out,t0+b[0],m,b[1],0.12);});tom(out,t0+b[0],90,50,k<2?0.4:1.2,0.6);});break;
  case "crickets":
    for(s=0;s<4;s+=0.55+Math.random()*0.15){[0,1].forEach(function(k){for(var p=0;p<3;p++){var tt=t0+s+k*0.27+p*0.035;
      var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=k?4300:4700;g.gain.setValueAtTime(0.0001,tt);g.gain.exponentialRampToValueAtTime(0.05,tt+0.005);g.gain.exponentialRampToValueAtTime(0.0001,tt+0.025);
      o.connect(g);g.connect(out);o.start(tt);o.stop(tt+0.03);}});}break;
  case "boom":
    var sh2=AC.createWaveShaper(),c2=new Float32Array(256);for(i=0;i<256;i++){var y=i/128-1;c2[i]=Math.tanh(2.5*y);}sh2.curve=c2;sh2.connect(out);
    tom(sh2,t0,90,32,1.6,1);noise(out,t0,0.08,"lowpass",1500,hit(out,t0,0.5,0.08));break;
  case "scratch":
    var sf=noise(out,t0,0.7,"bandpass",1000,function(p,t){p.exponentialRampToValueAtTime(0.9,t+0.01);p.setValueAtTime(0.9,t+0.6);p.exponentialRampToValueAtTime(0.0001,t+0.7);},3);
    sf.frequency.setValueAtTime(600,t0);sf.frequency.linearRampToValueAtTime(2800,t0+0.18);sf.frequency.linearRampToValueAtTime(700,t0+0.36);sf.frequency.linearRampToValueAtTime(3200,t0+0.6);break;
  case "waterfall":
    var wl=10,wb=AC.createBuffer(2,AC.sampleRate*wl,AC.sampleRate);
    for(var c=0;c<2;c++){var wd=wb.getChannelData(c),br=0;for(i=0;i<wd.length;i++){var r=Math.random()*2-1;br=(br+0.02*r)/1.02;wd[i]=br*2.5+r*0.35;}}
    var wsrc=AC.createBufferSource(),wlp=AC.createBiquadFilter(),wg=AC.createGain();wsrc.buffer=wb;wlp.type="lowpass";wlp.frequency.value=4200;
    wg.gain.setValueAtTime(0.0001,t0);wg.gain.linearRampToValueAtTime(0.9,t0+1.5);wg.gain.setValueAtTime(0.9,t0+wl-2);wg.gain.linearRampToValueAtTime(0.0001,t0+wl);
    var wm=AC.createOscillator(),wmg=AC.createGain();wm.frequency.value=0.25;wmg.gain.value=0.12;wm.connect(wmg);wmg.connect(wg.gain);wm.start(t0);wm.stop(t0+wl);
    wsrc.connect(wlp);wlp.connect(wg);wg.connect(out);wsrc.start(t0);wsrc.stop(t0+wl);break;
  case "rain":
    noise(out,t0,8,"bandpass",2500,function(p,t){p.linearRampToValueAtTime(0.35,t+1.2);p.setValueAtTime(0.35,t+6.5);p.linearRampToValueAtTime(0.0001,t+8);},0.4);
    for(s=0.3;s<7.5;s+=0.02+Math.random()*0.06){note(out,t0+s,1800+Math.random()*3500,0.03,0.02+Math.random()*0.05,[[1,1]]);}break;
  case "thunder":
    noise(out,t0,0.25,"highpass",1800,hit(out,t0,0.6,0.25));
    var th=noise(out,t0+0.05,6,"lowpass",220,function(p,t){p.exponentialRampToValueAtTime(1,t+0.15);for(var k=0.6;k<5;k+=0.4+Math.random()*0.5){p.linearRampToValueAtTime(0.3+Math.random()*0.7,t+k);}p.linearRampToValueAtTime(0.0001,t+6);});
    var rv3=reverb(out,3,2);tom(rv3,t0+0.05,60,30,2.5,0.8);break;
  case "birds":
    for(s=0;s<5;s+=0.5+Math.random()*0.6){var bird=Math.random()<0.5?0:1,nChirp=2+Math.floor(Math.random()*4);
      for(var k2=0;k2<nChirp;k2++){var tt=t0+s+k2*0.11,bo=AC.createOscillator(),bg=AC.createGain(),lo=bird?2600:3400,hi=bird?4200:5200;
        bo.frequency.setValueAtTime(lo,tt);bo.frequency.exponentialRampToValueAtTime(hi,tt+0.05);bo.frequency.exponentialRampToValueAtTime(lo*1.1,tt+0.09);
        bg.gain.setValueAtTime(0.0001,tt);bg.gain.exponentialRampToValueAtTime(0.09,tt+0.01);bg.gain.exponentialRampToValueAtTime(0.0001,tt+0.09);
        bo.connect(bg);bg.connect(out);bo.start(tt);bo.stop(tt+0.1);}}break;
  case "windchimes":
    var pent=[84,86,88,91,93,96,98];for(s=0;s<5;s+=0.15+Math.random()*0.45){note(out,t0+s,mf(pent[Math.floor(Math.random()*pent.length)]),3,0.12+Math.random()*0.1,[[1,1],[2.76,.3,.5],[5.4,.1,.3]]);}break;
  case "gong":
    note(out,t0,98,8,0.35,[[1,1],[1.48,.6,.8],[2.1,.5,.6],[2.9,.3,.5],[3.8,.2,.4],[5.2,.1,.3]]);
    noise(out,t0,4,"bandpass",600,function(p,t){p.exponentialRampToValueAtTime(0.15,t+0.4);p.exponentialRampToValueAtTime(0.0001,t+4);},1);break;
  case "schoolbell":
    for(s=0;s<2.5;s+=0.045){note(out,t0+s,1320,0.12,0.18,[[1,1],[2.4,.4]]);}break;
  case "whistle":
    [[0,0.35],[0.5,1]].forEach(function(b){var wo=AC.createOscillator(),wg2=AC.createGain(),tr=AC.createOscillator(),trg=AC.createGain();
      wo.frequency.value=2800;tr.frequency.value=32;trg.gain.value=160;tr.connect(trg);trg.connect(wo.frequency);
      wg2.gain.setValueAtTime(0.0001,t0+b[0]);wg2.gain.exponentialRampToValueAtTime(0.2,t0+b[0]+0.02);wg2.gain.setValueAtTime(0.2,t0+b[0]+b[1]-0.04);wg2.gain.exponentialRampToValueAtTime(0.0001,t0+b[0]+b[1]);
      wo.connect(wg2);wg2.connect(out);wo.start(t0+b[0]);tr.start(t0+b[0]);wo.stop(t0+b[0]+b[1]+0.05);tr.stop(t0+b[0]+b[1]+0.05);
      noise(out,t0+b[0],b[1],"bandpass",3000,function(p,t){p.exponentialRampToValueAtTime(0.08,t+0.02);p.exponentialRampToValueAtTime(0.0001,t+b[1]);},2);});break;
  case "clock":
    for(s=0;s<8;s+=0.5){var tick=Math.round(s*2)%2===0;noise(out,t0+s,0.03,tick?"highpass":"bandpass",tick?3500:1400,hit(out,t0+s,tick?0.35:0.3,0.03),tick?0:2);}break;
  case "sparkle":
    for(i=0;i<18;i++){note(out,t0+i*0.06+Math.random()*0.03,mf(88+Math.floor(Math.random()*20)),0.6,0.1,[[1,1],[2,.3]]);}
    note(out,t0+1.15,mf(108),1.5,0.12,[[1,1],[1.5,.4]]);break;
  case "rimshot":
    tom(out,t0,220,160,0.25,0.7);tom(out,t0+0.2,150,100,0.35,0.8);crash(out,t0+0.45,0.35,1.2);break;
  }
}

// ---------- timer ----------
var T={total:300,left:300,running:false,endAt:0,done:false};
function tLeft(){return T.running?Math.max(0,Math.ceil((T.endAt-Date.now())/1000)):T.left;}
function tFmt(s){return Math.floor(s/60)+":"+pad(s%60);}
function tPct(){return T.total?Math.max(0,Math.min(100,tLeft()/T.total*100)):0;}
function timerHTML(big){
  var s=tLeft();
  return '<div class="timer'+(big?" big":"")+(T.done?" done":"")+'">'+
    '<div class="t-top"><span class="s-lbl">Timer <i>/ Temporizador</i></span>'+(big?"":'<button class="t-expand" data-act="open:timer" aria-label="Full screen timer">⤢</button>')+'</div>'+
    '<button class="t-display'+(s<=T.total*0.2&&T.running?" low":"")+'" data-act="'+(big?"tstart":"open:timer")+'">'+tFmt(s)+'</button>'+
    '<div class="t-msg">'+(T.done?"Time's up! <i>/ ¡Se acabó el tiempo!</i>":"")+'</div>'+
    '<div class="t-bar"><div class="t-fill" style="width:'+tPct()+'%"></div></div>'+
    '<div class="t-presets">'+[1,3,5,10,15].map(function(m){return '<button data-act="tpreset:'+m+'" class="'+(T.total===m*60?"on":"")+'">'+m+'</button>';}).join("")+'</div>'+
    '<div class="t-ctrl"><button data-act="tminus" aria-label="One minute less">−</button><button class="t-go" data-act="tstart">'+(T.running?"Pause":T.done?"Restart":"Start")+'</button><button data-act="treset">Reset</button><button data-act="tplus" aria-label="One minute more">+</button></div>'+
  '</div>';
}
function refreshTimers(){
  document.querySelectorAll(".timer").forEach(function(el){
    var tmp=document.createElement("div");tmp.innerHTML=timerHTML(el.classList.contains("big"));
    el.parentNode.replaceChild(tmp.firstChild,el);
  });
}
function tickTimers(){
  if(!T.running)return;
  var s=tLeft();
  if(s<=0){T.running=false;T.left=0;T.done=true;refreshTimers();playSound(st.sound);return;}
  document.querySelectorAll(".t-display").forEach(function(el){el.textContent=tFmt(s);el.classList.toggle("low",s<=T.total*0.2);});
  document.querySelectorAll(".t-fill").forEach(function(el){el.style.width=tPct()+"%";});
}
function tStart(){
  if(T.running){T.left=tLeft();T.running=false;}
  else{if(T.done||T.left<=0)T.left=T.total;T.done=false;T.endAt=Date.now()+T.left*1000;T.running=true;}
  refreshTimers();
}
function tSet(secs){T.total=secs;T.left=secs;T.running=false;T.done=false;refreshTimers();}

// ---------- fitting text to its box ----------
function fit(el){
  var max=+el.dataset.max||32,min=+el.dataset.min||Math.round(max*0.5),s=max;
  el.style.fontSize=s+"px";
  while(s>min&&el.scrollHeight>el.clientHeight+1){s-=1;el.style.fontSize=s+"px";}
}
function fitAll(root){root.querySelectorAll(".fit").forEach(fit);}

// ---------- card bodies ----------
function doNowBody(d){
  return (d.doNowWhere?'<div class="pill">Where: '+esc(d.doNowWhere)+(d.doNowWhereEs?' <i>/ Dónde: '+esc(d.doNowWhereEs)+'</i>':"")+'</div>':"")+bi(d.doNow,d.doNowEs);
}
function agendaBody(d,minsIn){
  return agendaItems(d).map(function(it){
    var now=minsIn!=null&&it.a!=null&&minsIn>=it.a&&minsIn<it.b;
    return '<div class="ag'+(now?" now":"")+'"><span class="ag-t">'+(it.a!=null?it.a+"-"+it.b+" min":"")+'</span><span class="ag-en">'+esc(it.en)+'</span>'+(it.es?'<span class="ag-es">'+esc(it.es)+'</span>':"<span></span>")+(now?'<span class="ag-left">'+(it.b-minsIn)+' min left</span>':"")+'</div>';
  }).join("");
}
function stdBody(d){
  var items=stdItems(d);if(!items.length)return soon();
  return items.map(function(x){return '<div class="std"><span class="std-c">'+esc(x.code)+'</span><span class="std-t">'+esc(x.text)+'</span></div>';}).join("");
}
function taskBody(d){
  var mats=String(d.materials||"").split(",").map(function(s){return s.trim();}).filter(Boolean);
  var matsEs=String(d.materialsEs||"").split(",").map(function(s){return s.trim();}).filter(Boolean);
  return bi(d.activity,d.activityEs)+
    (mats.length?'<div class="lbl">Materials / Materiales</div><div class="chips">'+mats.map(function(m,i){return '<span class="chip">'+esc(m)+(matsEs[i]?' <i>/ '+esc(matsEs[i])+'</i>':"")+'</span>';}).join("")+'</div>':"")+
    (d.studysync?'<div class="note">StudySync: '+esc(d.studysync)+'</div>':"");
}
function critBody(d){
  return [["met","Met","Logrado",d.criteriaMet,d.criteriaMetEs],["app","Approaching","Casi",d.criteriaApproaching,d.criteriaApproachingEs],["not","Not yet","Todavía no",d.criteriaNotYet,d.criteriaNotYetEs]].map(function(r){
    return '<div class="crit '+r[0]+'"><b>'+r[1]+' <i>/ '+r[2]+'</i></b><div class="en">'+esc(r[3])+'</div>'+(r[4]?'<div class="es">'+esc(r[4])+'</div>':"")+'</div>';
  }).join("");
}

// ---------- layout ----------
var MAX={donow:42,agenda:34,target:36,clo:32,standards:26};
function card(id,t,te,body,cls,right){
  return '<section class="card '+cls+'" data-act="open:'+id+'"><header class="card-h"><span class="h-t">'+t+'</span><span class="h-es">'+te+'</span><span class="h-sp"></span>'+(right||"")+'<span class="h-x" aria-hidden="true">⤢</span></header><div class="card-b fit" data-max="'+MAX[id]+'">'+body+'</div></section>';
}
var TILES=[["task","Today's Task","Tarea de hoy"],["annotate","Annotation Key","Clave de anotación"],["criteria","Success Criteria","Criterios de éxito"],["vocab","Vocabulary","Vocabulario"],["grammar","Grammar","Gramática"],["exit","Exit Ticket","Boleto de salida"],["seating","Seating Chart","Mapa de asientos"]];
function tilePreview(id,d){
  var p="";
  if(id==="task")p=d.activity;
  else if(id==="criteria")p="Met · Approaching · Not yet";
  else if(id==="vocab")p=words(d).map(function(w){return w.w;}).join(", ");
  else if(id==="grammar")p=d.grammar;
  else if(id==="exit")p=d.exitQuestion;
  else if(id==="annotate")return '<span class="an-row">'+annList().map(function(a){return esc(a.symbol);}).join(" ")+'</span>';
  else if(id==="seating")return '24 desks · '+esc(seatSection())+' <i>/ 24 escritorios</i>';
  return p?esc(p):soon();
}
function soundTile(){
  return '<div class="tile t-sounds" data-act="open:sounds"><div class="tile-h"><span class="tile-t">Sounds</span><span class="h-x" aria-hidden="true">⤢</span></div><div class="tile-es">Sonidos</div>'+
    '<div class="qs">'+[["eagle","🦅"],["chime","🔔"],["bowl","🧘"]].map(function(b){return '<button class="qs-b" data-act="snd:'+b[0]+'" aria-label="'+b[0]+'">'+b[1]+'</button>';}).join("")+'</div></div>';
}
function tilesHTML(d){
  return soundTile()+TILES.map(function(t){
    return '<button class="tile" data-act="open:'+t[0]+'"><div class="tile-h"><span class="tile-t">'+t[1]+'</span><span class="h-x" aria-hidden="true">⤢</span></div><div class="tile-es">'+t[2]+'</div><div class="tile-p">'+tilePreview(t[0],d)+'</div></button>';
  }).join("");
}
var weekAnchor=null;
function mondayOf(dt){var m=new Date(dt);m.setDate(dt.getDate()-(dt.getDay()===0?6:dt.getDay()-1));m.setHours(0,0,0,0);return m;}
function weekHTML(n){
  var d=getDay(n),base=weekAnchor||(d.date?parseYmd(d.date):new Date());
  var mon=mondayOf(base),thisMon=mondayOf(new Date());
  var today=ymd(new Date()),byDate={};
  dayNums().forEach(function(k){var x=getDay(k);if(x.date)byDate[x.date]=x;});
  var isThis=ymd(mon)===ymd(thisMon);
  var label=isThis?'This Week<i>Esta semana</i>':'Week of '+mon.toLocaleDateString("en-US",{month:"short",day:"numeric"})+'<i>Semana del '+mon.getDate()+'</i>';
  return '<div class="wk-l"><button class="wk-home" data-act="day:auto" title="Back to today">'+label+'</button><div class="wk-nav"><button data-act="week:-1" aria-label="Previous week">‹</button><button data-act="week:1" aria-label="Next week">›</button></div></div>'+[0,1,2,3,4].map(function(i){
    var x=new Date(mon);x.setDate(mon.getDate()+i);
    var k=ymd(x),u=byDate[k],sel=u&&u.day===n;
    return '<button class="wk'+(sel?" sel":"")+(k===today?" tod":"")+'"'+(u?' data-act="day:set:'+u.day+'"':"")+'>'+
      '<div class="wk-d"><span>'+(k===today?"Today":["Mon","Tue","Wed","Thu","Fri"][i])+'</span><b>'+x.getDate()+'</b></div>'+
      '<div class="wk-x">'+(u?'<span class="wk-n">Day '+u.day+'</span> '+esc(u.topic):'<span class="wk-no">No class <i>/ Sin clases</i></span>')+'</div></button>';
  }).join("");
}
function sideHTML(now){
  var s=sectionInfo(now),vl=VOICE_LEVELS[st.voice]||VOICE_LEVELS[0];
  var secLine=s.sec?esc(s.sec.period)+" · "+(s.left!=null?s.left+" min left in class":fmt12(s.sec.start)+" to "+fmt12(s.sec.end)):"";
  var blk=null;if(s.minsIn!=null)agendaItems(getDay(currentDayN(now))).forEach(function(it){if(it.a!=null&&s.minsIn>=it.a&&s.minsIn<it.b)blk=it;});
  if(blk)secLine+='<div class="s-now">Now: '+esc(blk.en)+' · '+(blk.b-s.minsIn)+' min left</div>';
  return '<div><div class="s-subj">'+esc(CLASS_INFO.subject)+'</div><div class="s-who">'+esc(CLASS_INFO.teacher)+' · '+esc(CLASS_INFO.room)+'</div></div>'+
    '<div><div class="s-unitname">'+esc(CLASS_INFO.unit)+'</div><div class="s-eq">'+esc(CLASS_INFO.essentialQuestion)+'</div><div class="s-eqes">'+esc(CLASS_INFO.essentialQuestionEs)+'</div></div>'+
    '<div class="s-box s-clock"><div class="s-time">'+now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+'</div><div class="s-date">'+now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})+'</div>'+(secLine?'<div class="s-sec">'+secLine+'</div>':"")+'</div>'+
    '<button class="s-box s-cares" data-act="cares"><div class="s-lbl">CARES Focus <i>/ Enfoque CARES</i></div><div class="s-cv">'+esc(st.cares)+'</div><div class="s-ces">'+esc(CARES_ES[st.cares]||"")+'</div></button>'+
    '<div class="s-box"><div class="s-lbl">Voice Level <i>/ Nivel de voz</i></div><div class="v-btns">'+
      VOICE_LEVELS.map(function(v){return '<button data-act="voice:'+v.level+'" class="v-b v'+v.level+(v.level===st.voice?" on":"")+'">'+v.level+'</button>';}).join("")+
    '</div><div class="v-name">'+vl.level+' · '+esc(vl.label)+' <i>/ '+esc(vl.es)+'</i></div><div class="v-desc">'+esc(vl.desc)+' <i>'+esc(vl.descEs)+'</i></div></div>'+
    timerHTML(false)+
    '<div class="s-row"><button class="s-gear" data-act="open:video">▶ Video</button><button class="s-gear" data-act="open:settings">⚙ Settings</button></div>';
}
function mainHTML(now,d,n){
  var s=sectionInfo(now);
  return '<div class="top"><div class="col">'+
      card("donow","Do Now","Para empezar",doNowBody(d),"c-donow",'<button class="h-btn h-bell'+(d.dnOv?" on":"")+'" data-act="open:bell">☰ Bellringers</button><button class="h-btn" data-act="dstart">▶ '+d.doNowMins+':00</button>')+
      card("agenda","Agenda","Agenda",agendaBody(d,s.minsIn),"c-agenda")+
    '</div><div class="col">'+
      card("target","Learning Target","Meta de aprendizaje",bi(d.learningTarget,d.learningTargetEs),"c-target")+
      card("clo","Language Objective","Objetivo de lenguaje",bi(d.clo,d.cloEs),"c-clo")+
      card("standards","Standards","Estándares",stdBody(d),"c-std")+
    '</div></div>'+
    '<div class="tiles">'+tilesHTML(d)+'</div>'+
    '<div class="week">'+weekHTML(n)+'</div>';
}
var VIEW=(new URLSearchParams(location.search).get("view")||"").toLowerCase(),ENTRY=VIEW==="entry"||VIEW==="hallway";
function entryList(){return (st.entryCache&&st.entryCache.length)?st.entryCache:ENTRY_DEFAULT;}
function matIcon(m){var s=m.toLowerCase();for(var i=0;i<MATERIAL_ICONS.length;i++){if(new RegExp("(^|[^a-z])"+MATERIAL_ICONS[i][0]).test(s))return MATERIAL_ICONS[i][1];}return "📌";}
var entryKey="",entryMax="";
function eItem(ic,en,es){return '<div class="e-item"><span class="e-ic">'+esc(ic)+'</span><div><b>'+esc(en)+'</b>'+(es?'<i>'+esc(es)+'</i>':"")+'</div></div>';}
function eCard(id,cls,t,te,body,editable){
  return '<section class="e-card '+cls+(entryMax===id?" e-max":"")+'"><header class="e-ch"><span class="e-t" data-act="emax:'+id+'">'+t+' <i>'+te+'</i></span>'+
    (editable?'<button class="e-edit" data-act="epick:'+id+'">✎ Choose</button>':"")+'<button class="e-x" data-act="emax:'+id+'" aria-label="Full screen">'+(entryMax===id?"✕":"⤢")+'</button></header>'+body+'</section>';
}
// ----- daily picks for the hallway checklist (this device only, resets each day) -----
var entryPick="";
function uniqBy(list){var seen={},out=[];list.forEach(function(x){var k=x.text.toLowerCase();if(!seen[k]){seen[k]=1;out.push(x);}});return out;}
function matsDefault(d){
  var en=String(d.materials||"").split(",").map(function(x){return x.trim();}).filter(Boolean),es=String(d.materialsEs||"").split(",").map(function(x){return x.trim();});
  return en.map(function(m,i){return {text:m,textEs:es[i]||""};});
}
function bankFor(kind,d){return uniqBy(kind==="rt"?entryList().concat(ROUTINE_BANK):matsDefault(d).concat(MATERIAL_BANK));}
function picksFor(kind,d){
  var sel=st.entrySel,bank=bankFor(kind,d);
  if(sel&&sel.date===ymd(new Date())&&sel[kind]){return sel[kind].map(function(t){for(var i=0;i<bank.length;i++)if(bank[i].text===t)return bank[i];return null;}).filter(Boolean);}
  return kind==="rt"?entryList():matsDefault(d);
}
function togglePick(kind,idx){
  var d=getDay(currentDayN(new Date())),bank=bankFor(kind,d),cur=picksFor(kind,d).map(function(x){return x.text;}),t=bank[idx].text;
  var i=cur.indexOf(t);if(i>-1)cur.splice(i,1);else{
    var order=bank.map(function(x){return x.text;});cur.push(t);cur.sort(function(x,y){return order.indexOf(x)-order.indexOf(y);});}
  var today=ymd(new Date());if(!st.entrySel||st.entrySel.date!==today)st.entrySel={date:today};
  st.entrySel[kind]=cur;save();
}
function pickerHTML(kind,d){
  var bank=bankFor(kind,d),cur=picksFor(kind,d).map(function(x){return x.text;});
  return '<div class="pk-back"><div class="pk"><header class="pk-h"><span>'+(kind==="rt"?"When You Come In":"Materials to Have Ready")+' <i>Choose for today / Elige para hoy</i></span><button class="pk-done" data-act="epick:">Done</button></header>'+
    '<div class="pk-list">'+bank.map(function(x,i){var on=cur.indexOf(x.text)>-1;return '<button class="pk-i'+(on?" on":"")+'" data-act="etog:'+kind+':'+i+'"><span class="pk-box">'+(on?"✓":"")+'</span><span class="e-ic">'+esc(kind==="rt"?(x.icon||"📌"):matIcon(x.text))+'</span><span><b>'+esc(x.text)+'</b>'+(x.textEs?'<i>'+esc(x.textEs)+'</i>':"")+'</span></button>';}).join("")+'</div>'+
    '<footer class="pk-f"><button data-act="ereset:'+kind+'">Reset to today\'s default</button></footer></div></div>';
}
// ----- 24-desk seating chart (names stay on this device only) -----
var seatMode="view",seatPick=-1,seatSecSel="",seatTab="desks";
function seatSection(){
  if(seatSecSel)return seatSecSel;
  var now=new Date(),s=sectionInfo(now);if(s.sec)return s.sec.id;
  var m=now.getHours()*60+now.getMinutes();for(var i=0;i<SECTIONS.length;i++)if(toMin(SECTIONS[i].start)>m)return SECTIONS[i].id;
  return SECTIONS[0].id;
}
function seatNames(sec){var all=st.seats||{},a=(all[sec]||[]).slice();while(a.length<24)a.push("");return a;}
function setSeatNames(sec,a){if(!st.seats)st.seats={};st.seats[sec]=a;save();}
function deskHTML(i,names){return '<button class="desk'+(seatPick===i?" pick":"")+(names[i]?"":" empty")+'" data-act="desk:'+i+'"><span class="dn">'+(i+1)+'</span><span class="dname">'+esc(names[i]||"")+'</span></button>';}
function seatGridHTML(){
  var sec=seatSection(),names=seatNames(sec),lay=st.seatLayout||"groups",g="";
  if(lay==="groups"){for(var p=0;p<6;p++){g+='<div class="pod">';for(var k=0;k<4;k++)g+=deskHTML(p*4+k,names);g+='</div>';}}
  else{for(var i=0;i<24;i++)g+=deskHTML(i,names);}
  var secs=SECTIONS.map(function(s){return '<button class="'+(s.id===sec?"on":"")+'" data-act="seatsec:'+s.id+'">'+s.id+'</button>';}).join("");
  var modes=[["view","👀 View"],["move","↔ Swap"],["edit","✎ Names"]].map(function(m){return '<button class="'+(seatMode===m[0]?"on":"")+'" data-act="seatmode:'+m[0]+'">'+m[1]+'</button>';}).join("");
  var tip=seatMode==="move"?"Tap two desks to swap them. / Toca dos escritorios para cambiarlos.":seatMode==="edit"?"Tap a desk to type a name. / Toca un escritorio para escribir un nombre.":"";
  return '<div class="seat"><div class="seat-bar"><span class="seat-secs">'+secs+'</span><span class="seat-secs">'+modes+'</span>'+
    '<span class="seat-secs"><button data-act="seatshare:on">📤 Share</button><button data-act="seatlay:'+(lay==="groups"?"rows":"groups")+'">'+(lay==="groups"?"▦ Rows":"▣ Groups")+'</button>'+(seatMode==="edit"?'<button data-act="seatpaste">Paste list</button><button data-act="seatclear">Clear</button>':"")+'</span></div>'+
    (tip?'<div class="seat-tip">'+tip+'</div>':"")+
    '<div class="seat-front">Front of room / Frente del salón</div><div class="seat-grid '+lay+'">'+g+'</div></div>'+(seatShare?shareHTML():"");
}
// ----- copy names between devices with a QR code or link (names ride in the #hash, never sent to a server) -----
var seatShare=false;
function seatShareData(only){
  var s=st.seats||{};
  return Object.keys(s).filter(function(k){return (!only||k===only)&&(s[k]||[]).some(Boolean);}).map(function(k){
    var a=s[k].slice();while(a.length&&!a[a.length-1])a.pop();
    return k+":"+a.map(function(n){return String(n||"").replace(/[|;:]/g," ");}).join("|");
  }).join(";");
}
function seatShareLink(only){return location.origin+location.pathname+(ENTRY?"":"?view=entry")+"#seats="+encodeURIComponent(seatShareData(only));}
function shareHTML(){
  var sec=seatSection(),data=seatShareData(sec),count=data?1:0,all=seatShareData(),allCount=all?all.split(";").length:0,link=seatShareLink(sec),qr="";
  if(count&&typeof qrcode==="function"){try{var q=qrcode(0,"L");q.addData(link);q.make();qr=q.createSvgTag({cellSize:4,margin:4});}catch(e){qr="";}}
  return '<div class="pk-back"><div class="pk"><header class="pk-h"><span>Copy names to another device <i>Copiar nombres a otro dispositivo</i></span><button class="pk-done" data-act="seatshare:off">Done</button></header>'+
    (count?'<div class="sh-body">'+(qr?'<div class="sh-qr">'+qr+'</div>':"")+'<div class="sh-txt">This code copies seating names for class <b>'+esc(sec)+'</b>. Pick another class at the top to share it next.<ol>'+
      '<li>On the iPad, open the Camera and point it at this code. Tap the link that pops up.</li><li>Or copy the link below and open it on the other device.</li><li>Tap OK when it asks to copy the names.</li></ol>'+
      '<input class="sh-link" readonly value="'+esc(link)+'"><br><button class="sh-copy" data-act="seatcopy:one">Copy link for '+esc(sec)+'</button>'+(allCount>1?' <button class="sh-copy" data-act="seatcopy:all">Copy link for all '+allCount+' classes</button>':"")+'</div></div>'
    :'<div class="sh-body"><div class="sh-txt">No names yet for class '+esc(sec)+'. Add names with ✎ Names first, or pick another class at the top.</div></div>')+'</div></div>';
}
function importSeatsFromHash(){
  var h=location.hash;if(h.indexOf("#seats=")!==0)return;
  var raw="";try{raw=decodeURIComponent(h.slice(7));}catch(e){}
  history.replaceState(null,"",location.pathname+location.search);
  var got={};raw.split(";").forEach(function(part){var i=part.indexOf(":");if(i<1)return;var k=part.slice(0,i).trim(),names=part.slice(i+1).split("|").slice(0,24);if(k)got[k]=names;});
  var keys=Object.keys(got);if(!keys.length)return;
  if(confirm("Copy seating names for "+keys.join(", ")+" onto this device? This replaces the names already here for those classes.")){
    if(!st.seats)st.seats={};keys.forEach(function(k){st.seats[k]=got[k];});save();
  }
}
function deskTap(i){
  var sec=seatSection(),a=seatNames(sec);
  if(seatMode==="move"){if(seatPick<0){seatPick=i;}else{var t=a[seatPick];a[seatPick]=a[i];a[i]=t;setSeatNames(sec,a);seatPick=-1;}}
  else if(seatMode==="edit"){var v=prompt("Name for desk "+(i+1)+" (first name and last initial)",a[i]||"");if(v!==null){a[i]=v.trim();setSeatNames(sec,a);}}
}
function refreshSeats(){if(ENTRY){entryKey="";render();}else renderOv();}
function renderEntry(){
  var now=new Date(),n=currentDayN(now),d=getDay(n);
  var t=$("#eTime");if(t)t.textContent=now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
  var rts=picksFor("rt",d),mats=picksFor("mt",d);
  var k=JSON.stringify([n,d.date,rts,mats,entryMax,entryPick,st.seats,st.seatLayout,seatMode,seatPick,seatShare,seatSection(),now.toDateString()]);if(k===entryKey)return;entryKey=k;
  $("#entry").innerHTML='<div class="e-wrap">'+
    '<header class="e-h"><div><div class="e-cls">'+esc(CLASS_INFO.subject)+' · '+esc(CLASS_INFO.teacher)+' · '+esc(CLASS_INFO.room)+'</div><div class="e-wel">Welcome, Eagles! 🦅<i>¡Bienvenidos, Águilas!</i></div></div>'+
    '<div class="e-when"><div id="eTime">'+now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+'</div><div>'+now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})+' · Day '+n+'</div></div></header>'+
    '<div class="e-grid">'+
      eCard("rt","e-rt","When You Come In","Al llegar",'<div class="e-list">'+(rts.length?rts.map(function(x){return eItem(x.icon||"📌",x.text,x.textEs);}).join(""):eItem("📌","Nothing chosen yet","Nada elegido todavía"))+'</div>',true)+
      eCard("mt","e-mt","Materials to Have Ready","Materiales listos",'<div class="e-list">'+(mats.length?mats.map(function(m){return eItem(matIcon(m.text),m.text,m.textEs);}).join(""):eItem("📌","Nothing extra today","Nada extra hoy"))+'</div>',true)+
      eCard("st","e-st","Seating Chart","Mapa de asientos",seatGridHTML())+
    '</div></div>'+(entryPick?pickerHTML(entryPick,d):"");
}
function render(){
  if(ENTRY){renderEntry();return;}
  var now=new Date(),n=currentDayN(now),d=getDay(n);
  $("#side").innerHTML=sideHTML(now);
  $("#mainBody").innerHTML=mainHTML(now,d,n);
  fitAll($("#mainBody"));
}

// ---------- Rules and Routines ticker ----------
var rulesKey="";
function rulesList(){return (st.rulesCache&&st.rulesCache.length)?st.rulesCache:RULES_DEFAULT;}
function renderChyron(){
  var r=rulesList(),k=JSON.stringify(r);if(k===rulesKey)return;rulesKey=k;
  var items=r.map(function(x,i){return '<span class="ch-i"><b>'+(i+1)+'.</b> '+esc(x.rule)+(x.ruleEs?' <i>/ '+esc(x.ruleEs)+'</i>':"")+'</span>';}).join("");
  var chars=r.reduce(function(a,x){return a+x.rule.length+(x.ruleEs||"").length;},0);
  $("#chyron").innerHTML='<div class="ch-l">Rules &amp; Routines<i>Reglas y rutinas</i></div><div class="ch-win"><div class="ch-track" style="animation-duration:'+Math.max(30,Math.round(chars*0.22))+'s">'+items+items+'</div></div><span class="h-x ch-x" aria-hidden="true">⤢</span>';
}
function rulesUrl(){var u=sheetUrl();return /\/gviz\/tq/.test(u)?u+"&sheet=Rules":"";}
function annList(){return (st.annCache&&st.annCache.length)?st.annCache:ANNOTATIONS_DEFAULT;}
function loadAnnotations(){
  var u=sheetUrl();if(!/\/gviz\/tq/.test(u))return;
  fetch(u+"&sheet=Annotations",{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
    if(/^\s*</.test(t))throw 0;
    var rows=parseCSV(t),head=(rows.shift()||[]).map(function(h){return h.trim().toLowerCase();});
    var ix=function(k){return head.indexOf(k);},si=ix("symbol");if(si<0)throw 0;
    var get=function(r,k){var i=ix(k);return i>-1?String(r[i]||"").trim():"";};
    var out=rows.map(function(r){return {symbol:get(r,"symbol"),label:get(r,"label"),labelEs:get(r,"labeles"),meaning:get(r,"meaning"),meaningEs:get(r,"meaninges")};}).filter(function(x){return x.symbol;});
    if(!out.length)throw 0;
    st.annCache=out;save();render();if(OV==="annotate")renderOv();
  }).catch(function(){});
}
function loadEntry(){
  var u=sheetUrl();if(!/\/gviz\/tq/.test(u))return;
  fetch(u+"&sheet=Hallway",{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
    if(/^\s*</.test(t))throw 0;
    var rows=parseCSV(t),head=(rows.shift()||[]).map(function(h){return h.trim().toLowerCase();});
    var ii=head.indexOf("icon"),ti=head.indexOf("text"),ei=head.indexOf("textes");if(ti<0)throw 0;
    var out=rows.map(function(r){return {icon:ii>-1?String(r[ii]||"").trim():"",text:String(r[ti]||"").trim(),textEs:ei>-1?String(r[ei]||"").trim():""};}).filter(function(x){return x.text;});
    if(!out.length)throw 0;
    st.entryCache=out;save();if(ENTRY)render();
  }).catch(function(){});
}
function bellList(){return (st.bellCache&&st.bellCache.length)?st.bellCache:BELL_DEFAULT;}
function loadBells(){
  var u=sheetUrl();if(!/\/gviz\/tq/.test(u))return;
  fetch(u+"&sheet=Bellringers",{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
    if(/^\s*</.test(t))throw 0;
    var rows=parseCSV(t),head=(rows.shift()||[]).map(function(h){return h.trim().toLowerCase();});
    var ci=head.indexOf("category"),pi=head.indexOf("prompt"),ei=head.indexOf("promptes");if(pi<0)throw 0;
    var out=rows.map(function(r){return {category:ci>-1?String(r[ci]||"").trim()||"Other":"Other",prompt:String(r[pi]||"").trim(),promptEs:ei>-1?String(r[ei]||"").trim():""};}).filter(function(x){return x.prompt;});
    if(!out.length)throw 0;st.bellCache=out;save();
  }).catch(function(){});
}
function loadRules(){
  var u=rulesUrl();if(!u)return;
  fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
    if(/^\s*</.test(t))throw 0;
    var rows=parseCSV(t),head=(rows.shift()||[]).map(function(h){return h.trim().toLowerCase();});
    var ri=head.indexOf("rule"),ei=head.indexOf("rulees");if(ri<0)throw 0;
    var out=rows.map(function(r){return {rule:String(r[ri]||"").trim(),ruleEs:ei>-1?String(r[ei]||"").trim():""};}).filter(function(x){return x.rule;});
    if(!out.length)throw 0;
    st.rulesCache=out;save();renderChyron();if(OV==="rules")renderOv();
  }).catch(function(){});
}

// ---------- full screen views ----------
var OV=null,vocabOpen=null,gramShow=false;
var OVT={donow:["Do Now","Para empezar"],agenda:["Agenda","Agenda"],target:["Learning Target","Meta de aprendizaje"],clo:["Language Objective","Objetivo de lenguaje"],standards:["Standards","Estándares"],
  task:["Today's Task","Tarea de hoy"],criteria:["Success Criteria","Criterios de éxito"],vocab:["Vocabulary","Vocabulario"],grammar:["Grammar","Gramática"],exit:["Exit Ticket","Boleto de salida"],
  seating:["Seating Chart","Mapa de asientos"],sounds:["Sounds","Sonidos"],bell:["Bellringers","Actividades de inicio"],video:["Video","Video"],rules:["Rules & Routines","Reglas y rutinas"],annotate:["Annotation Key","Clave de anotación"],timer:["Timer","Temporizador"],settings:["Settings","Ajustes"]};
function seatEmbed(u){
  var m=u.match(/docs\.google\.com\/presentation\/d\/([^\/?#]+)/);
  return m?"https://docs.google.com/presentation/d/"+m[1]+"/embed?start=false&loop=false&delayms=600000":u;
}
function ovRight(id,d){
  if(id==="donow")return '<button class="h-btn" style="font-size:30px;padding:12px 22px" data-act="dstart">▶ Start '+d.doNowMins+':00</button>';
  if(id==="task"){
    var s=safeUrl(d.slidesUrl),p=safeUrl(d.lessonPlanUrl);
    return (s?'<a class="ov-link" href="'+esc(s)+'" target="_blank" rel="noopener">Slides</a>':"")+(p?'<a class="ov-link" href="'+esc(p)+'" target="_blank" rel="noopener">Lesson plan</a>':"");
  }
  if(id==="sounds")return '<button class="ov-link" data-act="sndstop">■ Stop</button>';
  if(id==="video"&&videoUrl(d))return '<a class="ov-link" href="'+esc(videoUrl(d))+'" target="_blank" rel="noopener">Open in YouTube</a>';
  if(id==="seating"&&seatUrl())return '<a class="ov-link" href="'+esc(seatUrl())+'" target="_blank" rel="noopener">Open in new tab</a>';
  return "";
}
function vocabBody(d){
  var ws=words(d);
  if(!ws.length)return '<div class="vd-empty">No words for today yet. <i>/ Todavía no hay palabras para hoy.</i></div>';
  var v=vocabOpen?vocab(vocabOpen):null,def;
  if(!vocabOpen)def='<div class="vd-empty">Tap a word to see what it means.<br><i>Toca una palabra para ver qué significa.</i></div>';
  else if(!v)def='<div class="vd-w">'+esc(vocabOpen)+'</div><div class="vd-empty" style="margin-top:20px">No definition saved for this word yet. <i>/ Todavía no hay definición para esta palabra.</i></div>';
  else def='<div class="vd-w">'+esc(vocabOpen)+'</div><div class="vd-say">Say it: <b>'+esc(v.ph)+'</b> <i>('+esc(v.pos)+')</i></div>'+
    '<div class="vd-d">'+esc(v.d)+'</div><div class="vd-de">'+esc(v.de)+'</div>'+
    '<div class="vd-ex"><b>In our unit / En nuestra unidad: </b>'+esc(v.ex)+'</div>';
  return '<div class="vb"><div class="vb-words">'+ws.map(function(w){
    return '<button class="vw'+(vocabOpen===w.w?" on":"")+'" data-act="vocab:'+encodeURIComponent(w.w)+'"><span>'+esc(w.w)+'</span>'+(w.es?'<i>'+esc(w.es)+'</i>':"")+'</button>';
  }).join("")+'</div><div class="vb-def">'+def+'</div></div>';
}
function settingsBody(now){
  var n=currentDayN(now),nums=dayNums(),d=getDay(n);
  var secs=[{id:"auto",l:"Auto"}].concat(SECTIONS.map(function(s){return {id:s.id,l:s.id+" · "+s.period};}));
  return '<div class="set">'+
    '<div class="set-row"><div class="set-l">Lesson day</div><div class="set-c"><button data-act="day:prev" aria-label="Previous day">‹</button><span class="set-v">Day '+n+' of '+nums.length+(d.date?" · "+fmtDt(d.date):"")+'</span><button data-act="day:next" aria-label="Next day">›</button><button class="'+(st.day==="auto"?"on":"")+'" data-act="day:auto">Today (auto)</button></div></div>'+
    '<div class="set-row"><div class="set-l">Class section</div><div class="set-c">'+secs.map(function(o){return '<button class="'+(st.section===o.id?"on":"")+'" data-act="section:'+o.id+'">'+esc(o.l)+'</button>';}).join("")+'</div></div>'+
    '<div class="set-row"><div class="set-l">Timer sound</div><div class="set-c">'+SOUNDS.map(function(s){return '<button class="'+(st.sound===s[0]?"on":"")+'" data-act="sound:'+s[0]+'">'+s[1]+'</button>';}).join("")+'<button data-act="soundtest">▶ Test</button></div></div>'+
    '<div class="set-row"><div class="set-l">Lesson Sheet link</div><div class="set-c colm"><input id="sheetIn" value="'+esc(st.sheetUrl)+'" placeholder="Paste the Google Sheet link"><div class="set-c"><button data-act="sheetsave">Save</button><button data-act="sheetreload">Reload now</button><span class="set-note" id="sheetMsg">'+esc(sheetMsg)+'</span></div><div class="set-help">The screen checks the Sheet every 5 minutes. Blank cells use the built-in lesson.</div></div></div>'+
    '<div class="set-row"><div class="set-l">Video link</div><div class="set-c colm"><input id="vidIn" value="'+esc(st.videoUrl||CLASS_INFO.videoUrl)+'" placeholder="Paste a YouTube link"><div class="set-c"><button data-act="vidsave">Save</button><button data-act="open:video">▶ Play</button><span class="set-note">A videoUrl in the Sheet for a day plays instead on that day.</span></div></div></div>'+
    '<div class="set-row"><div class="set-l">Seating chart link</div><div class="set-c colm"><input id="seatIn" value="'+esc(st.seatingUrl||CLASS_INFO.seatingUrl)+'"><div class="set-c"><button data-act="seatsave">Save</button></div></div></div>'+
    '<div class="set-row"><div class="set-l">Hallway iPad view</div><div class="set-c colm"><div class="set-help">Open this link on the iPad and bookmark it: <b>'+esc(location.origin+location.pathname)+'?view=entry</b></div><div class="set-c"><a class="ov-link" style="background:var(--maroon);color:#fff" href="?view=entry" target="_blank" rel="noopener">Open hallway view</a></div></div></div>'+
    '<div class="set-row"><div class="set-l">Screen</div><div class="set-c"><button data-act="fullscreen">Full screen browser</button></div></div>'+
    '<div class="set-row"><div class="set-l">Screen size</div><div class="set-c"><button data-act="zoom:out" aria-label="Smaller">−</button><span class="set-v">'+Math.round((st.zoom||1)*100)+'%</span><button data-act="zoom:in" aria-label="Bigger">+</button><button data-act="zoom:auto">Fit (100%)</button><span class="set-note">Screen reads as '+viewSize().w+' × '+viewSize().h+'</span></div></div>'+
  '</div>';
}
function ovBody(id,d,now){
  var s=sectionInfo(now);
  switch(id){
    case "donow":return '<div class="fit" data-max="84">'+doNowBody(d)+'</div>';
    case "agenda":return '<div class="fit" data-max="70">'+agendaBody(d,s.minsIn)+'</div>';
    case "target":return '<div class="fit" data-max="84">'+bi(d.learningTarget,d.learningTargetEs)+'</div>';
    case "clo":return '<div class="fit" data-max="76">'+bi(d.clo,d.cloEs)+'</div>';
    case "standards":return '<div class="fit" data-max="56">'+stdBody(d)+'</div>';
    case "task":return '<div class="fit" data-max="72">'+taskBody(d)+'</div>';
    case "criteria":return '<div class="fit" data-max="60">'+critBody(d)+'</div>';
    case "vocab":return vocabBody(d);
    case "grammar":return '<div class="fit" data-max="72">'+bi(d.grammar,d.grammarEs)+(gramShow&&d.grammarAnswer?'<div class="gram-ans"><div class="en">'+esc(d.grammarAnswer)+'</div></div>':"")+'</div>'+
      (d.grammarAnswer?'<button class="btn" data-act="gramshow">'+(gramShow?"Hide answer":"Show answer")+' <i>/ '+(gramShow?"Ocultar respuesta":"Mostrar respuesta")+'</i></button>':"");
    case "exit":return '<div class="fit" data-max="72">'+bi(d.exitQuestion,d.exitQuestionEs)+'</div><div class="submit">Submit in Google Classroom <i>/ Entrégalo en Google Classroom</i></div>';
    case "video":var vu=videoUrl(d),id=ytId(vu);return id?'<iframe class="seat-frame" src="https://www.youtube-nocookie.com/embed/'+id+'?rel=0&modestbranding=1&playsinline=1" title="Video" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>':(vu?'<div class="vd-empty">This link is not a YouTube video. Use Open in new tab.</div>':'<div class="vd-empty">Add a YouTube link in Settings.</div>');
    case "seating":var u=seatUrl();return '<div class="seat-tabs"><button class="'+(seatTab==="desks"?"on":"")+'" data-act="seattab:desks">🪑 24 desks</button><button class="'+(seatTab==="slides"?"on":"")+'" data-act="seattab:slides">Google Slides chart</button></div>'+
      (seatTab==="desks"?seatGridHTML():(u?'<iframe class="seat-frame" src="'+esc(seatEmbed(u))+'" title="Seating chart" allowfullscreen></iframe>':'<div class="vd-empty">Add the seating chart link in Settings.</div>'));
    case "timer":return timerHTML(true);
    case "bell":var bl=bellList(),cats=[];bl.forEach(function(b){if(cats.indexOf(b.category)<0)cats.push(b.category);});
      return '<div class="bl-top"><span class="bl-cur">Now showing: <b>'+(d.dnOv?"a bellringer you picked":"today\'s planned Do Now")+'</b></span><button class="btn" data-act="bellown">✎ Write your own</button>'+(d.dnOv?'<button class="btn bl-alt" data-act="bellclear">↺ Back to today\'s plan</button>':"")+'</div>'+
        '<div class="bl">'+cats.map(function(c){return '<div class="bl-cat"><div class="bl-ch">'+esc(c)+'</div>'+bl.map(function(b,i){return b.category===c?'<button class="bl-i" data-act="bellpick:'+i+'"><b>'+esc(b.prompt)+'</b>'+(b.promptEs?'<i>'+esc(b.promptEs)+'</i>':"")+'</button>':"";}).join("")+'</div>';}).join("")+'</div>';
    case "sounds":return '<div class="sb">'+BOARD.map(function(b){return '<button class="sb-b" data-act="snd:'+b[0]+'"><span class="sb-ic">'+b[3]+'</span><span class="sb-en">'+esc(b[1])+'</span><i>'+esc(b[2])+'</i></button>';}).join("")+'</div>';
    case "annotate":return '<div class="an">'+annList().map(function(a){return '<div class="an-c"><div class="an-s">'+esc(a.symbol)+'</div><div class="an-t"><div class="an-l">'+esc(a.label)+(a.labelEs?' <i>/ '+esc(a.labelEs)+'</i>':"")+'</div><div class="an-m">'+esc(a.meaning)+'</div>'+(a.meaningEs?'<div class="es">'+esc(a.meaningEs)+'</div>':"")+'</div></div>';}).join("")+'</div>';
    case "rules":var r=rulesList(),li=r.map(function(x,i){return '<li><b>'+(i+1)+'.</b> <span class="en">'+esc(x.rule)+'</span>'+(x.ruleEs?'<div class="es">'+esc(x.ruleEs)+'</div>':"")+'</li>';}).join("");
      return '<div class="rv"><ul class="rv-track" style="animation-duration:'+Math.max(20,r.length*5)+'s">'+li+li+'</ul></div>';
    case "settings":return settingsBody(now);
  }
  return "";
}
function renderOv(){
  var el=$("#overlay");
  if(!OV){el.innerHTML="";el.className="";return;}
  var now=new Date(),d=getDay(currentDayN(now)),t=OVT[OV];
  el.className="on";
  el.innerHTML='<div class="ov-back" data-act="backdrop"><div class="ov-panel ov-'+OV+'" data-act="noop" role="dialog" aria-label="'+esc(t[0])+'">'+
    '<header class="ov-h"><span class="ov-t">'+t[0]+'</span><span class="ov-es">'+t[1]+'</span><span class="h-sp"></span>'+ovRight(OV,d)+'<button class="ov-x" data-act="close" aria-label="Close">✕</button></header>'+
    '<div class="ov-b">'+ovBody(OV,d,now)+'</div></div></div>';
  fitAll(el);
}
function openOv(id){OV=id;vocabOpen=null;gramShow=false;renderOv();}
function closeOv(){OV=null;renderOv();}

// ---------- taps ----------
function setDay(v){st.day=v;save();render();if(OV)renderOv();}
function act(a,el,e){
  var p=a.split(":");
  switch(p[0]){
    case "noop":return;
    case "backdrop":if(e.target===el)closeOv();return;
    case "close":closeOv();return;
    case "open":openOv(p[1]);return;
    case "cares":st.cares=CARES[(CARES.indexOf(st.cares)+1)%CARES.length];save();render();return;
    case "voice":st.voice=+p[1];save();render();return;
    case "tpreset":tSet(+p[1]*60);return;
    case "tstart":tStart();return;
    case "treset":tSet(T.total);return;
    case "tplus":case "tminus":
      var dlt=p[0]==="tplus"?60:-60,nt=Math.max(60,Math.min(3600,T.total+dlt));dlt=nt-T.total;T.total=nt;
      if(T.running)T.endAt+=dlt*1000;else{T.left=Math.max(0,T.left+dlt);if(T.done){T.left=T.total;T.done=false;}}
      refreshTimers();return;
    case "dstart":var d=getDay(currentDayN(new Date()));tSet(d.doNowMins*60);tStart();return;
    case "day":
      var nums=dayNums(),cur=currentDayN(new Date()),i=nums.indexOf(cur);
      weekAnchor=null;
      if(p[1]==="auto")setDay("auto");
      else if(p[1]==="set")setDay(+p[2]);
      else setDay(nums[Math.max(0,Math.min(nums.length-1,i+(p[1]==="next"?1:-1)))]);
      return;
    case "section":st.section=p[1];save();render();renderOv();return;
    case "sound":st.sound=p[1];save();renderOv();return;
    case "soundtest":playSound(st.sound);return;
    case "snd":playSound(p[1]);return;
    case "sndstop":stopSounds();return;
    case "zoom":st.zoom=p[1]==="auto"?1:Math.max(0.5,Math.min(1.5,Math.round(((st.zoom||1)+(p[1]==="in"?0.05:-0.05))*100)/100));save();scaleBoard(true);renderOv();return;
    case "sheetsave":st.sheetUrl=$("#sheetIn").value.trim();save();loadSheet();return;
    case "sheetreload":loadSheet();loadRules();loadAnnotations();loadEntry();loadBells();return;
    case "emax":entryMax=entryMax===p[1]?"":p[1];entryKey="";render();return;
    case "epick":entryPick=p[1]||"";entryKey="";render();return;
    case "etog":togglePick(p[1],+p[2]);entryKey="";render();return;
    case "ereset":if(st.entrySel)delete st.entrySel[p[1]];save();entryKey="";render();return;
    case "seatsec":seatSecSel=p[1];seatPick=-1;refreshSeats();return;
    case "seatmode":seatMode=p[1];seatPick=-1;refreshSeats();return;
    case "seatlay":st.seatLayout=p[1];save();refreshSeats();return;
    case "week":
      var wb=weekAnchor||(function(){var dd=getDay(currentDayN(new Date()));return dd.date?parseYmd(dd.date):new Date();})();
      weekAnchor=new Date(wb);weekAnchor.setDate(wb.getDate()+7*(+p[1]));render();return;
    case "bellpick":var bb=bellList()[+p[1]],bn=currentDayN(new Date());if(!st.dnOv)st.dnOv={};st.dnOv[bn]={doNow:bb.prompt,doNowEs:bb.promptEs||""};save();closeOv();render();return;
    case "bellclear":if(st.dnOv)delete st.dnOv[currentDayN(new Date())];save();closeOv();render();return;
    case "bellown":var en=prompt("Type your bellringer in English","");if(!en)return;var es=prompt("Spanish version (optional, you can leave this blank)","");
      if(!st.dnOv)st.dnOv={};st.dnOv[currentDayN(new Date())]={doNow:en.trim(),doNowEs:(es||"").trim()};save();closeOv();render();return;
    case "seatshare":seatShare=p[1]==="on";refreshSeats();return;
    case "seatcopy":var sl=seatShareLink(p[1]==="all"?"":seatSection());if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(sl).then(function(){alert("Link copied.");},function(){prompt("Copy this link:",sl);});}else prompt("Copy this link:",sl);return;
    case "seattab":seatTab=p[1];refreshSeats();return;
    case "desk":deskTap(+p[1]);refreshSeats();return;
    case "seatpaste":var lst=prompt("Paste names in desk order, separated by commas (first name and last initial)","");
      if(lst){var nm=lst.split(/[,\n]/).map(function(x){return x.trim();});var a2=seatNames(seatSection());for(var q=0;q<24;q++)if(nm[q]!==undefined)a2[q]=nm[q];setSeatNames(seatSection(),a2);}refreshSeats();return;
    case "seatclear":if(confirm("Clear all names for "+seatSection()+"?")){setSeatNames(seatSection(),[]);}refreshSeats();return;
    case "vidsave":st.videoUrl=$("#vidIn").value.trim();save();renderOv();return;
    case "seatsave":st.seatingUrl=$("#seatIn").value.trim();save();renderOv();return;
    case "fullscreen":var r=document.documentElement;(r.requestFullscreen||r.webkitRequestFullscreen||function(){}).call(r);return;
    case "vocab":vocabOpen=decodeURIComponent(a.slice(6));renderOv();return;
    case "gramshow":gramShow=!gramShow;renderOv();return;
  }
}
document.addEventListener("click",function(e){
  if(e.target.closest("a,input"))return;
  var el=e.target.closest("[data-act]");if(!el)return;
  ensureAudio();act(el.dataset.act,el,e);
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&OV)closeOv();});

// ---------- scale the 1920x1080 board to any screen ----------
function viewSize(){
  var vv=window.visualViewport,de=document.documentElement;
  var w=Math.round((vv&&vv.width)||de.clientWidth||innerWidth),h=Math.round((vv&&vv.height)||de.clientHeight||innerHeight);
  return {w:Math.min(w,de.clientWidth||w,innerWidth||w),h:Math.min(h,de.clientHeight||h,innerHeight||h)};
}
var lastFit="";
function scaleBoard(force){
  if(ENTRY)return;
  var v=viewSize(),k=v.w+"x"+v.h+"x"+(st.zoom||1);if(!force&&k===lastFit)return;lastFit=k;
  var s=Math.min(v.w/W,v.h/H)*(st.zoom||1),b=$("#board");
  b.style.transform="translate("+Math.round((v.w-W*s)/2)+"px,"+Math.round((v.h-H*s)/2)+"px) scale("+s+")";
}
addEventListener("resize",function(){scaleBoard();});
addEventListener("orientationchange",function(){setTimeout(scaleBoard,300);});
addEventListener("load",function(){scaleBoard(true);});
document.addEventListener("fullscreenchange",function(){setTimeout(scaleBoard,300);});
if(window.visualViewport)visualViewport.addEventListener("resize",function(){scaleBoard();});
setInterval(scaleBoard,2000);

// ---------- start ----------
if(ENTRY)document.body.classList.add("entry");
importSeatsFromHash();
scaleBoard(true);render();renderChyron();loadSheet();loadRules();loadAnnotations();loadEntry();loadBells();
setInterval(function(){loadSheet();loadRules();loadAnnotations();loadEntry();loadBells();},5*60*1000);
var lastMin=new Date().getMinutes();
setInterval(function(){
  tickTimers();
  var m=new Date().getMinutes();
  if(m!==lastMin){lastMin=m;render();}
},250);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){render();if(OV)renderOv();});
})();
