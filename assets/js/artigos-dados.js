/**
 * Banco de Dados dos Artigos - Jardel Santos
 * Padronização de categorias para funcionamento do acesso rápido.
 *
 Exemplo:
   {
    data: "2026-03-09",
    categoria: "Inteligência Artificial",
    titulo: "Como micro‑prompts melhoram as respostas da IA",
    resumo: "Descubra como micro-prompts ativam comportamentos cognitivos avançados na IA generativa e reduzem riscos de segurança da informação.",
    img: "img/micro-prompts.webp",
    link: "artigos/poder-das-duas-linhas-micro-prompts-ia.html",
    status: "em-breve",
    dataDisponivel: "Disponível em 13 de Março"
  }, 
 */

const listaArtigos = [
  {
    data: "2026-03-12",
    categoria: "Inteligência Artificial",
    titulo: "Como micro‑prompts melhoram as respostas da IA",
    resumo: "Descubra como micro-prompts ativam comportamentos cognitivos avançados na IA generativa e reduzem riscos de segurança da informação.",
    img: "img/micro-prompts.webp",
    link: "artigos/poder-das-duas-linhas-micro-prompts-ia.html",
  },
  {
    data: "2026-03-09",
    categoria: "Gerenciamento de Dispositivos",
    titulo: "5 políticas essenciais do Microsoft Intune",
    resumo: "Conheça as políticas prioritárias da Microsoft para garantir conformidade e segurança no gerenciamento de dispositivos.",
    img: "img/politicas-intune.webp",
    link: "artigos/cinco-politicas-essenciais-para-intune.html"
  },
  {
    data: "2026-03-04",
    categoria: "Gerenciamento de Dispositivos",
    titulo: "Gerenciamento Moderno com Microsoft Intune",
    resumo: "O guia completo sobre como o Microsoft Intune transforma a gestão de TI e a segurança para negócios de todos os tamanhos, com foco em redução de custos.",
    img: "img/microsoft-intune.webp",
    link: "artigos/microsoft-intune-gerenciamento-seguranca-mpe.html"
  },
  {
    data: "2026-02-19",
    categoria: "LGPD & Compliance",
    titulo: "Shadow AI: O perigo das IAs não homologadas",
    resumo: "Entenda os riscos da Shadow AI para a privacidade, conformidade com a LGPD e como implementar controles sem sufocar a inovação.",
    img: "img/shadow-ai.webp",
    link: "artigos/shadow-ai.html"
  },
  {
    data: "2026-02-11",
    categoria: "Cibersegurança",
    titulo: "Zero Trust na prática",
    resumo: "Entenda o conceito de confiança zero e como implementá-lo.",
    img: "img/zero-trust.webp",
    link: "artigos/zero-trust-na-pratica.html"
  },
  {
    data: "2026-02-06",
    categoria: "Service Desk & ITSM, Inteligência Artificial",
    titulo: "20 prompts de IA para um Service Desk de Elite",
    resumo: "Utilize a IA generativa como o multiplicador de força com estratégias para otimizar qualquer operação",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
    link: "artigos/20-prompts-ia-service-desk-seguranca.html"
  },
  {
    data: "2026-02-04",
    categoria: "Gerenciamento de Dispositivos",
    titulo: "MDT descontinuado em jan/2026",
    resumo: "Sem MDT e agora? Estratégias open source para manter o deploy UEFI on‑premisses.",
    img: "img/mdt-opsi-fog.webp",
    link: "artigos/mdt-opsi-fog.html"
  },
  {
    data: "2026-01-30",
    categoria: "Cibersegurança",
    titulo: "Tendências de Cibersegurança para 2026",
    resumo: "IA moldando ataques e defesas, Deepfakes e a nova era da Privacidade: prepare sua empresa.",
    img: "img/tendencias-2026.webp",
    link: "artigos/tendencias-ciberseguranca-2026.html"
  },
  {
    data: "2026-01-29",
    categoria: "Inteligência Artificial",
    titulo: "Como Usar IA na Auditoria de Software",
    resumo: "Automatize a governança de software e a análise de riscos de segurança utilizando agentes de IA",
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200",
    link: "artigos/como-criar-agente-ia-auditoria-software.html"
  },
  {
    data: "2026-01-26",
    categoria: "Inteligência Artificial",
    titulo: "Guia prático para criar prompts eficientes",
    resumo: "Domine a arte de criar prompts eficientes com o método C.O.T.E. e aprenda a usar a IA de forma segura e profissional.",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
    link: "artigos/guia-engenharia-prompt-ia.html"
  },
  {
    data: "2026-01-25",
    categoria: "Service Desk & ITSM, Inteligência Artificial",
    titulo: "10 Prompts de IA para potencializar o Service Desk",
    resumo: "Aprenda a usar a IA Generativa para transformar o suporte técnico da sua MPE com segurança, eficiência e foco na LGPD.",
    img: "img/ia-servicedesk.webp",
    link: "artigos/prompts-ia-service-desk-seguranca.html"
  },
  {
    data: "2026-01-22",
    categoria: "LGPD & Compliance",
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
    categoria: "Service Desk & ITSM",
    titulo: "ITSM inteligente com SaaS, automação e open source",
    resumo: "Empresas brasileiras estão migrando para ITSM/ESM em nuvem para reduzir custos e dar conta do trabalho híbrido...",
    img: "img/itsm-automacao-2026.webp",
    link: "artigos/servicedesk-automacao.html"
  },
  {
    data: "2026-01-11",
    categoria: "Service Desk & ITSM",
    titulo: "Como reduzir custos e TMA com IA",
    resumo: "Automatizar tarefas simples no Service Desk não é luxo, é estratégia. Estudos mostram que a automação pode reduzir custos operacionais em até 40%.",
    img: "img/automacao-service-desk.webp",
    link: "artigos/automacao-service-desk.html"
  },
  {
    data: "2026-01-12",
    categoria: "Cibersegurança",
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
    categoria: "Cibersegurança",
    titulo: "Seu negócio pode ser o próximo alvo",
    resumo: "Ataques hackers já derrubaram milhares de pequenas empresas no Brasil. Em 2025, uma em cada cinco correu risco de fechar as portas.",
    img: "img/small-business-cib.webp",
    link: "artigos/ciberseguranca-para-pmes.html"
  }
];