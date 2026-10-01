/*
 * auth.js -- a sessao do lado do navegador
 * =========================================
 *
 * Guarda o token, sabe quem esta logado, e manda para o login quando a
 * sessao acaba. Carregado ANTES de api.js, porque api.js precisa do token
 * para montar o cabecalho de cada requisicao.
 *
 * ★★★ ONDE GUARDAR O TOKEN -- a pergunta que uma banca faz ★★★
 *
 *   Ha duas opcoes de verdade, e as duas tem defeito:
 *
 *   A) localStorage (o que usamos aqui)
 *      + simples, sobrevive ao F5 e ao fechar a aba
 *      - o JavaScript da pagina consegue ler. Se um XSS entrar na
 *        aplicacao, o atacante rouba o token.
 *
 *   B) cookie httpOnly
 *      + o JavaScript NAO consegue ler; um XSS nao rouba o token
 *      - exige CSRF token, porque o navegador manda o cookie sozinho em
 *        toda requisicao, inclusive nas disparadas por outro site
 *
 *   ESCOLHEMOS (A) e a defesa e' honesta: o projeto escapa TODO texto
 *   vindo do banco com escapeHtml antes de colocar na tela, entao a porta
 *   do XSS esta fechada. Em producao com dado real eu iria para (B) com
 *   CSRF, porque ali a regra e' nao depender de uma unica barreira.
 *
 *   O que NUNCA se faz: guardar a SENHA. A senha e' usada uma vez, no
 *   login, e nunca mais trafega nem fica gravada.
 */

const TOKEN_KEY = "helpdesk-token";
const USER_KEY = "helpdesk-user";

const auth = {
  /* Le o token guardado. try/catch porque localStorage LANCA excecao em
     janela anonima com cookies bloqueados -- e a pagina nao pode quebrar
     por causa disso. */
  token() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /* Os dados do usuario, guardados junto para a tela nao precisar chamar
     /api/auth/me so para escrever o nome no cabecalho.

     ★ ATENCAO AO QUE ISSO **NAO** SIGNIFICA: este objeto e' uma COPIA de
       conveniencia. Ele nao autoriza nada. Alguem pode editar o
       localStorage e trocar o papel para SUPER_ADMIN -- e nao vai
       adiantar, porque o backend le o papel do TOKEN ASSINADO e confere no
       banco, nunca daqui. */
  user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },

  salvar(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* sem persistencia neste navegador: a sessao vale so nesta aba */
    }
  },

  limpar() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* nada a fazer */
    }
  },

  /* Atalho de leitura para a tela decidir o que mostrar. Repetindo: e'
     decoracao. Quem barra de verdade e' o backend. */
  veTudo() {
    return this.user()?.role === "SUPER_ADMIN";
  },

  /*
   * exigirLogin -- chamado no topo de toda pagina protegida.
   *
   * Se nao ha token, redireciona para o login ANTES de a pagina tentar
   * carregar qualquer dado. Sem isso, a tela apareceria vazia com quatro
   * erros 401 no console -- feio e confuso.
   */
  exigirLogin() {
    if (!this.token()) {
      window.location.replace("login.html");
      return false;
    }
    return true;
  },

  /*
   * sair -- encerra a sessao.
   *
   * Avisa o servidor por educacao (e para o dia em que houver revogacao),
   * mas NAO espera a resposta: o que realmente encerra a sessao neste
   * navegador e' apagar o token daqui. Se a rede estiver fora, o logout
   * tem que funcionar do mesmo jeito.
   */
  async sair() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token()}` },
      });
    } catch {
      /* ignorado de proposito -- ver comentario acima */
    }
    this.limpar();
    window.location.replace("login.html");
  },
};
