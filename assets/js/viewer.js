    // URL Ocultada na arquitetura - o front consome o token guardado no login
	//const APPS_SCRIPT_URL = "https://google-drive-shield.jardelassis.workers.dev/";
	const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdbi7MyAHY8i5rrhjhZ_OpL8NP498E5hqZYlQEvCVvJzoM2CCR4LMb592aCRDoqbmr/exec";

    // Mesma chave usada pelo login.html ao salvar a sessão (sessionStorage.setItem("portalToken", ...))
    const TOKEN = sessionStorage.getItem("portalToken");

    // Sem token, não há sessão válida - volta para o login imediatamente.
    // A validação real (token existe / não expirou / perfil correto) sempre
    // acontece de novo no servidor a cada chamada; isto aqui é só para não
    // mostrar a tela do painel "vazia" para quem nunca fez login.
    if (!TOKEN) {
        window.location.href = "login";
    }
    
    let perfilUsuario = "Leitor"; // Padrão de segurança restrito

    document.addEventListener("DOMContentLoaded", function() {
        carregarDadosPainel();
        bloquearAtalhosSeguranca();
        iniciarMonitorDeInatividade();
    });

    // 1. Busca os arquivos e o perfil do usuário usando o Token de Sessão seguro
    function carregarDadosPainel() {
        fetch(`${APPS_SCRIPT_URL}?action=obterDados&token=${TOKEN}`)
            .then(res => res.json())
            .then(data => {
                if(data.erro) {
                    alert(data.msg || "Sessão inválida. Por favor, refaça o login.");
                    window.location.href = "login";
                    return;
                }

                perfilUsuario = data.perfil;
                renderizarPainel(data.arquivos);
            })
            .catch(err => {
                console.error("Erro ao conectar à API:", err);
                document.getElementById("lista-arquivos-loading").innerHTML =
                    '<p style="color:#ef476f; font-size:0.85rem;">Não foi possível carregar os arquivos. Tente novamente mais tarde.</p>';
            });
    }
	
    // 2. Monta o HTML dinâmico com base no perfil (EDITOR vs LEITOR)
    // ALTERAÇÃO: Remove extensões visuais e colore os ícones por tipo
    function renderizarPainel(arquivos) {
        document.getElementById("lista-arquivos-loading").style.display = "none";
        const listaDiv = document.getElementById("lista-arquivos");
        listaDiv.style.display = "block";

        if(arquivos.length === 0) {
            listaDiv.innerHTML = `<p style="color:var(--text-gray); font-size:0.9rem;">Nenhum arquivo disponível.</p>`;
            return;
        }

        // Se for EDITOR, exibe o botão superior "Baixar Todos"
        if(perfilUsuario === "Editor") {
            document.getElementById("container-download-todos").style.display = "block";
        }

        let html = '';
        arquivos.forEach(arq => {
            // Define o ícone e a cor padrão com base na extensão
            let icone = 'fa-file-pdf';
            let corIcone = '#e63946'; // Vermelho para PDF

            if(arq.nome.includes('.xlsx') || arq.nome.includes('.csv')) {
                icone = 'fa-file-excel';
                corIcone = '#2a9d8f'; // Verde para Excel
            } else if(arq.nome.includes('.docx')) {
                icone = 'fa-file-word';
                corIcone = '#0077b6'; // Azul para Word
            }

            // Tratamento para remover a extensão apenas na exibição visual
            const nomeSemExtensao = arq.nome.replace(/\.[^/.]+$/, "");
            const nomeEscapado = arq.nome.replace(/'/g, "\\'");

            html += `
                <div class="card-arquivo">
                    <div class="info-arquivo">
                        <i class="fa-solid ${icone}" style="color: ${corIcone}; font-size: 1.2rem;"></i>
                        <span class="nome-arquivo" title="${arq.nome}">${nomeSemExtensao}</span>
                    </div>
                    <div class="acoes-arquivo">
                        <button class="btn-acao btn-ver" onclick="visualizarArquivo('${arq.id}', '${nomeEscapado}')">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
            `;

            // Condicional de Segurança: Insere o botão de download com o novo fluxo de Popup de 5s
            if(perfilUsuario === "Editor") {
                html += `
                    <button class="btn-acao btn-baixar" onclick="baixarArquivoComPopup('${arq.id}', '${nomeEscapado}')">
                        <i class="fa-solid fa-download"></i> Salvar
                    </button>
                `;
            }

            html += `</div></div>`;
        });

        listaDiv.innerHTML = html;
    }


	    // NOVA FUNÇÃO: Cria um popup em tela, espera 5 segundos e inicia o download
    function baixarArquivoComPopup(id, nome) {
        // Criar o elemento do popup dinamicamente
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.right = '20px';
        popup.style.backgroundColor = '#1d3557';
        popup.style.color = '#fff';
        popup.style.padding = '15px 25px';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        popup.style.fontFamily = "'Poppins', sans-serif";
        popup.style.fontSize = '0.9rem';
        popup.style.zIndex = '9999';
        popup.style.display = 'flex';
        popup.style.alignItems = 'center';
        popup.style.gap = '10px';
        popup.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> O seu download começará em <b id="regressiva-pop">5</b>s...`;
        
        document.body.appendChild(popup);

        let tempoRestante = 5;
        
        // Intervalo para atualizar os segundos na tela
        const contador = setInterval(() => {
            tempoRestante--;
            const elementoContador = document.getElementById("regressiva-pop");
            if (elementoContador) elementoContador.innerText = tempoRestante;
            
            if (tempoRestante <= 0) {
                clearInterval(contador);
                popup.remove(); // Remove o popup da tela
                baixarArquivoIndividual(id, nome); // Dispara o download real
            }
        }, 1000);
    }


    // 3. Carrega o link de preview do Drive (via iframe) - funciona para PDF
    // de qualquer tamanho e também para DOCX/XLSX/PPTX, sem precisar baixar
    // o arquivo. A URL é obtida do servidor só após validar a sessão.
    function visualizarArquivo(id, nome) {
        document.getElementById("visualizador-vazio").style.display = "none";
        document.getElementById("container-render").style.display = "block";
        document.getElementById("titulo-documento-atual").innerText = nome;

        const iframeViewer = document.getElementById("iframe-seguro");
        iframeViewer.src = "about:blank"; // Limpa visualização anterior

        fetch(`${APPS_SCRIPT_URL}?action=obterLinkVisualizacao&token=${TOKEN}&fileId=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    alert(data.msg || "Não foi possível abrir este arquivo.");
                    return;
                }
                iframeViewer.src = data.url;
            })
            .catch(() => alert("Falha ao carregar o arquivo. Tente novamente."));
    }

    // 4. Ação de download individual (Executada após os 5 segundos do popup e disponível apenas para EDITORES - o
    // servidor confirma a permissão de novo, independente do botão exibido aqui)
    
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
                link.download = nome; // O arquivo baixa mantendo a extensão original correta
                link.click();
            })
            .catch(() => alert("Falha ao baixar o arquivo. Tente novamente."));
    }

    // 5. Ação de download em Massa ZIP (Disponível apenas para EDITORES)
    function baixarTodosArquivos() {
        const btn = document.querySelector(".btn-batch");
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = `<div class="loader-inline"></div> Compactando arquivos...`;
        btn.disabled = true;

        fetch(`${APPS_SCRIPT_URL}?action=downloadZip&token=${TOKEN}`)
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    alert(data.msg || "Não foi possível gerar o pacote de arquivos.");
                    btn.innerHTML = textoOriginal;
                    btn.disabled = false;
                    return;
                }
                
                // AJUSTE DE DATA: Gera a data no formato dd-mm-aaaa
                const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

                const link = document.createElement('a');
                link.href = `data:application/zip;base64,${data.bytes}`;
                
                // O arquivo agora será baixado como: Pacote_Arquivos_25-06-2026.zip
                link.download = `Pacote_Arquivos_${dataHoje}.zip`;
                
                link.click();
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            })
            .catch(() => {
                alert("Erro ao processar o download em lote.");
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            });
    }

    // 6. Camada Extrema de Segurança no Navegador (Focado no Perfil LEITOR)
    function bloquearAtalhosSeguranca() {
        document.addEventListener('keydown', function(e) {
            // Bloqueia se o usuário for leitor e tentar atalhos de saída
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

    // 7. Logout: pede confirmação, revoga a sessão no servidor (para que o
    // token pare de funcionar de fato, mesmo que alguém o tenha capturado)
    // e volta para a página principal do site.
    function confirmarLogout() {
        if (confirm("Deseja realmente encerrar a sessão?")) {
            efetuarLogout();
        }
    }

    function efetuarLogout() {
        // Revoga o token no servidor. Usa fetch sem esperar a resposta (não
        // bloqueia a navegação) - mesmo que essa chamada falhe por qualquer
        // motivo, o token expira por conta própria depois de algumas horas.
        fetch(`${APPS_SCRIPT_URL}?action=logout&token=${TOKEN}`).catch(() => {});

        sessionStorage.removeItem("portalToken");
        sessionStorage.removeItem("usuarioLogado");
        sessionStorage.removeItem("tipoUsuario");
        window.location.href = "index";
    }

    // 8. Logout automático por inatividade (30 minutos sem clique, tecla,
    // scroll ou toque na tela). Cobre o cenário de o usuário esquecer a
    // sessão aberta nesta aba.
    const MINUTOS_INATIVIDADE = 30;
    let timeoutInatividade = null;

    function iniciarMonitorDeInatividade() {
        reiniciarTimeoutInatividade();

        // Qualquer um destes eventos reinicia a contagem - cobre mouse,
        // teclado, toque (mobile) e rolagem.
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
