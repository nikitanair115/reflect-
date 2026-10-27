var THEMES={
Gratitude:["What was the best moment of your day?","Who are you thankful for today, and why?","What small comfort did you enjoy today?","What is something you often take for granted?","What went better than you expected?","What would you like to thank your past self for?"],
Emotions:["What emotion did you experience most today, and why?","When did you feel calm today?","What drained your energy, and what restored it?","Which feeling did you avoid today?","What did your body tell you today?","How do you want to feel tomorrow?"],
Relationships:["Who made your day better, and how?","Is there a conversation you need to have?","How did you show care for someone today?","Who do you want to reconnect with?","When did you listen well today?","What boundary did you keep or wish you had kept?"],
Achievements:["What are two things you are proud of?","What did you finish today, however small?","Which effort deserves more credit than you gave it?","What skill did you use well today?","What progress did you make on something that matters?","What would you tell a friend who did what you did today?"],
Challenges:["What is one thing you regret, and what can you learn from it?","What was the hardest part of your day?","What are you putting off, and what is the smallest first step?","What worry can you set down tonight?","Where did you get stuck, and what might help?","What would make tomorrow\u2019s hardest task easier?"],
Growth:["What did you learn about yourself today?","What is one thing you want to do differently tomorrow?","Which habit is helping you, and which is not?","What question are you sitting with right now?","When did you step outside your comfort zone?","What kind of person do you want to be this week?"]};
var WEEKLY=["What was the most important lesson of this week?","What progress did you make, personally or in your goals?","What drained you, and what gave you energy?","What are you proud of from the past seven days?","What do you want to let go of before next week?","What are your three intentions for the week ahead?"];

var S={reminder:false,time:"20:00",themes:Object.keys(THEMES),done:{}};
var view="home",lastNotified="",installEvent=null,swReg=null;
try{var raw=localStorage.getItem("reflect_v1");if(raw){var p=JSON.parse(raw);for(var k in p)S[k]=p[k];}}catch(e){}
function save(){try{localStorage.setItem("reflect_v1",JSON.stringify(S));}catch(e){}}

if("serviceWorker" in navigator){
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("service-worker.js").then(function(r){swReg=r;}).catch(function(){});
  });
}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();installEvent=e;if(view==="settings")render();});
window.addEventListener("appinstalled",function(){installEvent=null;if(view==="settings")render();});

function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dayNum(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}
function todayPlan(){
  var t=S.themes.length?S.themes:Object.keys(THEMES);var n=dayNum(new Date());
  var theme=t[n%t.length],list=THEMES[theme],out=[],start=(n*2)%list.length;
  for(var i=0;i<4;i++)out.push(list[(start+i)%list.length]);
  return{theme:theme,qs:out};
}
function streak(){var c=0,d=new Date();if(!S.done[key(d)])d.setDate(d.getDate()-1);while(S.done[key(d)]){c++;d.setDate(d.getDate()-1);}return c;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;}

function render(){
  var h="",app=document.getElementById("app"),now=new Date(),k=key(now);
  if(view==="home"){
    var dots="";for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var kk=key(d);
      dots+='<div class="dot'+(S.done[kk]?" on":"")+(i===0?" today":"")+'"><i></i>'+"SMTWTFS".charAt(d.getDay())+"</div>";}
    var s=streak();
    h='<div class="hero"><p class="mute">Reflect</p><h1>Take a quiet minute.</h1><p class="date mute">'+now.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})+'</p></div>'+
    '<div class="card"><div class="row"><b>This week</b><span class="small mute">'+(s?s+(s===1?" day":" days")+" in a row":"Start today")+'</span></div><div class="dots">'+dots+'</div></div>'+
    '<div class="card"><p class="small mute">Today\u2019s theme</p><h2 style="margin:4px 0 14px">'+todayPlan().theme+'</h2>'+
    (S.done[k]?'<p class="done" style="margin-bottom:14px">Done for today. Well done.</p>':'<p class="mute small" style="margin-bottom:14px">Four prompts to answer in your notebook.</p>')+
    '<button class="btn" data-go="today">Today\u2019s Reflection</button></div>';
  }else if(view==="today"){
    var pl=todayPlan();
    h='<button class="back" data-go="home">\u2039 Back</button><span class="tag">'+pl.theme+'</span><h2 style="margin:12px 0 4px">Write these in your notebook</h2><p class="mute small">Your answers stay on paper. Nothing is typed or saved here.</p><div class="card">';
    pl.qs.forEach(function(q,i){h+='<div class="q"><b>'+(i+1)+'</b><span>'+esc(q)+'</span></div>';});
    h+='</div><div style="margin-top:16px"><button class="btn'+(S.done[k]?" alt":"")+'" data-act="toggle">'+(S.done[k]?"Marked as done \u2713 (tap to undo)":"I\u2019ve finished journaling today")+'</button></div>';
  }else if(view==="weekly"){
    h='<div class="hero"><h1 style="font-size:34px">Weekly reflection</h1><p class="mute" style="margin-top:8px">Best on a Sunday, but any day works.</p></div><div class="card">';
    WEEKLY.forEach(function(q,i){h+='<div class="q"><b>'+(i+1)+'</b><span>'+esc(q)+'</span></div>';});
    h+='</div>';
  }else{
    h='<div class="hero"><h1 style="font-size:34px">Settings</h1></div>'+
    '<div class="card"><div class="row"><div><b>Reminder while app is open</b><p class="small mute">Shows a notification at your time</p></div><button class="sw" role="switch" aria-label="Reminder while app is open" aria-checked="'+S.reminder+'" data-act="rem"></button></div>'+
    '<div class="row" style="margin-top:16px"><label for="t"><b>Reminder time</b></label><input id="t" type="time" value="'+S.time+'"></div>'+
    '<div class="note">A web app cannot reliably wake your phone at a set time when it is closed. For a dependable daily reminder, add it to Google Calendar (below) or set a repeating alarm in your Clock app.</div>'+
    '<button class="btn" style="margin-top:12px" data-act="cal">Add daily reminder to Google Calendar</button>'+
    '<button class="btn alt" style="margin-top:10px" data-act="test">Send a test notification</button><p id="msg" class="small mute" style="margin-top:8px"></p></div>'+
    '<div class="card"><b>Journaling themes</b><p class="small mute">Pick the themes you want to rotate through.</p><div class="chips">'+
    Object.keys(THEMES).map(function(t){return '<button class="chip" aria-pressed="'+(S.themes.indexOf(t)>-1)+'" data-theme="'+t+'">'+t+'</button>';}).join("")+'</div></div>'+
    '<div class="card"><b>Install</b><p class="small mute" style="margin:4px 0 12px">'+(isStandalone()?"Reflect is installed on this device.":"Add Reflect to your home screen to open it like an app.")+'</p>'+
    (installEvent&&!isStandalone()?'<button class="btn alt" data-act="install">Install Reflect</button>':'')+'</div>'+
    '<p class="small mute" style="margin-top:16px;text-align:center">No account. Only your settings and the days you completed are stored on this device.</p>';
  }
  app.innerHTML=h;
  document.querySelectorAll(".nav button").forEach(function(b){var on=b.dataset.go===view||(view==="today"&&b.dataset.go==="home");if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  window.scrollTo(0,0);
}
function say(t){var m=document.getElementById("msg");if(m)m.textContent=t;}

function notify(){
  var opts={body:"Time for your daily reflection. Grab your notebook.",icon:"icon-192.png",badge:"icon-192.png",tag:"reflect-daily"};
  if("serviceWorker" in navigator){
    return navigator.serviceWorker.ready.then(function(reg){return reg.showNotification("Reflect",opts);}).then(function(){return true;}).catch(function(){return false;});
  }
  return Promise.resolve(false);
}
function calendarLink(){
  var parts=S.time.split(":"),h=+parts[0],m=+parts[1],now=new Date(),st=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m);
  if(st<=now)st.setDate(st.getDate()+1);
  var en=new Date(st.getTime()+10*60000);
  function f(d){return d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")+"T"+String(d.getHours()).padStart(2,"0")+String(d.getMinutes()).padStart(2,"0")+"00";}
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Reflect: daily journaling")+"&details="+encodeURIComponent("Grab your notebook and open Reflect for today\u2019s prompts.")+"&dates="+f(st)+"/"+f(en)+"&recur="+encodeURIComponent("RRULE:FREQ=DAILY");
}

document.addEventListener("click",function(e){
  var el=e.target.closest("[data-go],[data-act],[data-theme]");if(!el)return;
  if(el.dataset.go){view=el.dataset.go;render();return;}
  if(el.dataset.theme){var t=el.dataset.theme,i=S.themes.indexOf(t);
    if(i>-1){if(S.themes.length>1)S.themes.splice(i,1);}else S.themes.push(t);save();render();return;}
  var a=el.dataset.act,k=key(new Date());
  if(a==="toggle"){if(S.done[k])delete S.done[k];else S.done[k]=1;save();render();}
  if(a==="cal"){window.open(calendarLink(),"_blank");}
  if(a==="install"&&installEvent){installEvent.prompt();installEvent=null;}
  if(a==="rem"){
    if(!S.reminder){
      if(!("Notification" in window)){say("This browser does not support notifications.");return;}
      Notification.requestPermission().then(function(r){if(r==="granted"){S.reminder=true;save();render();}else{say("Permission was not granted, so this reminder stays off.");}}).catch(function(){say("Could not ask for permission here.");});
    }else{S.reminder=false;save();render();}
  }
  if(a==="test"){
    if(!("Notification" in window)){say("Notifications are not supported in this browser.");return;}
    Notification.requestPermission().then(function(r){
      if(r!=="granted"){say("Permission not granted. Allow notifications for this site in Chrome settings.");return;}
      return notify().then(function(ok){say(ok?"Test sent. If it appeared, notifications work here.":"Could not show it. Try opening the installed app and testing again.");});
    }).catch(function(){say("Could not ask for permission here.");});
  }
});
document.addEventListener("change",function(e){if(e.target.id==="t"&&e.target.value){S.time=e.target.value;save();}});
setInterval(function(){
  if(!S.reminder||!("Notification" in window)||Notification.permission!=="granted")return;
  var n=new Date(),hm=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"),k=key(n);
  if(hm===S.time&&lastNotified!==k&&!S.done[k]){lastNotified=k;notify();}
},20000);
render();
