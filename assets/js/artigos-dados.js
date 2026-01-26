/**
 * Banco de Dados dos Artigos - Jardel Santos
 * Para adicionar um novo artigo, basta copiar um bloco {...} e colar no topo da lista.
 *
 
 	{ 
	  data: "2026-01-25", 
	  categoria: "Suporte e Segurança",
	  titulo: "20 prompts de IA para um Service Desk de Elite: Agilidade e Segurança", 
	  resumo: "Vá além do básico com comandos avançados de IA para diagnóstico, conformidade com LGPD, automação no-code e resposta a incidentes.",
	  img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
	  link: "artigos/20-prompts-ia-service-desk-seguranca"
	},
 
 
 
 */

const listaArtigos = [
    { 
        data: "2026-01-30", 
        categoria: "Segurança & Governança",
        titulo: "Tendências de Cibersegurança para 2026", 
        resumo: "Em breve: Como a transformação digital acelerada e a IA estão redefinindo o cenário da segurança.",
        img: "img/tendencias-2026-placeholder.webp", // Sugestão: crie uma imagem para o placeholder
        link: "#",
        status: "em-breve",
        dataDisponivel: "Disponível em 30 de Janeiro"
    },
	{ 
	  data: "2026-01-26", 
	  categoria: "Inteligência Artificial",
	  titulo: "Como Conversar com a IA: O Guia Prático para Ganhar Tempo e Proteger seus Dados", 
	  resumo: "Domine a arte de criar prompts eficientes com o método C.O.T.E. e aprenda a usar a IA de forma segura e profissional.",
	  img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
	  link: "artigos/guia-engenharia-prompt-ia-seguranca"
	},
	{  
	  data: "2026-01-25",  
	  categoria: "Automação & Segurança",
	  titulo: "10 Prompts de IA para potencializar o Service Desk",  
	  resumo: "Aprenda a usar a IA Generativa para transformar o suporte técnico da sua MPE com segurança, eficiência e foco na LGPD.",
	  img: "img/ia-servicedesk.webp",
	  link: "artigos/prompts-ia-service-desk-seguranca.html"
	},
    { 
        data: "2026-01-22", 
        categoria: "Segurança & Governança",
        titulo: "IA Generativa: Desafios de Segurança e Governança", 
        resumo: "Uma análise técnica sobre Shadow AI, proteção de dados e como implementar o uso do Copilot com segurança...",
        img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200", 
        link: "artigos/ia-seguranca-corporativa.html" 
    },
    { 
        data: "2026-01-18", 
        categoria: "Cibersegurança",
        titulo: "Segurança na velocidade do ataque: o desafio de 2026", 
        resumo: "Em 2026, a ameaça evolui com phishing personalizado e malware adaptativo movidos por IA e automação. A grande questão é: como proteger o negócio?",
        img: "img/ciberseguranca-2026.webp", 
        link: "artigos/ciberseguranca-2026.html" 
    },
    { 
        data: "2026-01-19", 
        categoria: "Service Desk vs Automação",
        titulo: "ITSM inteligente com SaaS, automação e open source", 
        resumo: "Empresas brasileiras estão migrando para ITSM/ESM em nuvem para reduzir custos e dar conta do trabalho híbrido...",
        img: "img/itsm-automacao-2026.webp", 
        link: "artigos/servicedesk-automacao.html" 
    },
    { 
        data: "2026-01-11", 
        categoria: "Automação & IA",
        titulo: "Como reduzir custos e TMA com IA", 
        resumo: "Automatizar tarefas simples no Service Desk não é luxo, é estratégia. Estudos mostram que a automação pode reduzir custos operacionais em até 40%.",
        img: "img/automacao-service-desk.webp", 
        link: "artigos/automacao-service-desk.html" 
    },
    { 
        data: "2026-01-12", 
        categoria: "Automação & Segurança",
        titulo: "CVE-2026-21858: Falha no n8n", 
        resumo: "Uma falha crítica no n8n permitiu execução remota de código sem autenticação. Entenda o impacto real e as ações urgentes.",
        img: "img/n8n-vulnerability.webp", 
        link: "artigos/n8n-vulnerabilidade.html" 
    },
    { 
        data: "2026-01-11", 
        categoria: "LGPD & Compliance",
        titulo: "LGPD no Rio de Janeiro", 
        resumo: "Pesquisa revela um cenário alarmante para micro e pequenas empresas cariocas. Saiba como evitar multas e ganhar a confiança do mercado.",
        img: "img/blog-lgpd-rj.webp", 
        link: "artigos/lgpd-pme-rj.html" 
    },
    { 
        data: "2026-01-11", 
        categoria: "Cibersegurança para MPEs",
        titulo: "Seu negócio pode ser o próximo alvo", 
        resumo: "Ataques hackers já derrubaram milhares de pequenas empresas no Brasil. Em 2025, uma em cada cinco correu risco de fechar as portas.",
        img: "img/small-business-cib.webp", 
        link: "artigos/ciberseguranca-para-pmes.html" 
    }
];