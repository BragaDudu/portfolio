/*
 * dashboard.js -- monta a tela inicial a partir da API.
 *
 * QUANDO A PAGINA CARREGA, este arquivo faz requisicoes reais e desenha os
 * cartoes e os "graficos" (barras em CSS puro, sem biblioteca).
 * Nenhum numero aqui e' inventado: todos vem do banco via /api/analytics.
 */

// Desenha uma barra horizontal.
//   value    -> numero que define a LARGURA da barra (proporcional ao maximo)
//   display  -> o que aparece escrito a direita (padrao: o proprio value)
// Separar os dois permite a barra ter largura de "48 horas" mas mostrar
// o texto "2d 0h".
function barRow(label, value, max, display = null) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const text = display === null ? value : display;
  return `
    <div class="bar-row">
      <div class="bar-row__label" title="${escapeHtml(label)}">${escapeHtml(label)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="bar-row__value">${escapeHtml(text)}</div>
    </div>`;
}

function statCard(label, value, extra = "", modifier = "") {
  return `
    <div class="stat-card ${modifier}">
      <div class="stat-card__label">${escapeHtml(label)}</div>
      <div class="stat-card__value">${value}${extra}</div>
    </div>`;
}

async function loadDashboard() {
  const grid = document.getElementById("stat-grid");

  try {
    // UMA requisicao traz todos os numeros dos cartoes (endpoint /summary).
    const s = await api.get("/analytics/summary");

    grid.innerHTML = [
      statCard("Clientes", s.total_clientes, "", "stat-card--accent"),
      statCard("Chamados", s.total_chamados),
      statCard("Abertos", s.chamados_abertos, "", "stat-card--warn"),
      statCard("Em andamento", s.chamados_em_andamento, "", "stat-card--warn"),
      statCard("Finalizados", s.chamados_finalizados, "", "stat-card--ok"),
      statCard("Equipamentos", s.total_equipamentos, "", "stat-card--accent"),
      statCard(
        "Alertas críticos",
        s.alertas_criticos_abertos,
        `<small> / ${s.total_alertas}</small>`,
        "stat-card--danger"
      ),
      statCard(
        "Tempo médio resolução",
        `<span style="font-size:20px">${escapeHtml(
          s.tempo_medio_resolucao.formatted
        )}</span>`,
        "",
        "stat-card--ok"
      ),
    ].join("");
  } catch (error) {
    showErrorState(grid, error.detail || error.message);
    return; // se o resumo falhou, nem tenta os graficos
  }

  loadCategoryChart();
  loadRankingChart();
  loadResolutionChart();
}

// Grafico 1: chamados por categoria (item 2 do Exercicio 2)
async function loadCategoryChart() {
  const box = document.getElementById("chart-category");
  try {
    const rows = await api.get("/analytics/tickets-by-category");
    if (!rows.length) return showEmpty(box);
    const max = Math.max(...rows.map((r) => r.total));
    box.innerHTML = rows.map((r) => barRow(r.category_label, r.total, max)).join("");
  } catch (e) {
    showErrorState(box, e.detail || e.message);
  }
}

// Grafico 2: ranking de clientes (item 3 do Exercicio 2)
async function loadRankingChart() {
  const box = document.getElementById("chart-ranking");
  try {
    const rows = await api.get("/analytics/customer-ranking?limit=8");
    if (!rows.length) return showEmpty(box);
    const max = Math.max(...rows.map((r) => r.total));
    box.innerHTML = rows
      .map((r) => barRow(`${r.position}. ${r.company}`, r.total, max))
      .join("");
  } catch (e) {
    showErrorState(box, e.detail || e.message);
  }
}

// Grafico 3: tempo medio por categoria (item 6 do Exercicio 2)
async function loadResolutionChart() {
  const box = document.getElementById("chart-resolution");
  try {
    const rows = await api.get("/analytics/category-resolution-time");
    if (!rows.length) return showEmpty(box, "Nenhum chamado finalizado ainda.");
    const max = Math.max(...rows.map((r) => r.average_hours));
    // largura pela quantidade de horas; texto pelo formato legivel ("2d 6h")
    box.innerHTML = rows
      .map((r) => barRow(r.category_label, r.average_hours, max, r.formatted))
      .join("");
  } catch (e) {
    showErrorState(box, e.detail || e.message);
  }
}

// Dispara tudo assim que o HTML estiver pronto.
document.addEventListener("DOMContentLoaded", loadDashboard);
