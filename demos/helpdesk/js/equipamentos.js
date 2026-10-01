/*
 * equipamentos.js -- lista, cadastro, histórico e ENVIO DE LEITURA.
 *
 * O envio de leitura e' o ponto alto do Exercicio 3 no frontend: a pagina
 * manda uma temperatura e o SERVIDOR responde se gerou alerta. A pagina
 * apenas LE o campo critical_condition_detected -- ela NUNCA compara a
 * temperatura com 80. A regra e' do backend.
 */

// Classe de cor conforme a temperatura (so visual; a regra e' do servidor).
function tempClass(temp) {
  if (temp === null || temp === undefined) return "";
  if (temp > 80) return "temp--hot";
  if (temp >= 70) return "temp--warn";
  return "temp--ok";
}

async function loadEquipments(offset = 0) {
  const box = document.getElementById("equip-table");
  showLoading(box);

  const status = document.getElementById("f-eq-status").value;
  const busca = document.getElementById("f-eq-busca")?.value || "";

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (busca.trim()) params.set("search", busca.trim());
  params.set("limit", TAMANHO_PAGINA);
  params.set("offset", offset);
  paramsDeOrdem("equipamentos", params);

  try {
    const pagina = await api.get(`/equipments?${params.toString()}`);
    if (!pagina.items.length) {
      box.innerHTML = estadoVazio(Boolean(status || busca.trim()), "equipamento");
      return;
    }

    const rows = pagina.items
      .map((e) => {
        const temp =
          e.last_temperature === null
            ? `<span class="muted">sem leitura</span>`
            : `<span class="temp ${tempClass(e.last_temperature)}">${e.last_temperature}&deg;C</span>`;
        const alerts = e.open_alerts
          ? `<span class="sev sev--alta">${e.open_alerts}</span>`
          : `<span class="muted">0</span>`;
        return `
          <tr>
            <td>${escapeHtml(e.identifier)}</td>
            <td>${escapeHtml(e.name)}</td>
            <td>${escapeHtml(e.client.company)}</td>
            <td>${badge(e.status)}</td>
            <td class="num">${temp}</td>
            <td class="num">${alerts}</td>
            <td><button class="btn btn--ghost btn--sm" onclick="showEquipment(${e.id})">Detalhes</button></td>
          </tr>`;
      })
      .join("");

    box.innerHTML = `
      <table>
        ${cabecalho("equipamentos", [
          ["ID", "identifier"], ["Nome", "name"], ["Empresa", "company"],
          ["Status", "status"], ["Temp. atual", null, 'class="num"'],
          ["Alertas", null, 'class="num"'], [null, null],
        ], "loadEquipments")}
        <tbody>${rows}</tbody>
      </table>
      ${paginador(pagina, "loadEquipments")}`;
  } catch (error) {
    showErrorState(box, error.detail || error.message);
  }
}

async function fillClientSelect() {
  const select = document.querySelector("#form-equip select[name=client_id]");
  try {
    const clients = await api.get("/clients/options");
    select.innerHTML =
      `<option value="">Selecione...</option>` +
      clients.map((c) => `<option value="${c.id}">${escapeHtml(c.company)}</option>`).join("");
  } catch (error) {
    handleError(error);
  }
}

async function createEquipment(event) {
  event.preventDefault();
  const form = event.target;
  const payload = {
    client_id: Number(form.client_id.value),
    identifier: form.identifier.value.trim(),
    name: form.name.value.trim(),
    location: form.location.value.trim() || null,
    status: form.status.value,
  };
  try {
    const created = await api.post("/equipments", payload);
    toast(`Equipamento "${created.identifier}" cadastrado.`);
    form.reset();
    closeModal("modal-equip");
    loadEquipments();
  } catch (error) {
    handleError(error); // identifier duplicado -> 409
  }
}

/*
 * showEquipment -- detalhe com histórico de leituras e formulário de envio.
 */
async function showEquipment(equipmentId) {
  const body = document.getElementById("ed-body");
  document.getElementById("ed-title").textContent = "Equipamento #" + equipmentId;
  body.innerHTML = `<div class="state state--loading">Carregando...</div>`;
  openModal("modal-eq-detail");

  try {
    const [eq, readings] = await Promise.all([
      api.get(`/equipments/${equipmentId}`),
      api.get(`/equipments/${equipmentId}/readings?limit=15`),
    ]);

    document.getElementById("ed-title").textContent = eq.identifier + " — " + eq.name;

    const history = readings.length
      ? readings
          .map(
            (r) => `
          <tr>
            <td class="temp ${tempClass(r.temperature)}">${r.temperature}&deg;C</td>
            <td>${badge(r.status)}</td>
            <td class="muted">${formatDate(r.recorded_at)}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="3" class="muted">Nenhuma leitura registrada.</td></tr>`;

    body.innerHTML = `
      <dl>
        <div class="detail-row"><dt>Cliente</dt><dd>${escapeHtml(eq.client.company)}</dd></div>
        <div class="detail-row"><dt>Localização</dt><dd>${escapeHtml(eq.location || "—")}</dd></div>
        <div class="detail-row"><dt>Status</dt><dd>${badge(eq.status)}</dd></div>
        <div class="detail-row"><dt>Temp. atual</dt><dd class="temp ${tempClass(
          eq.last_temperature
        )}">${eq.last_temperature === null ? "—" : eq.last_temperature + "&deg;C"}</dd></div>
        <div class="detail-row"><dt>Alertas abertos</dt><dd>${eq.open_alerts}</dd></div>
      </dl>

      <h3 style="margin:18px 0 8px;font-size:15px">Enviar leitura</h3>
      <form id="form-reading" class="filters" style="align-items:flex-end">
        <div class="field">
          <label>Temperatura (&deg;C)</label>
          <input name="temperature" type="number" step="0.1" value="75" required style="min-width:120px" />
        </div>
        <button type="submit" class="btn">Enviar</button>
        <span class="muted" style="font-size:12px">&gt; 80&deg;C gera alerta no servidor</span>
      </form>

      <h3 style="margin:20px 0 8px;font-size:15px">Histórico (${readings.length} últimas)</h3>
      <table>
        <thead><tr><th>Temperatura</th><th>Status</th><th>Data/hora</th></tr></thead>
        <tbody>${history}</tbody>
      </table>`;

    // Liga o formulario de leitura, guardando o id do equipamento no closure.
    document
      .getElementById("form-reading")
      .addEventListener("submit", (e) => sendReading(e, equipmentId));
  } catch (error) {
    body.innerHTML = `<div class="state state--error">${escapeHtml(error.detail || error.message)}</div>`;
  }
}

/*
 * sendReading -- POST /api/equipments/{id}/readings.
 *
 * ★ A DECISAO SOBRE O ALERTA E' DO SERVIDOR. Nos lemos a resposta:
 *   response.critical_condition_detected. Se for true, mostramos em
 *   vermelho. NAO comparamos a temperatura com 80 aqui -- fazer isso seria
 *   colocar a regra no lugar errado.
 */
async function sendReading(event, equipmentId) {
  event.preventDefault();
  const temperature = Number(event.target.temperature.value);

  try {
    const result = await api.post(`/equipments/${equipmentId}/readings`, {
      temperature,
      status: "ONLINE",
    });

    if (result.critical_condition_detected) {
      // O servidor decidiu que e' critico. Mostramos o que ELE respondeu.
      toast(
        `⚠ ALERTA CRÍTICO gerado! ${result.alert.temperature}°C acima do limite de ${result.threshold}°C.`,
        "error"
      );
    } else {
      toast(`Leitura de ${temperature}°C registrada. Sem alerta (limite: ${result.threshold}°C).`);
    }

    showEquipment(equipmentId); // recarrega o detalhe com a leitura nova
    loadEquipments(); // atualiza a temperatura na tabela de fundo
  } catch (error) {
    handleError(error);
  }
}

// ---- LIGACOES DE EVENTOS ----
document.addEventListener("DOMContentLoaded", () => {
  loadEquipments();
  fillClientSelect();
  document.getElementById("form-equip").addEventListener("submit", createEquipment);
  const recarregarEq = () => loadEquipments(0);
  document.getElementById("f-eq-status").addEventListener("change", recarregarEq);
  document.getElementById("f-eq-busca")
    .addEventListener("input", debounce(recarregarEq, 350));
  document.getElementById("btn-eq-limpar").addEventListener("click", () => {
    document.getElementById("f-eq-busca").value = "";
    document.getElementById("f-eq-status").value = "";
    recarregarEq();
  });
});
