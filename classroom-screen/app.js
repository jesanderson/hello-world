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
  return safeUrl(st.sheetUrl||p||CLASS_INFO.sheetCsvUrl);
}
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
    setSheetMsg("Could not load the Sheet ("+e.message+"). Using the last saved copy.");
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
function playSound(name){
  ensureAudio();if(!AC||name==="off")return;
  var out=AC.createGain();out.gain.value=0.6;out.connect(AC.destination);
  var t0=AC.currentTime+0.05;
  if(name==="calypso"){
    var e=0.17,pan=[[1,1],[2,.45,.7],[3,.16,.45]],bass=[[1,.7],[2,.12,.6]];
    var mel=[[0,67],[1,72],[2,76],[3,79],[4.5,76],[5,79],[6,81],[7,79],[8,77],[9.5,74],[10,76],[11,74],[12,72]];
    var low=[[0,48],[2,55],[4,53],[6,53],[8,55],[10,55],[12,48]];
    [0,13*e+0.3].forEach(function(off){
      mel.forEach(function(m,i){note(out,t0+off+m[0]*e,mf(m[1]),i===mel.length-1?1.4:0.7,.28,pan);});
      low.forEach(function(m){note(out,t0+off+m[0]*e,mf(m[1]),0.45,.35,bass,"triangle");});
    });
  }else if(name==="ocean"){
    var len=7,buf=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),ch=buf.getChannelData(0),last=0;
    for(var i=0;i<ch.length;i++){last=(last+0.02*(Math.random()*2-1))/1.02;ch[i]=last*3.5;}
    var src=AC.createBufferSource(),lp=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=buf;lp.type="lowpass";lp.frequency.value=700;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(.9,t0+1.8);g.gain.linearRampToValueAtTime(.2,t0+3.3);
    g.gain.linearRampToValueAtTime(.8,t0+5);g.gain.linearRampToValueAtTime(0.0001,t0+len);
    src.connect(lp);lp.connect(g);g.connect(out);src.start(t0);src.stop(t0+len);
    [1.4,4.8].forEach(function(s){note(out,t0+s,1046.5,2.6,.12,[[1,1],[1.5,.5]]);});
  }else{
    var mar=[[1,1],[4,.12,.3]];
    [0,1.1].forEach(function(off){[72,76,79,84].forEach(function(m,i){note(out,t0+off+i*0.15,mf(m),0.6,.4,mar);});});
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
    return '<div class="ag'+(now?" now":"")+'"><span class="ag-t">'+(it.a!=null?it.a+"-"+it.b+" min":"")+'</span><span class="ag-en">'+esc(it.en)+'</span>'+(it.es?'<span class="ag-es">'+esc(it.es)+'</span>':"")+'</div>';
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
var TILES=[["task","Today's Task","Tarea de hoy"],["criteria","Success Criteria","Criterios de éxito"],["vocab","Vocabulary","Vocabulario"],["grammar","Grammar","Gramática"],["exit","Exit Ticket","Boleto de salida"],["seating","Seating Chart","Mapa de asientos"]];
function tilePreview(id,d){
  var p="";
  if(id==="task")p=d.activity;
  else if(id==="criteria")p="Met · Approaching · Not yet";
  else if(id==="vocab")p=words(d).map(function(w){return w.w;}).join(", ");
  else if(id==="grammar")p=d.grammar;
  else if(id==="exit")p=d.exitQuestion;
  else if(id==="seating")return 'Tap to open <i>/ Toca para abrir</i>';
  return p?esc(p):soon();
}
function tilesHTML(d){
  return TILES.map(function(t){
    return '<button class="tile" data-act="open:'+t[0]+'"><div class="tile-h"><span class="tile-t">'+t[1]+'</span><span class="h-x" aria-hidden="true">⤢</span></div><div class="tile-es">'+t[2]+'</div><div class="tile-p">'+tilePreview(t[0],d)+'</div></button>';
  }).join("");
}
function weekHTML(n){
  var d=getDay(n),base=d.date?parseYmd(d.date):new Date(),dow=base.getDay();
  var mon=new Date(base);mon.setDate(base.getDate()-(dow===0?6:dow-1));
  var today=ymd(new Date()),byDate={};
  dayNums().forEach(function(k){var x=getDay(k);if(x.date)byDate[x.date]=x;});
  return '<div class="wk-l"><div>This Week</div><i>Esta semana</i></div>'+[0,1,2,3,4].map(function(i){
    var x=new Date(mon);x.setDate(mon.getDate()+i);
    var k=ymd(x),u=byDate[k],sel=u&&u.day===n;
    return '<button class="wk'+(sel?" sel":"")+(k===today?" tod":"")+'"'+(u?' data-act="day:set:'+u.day+'"':"")+'>'+
      '<div class="wk-d"><span>'+["Mon","Tue","Wed","Thu","Fri"][i]+'</span><b>'+x.getDate()+'</b></div>'+
      '<div class="wk-x">'+(u?'<span class="wk-n">Day '+u.day+'</span> '+esc(u.topic):'<span class="wk-no">No class <i>/ Sin clases</i></span>')+'</div></button>';
  }).join("");
}
function sideHTML(now){
  var s=sectionInfo(now),vl=VOICE_LEVELS[st.voice]||VOICE_LEVELS[0];
  var secLine=s.sec?esc(s.sec.period)+" · "+(s.left!=null?s.left+" min left":fmt12(s.sec.start)+" to "+fmt12(s.sec.end)):"";
  return '<div><div class="s-subj">'+esc(CLASS_INFO.subject)+'</div><div class="s-who">'+esc(CLASS_INFO.teacher)+' · '+esc(CLASS_INFO.room)+'</div></div>'+
    '<div><div class="s-unitname">'+esc(CLASS_INFO.unit)+'</div><div class="s-eq">'+esc(CLASS_INFO.essentialQuestion)+'</div><div class="s-eqes">'+esc(CLASS_INFO.essentialQuestionEs)+'</div></div>'+
    '<div class="s-box s-clock"><div class="s-time">'+now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+'</div><div class="s-date">'+now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})+'</div>'+(secLine?'<div class="s-sec">'+secLine+'</div>':"")+'</div>'+
    '<button class="s-box s-cares" data-act="cares"><div class="s-lbl">CARES Focus <i>/ Enfoque CARES</i></div><div class="s-cv">'+esc(st.cares)+'</div><div class="s-ces">'+esc(CARES_ES[st.cares]||"")+'</div></button>'+
    '<div class="s-box"><div class="s-lbl">Voice Level <i>/ Nivel de voz</i></div><div class="v-btns">'+
      VOICE_LEVELS.map(function(v){return '<button data-act="voice:'+v.level+'" class="v-b v'+v.level+(v.level===st.voice?" on":"")+'">'+v.level+'</button>';}).join("")+
    '</div><div class="v-name">'+vl.level+' · '+esc(vl.label)+' <i>/ '+esc(vl.es)+'</i></div><div class="v-desc">'+esc(vl.desc)+' <i>'+esc(vl.descEs)+'</i></div></div>'+
    timerHTML(false)+
    '<button class="s-gear" data-act="open:settings">⚙ Settings</button>';
}
function mainHTML(now,d,n){
  var s=sectionInfo(now);
  return '<div class="top"><div class="col">'+
      card("donow","Do Now","Para empezar",doNowBody(d),"c-donow",'<button class="h-btn" data-act="dstart">▶ '+d.doNowMins+':00</button>')+
      card("agenda","Agenda","Agenda",agendaBody(d,s.minsIn),"c-agenda")+
    '</div><div class="col">'+
      card("target","Learning Target","Meta de aprendizaje",bi(d.learningTarget,d.learningTargetEs),"c-target")+
      card("clo","Language Objective","Objetivo de lenguaje",bi(d.clo,d.cloEs),"c-clo")+
      card("standards","Standards","Estándares",stdBody(d),"c-std")+
    '</div></div>'+
    '<div class="tiles">'+tilesHTML(d)+'</div>'+
    '<div class="week">'+weekHTML(n)+'</div>';
}
function render(){
  var now=new Date(),n=currentDayN(now),d=getDay(n);
  $("#side").innerHTML=sideHTML(now);
  $("#main").innerHTML=mainHTML(now,d,n);
  fitAll($("#main"));
}

// ---------- full screen views ----------
var OV=null,vocabOpen=null,gramShow=false;
var OVT={donow:["Do Now","Para empezar"],agenda:["Agenda","Agenda"],target:["Learning Target","Meta de aprendizaje"],clo:["Language Objective","Objetivo de lenguaje"],standards:["Standards","Estándares"],
  task:["Today's Task","Tarea de hoy"],criteria:["Success Criteria","Criterios de éxito"],vocab:["Vocabulary","Vocabulario"],grammar:["Grammar","Gramática"],exit:["Exit Ticket","Boleto de salida"],
  seating:["Seating Chart","Mapa de asientos"],timer:["Timer","Temporizador"],settings:["Settings","Ajustes"]};
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
    '<div class="set-row"><div class="set-l">Lesson Sheet link</div><div class="set-c colm"><input id="sheetIn" value="'+esc(st.sheetUrl)+'" placeholder="Paste the Google Sheet link that ends in output=csv"><div class="set-c"><button data-act="sheetsave">Save</button><button data-act="sheetreload">Reload now</button><span class="set-note" id="sheetMsg">'+esc(sheetMsg)+'</span></div><div class="set-help">The screen checks the Sheet every 5 minutes. Blank cells use the built-in lesson.</div></div></div>'+
    '<div class="set-row"><div class="set-l">Seating chart link</div><div class="set-c colm"><input id="seatIn" value="'+esc(st.seatingUrl||CLASS_INFO.seatingUrl)+'"><div class="set-c"><button data-act="seatsave">Save</button></div></div></div>'+
    '<div class="set-row"><div class="set-l">Screen</div><div class="set-c"><button data-act="fullscreen">Full screen browser</button></div></div>'+
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
    case "seating":var u=seatUrl();return u?'<iframe class="seat-frame" src="'+esc(seatEmbed(u))+'" title="Seating chart" allowfullscreen></iframe>':'<div class="vd-empty">Add the seating chart link in Settings.</div>';
    case "timer":return timerHTML(true);
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
      if(p[1]==="auto")setDay("auto");
      else if(p[1]==="set")setDay(+p[2]);
      else setDay(nums[Math.max(0,Math.min(nums.length-1,i+(p[1]==="next"?1:-1)))]);
      return;
    case "section":st.section=p[1];save();render();renderOv();return;
    case "sound":st.sound=p[1];save();renderOv();return;
    case "soundtest":playSound(st.sound);return;
    case "sheetsave":st.sheetUrl=$("#sheetIn").value.trim();save();loadSheet();return;
    case "sheetreload":loadSheet();return;
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
function scaleBoard(){
  var s=Math.min(innerWidth/W,innerHeight/H),b=$("#board");
  b.style.transform="translate("+Math.round((innerWidth-W*s)/2)+"px,"+Math.round((innerHeight-H*s)/2)+"px) scale("+s+")";
}
addEventListener("resize",scaleBoard);

// ---------- start ----------
scaleBoard();render();loadSheet();
setInterval(loadSheet,5*60*1000);
var lastMin=new Date().getMinutes();
setInterval(function(){
  tickTimers();
  var m=new Date().getMinutes();
  if(m!==lastMin){lastMin=m;render();}
},250);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){render();if(OV)renderOv();});
})();
