/*
 * chamados.js -- listagem com filtros, abertura e mudanca de status.
 *
 * Demonstra os 5 requisitos do Exercicio 1 do lado do frontend:
 *   listar, abrir, filtrar, ver detalhes, alterar status.
 */

/*
 * loadTickets -- busca chamados aplicando os filtros selecionados.
 *
 * ★ OS FILTROS VAO NA URL E SAO PROCESSADOS PELO BANCO.
 *   Montamos /api/tickets?status=ABERTO&priority=ALTA e o backend traduz
 *   isso em WHERE. NAO buscamos tudo para filtrar em JavaScript -- isso
 *   seria lento e traria dados a toa pela rede.
 */
async function loadTickets(offset = 0) {
  const box = document.getElementById("tickets-table");
  showLoading(box);

  const status = document.getElementById("f-status").value;
  const priority = document.getElementById("f-priority").value;
  const categoria = document.getElementById("f-categoria")?.value || "";
  const busca = document.getElementById("f-busca")?.value || "";

  // URLSearchParams monta a querystring corretamente, sem concatenar na mao.
  // Cada parametro que entra aqui vira uma condicao WHERE no banco.
  const params = new URLSearchParams();

  /*
   * ★ FILTRO VINDO DE OUTRA TELA.
   *
   *   O detalhe do cliente manda "chamados.html?client_id=42". Lendo esse
   *   parametro aqui, a tela abre JA filtrada naquela empresa.
   *
   *   POR QUE PELA URL E NAO POR UMA VARIAVEL: porque a URL e' comparti-
   *   lhavel. O tecnico manda o link no chat, o colega abre e ve exatamente
   *   a mesma lista. Estado guardado em variavel morre no F5.
   */
  const filtroDaUrl = new URLSearchParams(location.search).get("client_id");
  if (filtroDaUrl) params.set("client_id", filtroDaUrl);

  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (categoria) params.set("category", categoria);
  if (busca.trim()) params.set("search", busca.trim());
  params.set("limit", TAMANHO_PAGINA);
  params.set("offset", offset);
  paramsDeOrdem("chamados", params);

  const temFiltro = Boolean(status || priority || categoria || busca.trim());

  try {
    // A API devolve o ENVELOPE: { items, total, limit, offset, has_more }
    const pagina = await api.get(`/tickets?${params.toString()}`);

    if (!pagina.items.length) {
      box.innerHTML = estadoVazio(temFiltro, "chamado");
      return;
    }

    const rows = pagina.items
      .map(
        (t) => `
        <tr>
          <td class="num">${t.id}</td>
          <td>${escapeHtml(t.title)}</td>
          <td>${escapeHtml(t.client.company)}</td>
          <td>${escapeHtml(t.category_label)}${t.subcategory ? `<br><span class="muted" style="font-size:12px">${escapeHtml(t.subcategory)}</span>` : ""}</td>
          <td>${badge(t.priority)}</td>
          <td>${badge(t.status)}</td>
          <td class="muted">${formatDateShort(t.opened_at)}</td>
          <td><button class="btn btn--ghost btn--sm" onclick="showTicket(${t.id})">Detalhes</button></td>
        </tr>`
      )
      .join("");

    box.innerHTML = `
      <table>
        ${cabecalho("chamados", [
          ["ID", "id"], ["Título", "title"], ["Empresa", "company"],
          ["Categoria", "category"], ["Prioridade", "priority"],
          ["Status", "status"], ["Abertura", "opened_at"], [null, null],
        ], "loadTickets")}
        <tbody>${rows}</tbody>
      </table>
      ${paginador(pagina, "loadTickets")}`;
  } catch (error) {
    showErrorState(box, error.detail || error.message);
  }
}

/*
 * fillClientSelect -- popula o <select> de clientes do formulario.
 * Prova que ate as opcoes do dropdown vem do banco, nao estao no HTML.
 */
async function fillClientSelect() {
  const select = document.querySelector("#form-ticket select[name=client_id]");
  try {
    const clients = await api.get("/clients/options");
    select.innerHTML =
      `<option value="">Selecione...</option>` +
      clients
        .map((c) => `<option value="${c.id}">${escapeHtml(c.company)} — ${escapeHtml(c.name)}</option>`)
        .join("");
  } catch (error) {
    select.innerHTML = `<option value="">Erro ao carregar clientes</option>`;
    handleError(error);
  }
}

/*
 * createTicket -- abre um chamado novo.
 */
async function createTicket(event) {
  event.preventDefault();
  const form = event.target;

  const payload = {
    client_id: Number(form.client_id.value), // converte texto do select em numero
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    category: form.category.value,
    // string vazia vira null: o campo e' opcional, e mandar "" seria
    // enviar um valor invalido em vez de dizer "nao informado".
    subcategory: form.subcategory.value || null,
    priority: form.priority.value,
  };

  try {
    const created = await api.post("/tickets", payload);
    toast(`Chamado #${created.id} aberto com sucesso.`);
    form.reset();
    closeModal("modal-ticket");
    loadTickets();
  } catch (error) {
    handleError(error); // ex.: cliente inexistente -> 404
  }
}

/*
 * showTicket -- detalhe com os botoes de mudanca de status.
 * Os botoes disponiveis dependem do status atual (espelha a maquina de
 * estados do backend). Mas quem MANDA e' o backend: se o usuario burlar e
 * pedir uma transicao invalida, a API responde 409 e mostramos o erro.
 */
async function showTicket(ticketId) {
  const body = document.getElementById("td-body");
  document.getElementById("td-title").textContent = "Chamado #" + ticketId;
  body.innerHTML = `<div class="state state--loading">Carregando...</div>`;
  openModal("modal-ticket-detail");

  try {
    const t = await api.get(`/tickets/${ticketId}`);

    // Botoes coerentes com a maquina de estados (enums.py do backend).
    const actions = [];
    if (t.status !== "FINALIZADO") {
      if (t.status !== "EM_ANDAMENTO") {
        actions.push(btnStatus(t.id, "EM_ANDAMENTO", "Iniciar atendimento"));
      }
      if (t.status !== "ABERTO") {
        actions.push(btnStatus(t.id, "ABERTO", "Voltar para aberto"));
      }
      actions.push(btnStatus(t.id, "FINALIZADO", "Finalizar"));
    } else {
      actions.push(`<span class="muted">Chamado finalizado — não pode ser reaberto.</span>`);
    }

    body.innerHTML = `
      <dl>
        <div class="detail-row"><dt>Cliente</dt><dd>${escapeHtml(t.client.company)}</dd></div>
        <div class="detail-row"><dt>Título</dt><dd>${escapeHtml(t.title)}</dd></div>
        <div class="detail-row"><dt>Categoria</dt><dd>${escapeHtml(t.category_label)}</dd></div>
        <div class="detail-row"><dt>Problema</dt><dd>${t.subcategory ? escapeHtml(t.subcategory) : "<span class='muted'>nao informado</span>"}</dd></div>
        <div class="detail-row"><dt>Prioridade</dt><dd>${badge(t.priority)}</dd></div>
        <div class="detail-row"><dt>Status</dt><dd>${badge(t.status)}</dd></div>
        <div class="detail-row"><dt>Aberto em</dt><dd>${formatDate(t.opened_at)}</dd></div>
        <div class="detail-row"><dt>Fechado em</dt><dd>${formatDate(t.closed_at)}</dd></div>
      </dl>
      <p style="margin:16px 0 8px;color:var(--text-soft)">${escapeHtml(t.description)}</p>
      <div class="form-actions" style="justify-content:flex-start;flex-wrap:wrap">${actions.join("")}</div>`;
  } catch (error) {
    body.innerHTML = `<div class="state state--error">${escapeHtml(error.detail || error.message)}</div>`;
  }
}

function btnStatus(ticketId, status, label) {
  return `<button class="btn btn--sm" onclick="changeStatus(${ticketId}, '${status}')">${label}</button>`;
}

/*
 * changeStatus -- PATCH /api/tickets/{id}/status.
 * A regra da transicao mora no backend; aqui so enviamos o pedido.
 */
async function changeStatus(ticketId, status) {
  try {
    await api.patch(`/tickets/${ticketId}/status`, { status });
    toast(`Status alterado para ${status}.`);
    closeModal("modal-ticket-detail");
    loadTickets(); // recarrega a lista com o status novo vindo do banco
  } catch (error) {
    handleError(error); // ex.: transicao invalida -> 409
  }
}

// ---- LIGACOES DE EVENTOS ----
document.addEventListener("DOMContentLoaded", () => {
  loadTickets();
  fillClientSelect();
  document.getElementById("form-ticket").addEventListener("submit", createTicket);
  // ★ TODO FILTRO VOLTA PARA A PAGINA 1.
  //   Se o usuario esta na pagina 12 e filtra por "ABERTO", ficar na 12
  //   provavelmente mostraria uma tela vazia -- o resultado filtrado pode
  //   ter menos de 12 paginas. Voltar ao inicio e' o comportamento que nao
  //   surpreende.
  const recarregar = () => loadTickets(0);

  document.getElementById("f-status").addEventListener("change", recarregar);
  document.getElementById("f-priority").addEventListener("change", recarregar);
  document.getElementById("f-categoria").addEventListener("change", recarregar);

  // A busca usa debounce: so consulta quando o usuario para de digitar.
  document.getElementById("f-busca")
    .addEventListener("input", debounce(recarregar, 350));

  document.getElementById("btn-limpar").addEventListener("click", () => {
    document.getElementById("f-busca").value = "";
    document.getElementById("f-status").value = "";
    document.getElementById("f-priority").value = "";
    document.getElementById("f-categoria").value = "";
    recarregar();
  });
});


/* ===========================================================================
 * CATEGORIAS ENCADEADAS
 * ===========================================================================
 *
 * ★ POR QUE BUSCAR AS CATEGORIAS NA API EM VEZ DE ESCREVER NO HTML:
 *
 *   Se a lista estivesse no HTML, ela seria uma SEGUNDA fonte da verdade.
 *   No dia em que o backend ganhasse uma categoria nova, a tela continuaria
 *   mostrando a lista velha -- e pior, se alguem removesse uma categoria do
 *   enum, o formulario passaria a enviar um valor que a API recusa com 422,
 *   sem ninguem entender o motivo.
 *
 *   Buscando de /api/tickets/categories, existe UMA fonte: o enum do
 *   Python. As duas pontas nunca divergem.
 */

let CATALOGO_CATEGORIAS = [];

async function carregarCategorias() {
  const selCategoria = document.getElementById("f-category-select");
  const selProblema = document.getElementById("f-subcategory-select");
  if (!selCategoria) return;

  try {
    CATALOGO_CATEGORIAS = await api.get("/tickets/categories");
  } catch (erro) {
    // Falhar aqui nao pode derrubar a tela inteira: o resto da pagina
    // (listagem, filtros) continua util mesmo sem o formulario.
    toast("Nao foi possivel carregar as categorias.", "error");
    return;
  }

  const opcoes = CATALOGO_CATEGORIAS.map(
    (c) => `<option value="${c.value}">${escapeHtml(c.label)}</option>`
  ).join("");

  selCategoria.innerHTML = '<option value="">Selecione...</option>' + opcoes;

  // O MESMO catalogo alimenta o filtro da listagem. Uma requisicao, dois
  // selects -- e nenhuma lista escrita a mao no HTML.
  const filtroCategoria = document.getElementById("f-categoria");
  if (filtroCategoria) {
    filtroCategoria.innerHTML = '<option value="">Todas</option>' + opcoes;
  }

  // Ao trocar a categoria, a lista de problemas e' remontada.
  selCategoria.addEventListener("change", () => {
    const escolhida = CATALOGO_CATEGORIAS.find(
      (c) => c.value === selCategoria.value
    );

    if (!escolhida) {
      selProblema.innerHTML = '<option value="">Escolha a categoria primeiro</option>';
      selProblema.disabled = true;
      return;
    }

    selProblema.disabled = false;
    selProblema.innerHTML =
      '<option value="">(opcional)</option>' +
      escolhida.subcategories
        .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
        .join("");
  });
}

document.addEventListener("DOMContentLoaded", carregarCategorias);
