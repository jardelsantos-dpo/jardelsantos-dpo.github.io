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
    }

    // Rola a tela até a seção aberta, para o usuário ver o conteúdo
    // imediatamente, sem precisar rolar manualmente.
    if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Envia para o backend um registro de qual card/ação foi acessada.
// "fire and forget": não bloqueia a navegação nem trata erro visualmente,
// pois o log não pode atrapalhar a experiência do usuário no painel.
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

    // Registra no log qual persona específica foi aberta
    registrarAcessoCard("personas", persona.nome);

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

    // Totais agrupados vindos do backend:
    //  - totalIntervencaoEliane: pensão em atraso + custo com defesa criminal
    //  - totalObstrucaoInventario: conta bancária + meação (com IPCA + juros, total do backend)
    const totalIntervencao = iolanda.totalIntervencaoEliane;
    const totalObstrucao   = iolanda.totalObstrucaoInventario;

    // Total geral nominal (mantido para o card de total ao final) — soma os
    // valores originais (sem correção) dos blocos especiais + itens da planilha
    const totalBlocosEspeciaisNominal = b.contaBancaria.valorOriginal + b.meacaoBens.valorOriginal + b.pensao.totalEmAtraso;
    const totalItensIndividuais = (iolanda.itens || []).reduce((soma, i) => soma + (i.valorOriginal || 0), 0);
    const totalNominal = totalBlocosEspeciaisNominal + totalItensIndividuais;

    let html = `
        <div class="prejuizo-kpi-row">
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Danos por intervenção de Eliane</div>
                <div class="prejuizo-kpi-valor danger">${fmtBRL(totalIntervencao)}</div>
                <div class="prejuizo-kpi-sub">Pensão em atraso + defesa criminal</div>
            </div>
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Danos por obstrução no inventário</div>
                <div class="prejuizo-kpi-valor danger">${fmtBRL(totalObstrucao)}</div>
                <div class="prejuizo-kpi-sub">Partilha judicial não concluída</div>
            </div>
            <div class="prejuizo-kpi">
                <div class="prejuizo-kpi-label">Pensão em atraso</div>
                <div class="prejuizo-kpi-valor warning">${fmtBRL(b.pensao.totalEmAtraso)}</div>
                <div class="prejuizo-kpi-sub">${b.pensao.mesesEmAtraso} meses em atraso</div>
            </div>
        </div>

        <div class="section-title"><span class="section-num">1</span>Conta bancária — partilha judicial (15/01/2008)</div>
        <div class="item-card">
            <div class="item-header">
                <div class="item-desc">50% do saldo em conta corrente — determinado judicialmente no proc. 0002179-28.2007.8.19.0204. A conclusão da partilha está impedida enquanto o inventário permanece suspenso por ações de Eliane.</div>
                <div class="item-valor-destaque">${fmtBRL(b.contaBancaria.subtotalIpca)}</div>
            </div>
            <div><span class="item-badge badge-partilha">Partilha suspensa — proc. 0002179</span></div>
            <div class="prejuizo-vals" style="margin-top:12px;">
                <div class="val-block"><div class="val-label">Valor original (50%)</div><div class="val-num">${fmtBRL(b.contaBancaria.valorOriginal)}</div></div>
                <div class="val-block"><div class="val-label">Fator IPCA acumulado</div><div class="val-num">${b.contaBancaria.fator.toFixed(4)}×</div></div>
                <div class="val-block"><div class="val-label">Valor atualizado (IPCA)</div><div class="val-num updated">${fmtBRL(b.contaBancaria.subtotalIpca)}</div></div>
            </div>
            <div class="item-nota">Base: 50% do saldo apurado em 15/01/2008, atualizado pelo IPCA acumulado até a data-base do cálculo. Não inclui juros moratórios — apenas correção monetária.</div>
        </div>

        <div class="section-title"><span class="section-num">2</span>Pensão alimentícia — suspensa desde ago/2025</div>
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
        html += `<div class="section-title"><span class="section-num">+</span>Outros itens de dano material</div>`;
        iolanda.itens.forEach(item => { html += blocoItemMaterial(item); });
    }

    html += `
        <div class="prejuizo-total-card">
            <div>
                <div class="prejuizo-total-label">Total de danos mensurados — Iolanda</div>
                <small>Conta + Pensão em atraso + itens adicionais · Valores nominais declarados — sem correção monetária aplicada</small>
            </div>
            <div class="prejuizo-total-valor">${fmtBRL(totalNominal)}</div>

        </div>
        <div class="prejuizo-nota-rodape">Correção monetária (IPCA) e juros moratórios (1% a.m.) não estão aplicados. Os valores de partilha referem-se ao proc. 0002179. Solicite ao advogado o cálculo individualizado para apresentação em juízo.</div>
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
        <div class="section-title">Prejuízos causados por Eliane, Rodrigo (adv.) e Rosemar</div>
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
