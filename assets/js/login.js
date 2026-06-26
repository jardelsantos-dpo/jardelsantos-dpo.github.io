// Insira aqui a URL gerada após publicar o seu script como "Aplicativo da Web"
const APPS_SCRIPT_URL = "https://google-drive-shield.jardelassis.workers.dev/";
 

// Estados de controle baseados nas regras de negócio do seu arquivo GS
let loginEtapa = "CREDENCIAIS"; // Pode mudar para "MFA" ou "ALTERAR_SENHA"

let timeoutAlerta = null;

// Alterna a visibilidade de um campo de senha (mostra/oculta o texto digitado)
// e troca o ícone entre "olho aberto" e "olho cortado" de acordo com o estado.
function alternarVisibilidadeSenha(idCampo, idIcone) {
    const campo = document.getElementById(idCampo);
    const icone = document.getElementById(idIcone);

    if (campo.type === "password") {
        campo.type = "text";
        icone.classList.remove("fa-eye");
        icone.classList.add("fa-eye-slash");
    } else {
        campo.type = "password";
        icone.classList.remove("fa-eye-slash");
        icone.classList.add("fa-eye");
    }
}

// Valida a complexidade da senha no cliente (mesmo critério aplicado no
// back-end): mínimo 10 caracteres, com letra maiúscula, minúscula, número
// e caractere especial. Apenas feedback antecipado - a validação real e
// definitiva sempre acontece no servidor.
function validarComplexidadeSenha(senha) {
    if (!senha || senha.length < 10) return false;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const temEspecial = /[^A-Za-z0-9]/.test(senha);
    return temMaiuscula && temMinuscula && temNumero && temEspecial;
}

function exibirAlerta(texto, tipo) {
    const alerta = document.getElementById('mensagem-alerta');
    alerta.innerText = texto;
    alerta.style.display = 'block';
    if (tipo === 'erro') {
        alerta.style.background = 'rgba(239, 71, 111, 0.1)';
        alerta.style.color = '#ef476f';
        alerta.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        alerta.style.background = 'rgba(6, 214, 160, 0.1)';
        alerta.style.color = '#06d6a0';
        alerta.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }

    // Esconde automaticamente após 5 segundos. Cancela qualquer timeout
    // anterior, para que um alerta novo não seja escondido antes da hora
    // por um timeout que já estava rodando do alerta anterior.
    if (timeoutAlerta) clearTimeout(timeoutAlerta);
    timeoutAlerta = setTimeout(() => {
        alerta.style.display = 'none';
    }, 5000);
}

// Função principal de submissão do formulário
async function executarLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const tokenMfa = document.getElementById('token-mfa').value.trim();
    const btn = document.getElementById('btn-entrar');

    // Validação inicial do lado do cliente
    if (!usuario || !senha) {
        exibirAlerta("Por favor, preencha todos os campos obrigatórios.", "erro");
        return;
    }

    // Validações específicas da etapa de troca de senha (primeiro acesso)
    if (loginEtapa === "ALTERAR_SENHA") {
        if (!validarComplexidadeSenha(senha)) {
            exibirAlerta("A senha deve ter ao menos 10 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.", "erro");
            return;
        }
        if (senha !== confirmarSenha) {
            exibirAlerta("As senhas não coincidem. Digite novamente.", "erro");
            return;
        }
    }

    // Validação específica da etapa de MFA
    if (loginEtapa === "MFA" && (!tokenMfa || tokenMfa.length !== 6)) {
        exibirAlerta("Informe o código de 6 dígitos do Authenticator.", "erro");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Autenticando...";

    // Montagem do payload idêntico ao esperado pelas funções do CODIGO.GS
    const dadosPayload = {
        acao: "login",
        etapa: loginEtapa,
        usuario: usuario,
        senha: senha,
        tokenMfa: tokenMfa
    };

    try {
        // Sem o header 'Content-Type: application/json' o navegador trata como
        // um formulário simples e não exige o OPTIONS (CORS pre-flight).
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dadosPayload)
        });
        const resultado = await resposta.json();

        // Tratamento dos retornos de segurança do back-end
        if (resultado.sucesso) {
            // Login completo (senha + MFA já confirmado, ou recém configurado)
            sessionStorage.setItem("portalToken", resultado.tokenSession);
            sessionStorage.setItem("usuarioLogado", usuario);
            if (resultado.tipo) {
                sessionStorage.setItem("tipoUsuario", resultado.tipo);
            }

            exibirAlerta("Acesso autorizado! Redirecionando...", "sucesso");
            setTimeout(() => {
                window.location.href = "visualizador";
            }, 1500);
        }
        // MFA é obrigatório no sistema e este usuário ainda não configurou:
        // abre a tela de configuração (QR code) antes de liberar qualquer acesso.
        else if (resultado.exigeConfiguracaoMFA) {
            exibirAlerta("Login validado! Por segurança, configure a verificação em duas etapas para continuar.", "sucesso");
            abrirModalConfigurarMfa(usuario, resultado.tokenSessaoTemp);
        }
        // Tratamento da regra: Conta Bloqueada por Força Bruta (5 tentativas falhas)
        else if (resultado.bloqueado) {
            exibirAlerta("Conta bloqueada temporariamente devido a sucessivas falhas de login. Tente novamente em 15 minutos. Um e-mail de alerta foi enviado ao Admin.", "erro");
            btn.disabled = true;
            btn.innerText = "Acesso Bloqueado";
        }
        // Tratamento da regra: Primeiro Acesso (Exige alteração de senha)
        else if (resultado.primeiroAcesso) {
            loginEtapa = "ALTERAR_SENHA";
            exibirAlerta("Este é o seu primeiro acesso. Defina uma nova senha com no mínimo 10 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", "sucesso");

            // Transforma o campo de senha em "Nova Senha" visualmente
            document.getElementById('senha').value = "";
            document.getElementById('senha').placeholder = "Digite sua nova senha forte";
            document.getElementById('confirmar-senha').value = "";
            document.getElementById('campo-confirmar-senha').style.display = 'block';

            btn.disabled = false;
            btn.innerText = "Gravar Nova Senha";
        }
        // Tratamento da regra: Validação Multifator Pendente
        else if (resultado.exigeMFA) {
            loginEtapa = "MFA";
            document.getElementById('campo-mfa').style.display = 'block';
            document.getElementById('usuario').disabled = true;
            document.getElementById('senha').disabled = true;

            exibirAlerta("E-mail e senha validados. Insira o código de verificação do Authenticator.", "sucesso");
            btn.disabled = false;
            btn.innerText = "Validar Token";
        }
        // Caso especial: o autenticador foi reconfigurado/desativado em outra
        // aba/dispositivo enquanto esta tela ainda estava parada na etapa de
        // código MFA. O segredo antigo não existe mais, então nenhum código
        // vai funcionar aqui - a tela precisa voltar ao início e o usuário
        // deve refazer o login do zero.
        else if (resultado.msg === "MFA não configurado para este usuário.") {
            exibirAlerta("Seu autenticador foi reconfigurado. Faça login novamente para continuar.", "erro");
            setTimeout(() => {
                window.location.href = window.location.pathname;
            }, 2500);
        }
        // Erros comuns de credenciais incorretas
        else {
            exibirAlerta(resultado.msg || "Usuário ou senha inválidos.", "erro");
            btn.disabled = false;
            btn.innerText = loginEtapa === "ALTERAR_SENHA" ? "Gravar Nova Senha" : "Entrar";
        }

    } catch (erro) {
        console.error("Erro na comunicação da API:", erro);
        exibirAlerta("Falha ao estabelecer conexão segura com o servidor de autenticação.", "erro");
        btn.disabled = false;
        btn.innerText = "Entrar";
    }
}

// Vinculação com a rotina de Solicitação de Acesso do CODIGO.GS
function solicitarAcesso() {
    // Limpa o formulário e o alerta a cada abertura
    document.getElementById('solicitacao-nome').value = "";
    document.getElementById('solicitacao-email').value = "";
    document.getElementById('solicitacao-tipo').value = "Leitor";
    document.getElementById('solicitacao-motivo').value = "";

    const alertaSolicitacao = document.getElementById('mensagem-alerta-solicitacao');
    alertaSolicitacao.style.display = 'none';

    document.getElementById('modal-solicitar-acesso').style.display = 'flex';
}

function fecharModalSolicitarAcesso() {
    document.getElementById('modal-solicitar-acesso').style.display = 'none';
}

function exibirAlertaSolicitacao(texto, tipo) {
    const alertaSolicitacao = document.getElementById('mensagem-alerta-solicitacao');
    alertaSolicitacao.innerText = texto;
    alertaSolicitacao.style.display = 'block';
    if (tipo === 'erro') {
        alertaSolicitacao.style.background = 'rgba(239, 71, 111, 0.1)';
        alertaSolicitacao.style.color = '#ef476f';
        alertaSolicitacao.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        alertaSolicitacao.style.background = 'rgba(6, 214, 160, 0.1)';
        alertaSolicitacao.style.color = '#06d6a0';
        alertaSolicitacao.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }
}

async function enviarSolicitacaoAcesso() {
    const nome = document.getElementById('solicitacao-nome').value.trim();
    const email = document.getElementById('solicitacao-email').value.trim();
    const tipo = document.getElementById('solicitacao-tipo').value;
    const motivo = document.getElementById('solicitacao-motivo').value.trim();
    const btn = document.getElementById('btn-enviar-solicitacao');

    if (!nome || !email || !motivo) {
        exibirAlertaSolicitacao("Preencha todos os campos antes de enviar.", "erro");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "solicitarAcesso",
                nome: nome,
                email: email,
                motivo: motivo,
                tipo: tipo
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            exibirAlertaSolicitacao("Solicitação enviada com sucesso! O administrador foi notificado para análise.", "sucesso");
            btn.innerText = "Enviado";

            setTimeout(() => {
                fecharModalSolicitarAcesso();
                btn.disabled = false;
                btn.innerText = "Enviar Solicitação";
            }, 5000);
        } else {
            exibirAlertaSolicitacao(resultado.msg || "Erro ao registrar a solicitação.", "erro");
            btn.disabled = false;
            btn.innerText = "Enviar Solicitação";
        }
    } catch (erro) {
        console.error("Erro na solicitação de acesso:", erro);
        exibirAlertaSolicitacao("Não foi possível processar a solicitação no momento.", "erro");
        btn.disabled = false;
        btn.innerText = "Enviar Solicitação";
    }
}

// ---------------------------------------------------------------------
// Fluxo: Esqueci minha senha
// ---------------------------------------------------------------------

function esqueciSenha() {
    // Pré-preenche com o e-mail já digitado no formulário de login, se houver
    const emailJaDigitado = document.getElementById('usuario').value.trim();
    document.getElementById('email-recuperacao').value = emailJaDigitado;

    const alertaModal = document.getElementById('mensagem-alerta-modal');
    alertaModal.style.display = 'none';

    document.getElementById('modal-esqueci-senha').style.display = 'flex';
}

function fecharModalEsqueciSenha() {
    document.getElementById('modal-esqueci-senha').style.display = 'none';
}

function exibirAlertaModal(texto, tipo) {
    const alertaModal = document.getElementById('mensagem-alerta-modal');
    alertaModal.innerText = texto;
    alertaModal.style.display = 'block';
    if (tipo === 'erro') {
        alertaModal.style.background = 'rgba(239, 71, 111, 0.1)';
        alertaModal.style.color = '#ef476f';
        alertaModal.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        alertaModal.style.background = 'rgba(6, 214, 160, 0.1)';
        alertaModal.style.color = '#06d6a0';
        alertaModal.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }
}

async function enviarRecuperacaoSenha() {
    const email = document.getElementById('email-recuperacao').value.trim();
    const btn = document.getElementById('btn-enviar-recuperacao');

    if (!email) {
        exibirAlertaModal("Informe seu e-mail corporativo.", "erro");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "esqueciSenha",
                usuario: email
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            exibirAlertaModal(
                "Se o e-mail estiver cadastrado, você receberá uma senha temporária em poucos minutos. Verifique sua caixa de entrada (e o spam).",
                "sucesso"
            );
            btn.innerText = "Enviado";

            setTimeout(() => {
                fecharModalEsqueciSenha();
                btn.disabled = false;
                btn.innerText = "Enviar";
            }, 5000);
        } else {
            exibirAlertaModal(resultado.msg || "Não foi possível processar a solicitação.", "erro");
            btn.disabled = false;
            btn.innerText = "Enviar";
        }
    } catch (erro) {
        console.error("Erro na recuperação de senha:", erro);
        exibirAlertaModal("Falha ao estabelecer conexão com o servidor.", "erro");
        btn.disabled = false;
        btn.innerText = "Enviar";
    }
}

// ---------------------------------------------------------------------
// Fluxo: Configuração de MFA pelo próprio usuário (após login)
// ---------------------------------------------------------------------

// Guarda temporariamente o e-mail/token enquanto o modal de MFA está aberto
let mfaContexto = { usuario: null, tokenSession: null };

async function abrirModalConfigurarMfa(usuario, tokenSession) {
    mfaContexto = { usuario: usuario, tokenSession: tokenSession };

    document.getElementById('modal-configurar-mfa').style.display = 'flex';
    document.getElementById('mfa-qrcode-img').style.display = 'none';
    document.getElementById('mfa-qrcode-loading').style.display = 'block';
    document.getElementById('mfa-qrcode-loading').innerText = "Gerando QR code...";
    document.getElementById('mfa-segredo-texto').innerText = "---";
    document.getElementById('mfa-confirmacao-token').value = "";
    document.getElementById('mensagem-alerta-mfa').style.display = 'none';

    // Reseta para o estado padrão (modo "primeiro acesso") antes de saber
    // a origem - ajustado abaixo conforme a resposta do back-end.
    document.getElementById('mfa-bloco-qrcode').style.display = 'block';
    document.getElementById('mfa-link-mostrar-qrcode').style.display = 'none';
    document.getElementById('mfa-modal-titulo').innerText = "Configurar Verificação em 2 Etapas";
    document.getElementById('mfa-modal-subtitulo').innerText = "Use o Google Authenticator ou Microsoft Authenticator.";

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "iniciarMfa",
                usuario: usuario,
                tokenSession: tokenSession
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            document.getElementById('mfa-qrcode-loading').style.display = 'none';
            const img = document.getElementById('mfa-qrcode-img');
            img.src = resultado.qrCode;
            img.style.display = 'inline-block';
            document.getElementById('mfa-segredo-texto').innerText = resultado.segredo;

            if (resultado.origemReconfiguracao) {
                // Usuário já recebeu este mesmo QR code por e-mail (fluxo de
                // "Reconfigurar autenticador"). Prioriza o campo de código:
                // esconde o bloco do QR code e mostra um link para reexibi-lo
                // só se a pessoa realmente precisar.
                document.getElementById('mfa-bloco-qrcode').style.display = 'none';
                document.getElementById('mfa-link-mostrar-qrcode').style.display = 'block';
                document.getElementById('mfa-modal-titulo').innerText = "Confirme seu novo autenticador";
                document.getElementById('mfa-modal-subtitulo').innerText =
                    "Você já recebeu o QR code por e-mail. Digite abaixo o código de 6 dígitos gerado pelo app.";
                document.getElementById('mfa-confirmacao-token').focus();
            }
        } else {
            document.getElementById('mfa-qrcode-loading').innerText = resultado.msg || "Não foi possível gerar o QR code.";
        }
    } catch (erro) {
        console.error("Erro ao iniciar configuração de MFA:", erro);
        document.getElementById('mfa-qrcode-loading').innerText = "Falha ao conectar ao servidor.";
    }
}

// Reexibe o bloco do QR code dentro do modal, para quem está no modo
// "pós-reconfiguração" mas não recebeu/encontrou o e-mail com o QR code.
function exibirBlocoQrCodeMfa(event) {
    event.preventDefault();
    document.getElementById('mfa-bloco-qrcode').style.display = 'block';
    document.getElementById('mfa-link-mostrar-qrcode').style.display = 'none';
}

function exibirAlertaMfa(texto, tipo) {
    const alertaMfa = document.getElementById('mensagem-alerta-mfa');
    alertaMfa.innerText = texto;
    alertaMfa.style.display = 'block';
    if (tipo === 'erro') {
        alertaMfa.style.background = 'rgba(239, 71, 111, 0.1)';
        alertaMfa.style.color = '#ef476f';
        alertaMfa.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        alertaMfa.style.background = 'rgba(6, 214, 160, 0.1)';
        alertaMfa.style.color = '#06d6a0';
        alertaMfa.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }
}

async function confirmarConfiguracaoMfa() {
    const codigo = document.getElementById('mfa-confirmacao-token').value.trim();
    const btn = document.getElementById('btn-confirmar-mfa');

    if (!codigo || codigo.length !== 6) {
        exibirAlertaMfa("Informe o código de 6 dígitos do Authenticator.", "erro");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Validando...";

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "confirmarMfa",
                usuario: mfaContexto.usuario,
                tokenSession: mfaContexto.tokenSession,
                tokenMfa: codigo
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            // O back-end promove a sessão restrita (usada só para configurar o
            // MFA) em uma sessão completa - é isso que efetivamente libera o acesso.
            sessionStorage.setItem("portalToken", resultado.tokenSession);
            sessionStorage.setItem("usuarioLogado", mfaContexto.usuario);
            if (resultado.tipo) {
                sessionStorage.setItem("tipoUsuario", resultado.tipo);
            }

            exibirAlertaMfa("Verificação em duas etapas ativada com sucesso!", "sucesso");
            btn.innerText = "Ativado";

            setTimeout(() => {
                window.location.href = "visualizador";
            }, 1800);
        } else {
            exibirAlertaMfa(resultado.msg || "Código inválido. Tente novamente.", "erro");
            btn.disabled = false;
            btn.innerText = "Confirmar e Acessar";
        }
    } catch (erro) {
        console.error("Erro ao confirmar MFA:", erro);
        exibirAlertaMfa("Falha ao conectar ao servidor.", "erro");
        btn.disabled = false;
        btn.innerText = "Confirmar e Acessar";
    }
}

// ---------------------------------------------------------------------
// Receber código MFA por e-mail (alternativa ao Authenticator)
// ---------------------------------------------------------------------

function exibirMensagemSuporteMfa(texto, tipo) {
    const el = document.getElementById('mensagem-suporte-mfa');
    el.innerText = texto;
    el.style.display = 'block';
    if (tipo === 'erro') {
        el.style.background = 'rgba(239, 71, 111, 0.1)';
        el.style.color = '#ef476f';
        el.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        el.style.background = 'rgba(6, 214, 160, 0.1)';
        el.style.color = '#06d6a0';
        el.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }
}

async function enviarCodigoEmailMfa(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    if (!usuario) {
        exibirMensagemSuporteMfa("E-mail não identificado. Recarregue a página e faça login novamente.", "erro");
        return;
    }

    const link = document.getElementById('link-codigo-email-mfa');
    const textoOriginal = link.innerHTML;
    link.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 5px;"></i>Enviando...';

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "enviarCodigoEmailMfa",
                usuario: usuario
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            exibirMensagemSuporteMfa("Código enviado! Verifique seu e-mail (válido por 5 minutos) e digite-o no campo acima.", "sucesso");
        } else {
            exibirMensagemSuporteMfa(resultado.msg || "Não foi possível enviar o código.", "erro");
        }
    } catch (erro) {
        console.error("Erro ao enviar código por e-mail:", erro);
        exibirMensagemSuporteMfa("Falha ao conectar ao servidor.", "erro");
    } finally {
        link.innerHTML = textoOriginal;
    }
}

// ---------------------------------------------------------------------
// Reconfigurar autenticador ("Problemas com o Token?")
// ---------------------------------------------------------------------

function solicitarReconfiguracaoMfa(event) {
    event.preventDefault();

    const alertaReconfigurar = document.getElementById('mensagem-alerta-reconfigurar');
    alertaReconfigurar.style.display = 'none';

    document.getElementById('modal-reconfigurar-mfa').style.display = 'flex';
}

function fecharModalReconfigurarMfa() {
    document.getElementById('modal-reconfigurar-mfa').style.display = 'none';
}

function exibirAlertaReconfigurar(texto, tipo) {
    const el = document.getElementById('mensagem-alerta-reconfigurar');
    el.innerText = texto;
    el.style.display = 'block';
    if (tipo === 'erro') {
        el.style.background = 'rgba(239, 71, 111, 0.1)';
        el.style.color = '#ef476f';
        el.style.border = '1px solid rgba(239, 71, 111, 0.2)';
    } else {
        el.style.background = 'rgba(6, 214, 160, 0.1)';
        el.style.color = '#06d6a0';
        el.style.border = '1px solid rgba(6, 214, 160, 0.2)';
    }
}

async function confirmarSolicitacaoReconfiguracao() {
    const usuario = document.getElementById('usuario').value.trim();
    const btn = document.getElementById('btn-confirmar-reconfigurar');

    if (!usuario) {
        exibirAlertaReconfigurar("E-mail não identificado. Recarregue a página e faça login novamente.", "erro");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "solicitarReconfiguracaoMfa",
                usuario: usuario
            })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            exibirAlertaReconfigurar("E-mail enviado! Verifique sua caixa de entrada e clique no link para confirmar.", "sucesso");
            btn.innerText = "Enviado";
            setTimeout(() => {
                fecharModalReconfigurarMfa();
                btn.disabled = false;
                btn.innerText = "Sim, enviar e-mail";
            }, 5000);
        } else {
            exibirAlertaReconfigurar(resultado.msg || "Não foi possível processar a solicitação.", "erro");
            btn.disabled = false;
            btn.innerText = "Sim, enviar e-mail";
        }
    } catch (erro) {
        console.error("Erro ao solicitar reconfiguração de MFA:", erro);
        exibirAlertaReconfigurar("Falha ao conectar ao servidor.", "erro");
        btn.disabled = false;
        btn.innerText = "Sim, enviar e-mail";
    }
}

// ---------------------------------------------------------------------
// Detecta o link de confirmação (?confirmarReset=TOKEN) vindo do e-mail
// de "Reconfigurar autenticador" e finaliza o processo automaticamente.
// ---------------------------------------------------------------------

async function verificarLinkConfirmacaoReset() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('confirmarReset');
    if (!token) return;

    exibirAlerta("Confirmando reconfiguração do autenticador...", "sucesso");

    try {
        const resposta = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: "confirmarReconfiguracaoMfa",
                token: token
            })
        });
        const resultado = await resposta.json();

        const mensagemFinal = resultado.sucesso
            ? (resultado.msg || "Autenticador antigo desativado. Verifique seu e-mail para configurar o novo.")
            : (resultado.msg || "Não foi possível confirmar a reconfiguração.");

        // Guarda a mensagem para exibir já na tela de login limpa, depois do reload.
        sessionStorage.setItem("mensagemPosReset", mensagemFinal);
        sessionStorage.setItem("tipoMensagemPosReset", resultado.sucesso ? "sucesso" : "erro");

    } catch (erro) {
        console.error("Erro ao confirmar reconfiguração de MFA:", erro);
        sessionStorage.setItem("mensagemPosReset", "Falha ao conectar ao servidor para confirmar a reconfiguração.");
        sessionStorage.setItem("tipoMensagemPosReset", "erro");
    }

    // Força a volta para a tela inicial de login, limpa (sem parâmetros na
    // URL e sem nenhum estado JS em memória - loginEtapa, mfaContexto, campos
    // desabilitados, etc.). Isso evita que uma aba antiga, parada na etapa de
    // código MFA com o segredo já desativado, continue ativa e cause o erro
    // "código inválido" mesmo depois da reconfiguração ter funcionado.
    window.location.href = window.location.pathname;
}

// Ao carregar a tela de login limpa, exibe a mensagem guardada (se houver)
// sobre o resultado da reconfiguração de autenticador feita no passo anterior.
function exibirMensagemPosResetSeHouver() {
    const mensagem = sessionStorage.getItem("mensagemPosReset");
    if (!mensagem) return;

    const tipo = sessionStorage.getItem("tipoMensagemPosReset") || "sucesso";
    exibirAlerta(mensagem, tipo);

    sessionStorage.removeItem("mensagemPosReset");
    sessionStorage.removeItem("tipoMensagemPosReset");
}

// Executa a verificação automaticamente ao carregar a página
verificarLinkConfirmacaoReset();
exibirMensagemPosResetSeHouver();
