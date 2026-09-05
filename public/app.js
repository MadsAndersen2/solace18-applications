const types = {
  whitelist: {
    title: "Whitelist",
    description: "For dig der gerne vil være en del af Solace 18+.",
    fields: [
      ["name", "Hvad hedder du?", "text"],
      ["age", "Hvor gammel er du?", "number"],
      ["experience", "Beskriv din tidligere RP-erfaring", "textarea"],
      ["character", "Fortæl om din karakter", "textarea"],
      ["motivation", "Hvorfor vil du spille på Solace 18+?", "textarea"]
    ]
  },

  staff: {
    title: "Staff",
    description: "For dig der gerne vil hjælpe med serveren og communityet.",
    fields: [
      ["name", "Navn", "text"],
      ["age", "Alder", "number"],
      ["experience", "Tidligere staff-erfaring", "textarea"],
      ["motivation", "Hvorfor vil du være staff?", "textarea"],
      ["hours", "Hvor mange timer kan du lægge om ugen?", "text"]
    ]
  },

  creator: {
    title: "Content Creator",
    description: "For streamere og content creators, der vil skabe indhold på Solace.",
    fields: [
      ["name", "Navn / creator-navn", "text"],
      ["platform", "Platform og kanal-link", "text"],
      ["audience", "Fortæl kort om dit publikum", "textarea"],
      ["motivation", "Hvorfor vil du samarbejde med Solace 18+?", "textarea"]
    ]
  },

  company: {
    title: "Firma",
    description: "For dig der vil starte eller overtage en virksomhed i byen.",
    fields: [
      ["name", "Navn", "text"],
      ["company", "Hvilket firma søger du?", "text"],
      ["concept", "Beskriv dit koncept", "textarea"],
      ["experience", "Relevant RP-erfaring", "textarea"],
      ["plan", "Hvad vil du bidrage med til byen?", "textarea"]
    ]
  },

  police: {
    title: "Politi",
    description: "For dig der ønsker at blive en del af politiet på Solace 18+.",
    fields: [
      ["name", "Hvad hedder du?", "text"],
      ["age", "Hvor gammel er du?", "number"],
      ["experience", "Beskriv din tidligere RP-erfaring", "textarea"],
      ["policeExperience", "Har du tidligere erfaring med politi-RP?", "textarea"],
      ["motivation", "Hvorfor vil du være betjent på Solace 18+?", "textarea"],
      ["strengths", "Hvilke styrker vil du bidrage med til politiet?", "textarea"],
      ["availability", "Hvor aktiv forventer du at være?", "text"]
    ]
  },

  ems: {
    title: "Læge",
    description: "For dig der ønsker at blive en del af sundhedsberedskabet på Solace 18+.",
    fields: [
      ["name", "Hvad hedder du?", "text"],
      ["age", "Hvor gammel er du?", "number"],
      ["experience", "Beskriv din tidligere RP-erfaring", "textarea"],
      ["emsExperience", "Har du tidligere erfaring med læge/EMS-RP?", "textarea"],
      ["motivation", "Hvorfor vil du være læge på Solace 18+?", "textarea"],
      ["patientRp", "Hvordan vil du skabe godt RP med patienter?", "textarea"],
      ["availability", "Hvor aktiv forventer du at være?", "text"]
    ]
  }
};

let me = { loggedIn: false, permissions: {} };
let applications = [];
let selectedType = null;

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Der opstod en fejl.");
  }

  return data;
}

async function loadMe() {
  try {
    me = await api("/api/me");
  } catch (error) {
    console.error("Kunne ikke hente bruger:", error);
    me = { loggedIn: false, permissions: {} };
  }

  renderLogin();
}

function renderLogin() {
  const loginArea = document.querySelector("#loginArea");
  if (!loginArea) return;

  if (!me.loggedIn) {
    loginArea.innerHTML = `
      <div class="login-box">
        <strong>Log ind for at fortsætte</strong>
        <p>🟢 Brug din Discord-konto for at se dine muligheder.</p>
        <a href="/api/auth-login">Log ind med Discord →</a>
      </div>
    `;
    return;
  }

  const username = me.user?.username || "Discord bruger";

  loginArea.innerHTML = `
    <div class="login-box">
      <strong>Logget ind som ${escapeHtml(username)}</strong>
      <p>🟢 Du er logget ind med Discord.</p>
      <a href="/api/logout">Log ud →</a>
    </div>
  `;
}

function renderTypes() {
  const container =
    document.querySelector("#applicationTypes") ||
    document.querySelector("#types") ||
    document.querySelector(".application-types");

  if (!container) {
    console.error("Kunne ikke finde container til ansøgninger.");
    return;
  }

  container.innerHTML = "";

  Object.entries(types).forEach(([key, type], index) => {
    const item = document.createElement("div");
    item.className = "application-row";

    item.innerHTML = `
      <div class="application-number">
        ${String(index + 1).padStart(2, "0")}
      </div>

      <div class="application-info">
        <h3>${escapeHtml(type.title)}</h3>
        <p>${escapeHtml(type.description)}</p>
      </div>

      <div class="application-action">
        ${
          me.loggedIn
            ? `<button type="button" data-apply="${key}">Ansøg →</button>`
            : `<span>LOGIN KRÆVES</span>`
        }
      </div>
    `;

    container.appendChild(item);
  });

  container.querySelectorAll("[data-apply]").forEach(button => {
    button.addEventListener("click", () => {
      openApplication(button.dataset.apply);
    });
  });
}

function openApplication(typeKey) {
  const type = types[typeKey];
  if (!type || !me.loggedIn) return;

  selectedType = typeKey;

  const modal =
    document.querySelector("#applicationModal") ||
    document.querySelector("#modal");

  const form =
    document.querySelector("#applicationForm") ||
    document.querySelector("#form");

  if (!modal || !form) {
    console.error("Kunne ikke finde ansøgningsformularen.");
    return;
  }

  const title = modal.querySelector("h2");
  if (title) {
    title.textContent = type.title;
  }

  const fields = type.fields.map(([name, label, fieldType]) => {
    if (fieldType === "textarea") {
      return `
        <label>
          <span>${escapeHtml(label)}</span>
          <textarea name="${name}" required></textarea>
        </label>
      `;
    }

    return `
      <label>
        <span>${escapeHtml(label)}</span>
        <input
          type="${fieldType}"
          name="${name}"
          required
        >
      </label>
    `;
  }).join("");

  form.innerHTML = `
    ${fields}

    <div class="form-actions">
      <button type="button" id="cancelApplication">Annuller</button>
      <button type="submit">Send ansøgning</button>
    </div>
  `;

  modal.hidden = false;
  modal.classList.add("open");

  const cancelButton = document.querySelector("#cancelApplication");

  if (cancelButton) {
    cancelButton.addEventListener("click", closeApplication);
  }

  form.onsubmit = submitApplication;
}

function closeApplication() {
  const modal =
    document.querySelector("#applicationModal") ||
    document.querySelector("#modal");

  if (!modal) return;

  modal.hidden = true;
  modal.classList.remove("open");
  selectedType = null;
}

async function submitApplication(event) {
  event.preventDefault();

  if (!selectedType) return;

  const form = event.currentTarget;
  const formData = new FormData(form);

  const answers = {};

  for (const [key, value] of formData.entries()) {
    answers[key] = value;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sender...";
  }

  try {
    await api("/api/applications", {
      method: "POST",
      body: JSON.stringify({
        type: selectedType,
        answers
      })
    });

    alert("Din ansøgning er sendt.");
    closeApplication();
    await loadApplications();
  } catch (error) {
    alert(error.message);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Send ansøgning";
    }
  }
}

async function loadApplications() {
  if (!me.loggedIn) {
    applications = [];
    return;
  }

  try {
    applications = await api("/api/applications");
  } catch (error) {
    console.error("Kunne ikke hente ansøgninger:", error);
    applications = [];
  }

  renderMyApplications();
}

function renderMyApplications() {
  const container =
    document.querySelector("#myApplications") ||
    document.querySelector("#mine");

  if (!container) return;

  if (!me.loggedIn) {
    container.innerHTML = "";
    return;
  }

  if (!applications.length) {
    container.innerHTML = `
      <p>Du har ingen ansøgninger endnu.</p>
    `;
    return;
  }

  container.innerHTML = applications.map(application => {
    const title =
      types[application.type]?.title ||
      application.type;

    return `
      <div class="my-application">
        <strong>${escapeHtml(title)}</strong>
        <span>${statusText(application.status)}</span>
      </div>
    `;
  }).join("");
}

function statusText(status) {
  const statuses = {
    pending: "Afventer",
    interview: "Samtale",
    approved: "Godkendt",
    rejected: "Afvist"
  };

  return statuses[status] || status;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function init() {
  await loadMe();
  renderTypes();

  if (me.loggedIn) {
    await loadApplications();
  }
}

document.addEventListener("DOMContentLoaded", init);
