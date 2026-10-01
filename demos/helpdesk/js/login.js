/*
 * login.js -- a logica da tela de entrada.
 */

const caixaErro = () => document.getElementById("login-error");

function mostrarErro(mensagem) {
  const caixa = caixaErro();
  caixa.textContent = mensagem;
  caixa.hidden = false;
}

function limparErro() {
  caixaErro().hidden = true;
}

/*
 * entrar -- troca e-mail e senha por um token.
 */
async function entrar(evento) {
  evento.preventDefault();
  limparErro();

  const botao = document.getElementById("btn-entrar");
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value;

  // ★ FEEDBACK IMEDIATO E BOTAO TRAVADO.
  //   O login demora ~150ms de proposito (o PBKDF2 e' lento por design).
  //   Sem travar o botao, um clique duplo dispara duas requisicoes. Sem o
  //   texto "Entrando...", a tela parece congelada.
  botao.disabled = true;
  botao.textContent = "Entrando...";

  try {
    const resposta = await api.post("/auth/login", { email, password: senha });
    auth.salvar(resposta.access_token, resposta.user);

    // replace e' diferente de href: NAO deixa a tela de login no historico.
    // Assim, apertar Voltar depois de entrar nao devolve o usuario para o
    // formulario de login (que ja nao faz sentido).
    window.location.replace("index.html");
  } catch (erro) {
    mostrarErro(erro.detail || erro.message || "Nao foi possivel entrar.");
    botao.disabled = false;
    botao.textContent = "Entrar";
    document.getElementById("password").value = "";
    document.getElementById("password").focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Quem ja tem sessao valida nao precisa ver o formulario.
  if (auth.token()) {
    window.location.replace("index.html");
    return;
  }

  document.getElementById("form-login").addEventListener("submit", entrar);

  // Os botoes de demonstracao preenchem os campos.
  // ★ Eles SO existem porque este e' um projeto de avaliacao. Num sistema
  //   real, mostrar credenciais na tela de login seria uma falha grave.
  document.querySelectorAll(".login-demo__row").forEach((botao) => {
    botao.addEventListener("click", () => {
      document.getElementById("email").value = botao.dataset.email;
      document.getElementById("password").value = botao.dataset.senha;
      limparErro();
      document.getElementById("btn-entrar").focus();
    });
  });
});
