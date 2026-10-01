// Cópia de demonstração no portfólio: bloqueia ações que contatariam a empresa de verdade.
(() => {
  const isContact = (a) => /^(tel:|mailto:|https?:\/\/(wa\.me|api\.whatsapp\.com))/i.test(a.getAttribute("href") || "");
  function notice() {
    const box = document.getElementById("demo-aviso");
    box.textContent = "Demonstração: os contatos estão desativados nesta cópia. No site real, este botão abre o WhatsApp, o telefone ou o e-mail da empresa.";
    box.dataset.on = "1";
    clearTimeout(notice.t);
    notice.t = setTimeout(() => { box.dataset.on = ""; box.textContent = "Demonstração do portfólio de Eduardo Braga · contatos desativados"; }, 4000);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (a && isContact(a)) { e.preventDefault(); e.stopImmediatePropagation(); notice(); }
  }, true);
  document.addEventListener("submit", (e) => { e.preventDefault(); e.stopImmediatePropagation(); notice(); }, true);
  const origOpen = window.open;
  window.open = (url, ...rest) => (/wa\.me|whatsapp|^tel:|^mailto:/i.test(String(url)) ? (notice(), null) : origOpen.call(window, url, ...rest));
  document.addEventListener("DOMContentLoaded", () => {
    const box = document.createElement("div");
    box.id = "demo-aviso";
    box.setAttribute("role", "status");
    box.textContent = "Demonstração do portfólio de Eduardo Braga · contatos desativados";
    box.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:99999;width:max-content;max-width:calc(100% - 24px);text-align:center;font:12px/1.4 system-ui,sans-serif;background:rgba(10,20,35,.92);color:#e5edf7;padding:8px 12px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.35)";
    document.body.appendChild(box);
  });
})();
