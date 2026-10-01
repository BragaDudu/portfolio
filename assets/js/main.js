const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const stackLabel = (key) => STACK[key]?.label ?? key;

/* Tema */
$("#theme-toggle").addEventListener("click", () => {
  const light = document.documentElement.dataset.theme !== "light";
  if (light) document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("eb-theme", light ? "light" : "dark"); } catch (e) {}
});

/* Contato configurável */
if (CONTACT.whatsapp) $$("[data-whatsapp]").forEach((a) => { a.href = `https://wa.me/${CONTACT.whatsapp}`; a.hidden = false; });
if (CONTACT.cv) $$("[data-cv]").forEach((a) => { a.href = CONTACT.cv; a.hidden = false; });

/* Projetos */
function projectCard(p, featured) {
  const tags = p.stack.slice(0, featured ? 5 : 4).map((k) => `<li>${esc(stackLabel(k))}</li>`).join("");
  return `
    <article class="card ${featured ? "card-featured" : ""}" id="projeto-${p.id}">
      <button class="card-media" type="button" data-open="${p.id}" aria-label="Ver prévia de ${esc(p.title)}">
        <img src="${p.cover}" alt="" width="640" height="400" loading="lazy" decoding="async">
        <span class="card-media-hint">${icon("eye")}Ver prévia</span>
      </button>
      <div class="card-body">
        <p class="card-kind">${esc(p.kind)}${p.status ? ` <span class="badge">${esc(p.status)}</span>` : ""}</p>
        <h3>${esc(p.title)}</h3>
        <p class="card-summary">${esc(p.summary)}</p>
        ${featured ? `<p class="card-problem"><strong>Problema:</strong> ${esc(p.problem)}</p>` : ""}
        <ul class="chips chips-sm">${tags}</ul>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" type="button" data-open="${p.id}">${icon("eye")}Ver prévia</button>
          ${p.demo ? `<a class="btn btn-sm" href="${p.demo}" target="_blank" rel="noopener">${icon("external")}${p.embed === false ? "Site no ar" : "Demo"}</a>` : ""}
          ${p.github
            ? `<a class="btn btn-sm" href="${p.github}" target="_blank" rel="noopener" aria-label="Código do ${esc(p.title)} no GitHub">${icon("github")}Código</a>`
            : `<span class="private">${icon("lock")}${esc(p.privateCode ?? "Código privado")}</span>`}
        </div>
      </div>
    </article>`;
}

$("[data-projects=featured]").innerHTML = projects.filter((p) => p.featured).map((p) => projectCard(p, true)).join("");
$("[data-projects=small]").innerHTML = projects.filter((p) => !p.featured).map((p) => projectCard(p, false)).join("");
$("[data-count-projects]").textContent = projects.length;

/* Stack ligada aos projetos */
const groups = {};
for (const [key, item] of Object.entries(STACK)) {
  const usedIn = item.everywhere ? null : projects.filter((p) => p.stack.includes(key));
  if (usedIn && !usedIn.length) continue;
  (groups[item.group] ??= []).push({ ...item, usedIn });
}
$("[data-stack]").innerHTML = Object.entries(groups).map(([group, items]) => `
  <div class="stack-group">
    <h3>${esc(group)}</h3>
    <ul>${items.map((it) => `
      <li>
        <span class="stack-name">${esc(it.label)}</span>
        <span class="stack-where">${it.usedIn
          ? it.usedIn.map((p) => `<a href="#/projeto/${p.id}">${esc(p.title)}</a>`).join(", ")
          : "em todos os projetos"}</span>
      </li>`).join("")}
    </ul>
  </div>`).join("");
$("[data-studying]").textContent = STUDYING.join(" · ");

/* Prévia */
const dialog = $("#preview");
const pv = (name) => $(`[data-pv="${name}"]`, dialog);
let current = null;

function setMode(mode) {
  $$("[data-mode]", dialog).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === mode)));
  $$("[data-panel]", dialog).forEach((el) => { el.hidden = el.dataset.panel !== mode; });
  if (mode === "demo" && current?.demo && !pv("frame-wrap").firstChild) {
    const frame = document.createElement("iframe");
    frame.src = current.demo;
    frame.title = `Demo interativa do ${current.title}`;
    if (current.demoAllow) frame.allow = current.demoAllow;
    pv("frame-wrap").append(frame);
  }
}

function setSize(size) {
  $$("[data-size]", dialog).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === size)));
  pv("frame-wrap").classList.toggle("is-mobile", size === "mobile");
}

function showImage(i) {
  const img = current.images[i];
  const main = pv("main");
  main.src = img.src;
  main.alt = img.alt;
  main.closest("figure").classList.toggle("is-mobile", !!img.mobile);
  $$("button", pv("thumbs")).forEach((b, j) => b.setAttribute("aria-current", String(i === j)));
}

function openPreview(id, { updateHash = true } = {}) {
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  current = p;
  pv("kind").textContent = p.kind;
  pv("title").textContent = p.title;
  pv("summary").textContent = p.summary;
  pv("problem").textContent = p.problem;
  pv("solution").textContent = p.solution;
  pv("features").innerHTML = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
  pv("stack").innerHTML = p.stack.map((k) => `<li>${esc(stackLabel(k))}</li>`).join("");
  pv("origin").textContent = p.origin ?? "";
  pv("origin-wrap").hidden = !p.origin;
  pv("github").hidden = !p.github;
  if (p.github) pv("github").href = p.github;
  pv("private").hidden = !!p.github;
  pv("private-text").textContent = p.privateCode ?? "Código privado";
  pv("demo").hidden = !p.demo;
  pv("demo-label").textContent = p.embed === false ? "Ver site no ar" : "Demo em nova aba";
  pv("demo-link").href = p.demo ?? "#";
  if (p.demo) pv("demo").href = p.demo;
  pv("no-demo").hidden = !p.noDemo;
  pv("no-demo").textContent = p.noDemo ?? "";
  pv("try").textContent = p.tryThis ?? "";
  pv("try").hidden = !p.tryThis;
  pv("thumbs").innerHTML = p.images.length > 1
    ? p.images.map((img, i) => `<button type="button" aria-label="Imagem ${i + 1}: ${esc(img.alt)}"><img src="${img.src}" alt="" loading="lazy" width="96" height="60"></button>`).join("")
    : "";
  $$("button", pv("thumbs")).forEach((b, i) => b.addEventListener("click", () => showImage(i)));
  pv("frame-wrap").replaceChildren();
  $("[data-mode=demo]", dialog).parentElement.hidden = !p.demo || p.embed === false;
  showImage(0);
  setMode("images");
  setSize(matchMedia("(max-width: 720px)").matches ? "mobile" : "desktop");
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  $(".pv-body", dialog).scrollTop = 0;
  if (updateHash) history.replaceState(null, "", `#/projeto/${id}`);
}

function cleanupPreview() {
  if (!current) return;
  pv("frame-wrap").replaceChildren();
  if (location.hash.startsWith("#/projeto/")) history.replaceState(null, "", "#projetos");
  $(`#projeto-${current.id} [data-open]`)?.focus({ preventScroll: true });
  current = null;
}

function closePreview() {
  if (dialog.open) dialog.close();
  cleanupPreview();
}

dialog.addEventListener("close", () => { if (!dialog.open) cleanupPreview(); });
dialog.addEventListener("click", (e) => { if (e.target === dialog) closePreview(); });
$("[data-close]", dialog).addEventListener("click", closePreview);
$$("[data-mode]", dialog).forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
$$("[data-size]", dialog).forEach((b) => b.addEventListener("click", () => setSize(b.dataset.size)));

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) return openPreview(opener.dataset.open);
  const link = e.target.closest('a[href^="#/projeto/"]');
  if (link) { e.preventDefault(); openPreview(link.getAttribute("href").split("/")[2]); }
});

function routeFromHash() {
  const m = location.hash.match(/^#\/projeto\/([\w-]+)/);
  if (m) openPreview(m[1], { updateHash: false });
}
window.addEventListener("hashchange", routeFromHash);
routeFromHash();

/* Copiar e-mail */
const toast = $("[data-toast]");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
}
$$("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    showToast("E-mail copiado");
  } catch (e) {
    showToast(btn.dataset.copy);
  }
}));

/* Entrada discreta das seções */
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".section").forEach((s) => { s.classList.add("reveal"); io.observe(s); });
}
