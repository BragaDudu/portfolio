/*
 * ui.js -- FUNCOES DE INTERFACE REUTILIZADAS POR TODAS AS PAGINAS
 * ================================================================
 * Formatacao de data, "badges" de status, mensagens (toast), estados de
 * carregamento e erro. Ficam aqui para nao serem reescritas em cada pagina.
 */

/*
 * formatDate -- converte a data ISO da API para o fuso do usuario.
 *
 * ★ AQUI ACONTECE A CONVERSAO DE FUSO HORARIO.
 *   O backend manda "2026-09-01T14:32:10Z". O "Z" diz que e' UTC.
 *   new Date(...) entende isso e converte para o horario LOCAL do
 *   navegador. toLocaleString('pt-BR') formata no padrao brasileiro.
 *
 *   E' a unica etapa do sistema onde o horario deixa de ser UTC. No banco,
 *   na API e no trafego, tudo e' UTC. So na TELA vira horario de Brasilia.
 */
function formatDate(isoString) {
  if (!isoString) return "—"; // travessao para "nao ha data"
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("pt-BR");
}

/*
 * badge -- gera o HTML de uma etiqueta colorida de status/prioridade.
 * A cor vem de uma classe CSS derivada do proprio valor
 * (ex.: status "ABERTO" -> classe "badge--aberto").
 */
function badge(value) {
  if (!value) return "";
  const cls = "badge--" + String(value).toLowerCase().replace(/_/g, "-");
  return `<span class="badge ${cls}">${escapeHtml(value)}</span>`;
}

/*
 * escapeHtml -- PROTECAO CONTRA XSS.
 *
 * ★ SEGURANCA: nomes de clientes, titulos de chamados etc. vem do banco e
 *   sao inseridos no HTML. Se um cliente se chamasse
 *       <script>algo()</script>
 *   e jogassemos direto no innerHTML, o navegador EXECUTARIA esse script.
 *   Isso e' um ataque XSS. Esta funcao troca < > & " por entidades HTML,
 *   entao o texto aparece como texto, nunca como codigo.
 *
 *   Toda vez que colocamos dado do usuario no HTML, passa por aqui.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
 * toast -- mensagem temporaria no canto da tela (sucesso ou erro).
 * Substitui o alert(): nao trava a pagina e some sozinha.
 */
function toast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  container.appendChild(el);

  // Remove depois de alguns segundos (erros ficam mais tempo).
  setTimeout(() => el.remove(), type === "error" ? 6000 : 3500);
}

/*
 * handleError -- traduz um erro do api.js em uma mensagem para o usuario.
 * Chamado no catch de toda operacao. Nunca deixa o erro silencioso no
 * console (o enunciado pede isso explicitamente).
 */
function handleError(error) {
  console.error(error); // registra tambem no console, para depurar
  const message = error.detail || error.message || "Ocorreu um erro inesperado.";
  toast(message, "error");
}

/*
 * Estados de uma area de conteudo: carregando / vazio / erro.
 * Usados enquanto o fetch nao volta, ou quando nao ha dados.
 */
function showLoading(el) {
  el.innerHTML = `<div class="state state--loading">Carregando...</div>`;
}
function showEmpty(el, message = "Nenhum registro encontrado.") {
  el.innerHTML = `<div class="state state--empty">${escapeHtml(message)}</div>`;
}
function showErrorState(el, message) {
  el.innerHTML = `<div class="state state--error">${escapeHtml(message)}</div>`;
}

/*
 * Modal simples: abre/fecha pelo atributo hidden. Sem biblioteca.
 */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.hidden = false;
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.hidden = true;
}

/*
 * markActiveNav -- destaca o link da pagina atual no menu lateral.
 * Compara o nome do arquivo da URL com o data-page de cada link.
 */
function markActiveNav() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === current) link.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", markActiveNav);


/* ===========================================================================
 * TEMA CLARO / ESCURO
 * ===========================================================================
 *
 * ★ ESTE E' O UNICO LUGAR DO SISTEMA QUE USA localStorage -- e e' o uso
 *   CORRETO dele.
 *
 *   O enunciado proibia localStorage como BANCO DE DADOS, e com razao: um
 *   cliente salvo la sumiria em outro computador e ninguem mais o veria.
 *
 *   Preferencia de tema e' o oposto disso: e' um dado DE CONVENIENCIA, que
 *   pertence aquele navegador daquela pessoa. Ele NAO deve ir para o banco
 *   -- se fosse, todo mundo da empresa seria obrigado a usar o tema que o
 *   ultimo escolheu. Aqui, ficar so no navegador e' a decisao certa.
 *
 *   Resumindo a diferenca que vale explicar:
 *     dado de NEGOCIO      -> banco (servidor)   -> vale para todos
 *     dado de CONVENIENCIA -> localStorage        -> vale para este browser
 */

const THEME_KEY = "helpdesk-theme";

function applyTheme(theme) {
  const icon = document.getElementById("theme-icon");
  const label = document.getElementById("theme-label");

  if (theme === "dark" || theme === "light") {
    // Carimba o atributo na tag <html>. O CSS tem um bloco
    // :root[data-theme="dark"] que reage a isso.
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    // "system" = sem carimbo. O CSS cai no @media prefers-color-scheme e
    // segue o sistema operacional.
    document.documentElement.removeAttribute("data-theme");
  }

  if (icon) icon.textContent = theme === "dark" ? "☀" : "◐";
  if (label) label.textContent = theme === "dark" ? "Tema claro" : "Tema escuro";
}

function currentTheme() {
  // try/catch porque localStorage LANCA EXCECAO em janela anonima com
  // cookies bloqueados. Sem o try, a pagina inteira quebraria por causa de
  // uma preferencia de cor -- o que seria um pessimo negocio.
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
}

function toggleTheme() {
  const atual = currentTheme();
  // Descobre o que esta na tela AGORA para inverter o que a pessoa ve,
  // e nao o que esta gravado (que pode ser "system").
  const estaEscuro =
    atual === "dark" ||
    (atual === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const novo = estaEscuro ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, novo);
  } catch {
    /* sem persistencia neste navegador; o tema vale so nesta aba */
  }
  applyTheme(novo);
}

// Aplica antes de qualquer coisa aparecer, para nao piscar branco no escuro.
applyTheme(currentTheme());

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(currentTheme());
  const botao = document.getElementById("theme-toggle");
  if (botao) botao.addEventListener("click", toggleTheme);
});


/* ===========================================================================
 * PAGINACAO -- um componente, quatro telas
 * ===========================================================================
 *
 * ★ POR QUE PAGINAR (a pergunta "o cliente ia rolar a tela infinitamente?")
 *
 *   Com 5.000 chamados, mandar tudo de uma vez significa: megabytes de JSON
 *   na rede, 5.000 linhas de HTML para o navegador desenhar, e uma tela que
 *   trava no celular. Paginar e' o que torna volume UTILIZAVEL.
 *
 *   E tem o lado humano: ninguem procura um chamado rolando 5.000 linhas.
 *   Quem precisa achar algo usa BUSCA e FILTRO -- por isso a paginacao vem
 *   sempre acompanhada dos dois. A pagina serve para navegar; o filtro serve
 *   para encontrar.
 *
 * ★ POR QUE O ESTADO DA PAGINA MORA NA URL (?page=3)
 *   Assim o usuario pode dar F5, mandar o link para um colega, ou usar o
 *   botao Voltar do navegador, e cair exatamente onde estava. Estado de tela
 *   guardado so em variavel de JavaScript se perde no primeiro F5.
 */

const TAMANHO_PAGINA = 20;

/*
 * paginador -- devolve o HTML da barra de navegacao.
 *
 * RECEBE: o envelope da API ({total, limit, offset, has_more}) e o nome da
 *         funcao global que recarrega a lista.
 * RETORNA: string de HTML.
 */
function paginador(pagina, nomeDaFuncao) {
  const { total, limit, offset } = pagina;

  if (total === 0) return "";

  const paginaAtual = Math.floor(offset / limit) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  const primeiro = offset + 1;
  const ultimo = Math.min(offset + limit, total);

  const irPara = (n) => `${nomeDaFuncao}(${(n - 1) * limit})`;

  return `
    <div class="pager">
      <span class="pager__info">
        <strong>${primeiro}–${ultimo}</strong> de <strong>${total.toLocaleString("pt-BR")}</strong>
      </span>
      <span class="pager__controls">
        <button class="btn btn--ghost btn--sm" ${paginaAtual === 1 ? "disabled" : ""}
                onclick="${irPara(1)}" title="Primeira página">«</button>
        <button class="btn btn--ghost btn--sm" ${paginaAtual === 1 ? "disabled" : ""}
                onclick="${irPara(paginaAtual - 1)}">‹ Anterior</button>
        <span class="pager__page">${paginaAtual} / ${totalPaginas}</span>
        <button class="btn btn--ghost btn--sm" ${paginaAtual >= totalPaginas ? "disabled" : ""}
                onclick="${irPara(paginaAtual + 1)}">Próxima ›</button>
        <button class="btn btn--ghost btn--sm" ${paginaAtual >= totalPaginas ? "disabled" : ""}
                onclick="${irPara(totalPaginas)}" title="Última página">»</button>
      </span>
    </div>`;
}

/*
 * debounce -- espera o usuario PARAR de digitar antes de chamar a API.
 *
 * ★ SEM ISSO: digitar "impressora" (10 letras) dispararia 10 requisicoes,
 *   e a resposta da 3a poderia chegar DEPOIS da 10a e sobrescrever a tela
 *   com resultado errado ("race condition de UI").
 *
 *   Com 350ms, so a ultima digitada vira requisicao. E' a diferenca entre
 *   uma busca que parece instantanea e uma que pisca resultado errado.
 */
function debounce(fn, ms = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/*
 * Estado vazio com contexto: dizer "nenhum resultado" e' pouco. O usuario
 * precisa saber POR QUE esta vazio e o que fazer -- por isso a mensagem
 * muda conforme haja ou nao filtro aplicado.
 */
function estadoVazio(temFiltro, oQue = "registro") {
  return temFiltro
    ? `<div class="state state--empty">
         Nenhum ${oQue} encontrado com esses filtros.<br>
         <span class="muted">Tente limpar a busca ou trocar o status.</span>
       </div>`
    : `<div class="state state--empty">Nenhum ${oQue} cadastrado ainda.</div>`;
}


/* ===========================================================================
 * CABECALHO DA SESSAO NA SIDEBAR
 * ===========================================================================
 * Monta o bloco "quem esta logado" + os botoes de tema e sair, e esconde os
 * itens de menu que o papel do usuario nao usa.
 */

function iniciais(nome) {
  const partes = String(nome || "?").trim().split(/\s+/);
  const primeira = partes[0]?.[0] || "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function montarSessao() {
  const rodape = document.querySelector(".sidebar__foot");
  if (!rodape || typeof auth === "undefined") return;

  const usuario = auth.user();
  if (!usuario) return;

  const papel = usuario.role === "SUPER_ADMIN"
    ? "Administrador da plataforma"
    : usuario.client_company || "Cliente";

  rodape.innerHTML = `
    <div class="sidebar__user">
      <div class="sidebar__avatar">${escapeHtml(iniciais(usuario.name))}</div>
      <div class="sidebar__who">
        <b title="${escapeHtml(usuario.name)}">${escapeHtml(usuario.name)}</b>
        <small title="${escapeHtml(papel)}">${escapeHtml(papel)}</small>
      </div>
    </div>
    <div class="sidebar__actions">
      <button class="theme-toggle" id="theme-toggle" type="button">
        <span id="theme-icon">◐</span> <span id="theme-label">Tema escuro</span>
      </button>
      <button class="btn-sair" id="btn-sair" type="button" title="Sair">⏻</button>
    </div>`;

  document.getElementById("btn-sair").addEventListener("click", () => auth.sair());
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  applyTheme(currentTheme());

  // ★ ESCONDER O MENU "CLIENTES" DE QUEM NAO E' DA EMPRESA DE TI.
  //
  //   Isto e' UX, nao seguranca. O responsavel de uma empresa nao gerencia
  //   a carteira de clientes da operadora, entao o item nao faz sentido
  //   para ele e so confundiria.
  //
  //   ★ E se ele digitar clientes.html na barra de enderecos? A pagina
  //     abre -- e vem com UM cliente: o dele. Porque quem filtra e' o
  //     backend, pela dependencia de escopo. Esconder o menu poupa
  //     confusao; nao e' o que protege o dado.
  if (!auth.veTudo()) {
    const linkClientes = document.querySelector('a[data-page="clientes.html"]');
    if (linkClientes) linkClientes.hidden = true;

    // Faixa explicando por que a tela mostra menos coisa que o esperado.
    const cabecalho = document.querySelector(".page-header");
    if (cabecalho && usuario.client_company) {
      const aviso = document.createElement("div");
      aviso.className = "escopo-aviso";
      aviso.innerHTML =
        `<span>🏢</span><span>Você está vendo apenas os dados de <strong>${escapeHtml(
          usuario.client_company
        )}</strong>.</span>`;
      cabecalho.insertAdjacentElement("afterend", aviso);
    }
  }
}

document.addEventListener("DOMContentLoaded", montarSessao);


/* ===========================================================================
 * ORDENACAO CLICAVEL NAS TABELAS
 * ===========================================================================
 *
 * ★ POR QUE ORDENAR NO SERVIDOR E NAO NO NAVEGADOR
 *
 *   A tela tem 20 linhas na mao, mas a tabela tem 5.000. Ordenar as 20 que
 *   estao na tela daria a ILUSAO de ordenacao: clicar em "Empresa" poria
 *   em ordem alfabetica apenas a pagina atual, e a pagina 2 recomecaria do
 *   "A". O usuario acharia que o sistema esta quebrado -- com razao.
 *
 *   Ordenar de verdade e' ordenar as 5.000 e mostrar as 20 primeiras. Isso
 *   so o banco faz. Por isso o clique vira ?sort=company&order=asc.
 */

// Cada tela guarda aqui a coluna e o sentido escolhidos.
const ordenacao = {};

function alternarOrdem(tela, coluna, recarregar) {
  const atual = ordenacao[tela] || {};
  // Clicar na MESMA coluna inverte o sentido; clicar em outra comeca do asc.
  // E' o comportamento que todo mundo ja espera de tabela -- fugir dele
  // confunde mais do que inova.
  ordenacao[tela] =
    atual.sort === coluna
      ? { sort: coluna, order: atual.order === "asc" ? "desc" : "asc" }
      : { sort: coluna, order: "asc" };
  recarregar(0); // ordenar e' como filtrar: volta para a primeira pagina
}

/* Acrescenta ?sort=&order= na querystring, se houver ordenacao ativa. */
function paramsDeOrdem(tela, params) {
  const o = ordenacao[tela];
  if (o?.sort) {
    params.set("sort", o.sort);
    params.set("order", o.order);
  }
  return params;
}

/*
 * cabecalho -- monta o <thead> com as colunas clicaveis.
 *
 * RECEBE: nome da tela, lista de colunas e o nome da funcao que recarrega.
 *         Cada coluna e' [rotulo, chave] -- chave null = coluna nao ordenavel
 *         (a dos botoes, por exemplo).
 */
function cabecalho(tela, colunas, nomeDaFuncao) {
  const o = ordenacao[tela] || {};

  const ths = colunas
    .map(([rotulo, chave, extra = ""]) => {
      if (!chave) return `<th ${extra}></th>`;

      const ativa = o.sort === chave;
      // A seta mostra o estado ATUAL. Sem ela, o usuario clica e nao sabe
      // se ordenou crescente ou decrescente.
      const seta = ativa ? (o.order === "asc" ? " ▲" : " ▼") : "";
      return `<th ${extra} class="th-sort ${ativa ? "th-sort--ativa" : ""}"
                  onclick="alternarOrdem('${tela}','${chave}',${nomeDaFuncao})"
                  title="Ordenar por ${rotulo}">${rotulo}${seta}</th>`;
    })
    .join("");

  return `<thead><tr>${ths}</tr></thead>`;
}
