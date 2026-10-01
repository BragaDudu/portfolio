/*
 * alertas.js -- anomalias (diagnóstico do agora) e histórico de alertas.
 *
 * Diferenca que esta pagina deixa clara:
 *   ANOMALIA = diagnostico do momento, calculado na hora (GET /anomalies)
 *   ALERTA   = evento gravado no banco quando passou de 80 (GET /alerts)
 */

// Painel superior: anomalias detectadas agora.
async function loadAnomalies() {
  const box = document.getElementById("anomalies");
  try {
    const items = await api.get("/equipments/anomalies");

    if (!items.length) {
      box.innerHTML = `<div class="state state--empty" style="color:var(--green)">✓ Nenhuma situação anormal no momento.</div>`;
      return;
    }

    /*
     * ★ O PROBLEMA QUE ESTE BLOCO RESOLVE
     *
     *   Com 900 equipamentos, esta lista chegou a 1.115 linhas -- todas
     *   desenhadas de uma vez. A tela virava uma rolagem sem fim, e uma
     *   lista que ninguem consegue ler é o mesmo que nao ter lista.
     *
     *   A correcao nao e' so paginar: e' MUDAR A PERGUNTA. Ninguem precisa
     *   ver as 899 anomalias uma a uma. Precisa saber QUANTAS sao de cada
     *   tipo, e ver as mais graves. Resumo em cima, detalhe embaixo.
     */
    const porTipo = {};
    for (const a of items) porTipo[a.anomaly_type] = (porTipo[a.anomaly_type] || 0) + 1;

    // Ordena por gravidade: ALTA primeiro. O que exige acao agora fica no topo.
    const peso = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
    const ordenadas = [...items].sort(
      (x, y) => (peso[x.severity] ?? 9) - (peso[y.severity] ?? 9)
    );
    const MOSTRAR = 8;
    const visiveis = ordenadas.slice(0, MOSTRAR);

    const resumo = Object.entries(porTipo)
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, n]) => `<span class="chip">${escapeHtml(tipo.replace(/_/g, " "))} <strong>${n}</strong></span>`)
      .join("");

    const linhas = visiveis
      .map(
        (a) => `
        <div class="detail-row">
          <dt>
            <span class="sev sev--${a.severity.toLowerCase()}">[${a.severity}]</span>
            <strong>${escapeHtml(a.identifier)}</strong>
          </dt>
          <dd class="muted" style="font-weight:400">
            ${escapeHtml(a.client_company || "")} — ${escapeHtml(a.detail)}
          </dd>
        </div>`
      )
      .join("");

    const restantes = items.length - visiveis.length;

    box.innerHTML = `
      <div class="filter-chips" style="margin-bottom:14px">${resumo}</div>
      ${linhas}
      ${restantes > 0
        ? `<div class="state state--empty" style="padding:14px 0 0">
             + ${restantes} outras situações. Use a lista de equipamentos
             para filtrar por empresa ou status.
           </div>`
        : ""}`;
  } catch (error) {
    showErrorState(box, error.detail || error.message);
  }
}

// Painel inferior: histórico de alertas, com filtro por status.
async function loadAlerts(offset = 0) {
  const box = document.getElementById("alerts-table");
  showLoading(box);

  const status = document.getElementById("f-alert-status").value;
  const qs = status ? `?status=${status}` : "";

  try {
    const sep = qs ? "&" : "?";
    const pagina = await api.get(`/alerts${qs}${sep}limit=${TAMANHO_PAGINA}&offset=${offset}&${paramsDeOrdem('alertas', new URLSearchParams())}`);
    const alerts = pagina.items;
    if (!alerts.length) return showEmpty(box, "Nenhum alerta com esse filtro.");

    const rows = alerts
      .map(
        (a) => `
        <tr>
          <td class="num">${a.id}</td>
          <td>${escapeHtml(a.equipment_identifier || "—")}</td>
          <td>${escapeHtml(a.client_company || "—")}</td>
          <td class="num"><span class="temp temp--hot">${a.temperature}&deg;C</span></td>
          <td>${badge(a.status)}</td>
          <td class="muted">${formatDate(a.created_at)}</td>
          <td>${alertActions(a)}</td>
        </tr>`
      )
      .join("");

    box.innerHTML = `
      <table>
        ${cabecalho("alertas", [
          ["ID", "id"], ["Equipamento", "identifier"], ["Empresa", "company"],
          ["Temp.", "temperature", 'class="num"'], ["Status", "status"],
          ["Detectado em", "created_at"], [null, null],
        ], "loadAlerts")}
        <tbody>${rows}</tbody>
      </table>
      ${paginador(pagina, "loadAlerts")}`;
  } catch (error) {
    showErrorState(box, error.detail || error.message);
  }
}

// Botoes de ciclo de vida conforme o status atual do alerta.
function alertActions(alert) {
  if (alert.status === "RESOLVIDO") {
    return `<span class="muted">—</span>`;
  }
  const buttons = [];
  if (alert.status === "ABERTO") {
    buttons.push(
      `<button class="btn btn--ghost btn--sm" onclick="setAlert(${alert.id}, 'RECONHECIDO')">Reconhecer</button>`
    );
  }
  buttons.push(
    `<button class="btn btn--sm" onclick="setAlert(${alert.id}, 'RESOLVIDO')">Resolver</button>`
  );
  return buttons.join(" ");
}

/*
 * setAlert -- PATCH /api/alerts/{id}/status.
 * Alerta nunca e' apagado, so muda de status. Um resolvido some da
 * contagem de pendencias mas continua no historico.
 */
async function setAlert(alertId, status) {
  try {
    await api.patch(`/alerts/${alertId}/status`, { status });
    toast(`Alerta #${alertId} marcado como ${status}.`);
    loadAlerts();
    loadAnomalies(); // um alerta resolvido pode mudar o quadro de anomalias
  } catch (error) {
    handleError(error);
  }
}

// ---- LIGACOES DE EVENTOS ----
document.addEventListener("DOMContentLoaded", () => {
  loadAnomalies();
  loadAlerts();
  document.getElementById("f-alert-status").addEventListener("change", () => loadAlerts(0));
});
