const types = {
  whitelist: {
    title: "Whitelist",
    description: "For dig der gerne vil være en del af Solace 16+.",
    fields: [
      ["name","Hvad hedder du?","text"],
      ["age","Hvor gammel er du?","number"],
      ["experience","Beskriv din tidligere RP-erfaring","textarea"],
      ["character","Fortæl om din karakter","textarea"],
      ["motivation","Hvorfor vil du spille på Solace 16+?","textarea"]
    ]
  },
  staff: {
    title: "Staff",
    description: "For dig der gerne vil hjælpe med serveren og communityet.",
    fields: [
      ["name","Navn","text"],
      ["age","Alder","number"],
      ["experience","Tidligere staff-erfaring","textarea"],
      ["motivation","Hvorfor vil du være staff?","textarea"],
      ["hours","Hvor mange timer kan du lægge om ugen?","text"]
    ]
  },
  creator: {
    title: "Content Creator",
    description: "For streamere og content creators, der vil skabe indhold på Solace.",
    fields: [
      ["name","Navn / creator-navn","text"],
      ["platform","Platform og kanal-link","text"],
      ["audience","Fortæl kort om dit publikum","textarea"],
      ["motivation","Hvorfor vil du samarbejde med Solace 18+?","textarea"]
    ]
  },
  company: {
    title: "Firma",
    description: "For dig der vil starte eller overtage en virksomhed i byen.",
    fields: [
      ["name","Navn","text"],
      ["company","Hvilket firma søger du?","text"],
      ["concept","Beskriv dit koncept","textarea"],
      ["experience","Relevant RP-erfaring","textarea"],
      ["plan","Hvad vil du bidrage med til byen?","textarea"]
    ]
  },
  police: {
    title: "Politi",
    description: "For dig der ønsker at blive en del af politiet på Solace 18+.",
    fields: [
      ["name","Hvad hedder du?","text"],
      ["age","Hvor gammel er du?","number"],
      ["experience","Beskriv din tidligere RP-erfaring","textarea"],
      ["policeExperience","Har du tidligere erfaring med politi-RP?","textarea"],
      ["motivation","Hvorfor vil du være betjent på Solace 16+?","textarea"],
      ["strengths","Hvilke styrker vil du bidrage med til politiet?","textarea"],
      ["availability","Hvor aktiv forventer du at være?","text"]
    ]
  },
  ems: {
    title: "Læge",
    description: "For dig der ønsker at blive en del af sundhedsberedskabet på Solace 18+.",
    fields: [
      ["name","Hvad hedder du?","text"],
      ["age","Hvor gammel er du?","number"],
      ["experience","Beskriv din tidligere RP-erfaring","textarea"],
      ["emsExperience","Har du tidligere erfaring med læge/EMS-RP?","textarea"],
      ["motivation","Hvorfor vil du være læge på Solace 18+?","textarea"],
      ["patientRp","Hvordan vil du skabe godt RP med patienter?","textarea"],
      ["availability","Hvor aktiv forventer du at være?","text"]
    ]
  }
};

let me = { loggedIn:false, permissions:{} };
let currentType = null;
let staffCurrentType = null;
let staffCurrentApp = null;

const qs = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function statusText(s){return ({pending:"Afventer",interview:"Samtale",approved:"Godkendt",rejected:"Afvist"})[s]||s}

async function init(){
  me = await fetch("/api/me").then(r=>r.json());
  renderHeader();
  renderRows();
  if(me.loggedIn) {
    qs("#mine").classList.remove("hidden");
    loadMine();
    const perms = me.permissions || {};
    if(perms.admin || perms.whitelist || perms.staff || perms.creator || perms.company || perms.police || perms.ems) {
      qs("#staff").classList.remove("hidden");
      qs("#staffNav").classList.remove("hidden");
      renderStaffTabs();
    }
  }
}

function renderHeader(){
  if(!me.loggedIn) return;
  qs("#loginBtn").classList.add("hidden");
  qs("#loginPanel").innerHTML = `<div class="rule"></div><b>Du er logget ind</b><p><span class="dot"></span>${esc(me.user.username)}</p><a href="#mine">Se dine ansøgninger →</a><div class="rule"></div>`;
  qs("#accountBtn").classList.remove("hidden");
  qs("#accountBtn").textContent = me.user.username;
  qs("#logoutBtn").classList.remove("hidden");
}

function renderRows(){
  qs("#applicationRows").innerHTML = Object.entries(types).map(([key,t],i)=>`
    <div class="app-row" data-type="${key}">
      <div class="num">0${i+1}</div>
      <div><h3>${t.title}</h3><p>${t.description}</p></div>
      <div class="require">${me.loggedIn ? "ÅBN ANSØGNING" : "LOGIN KRÆVES"}</div>
      <div class="arrow">↘</div>
    </div>`).join("");
  document.querySelectorAll(".app-row").forEach(el=>el.onclick=()=>{
    if(!me.loggedIn){ location.href="/api/auth-login"; return; }
    openApply(el.dataset.type);
  });
}

function openApply(type){
  currentType = type; const t = types[type];
  qs("#formTitle").textContent=t.title;
  qs("#formFields").innerHTML=t.fields.map(([name,label,kind])=>`
    <label>${label}${kind==="textarea"
      ? `<textarea name="${name}" rows="4" required></textarea>`
      : `<input name="${name}" type="${kind}" required>`}</label>`).join("");
  qs("#formError").textContent="";
  qs("#applyDialog").showModal();
}

qs("#applyForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget), answers={};
  for(const [k,v] of fd.entries()) answers[k]=v;
  const r=await fetch("/api/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:currentType,answers})});
  const data=await r.json();
  if(!r.ok){qs("#formError").textContent=data.error||"Noget gik galt.";return}
  qs("#applyDialog").close(); e.currentTarget.reset(); loadMine();
});

async function loadMine(){
  const rows=await fetch("/api/applications").then(r=>r.json());
  qs("#myApplications").innerHTML = rows.length ? rows.map(a=>`
    <article class="card">
      <div class="card-head"><div><h3>${types[a.type]?.title||a.type}</h3><span class="meta">${new Date(a.created_at).toLocaleString("da-DK")}</span></div><span class="badge">${statusText(a.status)}</span></div>
      ${a.staff_reply?`<p class="reply"><b>Svar fra teamet:</b><br>${esc(a.staff_reply)}</p>`:""}
    </article>`).join("") : `<p class="meta">Du har ikke sendt nogen ansøgninger endnu.</p>`;
}

function renderStaffTabs(){
  const p=me.permissions||{};
  const allowed=Object.keys(types).filter(k=>p.admin||p[k]);
  qs("#staffTabs").innerHTML=allowed.map((k,i)=>`<button data-type="${k}" class="${i===0?"active":""}">${types[k].title}</button>`).join("");
  document.querySelectorAll("#staffTabs button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("#staffTabs button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); loadStaff(b.dataset.type);
  });
  if(allowed.length) loadStaff(allowed[0]);
}

async function loadStaff(type){
  staffCurrentType=type;
  const r=await fetch(`/api/staff-applications?type=${encodeURIComponent(type)}`);
  const rows=await r.json();
  if(!r.ok){qs("#staffApplications").innerHTML=`<p class="error">${esc(rows.error)}</p>`;return}
  qs("#staffApplications").innerHTML=rows.length?rows.map(a=>`
    <article class="card staff-card" data-id="${a.id}">
      <div class="card-head"><div><h3>${esc(a.discord_name)}</h3><span class="meta">${new Date(a.created_at).toLocaleString("da-DK")}</span></div><span class="badge">${statusText(a.status)}</span></div>
      <p>${Object.values(a.answers||{}).slice(0,2).map(esc).join(" · ")}</p>
      <button class="primary">Åbn ansøgning</button>
    </article>`).join(""):`<p class="meta">Ingen ansøgninger i denne kategori.</p>`;
  document.querySelectorAll(".staff-card button").forEach(btn=>btn.onclick=()=>{
    const id=btn.closest(".staff-card").dataset.id;
    staffCurrentApp=rows.find(x=>String(x.id)===String(id)); openStaff();
  });
}

function openStaff(){
  const a=staffCurrentApp; qs("#staffTitle").textContent=`${types[a.type].title} – ${a.discord_name}`;
  qs("#staffAnswers").innerHTML=`<div class="answer-grid">${Object.entries(a.answers||{}).map(([k,v])=>`<div class="answer"><small>${esc(k)}</small><p>${esc(v)}</p></div>`).join("")}</div>`;
  qs("#staffStatus").value=a.status; qs("#staffReply").value=a.staff_reply||""; qs("#staffDialog").showModal();
}

qs("#staffForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const r=await fetch("/api/staff-applications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    id:staffCurrentApp.id,status:qs("#staffStatus").value,staffReply:qs("#staffReply").value
  })});
  const data=await r.json(); if(!r.ok){alert(data.error||"Kunne ikke gemme.");return}
  qs("#staffDialog").close(); loadStaff(staffCurrentType);
});

init();
