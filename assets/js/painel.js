// URL do Web App do Apps Script
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjp0qfCz5lQRssIH9fDdON-AwmwZa0iL3rB-ldTJ_rO0-NX6Sva5VenZswvIC1bx-3/exec";

// Mesma chave usada pelo login.html ao salvar a sessão
const TOKEN = sessionStorage.getItem("portalToken");

// Sem token, não há sessão válida - volta para o login imediatamente.
if (!TOKEN) {
    window.location.href = "login";
}

let perfilUsuario = "Leitor"; // Padrão de segurança restrito

// Controla quais cards já tiveram seus dados carregados, para não repetir
// a chamada à API cada vez que o usuário reabre o mesmo card.
const cardsJaCarregados = {};

document.addEventListener("DOMContentLoaded", function () {
    bloquearAtalhosSeguranca();
    iniciarMonitorDeInatividade();
});

// ---------------------------------------------------------------------
// Navegação entre cards / seções
// ---------------------------------------------------------------------

function abrirSecao(nomeCard) {
    // Fecha qualquer outra seção aberta (só uma seção visível por vez)
    document.querySelectorAll(".secao-conteudo").forEach(function (secao) {
        secao.classList.remove("visivel");
    });
    document.querySelectorAll(".card-recurso").forEach(function (card) {
        card.classList.remove("ativo");
    });

    const secao = document.getElementById("secao-" + nomeCard);
    const card = document.querySelector('.card-recurso[data-card="' + nomeCard + '"]');
    if (secao) secao.classList.add("visivel");
    if (card) card.classList.add("ativo");

    // Registra no log (aba LogLogin) qual card o usuário acessou
    registrarAcessoCard(nomeCard);

    // Carrega os dados do card na primeira vez que ele é aberto
    if (!cardsJaCarregados[nomeCard]) {
        cardsJaCarregados[nomeCard] = true;

        if (nomeCard === "documentos") carregarDocumentos();
        if (nomeCard === "personas") carregarPersonas();
        if (nomeCard === "processos") carregarProcessos();
        if (nomeCard === "multas") carregarMultas();
        if (nomeCard === "prejuizo") carregarPrejuizoFinanceiro();
        if (nomeCard === "calculadora") carregarCalculadora();
    }

    // Rola a tela até a seção aberta, para o usuário ver o conteúdo
    // imediatamente, sem precisar rolar manualmente.
    if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Envia para o backend um registro de qual card/ação foi acessada.
// "fire and forget": não bloqueia a navegação nem trata erro visualmente.
function registrarAcessoCard(card, detalhe) {
    let url = `${APPS_SCRIPT_URL}?action=registrarAcessoCard&token=${TOKEN}&card=${encodeURIComponent(card)}`;
    if (detalhe) url += `&detalhe=${encodeURIComponent(detalhe)}`;
    fetch(url).catch(() => {});
}

function fecharSecao(nomeCard) {
    const secao = document.getElementById("secao-" + nomeCard);
    const card = document.querySelector('.card-recurso[data-card="' + nomeCard + '"]');
    if (secao) secao.classList.remove("visivel");
    if (card) card.classList.remove("ativo");
}

// ---------------------------------------------------------------------
// CARD 1 — Documentos para Consulta
// ---------------------------------------------------------------------

function carregarDocumentos() {
    fetch(`${APPS_SCRIPT_URL}?action=obterDados&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.msg || "Sessão inválida. Por favor, refaça o login.");
                window.location.href = "login";
                return;
            }

            perfilUsuario = data.perfil;
            renderizarDocumentos(data.arquivos, data.urlPastaDrive);
        })
        .catch(err => {
            console.error("Erro ao conectar à API:", err);
            document.getElementById("documentos-loading").innerHTML =
                '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar os documentos. Tente novamente mais tarde.</p>';
        });
}

function renderizarDocumentos(arquivos, urlPastaDrive) {
    document.getElementById("documentos-loading").style.display = "none";
    document.getElementById("documentos-lista-wrapper").style.display = "block";

    // Botão "Salvar Todos": abre a própria pasta do Drive em nova aba.
    // A pasta continua com compartilhamento restrito - só quem já tem
    // acesso (via Permissions.create) consegue de fato abrir o conteúdo.
    if (perfilUsuario === "Editor" && urlPastaDrive) {
        const btnPasta = document.getElementById("btn-link-pasta-drive");
        btnPasta.href = urlPastaDrive;
        btnPasta.style.display = "flex";
    }

    const listaDiv = document.getElementById("lista-arquivos");

    if (arquivos.length === 0) {
        listaDiv.innerHTML = '<p style="color:var(--text-gray); font-size:0.9rem;">Nenhum arquivo disponível.</p>';
        return;
    }

    let html = '';
    arquivos.forEach(arq => {
        let icone = 'fa-file-pdf';
        let corIcone = '#e63946';

        if (arq.nome.includes('.xlsx') || arq.nome.includes('.csv')) {
            icone = 'fa-file-excel';
            corIcone = '#2a9d8f';
        } else if (arq.nome.includes('.docx')) {
            icone = 'fa-file-word';
            corIcone = '#0077b6';
        }

        const nomeSemExtensao = arq.nome.replace(/\.[^/.]+$/, "");
        const nomeEscapado = arq.nome.replace(/'/g, "\\'");

        html += `
            <div class="card-arquivo">
                <div class="info-arquivo">
                    <i class="fa-solid ${icone}" style="color: ${corIcone};"></i>
                    <span class="nome-arquivo" title="${arq.nome}">${nomeSemExtensao}</span>
                </div>
                <div class="acoes-arquivo">
                    <button class="btn-acao btn-ver" onclick="abrirArquivoNovaGuia('${arq.id}')">
                        <i class="fa-solid fa-eye"></i> Ver
                    </button>
        `;

        if (perfilUsuario === "Editor") {
            if (arq.tamanhoExcedeLimite) {
                html += `
                    <button class="btn-acao btn-baixar" disabled title="Arquivo muito grande para baixar por aqui" style="opacity:0.5; cursor:not-allowed;" onclick="alert('Este arquivo é grande demais para ser baixado por este painel. Use o botão Salvar Todos (pasta do Drive) para obtê-lo.')">
                        <i class="fa-solid fa-triangle-exclamation"></i> Muito grande
                    </button>
                `;
            } else {
                html += `
                    <button class="btn-acao btn-baixar" onclick="baixarArquivoIndividual('${arq.id}', '${nomeEscapado}')">
                        <i class="fa-solid fa-download"></i> Salvar
                    </button>
                `;
            }
        }

        html += `</div></div>`;
    });

    listaDiv.innerHTML = html;
}

// "Ver": abre o documento em uma nova guia (permite tanto visualizar
// quanto, a partir dela, salvar - conforme solicitado).
function abrirArquivoNovaGuia(id) {
    fetch(`${APPS_SCRIPT_URL}?action=obterLinkVisualizacao&token=${TOKEN}&fileId=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.msg || "Não foi possível abrir este arquivo.");
                return;
            }
            window.open(data.url, "_blank", "noopener");
        })
        .catch(() => alert("Falha ao carregar o arquivo. Tente novamente."));
}

function fecharVisualizadorDocumento() {
    document.getElementById("documentos-visualizador").style.display = "none";
    document.getElementById("iframe-seguro").src = "about:blank";
}

function baixarArquivoIndividual(id, nome) {
    fetch(`${APPS_SCRIPT_URL}?action=stream&token=${TOKEN}&fileId=${id}&finalidade=download`)
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.msg || "Não foi possível baixar este arquivo.");
                return;
            }
            const link = document.createElement('a');
            link.href = `data:${data.mimeType};base64,${data.bytes}`;
            link.download = nome;
            link.click();
        })
        .catch(() => alert("Falha ao baixar o arquivo. Tente novamente."));
}

// ---------------------------------------------------------------------
// CARD 2 — Personas Envolvidas
// ---------------------------------------------------------------------

// Armazena todas as personas carregadas para navegação local (sem nova chamada à API)
let personasCarregadas = [];
let secundariosVisiveis = false;

function carregarPersonas() {
    fetch(`${APPS_SCRIPT_URL}?action=obterPersonas&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("personas-loading").style.display = "none";

            if (data.erro) {
                document.getElementById("personas-lista").innerHTML =
                    `<p style="color:#ef476f; font-size:0.9rem;">${data.msg || "Não foi possível carregar as personas."}</p>`;
                return;
            }

            if (!data.personas || data.personas.length === 0) {
                document.getElementById("personas-lista").innerHTML =
                    '<p style="color:var(--text-gray); font-size:0.9rem;">Nenhuma persona cadastrada.</p>';
                return;
            }

            personasCarregadas = data.personas;
            secundariosVisiveis = false;
            renderizarListaPersonas();
        })
        .catch(() => {
            document.getElementById("personas-loading").innerHTML =
                '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar as personas. Tente novamente mais tarde.</p>';
        });
}

function gerarIniciais(nome) {
    return nome.split(" ").filter(p => p.length > 2).slice(0, 2)
        .map(p => p[0]).join("").toUpperCase() || nome.slice(0, 2).toUpperCase();
}

function obterRelacao(campos) {
    const r = (campos || []).find(c =>
        c.campo.toLowerCase() === "relação" || c.campo.toLowerCase() === "relacao"
    );
    return r ? r.valor : "";
}

// Lê a classificação diretamente do campo retornado pela API.
// A planilha possui a coluna "Classificacao" com valores:
//   "Principal 1" … "Principal 7"  → grupo principal, ordenado pelo número
//   qualquer outro valor ou vazio   → grupo secundário, ordenado alfabeticamente
function lerClassificacao(persona) {
    const raw = String(persona.classificacao || "").trim();
    const match = raw.match(/^principal\s*(\d+)$/i);
    if (match) return { tipo: "principal", ordem: parseInt(match[1], 10) };
    return { tipo: "secundario", ordem: null };
}

function renderizarListaPersonas() {
    const lista = document.getElementById("personas-lista");
    const detalhe = document.getElementById("personas-detalhe");
    detalhe.classList.remove("visivel");
    detalhe.innerHTML = "";

    const principais    = [];
    const secundarios   = [];

    personasCarregadas.forEach((persona, idx) => {
        const cls = lerClassificacao(persona);
        if (cls.tipo === "principal") {
            principais.push({ persona, idx, ordem: cls.ordem });
        } else {
            secundarios.push({ persona, idx });
        }
    });

    // Principais respeitam a numeração da planilha
    principais.sort((a, b) => a.ordem - b.ordem);

    // Secundários em ordem alfabética
    secundarios.sort((a, b) =>
        a.persona.nome.localeCompare(b.persona.nome, "pt-BR", { sensitivity: "base" })
    );

    function cardHtml({ persona, idx }) {
        return `
            <div class="persona-item" onclick="abrirDetalhePersona(${idx})">
                <div class="persona-avatar">${gerarIniciais(persona.nome)}</div>
                <div style="flex:1; min-width:0;">
                    <div class="persona-item-nome">${persona.nome}</div>
                    <div class="persona-item-relacao">${obterRelacao(persona.campos)}</div>
                </div>
            </div>
        `;
    }

    let html = "";

    if (principais.length) {
        html += `<div class="personas-grupo-label">Personas Principais</div>`;
        html += principais.map(cardHtml).join("");
    }

    if (secundarios.length) {
        const qtd = secundarios.length;
        if (secundariosVisiveis) {
            html += `<div class="personas-grupo-label secundario">Personas Secundárias (${qtd})</div>`;
            html += secundarios.map(cardHtml).join("");
            html += `
                <button class="btn-ver-mais-personas" onclick="toggleSecundarios()">
                    <i class="fa-solid fa-chevron-up"></i> Ocultar secundárias
                </button>
            `;
        } else {
            html += `
                <button class="btn-ver-mais-personas" onclick="toggleSecundarios()">
                    <i class="fa-solid fa-chevron-down"></i> Ver mais — ${qtd} persona${qtd !== 1 ? "s" : ""} secundária${qtd !== 1 ? "s" : ""}
                </button>
            `;
        }
    }

    lista.innerHTML = html;
    lista.style.display = "grid";
}

function toggleSecundarios() {
    secundariosVisiveis = !secundariosVisiveis;
    renderizarListaPersonas();
}

function abrirDetalhePersona(idx) {
    const persona = personasCarregadas[idx];
    const lista   = document.getElementById("personas-lista");
    const detalhe = document.getElementById("personas-detalhe");
    const loading = document.getElementById("personas-loading");

    lista.style.display = "none";
    if (loading) loading.style.display = "none";

    const camposHtml = persona.campos.map(c => `
        <div class="linha-campo-persona">
            <span class="nome-campo">${c.campo}</span>
            <span class="valor-campo">${c.valor}</span>
        </div>
    `).join("");

    detalhe.innerHTML = `
        <div class="persona-detalhe-header">
            <div class="persona-avatar-grande">${gerarIniciais(persona.nome)}</div>
            <div class="persona-detalhe-nome">${persona.nome}</div>
        </div>
        <div class="persona-detalhe-campos">${camposHtml}</div>
        <button class="btn-voltar-personas" onclick="voltarListaPersonas()">
            <i class="fa-solid fa-arrow-left"></i> Voltar para personas
        </button>
    `;
    detalhe.classList.add("visivel");
}

function voltarListaPersonas() {
    const lista   = document.getElementById("personas-lista");
    const detalhe = document.getElementById("personas-detalhe");
    detalhe.classList.remove("visivel");
    detalhe.innerHTML = "";
    lista.style.display = "grid";
}

// ---------------------------------------------------------------------
// CARD 3 — Prejuízo Financeiro
// ---------------------------------------------------------------------

let abaPrejuizoAtiva = "iolanda";

function carregarPrejuizoFinanceiro() {
    fetch(`${APPS_SCRIPT_URL}?action=obterPrejuizoFinanceiro&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("prejuizo-loading").style.display = "none";
            const container = document.getElementById("prejuizo-conteudo");
            container.style.display = "block";

            if (data.erro) {
                container.innerHTML = `<p style="color:#ef476f; font-size:0.9rem;">${data.msg || "Não foi possível carregar os dados de prejuízo financeiro."}</p>`;
                return;
            }

            dadosPrejuizoCarregados = data;
            renderizarPrejuizoFinanceiro(data);
        })
        .catch(() => {
            document.getElementById("prejuizo-loading").innerHTML =
                '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
        });
}

let dadosPrejuizoCarregados = null;

function trocarAbaPrejuizo(aba) {
    abaPrejuizoAtiva = aba;
    if (dadosPrejuizoCarregados) renderizarPrejuizoFinanceiro(dadosPrejuizoCarregados);
}

function fmtBRL(v) {
    if (typeof v !== "number" || isNaN(v)) return "R$ 0,00";
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderizarPrejuizoFinanceiro(data) {
    const container = document.getElementById("prejuizo-conteudo");

    const mes = String(data.dataBaseCalculo.mes).padStart(2, "0");
    const ano = data.dataBaseCalculo.ano;

    let html = `
        <div class="prejuizo-meta">Consulta de danos — Caso Eliane · Base de referência: ${mes}/${ano} · Valores nominais declarados</div>
        <div class="prejuizo-tabs">
            <button class="prejuizo-tab ${abaPrejuizoAtiva === "iolanda" ? "active" : ""}" onclick="trocarAbaPrejuizo('iolanda')">Iolanda</button>
            <button class="prejuizo-tab ${abaPrejuizoAtiva === "jardel" ? "active" : ""}" onclick="trocarAbaPrejuizo('jardel')">Jardel</button>
        </div>
    `;

    if (abaPrejuizoAtiva === "iolanda") {
        html += renderizarPainelIolanda(data.iolanda);
    } else {
        html += renderizarPainelJardel(data.jardel);
    }

    container.innerHTML = html;
}

function renderizarPainelIolanda(iolanda) {
    const b = iolanda.blocosEspeciais;

    // KPI: apenas danos diretos por intervenção de Eliane
    const totalIntervencao = iolanda.totalIntervencaoEliane;

    // Total nominal dos itens individuais da planilha (ex: custo advogado)
    const totalItensIndividuais = (iolanda.itens || []).reduce((soma, i) => soma + (i.valorOriginal || 0), 0);
    const totalNominal = b.pensao.totalEmAtraso + totalItensIndividuais;

    let html = `
        <div class="prejuizo-kpi-row">
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Danos por intervenção de Eliane</div>
                <div class="prejuizo-kpi-valor danger">${fmtBRL(totalIntervencao)}</div>
                <div class="prejuizo-kpi-sub">Pensão em atraso + defesa criminal</div>
            </div>
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Pensão em atraso</div>
                <div class="prejuizo-kpi-valor warning">${fmtBRL(b.pensao.totalEmAtraso)}</div>
                <div class="prejuizo-kpi-sub">${b.pensao.mesesEmAtraso} meses em atraso</div>
            </div>
        </div>

        <div class="section-titlev1"><span class="section-numv1">1</span>Pensão alimentícia — suspensa desde ago/2025</div>
        <div class="item-card">
            <div class="item-header">
                <div class="item-desc">Pensão mensal com trânsito julgado (proc. 0002177-58.2007.8.19.0204). Suspensa pois a Marinha aguarda certidão de óbito corrigida — correção impedida por Eliane e seu advogado junto ao cartório.</div>
                <div class="item-valor-destaque warning">${fmtBRL(b.pensao.totalEmAtraso)}</div>
            </div>
            <div><span class="item-badge badge-suspenso">Benefício suspenso — proc. 0906334-46.2025.8.19.0001</span></div>
            <div class="prejuizo-vals" style="margin-top:12px;">
                <div class="val-block"><div class="val-label">Valor mensal</div><div class="val-num">${fmtBRL(b.pensao.pensaoMensal)}</div></div>
                <div class="val-block"><div class="val-label">Meses em atraso</div><div class="val-num">${b.pensao.mesesEmAtraso}</div></div>
                <div class="val-block"><div class="val-label">2ª parcela 13º</div><div class="val-num">${b.pensao.decimoTerceiroParcela2 > 0 ? fmtBRL(b.pensao.decimoTerceiroParcela2) : "—"}</div></div>
                <div class="val-block"><div class="val-label">Total em atraso</div><div class="val-num updated">${fmtBRL(b.pensao.totalEmAtraso)}</div></div>
            </div>
        </div>
    `;

    if (iolanda.itens && iolanda.itens.length > 0) {
        html += `<div class="section-titlev1"><span class="section-numv1">+</span>Outros itens de dano material</div>`;
        iolanda.itens.forEach(item => { html += blocoItemMaterial(item); });
    }

    html += `
        <div class="prejuizo-nota-rodape" style="border-left: 2px solid var(--primary-blue); margin-top: 1.5rem;">
            <strong style="color: #e0e0e0; display:block; margin-bottom: 6px;">
                <i class="fa-solid fa-scale-balanced" style="color: var(--primary-blue); margin-right: 6px;"></i>
                Outros danos não contabilizados acima
            </strong>
            Além dos danos materiais listados, Iolanda possui direito à partilha de bens determinada em processo judicial com trânsito em julgado de nº
            <strong style="color: #e0e0e0;">0002179-28.2007.8.19.0204</strong>
            — cujo cumprimento está impedido enquanto o processo de inventário permanecer suspenso em razão das ações da parte adversa.
            Os valores referentes a esses direitos podem ser consultados no card
            <strong style="color: var(--primary-blue); cursor: pointer;" onclick="fecharSecao('prejuizo'); abrirSecao('calculadora')">
                Calculadora Partilha
            </strong>.
        </div>
    `;

    return html;
}

function renderizarPainelJardel(jardel) {
    const totalNominal = (jardel.itens || []).reduce((soma, i) => soma + i.valorOriginal, 0);
    const qtd = (jardel.itens || []).length;
    const maiorItem = (jardel.itens || []).reduce((m, i) => i.valorOriginal > m ? i.valorOriginal : m, 0);

    let html = `
        <div class="prejuizo-kpi-row">
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Total de danos mensurados</div>
                <div class="prejuizo-kpi-valor danger">${fmtBRL(totalNominal)}</div>
                <div class="prejuizo-kpi-sub">Valores nominais declarados</div>
            </div>
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Itens mapeados</div>
                <div class="prejuizo-kpi-valor">${qtd}</div>
                <div class="prejuizo-kpi-sub">Eliane · Rodrigo · Rosemar</div>
            </div>
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Maior dano individual</div>
                <div class="prejuizo-kpi-valor">${fmtBRL(maiorItem)}</div>
                <div class="prejuizo-kpi-sub">Valor nominal</div>
            </div>
        </div>
        <div class="section-titlev1">Prejuízos causados por Eliane, Rodrigo (adv.) e Rosemar</div>
    `;

    (jardel.itens || []).forEach(item => { html += blocoItemMaterial(item); });

    html += `
        <div class="prejuizo-total-card">
            <div>
                <div class="prejuizo-total-label">Total de prejuízo mensurável — Jardel</div>
                <small>${qtd} ${qtd === 1 ? "item" : "itens"} · Valores nominais declarados — sem correção monetária aplicada</small>
            </div>
            <div class="prejuizo-total-valor">${fmtBRL(totalNominal)}</div>
        </div>
        <div class="prejuizo-nota-rodape">Correção monetária (IPCA) e juros moratórios (1% a.m.) não estão aplicados. Esses valores poderão ser calculados individualmente por item conforme a data do dano. Solicite ao advogado o cálculo individualizado para apresentação em juízo.</div>
    `;

    return html;
}

function blocoItemMaterial(item) {
    const badgeTipo = item.tipo ? `<span class="item-badge badge-direto">${item.tipo}</span>` : "";
    const observacao = item.observacao
        ? `<div class="item-nota">${item.observacao}</div>`
        : "";
    const valor = item.valorOriginal || item.valorFinal || 0;

    return `
        <div class="item-card">
            <div class="item-header">
                <div class="item-desc">${item.detalhamento}</div>
                <div class="item-valor-destaque">${fmtBRL(valor)}</div>
            </div>
            <div>${badgeTipo}</div>
            ${observacao}
        </div>
    `;
}


// ---------------------------------------------------------------------
// CARD 4 — Processos
// ---------------------------------------------------------------------

function carregarProcessos() {
    fetch(`${APPS_SCRIPT_URL}?action=obterProcessos&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("processos-loading").style.display = "none";
            const container = document.getElementById("processos-conteudo");
            container.style.display = "block";

            if (data.erro) {
                container.innerHTML = `<p style="color:#ef476f; font-size:0.9rem;">${data.msg || "Não foi possível carregar os processos."}</p>`;
                return;
            }

            if (!data.processos || data.processos.length === 0) {
                container.innerHTML = '<p style="color:var(--text-gray); font-size:0.9rem;">Nenhum processo cadastrado.</p>';
                return;
            }

            let html = '<div class="proc-list">';

            data.processos.forEach(p => {
                const statusClasse = classificarStatusBadge(p.status);
                html += `
                    <div class="proc-card">
                        <div class="proc-topo">
                            <span class="proc-numero">${p.numero}</span>
                            <span class="badge-status ${statusClasse}">${p.status}</span>
                        </div>
                        <div class="proc-subtopo">
                            <div class="proc-subtopo-item">
                                <i class="fa-solid fa-briefcase"></i>
                                <strong>${p.atribuicao}</strong>
                            </div>
                            <div class="proc-subtopo-item">
                                <i class="fa-solid fa-calendar"></i>
                                <strong>${p.dataAbertura}</strong>
                            </div>
                        </div>
                        <div class="proc-resumo">${p.resumo}</div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        })
        .catch(() => {
            document.getElementById("processos-loading").innerHTML =
                '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar os processos. Tente novamente mais tarde.</p>';
        });
}

// Mapeia o texto do status para uma classe de cor do badge. Reconhece
// variações comuns (acentos, maiúsculas/minúsculas); qualquer status não
// reconhecido cai no estilo neutro padrão (sem classe extra).
function classificarStatusBadge(status) {
    const normalizado = String(status || "").toLowerCase();
    if (normalizado.includes("ativo") || normalizado.includes("andamento")) return "ativo";
    if (normalizado.includes("encerrado") || normalizado.includes("conclu")) return "encerrado";
    if (normalizado.includes("suspens")) return "suspenso";
    return "";
}


// ---------------------------------------------------------------------
// CARD 6 — Multas T-Cross
// ---------------------------------------------------------------------

function carregarMultas() {
    fetch(`${APPS_SCRIPT_URL}?action=obterMultas&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("multas-loading").style.display = "none";
            const container = document.getElementById("multas-conteudo");
            container.style.display = "block";

            if (data.erro) {
                container.innerHTML = `<p style="color:#ef476f; font-size:0.9rem;">${data.msg || "Não foi possível carregar as multas."}</p>`;
                return;
            }

            renderizarMultas(data.multas || []);
        })
        .catch(() => {
            document.getElementById("multas-loading").innerHTML =
                '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar as multas. Tente novamente mais tarde.</p>';
        });
}

function renderizarMultas(multas) {
    if (!multas.length) {
        document.getElementById("multas-conteudo").innerHTML =
            '<p style="color:var(--text-gray);">Nenhuma multa registrada.</p>';
        return;
    }

    // KPIs
    const total = multas.reduce((acc, m) => {
        const v = parseFloat(String(m.valor || "0").replace("R$","").replace(".","").replace(",",".").trim());
        return acc + (isNaN(v) ? 0 : v);
    }, 0);

    const qtdVelocidade  = multas.filter(m => String(m.enquadramento||"").startsWith("218")).length;
    const qtdOutros      = multas.length - qtdVelocidade;
    const qtdTransitado  = multas.filter(m => String(m.statusRecurso||"").toLowerCase().includes("transitado")).length;

    const fmtBRL = v => "R$ " + v.toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Classifica badge e borda
    function classeRecurso(status) {
        const s = String(status||"").toLowerCase();
        if (s.includes("transitado")) return { badge: "transitado", card: "transitado" };
        if (s.includes("defesa"))     return { badge: "defesa",     card: "defesa-previa" };
        return                               { badge: "jari",       card: "jari" };
    }

    function labelBadge(status) {
        const s = String(status||"").toLowerCase();
        if (s.includes("transitado")) return "Transitado em Julgado";
        if (s.includes("defesa"))     return "Aguard. Defesa Prévia";
        return "Recurso JARI";
    }

    let html = `
        <div class="multas-resumo">
            <div class="multas-kpi">
                <i class="fa-solid fa-circle-exclamation kpi-icon" style="color:#ef476f;"></i>
                <div class="kpi-valor">${fmtBRL(total)}</div>
                <div class="kpi-label">Valor total em multas</div>
            </div>
            <div class="multas-kpi">
                <i class="fa-solid fa-gauge-high kpi-icon" style="color:#ffd166;"></i>
                <div class="kpi-valor" style="color:#ffd166;">${qtdVelocidade}</div>
                <div class="kpi-label">Infrações por excesso de velocidade</div>
            </div>
            <div class="multas-kpi">
                <i class="fa-solid fa-list-check kpi-icon" style="color:#58a6ff;"></i>
                <div class="kpi-valor" style="color:#58a6ff;">${multas.length}</div>
                <div class="kpi-label">Total de infrações</div>
            </div>
            <div class="multas-kpi">
                <i class="fa-solid fa-triangle-exclamation kpi-icon" style="color:#ef476f;"></i>
                <div class="kpi-valor">${qtdTransitado}</div>
                <div class="kpi-label">Transitadas em julgado (pgto obrigatório)</div>
            </div>
        </div>

        <div class="multas-legenda">
            <div class="legenda-item"><div class="legenda-cor" style="background:#ef476f;"></div>Transitado em Julgado</div>
            <div class="legenda-item"><div class="legenda-cor" style="background:#ffd166;"></div>Aguard. Defesa Prévia</div>
            <div class="legenda-item"><div class="legenda-cor" style="background:#58a6ff;"></div>Recurso 1ª Instância (JARI)</div>
        </div>
    `;

	multas.forEach(m => {
		const cls = classeRecurso(m.statusRecurso);
		
		// Limpa o texto vindo do back-end para evitar falso-positivo
		const valorPrazo = m.prazoPagamento ? m.prazoPagamento.toString().trim() : "";
		
		// Valida se o prazo é válido e se não é um traço ou a string "Invalid Date"
		const prazo = (valorPrazo && valorPrazo !== "-" && valorPrazo !== "" && valorPrazo.toLowerCase() !== "invalid date")
			? `<div class="multa-meta-item"><i class="fa-solid fa-calendar-xmark" style="color:#ef476f;"></i> Prazo: <strong>${valorPrazo}</strong></div>`
			: "";

		html += `
			<div class="multa-card ${cls.card}">
				<div class="multa-topo">
					<span class="multa-auto">Auto: ${m.autoInfracao}</span>
					<span class="multa-valor">${m.valor}</span>
				</div>
				<div class="multa-descricao">${m.descricao}</div>
				<div class="multa-local"><i class="fa-solid fa-location-dot" style="font-size:0.75rem;"></i> ${m.local}</div>
				<div class="multa-meta">
					<div class="multa-meta-item"><i class="fa-solid fa-calendar"></i> <strong>${m.dataInfracao}</strong> às ${m.hora}</div>
					<div class="multa-meta-item"><i class="fa-solid fa-building"></i> ${m.orgaoEmissor}</div>
					<div class="multa-meta-item"><i class="fa-solid fa-code"></i> ${m.enquadramento}</div>
					${prazo}
					<div class="multa-meta-item" style="margin-left:auto;">
						<span class="badge-recurso ${cls.badge}">${labelBadge(m.statusRecurso)}</span>
					</div>
				</div>
			</div>
		`;
	});
    document.getElementById("multas-conteudo").innerHTML = html;
}

// ---------------------------------------------------------------------
// Segurança no navegador (mesmo comportamento do visualizador anterior)
// ---------------------------------------------------------------------

function bloquearAtalhosSeguranca() {
    document.addEventListener('keydown', function (e) {
        if (perfilUsuario === "Leitor") {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;

            if (ctrl && (key === 'p' || key === 's' || key === 'c')) {
                e.preventDefault();
                alert('Atenção: Operação de cópia, impressão ou salvamento bloqueada para este perfil.');
            }
        }
    });
}

// ---------------------------------------------------------------------
// Logout (manual e por inatividade)
// ---------------------------------------------------------------------

function confirmarLogout() {
    if (confirm("Deseja realmente encerrar a sessão?")) {
        efetuarLogout();
    }
}

function efetuarLogout() {
    fetch(`${APPS_SCRIPT_URL}?action=logout&token=${TOKEN}`).catch(() => {});

    sessionStorage.removeItem("portalToken");
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("tipoUsuario");
    window.location.href = "index";
}

const MINUTOS_INATIVIDADE = 30;
let timeoutInatividade = null;

function iniciarMonitorDeInatividade() {
    reiniciarTimeoutInatividade();

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(function (evento) {
        document.addEventListener(evento, reiniciarTimeoutInatividade, { passive: true });
    });
}

function reiniciarTimeoutInatividade() {
    if (timeoutInatividade) clearTimeout(timeoutInatividade);
    timeoutInatividade = setTimeout(encerrarPorInatividade, MINUTOS_INATIVIDADE * 60 * 1000);
}

function encerrarPorInatividade() {
    alert("Sua sessão foi encerrada automaticamente por inatividade (" + MINUTOS_INATIVIDADE + " minutos sem uso). Faça login novamente.");

    fetch(`${APPS_SCRIPT_URL}?action=logout&token=${TOKEN}`).catch(() => {});

    sessionStorage.removeItem("portalToken");
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("tipoUsuario");
    window.location.href = "index";
}

// =====================================================================
// CARD — Calculadora Partilha
// =====================================================================

let dadosCalculadora = null; // cache dos dados carregados da API

function carregarCalculadora() {
    const container = document.getElementById("calc-conteudo");
    const loading   = document.getElementById("calc-loading");
    if (loading) loading.style.display = "block";
    if (container) container.style.display = "none";

    fetch(`${APPS_SCRIPT_URL}?action=obterCalculadora&token=${TOKEN}`)
        .then(res => res.json())
        .then(data => {
            if (loading) loading.style.display = "none";
            if (data.erro) {
                if (container) container.innerHTML =
                    `<p style="color:#ef476f;">${data.msg || "Erro ao carregar calculadora."}</p>`;
                if (container) container.style.display = "block";
                return;
            }
            dadosCalculadora = data;
            if (container) container.style.display = "block";
            renderizarCalculadora(data);
        })
        .catch(() => {
            if (loading) loading.style.display = "none";
            if (container) {
                container.innerHTML = '<p style="color:#ef476f;">Não foi possível carregar a calculadora. Tente novamente mais tarde.</p>';
                container.style.display = "block";
            }
        });
}

// ------------------------------------------------------------------
// Helpers de cálculo
// ------------------------------------------------------------------

function calcFatorEntreDatas(series, indice, anoIni, mesIni, anoFim, mesFim) {
    const lista = (series[indice] || []);
    // filtra o intervalo: mes/ano > inicio e <= fim
    let fator = 1;
    lista.forEach(p => {
        const depois = p.ano > anoIni || (p.ano === anoIni && p.mes > mesIni);
        const antes  = p.ano < anoFim || (p.ano === anoFim && p.mes <= mesFim);
        if (depois && antes) fator *= (1 + p.variacaoMensal / 100);
    });
    return fator;
}

function mesesEntreDatas(anoIni, mesIni, anoFim, mesFim) {
    return (anoFim - anoIni) * 12 + (mesFim - mesIni);
}

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmtMesAno(ano, mes) {
    return NOMES_MES[mes - 1] + "/" + ano;
}

function fmtBRLCalc(v) {
    return "R$ " + (isNaN(v) ? "0,00" : Math.abs(v).toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2}));
}

// ------------------------------------------------------------------
// Renderização principal
// ------------------------------------------------------------------

function renderizarCalculadora(data) {
    const container = document.getElementById("calc-conteudo");
    if (!container) return;

    const indices = data.indices || [];

    container.innerHTML = `
        <div class="calc-tabs">
            <button class="calc-tab active" onclick="calcTrocarAba('partilha', this)">
                <i class="fa-solid fa-scale-balanced"></i> Partilha Judicial
            </button>
            <button class="calc-tab" onclick="calcTrocarAba('livre', this)">
                <i class="fa-solid fa-calculator"></i> Calculadora Livre
            </button>
        </div>

        <div id="calc-painel-partilha" class="calc-painel active">
            ${renderizarAbaPartilha(data, indices)}
        </div>
        <div id="calc-painel-livre" class="calc-painel">
            ${renderizarAbaLivre(indices)}
        </div>
    `;
}

function calcTrocarAba(aba, el) {
    document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".calc-painel").forEach(p => p.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("calc-painel-" + aba).classList.add("active");
}

// ------------------------------------------------------------------
// Aba A: Partilha Judicial (bens pré-carregados do Calculadora_Config)
// ------------------------------------------------------------------

function renderizarAbaPartilha(data, indices) {
    const cfg = data.config || {};
    const dataBase = cfg.dataBase || "15/01/2008";
    const proc = cfg.processoPartilha || "0002179-28.2007.8.19.0204";
    const perc = parseFloat(cfg.percentualMeacao || 50) / 100;
    const juros = parseFloat(cfg.jurosAoMes || 1);

    const bens = [
        { id: "contaBancaria", label: "Conta bancária",    valorTotal: parseFloat(cfg.contaBancariaTotal || 0), valor50: parseFloat(cfg.contaBancariaTotal || 0) * perc },
        { id: "karmanGhia",    label: "Karmann Ghia 1969", valorTotal: parseFloat(cfg.karmanGhia || 0),          valor50: parseFloat(cfg.karmanGhia || 0) * perc },
        { id: "santanaQ",      label: "Santana Quantum",   valorTotal: parseFloat(cfg.santanaQuantum || 0),       valor50: parseFloat(cfg.santanaQuantum || 0) * perc },
        { id: "terreno",       label: "Terreno Tanguá-RJ", valorTotal: parseFloat(cfg.terrenoTangua || 0),        valor50: parseFloat(cfg.terrenoTangua || 0) * perc },
    ];

    const seletorIndices = indices.map(idx =>
        `<button class="calc-badge ${idx.badge || 'badge-blue'}"
            style="border-color:${idx.cor || '#378ADD'}; --badge-cor:${idx.cor || '#378ADD'};"
            onclick="calcPartilhaAtualizarIndice('${idx.indice}', this)"
            title="${idx.uso || ''}"
            data-indice="${idx.indice}">
            ${idx.indice}
        </button>`
    ).join("");

    const bensList = bens.map(b => `
        <div class="calc-bem-row" id="bem-row-${b.id}">
            <div class="calc-bem-info">
                <div class="calc-bem-label">${b.label}</div>
                <div class="calc-bem-original">50% = ${fmtBRLCalc(b.valor50)}</div>
            </div>
            <div class="calc-bem-resultado" id="bem-res-${b.id}">—</div>
        </div>
    `).join("");

    return `
        <div class="calc-partilha-header">
            <div class="calc-info-proc">
                <i class="fa-solid fa-gavel"></i>
                Partilha referente ao proc. <strong>${proc}</strong> · Data-base: <strong>${dataBase}</strong>
            </div>
        </div>

        <div class="calc-bloco">
            <div class="calc-bloco-titulo">Selecione o índice de correção</div>
            <div class="calc-indices-row" id="partilha-indices">
                ${seletorIndices}
            </div>
            <div class="calc-juros-toggle">
                <label class="calc-toggle-label">
                    <input type="checkbox" id="partilha-juros" checked onchange="calcPartilhaRecalcular()">
                    Incluir juros moratórios de <strong>${juros}% a.m.</strong> sobre o valor original
                </label>
            </div>
        </div>

        <div class="calc-bloco" id="partilha-resultado-bloco" style="display:none;">
            <div class="calc-bloco-titulo">Resultado por bem — meação de 50%</div>
            ${bensList}
            <div class="calc-total-row">
                <div class="calc-total-label">Total da meação (50%)</div>
                <div class="calc-total-valor" id="partilha-total">—</div>
            </div>
            <div class="calc-mem-grid" id="partilha-memoria"></div>
            <button class="calc-btn-imprimir" onclick="calcImprimir()">
                <i class="fa-solid fa-print"></i> Salvar / Imprimir
            </button>
        </div>
    `;
}

function calcPartilhaAtualizarIndice(indice, el) {
    document.querySelectorAll("#partilha-indices .calc-badge").forEach(b => b.classList.remove("selecionado"));
    el.classList.add("selecionado");
    calcPartilhaRecalcular();
}

function calcPartilhaRecalcular() {
    if (!dadosCalculadora) return;
    const cfg = dadosCalculadora.config || {};
    const series = dadosCalculadora.series || {};
    const perc = parseFloat(cfg.percentualMeacao || 50) / 100;
    const juros = parseFloat(cfg.jurosAoMes || 1) / 100;

    const btnSel = document.querySelector("#partilha-indices .calc-badge.selecionado");
    if (!btnSel) return;
    const indice = btnSel.dataset.indice;
    const incluirJuros = document.getElementById("partilha-juros").checked;

    // Data-base
    const dataBaseStr = cfg.dataBase || "15/01/2008";
    const partes = dataBaseStr.split("/");
    const anoIni = parseInt(partes[2]), mesIni = parseInt(partes[1]);
    const agora = new Date();
    const anoFim = agora.getFullYear(), mesFim = agora.getMonth() + 1;

    const fatorIPCA = calcFatorEntreDatas(series, indice, anoIni, mesIni, anoFim, mesFim);
    const meses = mesesEntreDatas(anoIni, mesIni, anoFim, mesFim);

    // Bens pecuniários (conta bancária) recebem correção monetária + juros
    // de mora normalmente. Bens partilhados IN NATURA (veículos, terreno)
    // não seguem essa lógica — são avaliados pelo valor de mercado atual
    // no momento da partilha efetiva, sem correção de um valor histórico.
    const bens = [
        { id: "contaBancaria", label: "Conta bancária",    valorTotal: parseFloat(cfg.contaBancariaTotal || 0), inNatura: false },
        { id: "karmanGhia",    label: "Karmann Ghia 1969", valorTotal: parseFloat(cfg.karmanGhia || 0),          inNatura: true, valorMercadoAtual: parseFloat(cfg.karmanGhiaMercadoAtual || 0) },
        { id: "santanaQ",      label: "Santana Quantum",   valorTotal: parseFloat(cfg.santanaQuantum || 0),       inNatura: true, valorMercadoAtual: parseFloat(cfg.santanaQuantumMercadoAtual || 0) },
        { id: "terreno",       label: "Terreno Tanguá-RJ", valorTotal: parseFloat(cfg.terrenoTangua || 0),        inNatura: true, valorMercadoAtual: parseFloat(cfg.terrenoTanguaMercadoAtual || 0) },
    ];

    let totalMeacao = 0;
    let memoriaHtml = `<div class="calc-mem-titulo">Memória de cálculo — índice: ${indice} · ${fmtMesAno(anoIni, mesIni)} → ${fmtMesAno(anoFim, mesFim)}</div>`;
    memoriaHtml += `<div class="calc-mem-linha header"><span>Bem</span><span>50% original</span><span>Após ${indice}</span><span>Juros mora</span><span>Total</span></div>`;

    bens.forEach(b => {
        const v50 = b.valorTotal * perc;

        if (b.inNatura) {
            const temValorMercado = b.valorMercadoAtual > 0;
            const total = temValorMercado ? (b.valorMercadoAtual * perc) : v50;
            totalMeacao += total;

            const el = document.getElementById("bem-res-" + b.id);
            if (el) el.textContent = fmtBRLCalc(total);

            memoriaHtml += `
                <div class="calc-mem-linha">
                    <span>${b.label}</span>
                    <span>${fmtBRLCalc(v50)}</span>
                    <span>—</span>
                    <span>—</span>
                    <span class="destaque">${fmtBRLCalc(total)}</span>
                </div>
                <div class="calc-mem-linha" style="border-bottom:none; padding-top:0;">
                    <span style="grid-column: 1 / -1; font-style: italic; color:#8a8f98;">
                        ${temValorMercado
                            ? "Bem partilhado in natura — valor de mercado atual (50%), sem correção monetária ou juros de mora."
                            : "Bem partilhado in natura — valor de mercado atual ainda não informado; exibindo 50% do valor histórico sem correção. Atualize \"" + b.id + "MercadoAtual\" na aba Calculadora_Config."}
                    </span>
                </div>`;
            return;
        }

        const aposIPCA = v50 * fatorIPCA;
        const jurosMora = incluirJuros ? v50 * juros * meses : 0;
        const total = aposIPCA + jurosMora;
        totalMeacao += total;

        const el = document.getElementById("bem-res-" + b.id);
        if (el) el.textContent = fmtBRLCalc(total);

        memoriaHtml += `
            <div class="calc-mem-linha">
                <span>${b.label}</span>
                <span>${fmtBRLCalc(v50)}</span>
                <span>${fmtBRLCalc(aposIPCA)}</span>
                <span>${incluirJuros ? fmtBRLCalc(jurosMora) : "—"}</span>
                <span class="destaque">${fmtBRLCalc(total)}</span>
            </div>`;
    });

    memoriaHtml += `
        <div class="calc-mem-linha footer">
            <span>Total da meação (50%)</span>
            <span></span>
            <span></span>
            <span>${(incluirJuros ? "Conta bancária — Fator " + indice + ": " + fatorIPCA.toFixed(6) + "× · " + meses + " meses × " + (juros*100) + "% a.m." : "Conta bancária — Fator " + indice + ": " + fatorIPCA.toFixed(6) + "×") + " · Veículos/terreno: valor de mercado atual"}</span>
            <span class="destaque">${fmtBRLCalc(totalMeacao)}</span>
        </div>`;

    document.getElementById("partilha-total").textContent = fmtBRLCalc(totalMeacao);
    document.getElementById("partilha-memoria").innerHTML = memoriaHtml;
    document.getElementById("partilha-resultado-bloco").style.display = "block";
}

// ------------------------------------------------------------------
// Aba B: Calculadora Livre
// ------------------------------------------------------------------

function renderizarAbaLivre(indices) {
    const seletorIndices = indices.map(idx =>
        `<button class="calc-badge ${idx.badge || 'badge-blue'}"
            style="border-color:${idx.cor || '#378ADD'}; --badge-cor:${idx.cor || '#378ADD'};"
            onclick="calcLivreAtualizarIndice('${idx.indice}', this)"
            title="${idx.uso || ''}"
            data-indice="${idx.indice}">
            ${idx.indice}
        </button>`
    ).join("");

    return `
        <div class="calc-bloco">
            <div class="calc-bloco-titulo">Parâmetros do cálculo</div>
            <div class="calc-form-grid">
                <div class="calc-campo">
                    <label>Valor original (R$)</label>
                    <input type="number" id="livre-valor" placeholder="Ex: 18852.48" min="0" step="0.01" oninput="calcLivreRecalcular()">
                </div>
                <div class="calc-campo">
                    <label>Data-base (mês/ano)</label>
                    <input type="month" id="livre-data" oninput="calcLivreRecalcular()">
                </div>
            </div>
            <div class="calc-bloco-titulo" style="margin-top:16px;">Índice de correção</div>
            <div class="calc-indices-row" id="livre-indices">
                ${seletorIndices}
            </div>
            <div class="calc-juros-toggle">
                <label class="calc-toggle-label">
                    <input type="checkbox" id="livre-juros" checked onchange="calcLivreRecalcular()">
                    Incluir juros moratórios de <strong>1% a.m.</strong> sobre o valor original
                </label>
            </div>
        </div>

        <div class="calc-bloco" id="livre-resultado-bloco" style="display:none;">
            <div class="calc-bloco-titulo">Resultado</div>
            <div class="calc-resultado-grid">
                <div class="calc-res-item">
                    <div class="calc-res-label">Valor original</div>
                    <div class="calc-res-valor" id="livre-res-original">—</div>
                </div>
                <div class="calc-res-item">
                    <div class="calc-res-label">Após correção monetária</div>
                    <div class="calc-res-valor" id="livre-res-ipca">—</div>
                </div>
                <div class="calc-res-item">
                    <div class="calc-res-label">Juros de mora</div>
                    <div class="calc-res-valor" id="livre-res-juros">—</div>
                </div>
                <div class="calc-res-item destaque">
                    <div class="calc-res-label">Total atualizado</div>
                    <div class="calc-res-valor" id="livre-res-total">—</div>
                </div>
            </div>
            <div class="calc-mem-grid" id="livre-memoria"></div>
            <button class="calc-btn-imprimir" onclick="calcImprimir()">
                <i class="fa-solid fa-print"></i> Salvar / Imprimir
            </button>
        </div>
    `;
}

function calcLivreAtualizarIndice(indice, el) {
    document.querySelectorAll("#livre-indices .calc-badge").forEach(b => b.classList.remove("selecionado"));
    el.classList.add("selecionado");
    calcLivreRecalcular();
}

function calcLivreRecalcular() {
    if (!dadosCalculadora) return;
    const series = dadosCalculadora.series || {};

    const valor = parseFloat(document.getElementById("livre-valor").value);
    const dataStr = document.getElementById("livre-data").value; // "YYYY-MM"
    const btnSel = document.querySelector("#livre-indices .calc-badge.selecionado");
    const incluirJuros = document.getElementById("livre-juros").checked;

    if (!valor || !dataStr || !btnSel) return;

    const [anoIniStr, mesIniStr] = dataStr.split("-");
    const anoIni = parseInt(anoIniStr), mesIni = parseInt(mesIniStr);
    const agora = new Date();
    const anoFim = agora.getFullYear(), mesFim = agora.getMonth() + 1;
    const indice = btnSel.dataset.indice;

    const fatorIPCA = calcFatorEntreDatas(series, indice, anoIni, mesIni, anoFim, mesFim);
    const meses = mesesEntreDatas(anoIni, mesIni, anoFim, mesFim);
    const aposIPCA = valor * fatorIPCA;
    const jurosMora = incluirJuros ? valor * 0.01 * meses : 0;
    const total = aposIPCA + jurosMora;

    document.getElementById("livre-res-original").textContent = fmtBRLCalc(valor);
    document.getElementById("livre-res-ipca").textContent = fmtBRLCalc(aposIPCA);
    document.getElementById("livre-res-juros").textContent = incluirJuros ? fmtBRLCalc(jurosMora) : "—";
    document.getElementById("livre-res-total").textContent = fmtBRLCalc(total);

    document.getElementById("livre-memoria").innerHTML = `
        <div class="calc-mem-titulo">Memória de cálculo — ${indice} · ${fmtMesAno(anoIni, mesIni)} → ${fmtMesAno(anoFim, mesFim)}</div>
        <div class="calc-mem-linha"><span>Valor original</span><span>${fmtBRLCalc(valor)}</span></div>
        <div class="calc-mem-linha"><span>Fator ${indice} acumulado</span><span>${fatorIPCA.toFixed(8)}×</span></div>
        <div class="calc-mem-linha"><span>Subtotal 1 — após correção ${indice}</span><span>${fmtBRLCalc(aposIPCA)}</span></div>
        ${incluirJuros ? `<div class="calc-mem-linha"><span>Juros de mora (${meses} meses × 1% a.m. s/ valor original)</span><span>${fmtBRLCalc(jurosMora)}</span></div>` : ""}
        <div class="calc-mem-linha footer"><span>Total final</span><span class="destaque">${fmtBRLCalc(total)}</span></div>
    `;

    document.getElementById("livre-resultado-bloco").style.display = "block";
}

// ------------------------------------------------------------------
// Impressão / exportação
// ------------------------------------------------------------------

function calcImprimir() {
    const abaAtiva = document.querySelector(".calc-painel.active");
    if (!abaAtiva) return;

    const nomeAba = abaAtiva.id === "calc-painel-partilha" ? "Partilha Judicial" : "Calculadora Livre";
    const conteudo = abaAtiva.innerHTML;
    const agora = new Date().toLocaleString("pt-BR");

    const janela = window.open("", "_blank");
    janela.document.write(`
        <!DOCTYPE html><html lang="pt-br"><head>
        <meta charset="UTF-8">
        <title>Calculadora Partilha — ${nomeAba}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 24px; }
            h1 { font-size: 16px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            .calc-mem-grid { margin-top: 16px; }
            .calc-mem-titulo { font-weight: bold; margin-bottom: 8px; font-size: 12px; }
            .calc-mem-linha { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; padding: 5px 0; border-bottom: 1px solid #ddd; font-size: 12px; }
            .calc-mem-linha.header { font-weight: bold; background: #f5f5f5; }
            .calc-mem-linha.footer { font-weight: bold; background: #e8f0fe; }
            .destaque { font-weight: bold; color: #c0392b; }
            .calc-total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 16px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
            button, .calc-tabs, .calc-indices-row, .calc-form-grid, .calc-juros-toggle, .calc-btn-imprimir { display: none !important; }
            .calc-bloco { margin-bottom: 20px; }
        </style>
        </head><body>
        <h1>Calculadora Partilha — ${nomeAba}</h1>
        <div class="meta">Gerado em: ${agora} · Processo 0002179-28.2007.8.19.0204</div>
        ${conteudo}
        <script>window.onload = function() { window.print(); }<\/script>
        </body></html>
    `);
    janela.document.close();
}
