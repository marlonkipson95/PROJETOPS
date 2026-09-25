# GUIA COMPLETO DE APRESENTAÇÃO ACADÊMICA — SERVIÇOSAPP
## Arquitetura 100% em Nuvem, PWA, API Python no PythonAnywhere, Duplo RAG e Governança GEMINI.md

Este documento serve como o **roteiro oficial do apresentador (speaker notes)** para a defesa do projeto final em sala de aula / banca acadêmica. Ele detalha exatamente o que foi implementado em cada um dos **15 slides interativos**, conectando cada decisão de código à diretriz formal solicitada pelo professor.

---

## ÍNDICE DOS SLIDES (15 SLIDES)

1. **Slide 1:** Capa Institucional — Apresentação do Projeto & Escopo Acadêmico
2. **Slide 2:** A Diretriz Arquitetural do Professor — O Modelo 100% em Nuvem
3. **Slide 3:** Arquitetura Geral de Nuvem — Topologia de Ponta a Ponta
4. **Slide 4:** Camada de Apresentação — Frontend PWA, Tailwind CSS & Vanilla JS
5. **Slide 5:** Identidade & Distribuição — Firebase Auth (Google OAuth) & Firebase Hosting
6. **Slide 6:** O Motor Lógico — Backend Python RESTful no PythonAnywhere (`app_pythonanywhere.py`)
7. **Slide 7:** Protocolo de Ferramentas de IA — Implementação do Model Context Protocol (MCP)
8. **Slide 8:** O Coração dos Dados — Cloud Firestore & Papel Duplo (RAG Estruturado vs. RAG Clássico)
9. **Slide 9:** Governança Documental da Raiz — Diretriz `GEMINI.md` vs. `PROJETO.md`
10. **Slide 10:** Engenharia de Prompts Estruturados — Prompts Puros em Markdown
11. **Slide 11:** Regras de Negócio Reais — Separação Estrita de Papéis & Sigilo de Orçamentos
12. **Slide 12:** Engenharia de Usabilidade & UX — Notificações Toast & Menus com Rolagem Ativa
13. **Slide 13:** Pontos Fortes & Diferenciais da Solução
14. **Slide 14:** Honestidade Acadêmica — Desafios, Limitações & Pontos de Melhoria
15. **Slide 15:** Conclusão, Demonstração ao Vivo & Abertura para Perguntas

---

## ROTEIRO DETALHADO DE FALA (SLIDE POR SLIDE)

---

### SLIDE 1: CAPA INSTITUCIONAL
- **Foco Visual:** Título de alto impacto, tags tecnológicas (PWA, PythonAnywhere, Firestore, Gemini, MCP) e créditos de autoria.
- **Roteiro de Fala:**
  > *"Cumprimento o professor e todos os colegas presentes. Hoje apresento o **ServiçosApp**, uma solução desenvolvida integralmente para atender aos requisitos da disciplina: a construção de uma aplicação moderna, **100% em nuvem**, desenhada de ponta a ponta para integrar interfaces ricas, segurança nativa e inteligência artificial generativa avançada. Durante esta apresentação, vou detalhar cada camada arquitetural: onde reside nosso frontend, onde está hospedado nosso backend e em que linguagem foi desenvolvido, como orquestramos o duplo RAG e o protocolo MCP, e as regras de negócio que tornam este sistema comercialmente viável."*

---

### SLIDE 2: A DIRETRIZ ARQUITETURAL DO PROFESSOR
- **Foco Visual:** A citação literal do requisito solicitado pelo professor, dividida nos 6 grandes pilares (PWA, Google Auth + Hosting, API Python no PythonAnywhere, MCP, Duplo RAG no Firestore e Governança com GEMINI.md).
- **Roteiro de Fala:**
  > *"Para garantir total aderência ao desafio proposto, o projeto foi guiado estritamente pelas diretrizes do professor:
  > 1. Na apresentação, um Progressive Web App com design minimalista em Tailwind CSS e controle dinâmico em Vanilla JavaScript;
  > 2. Entrada única e segura via Google Authentication configurada no Firebase, com distribuição no Firebase Hosting;
  > 3. Um backend robusto desenvolvido em Python como API RESTful e hospedado de forma confiável no PythonAnywhere;
  > 4. Servidor de ferramentas implementando o Model Context Protocol (MCP);
  > 5. Banco Cloud Firestore exercendo papel duplo com RAG Estruturado e RAG Clássico documental;
  > 6. E por fim, governança rigorosa desde a raiz com o arquivo GEMINI.md e prompts estruturados em Markdown."*

---

### SLIDE 3: ARQUITETURA GERAL DE NUVEM (TOPOLOGIA PONTA A PONTA)
- **Foco Visual:** Diagrama arquitetural SVG interativo mostrando o fluxo: Usuário -> PWA -> Firebase Hosting CDN & Google Auth -> API REST Python no PythonAnywhere -> Cloud Firestore & Google Gemini.
- **Roteiro de Fala:**
  > *"Neste diagrama visualizamos a topologia completa da nossa infraestrutura. A aplicação é **100% cloud**, sem qualquer dependência de servidores locais:
  > - Quando o usuário acessa nossa URL, a camada estática é servida pela rede global de borda (CDN) do **Firebase Hosting**.
  > - O handshake de identidade é feito pelo **Firebase Authentication** com protocolo OAuth2 da Google.
  > - Todas as operações protegidas e comandos inteligentes trafegam via requisições HTTPS RESTful para o nosso backend em **Python**, que está rodando no cluster de servidores do **PythonAnywhere**.
  > - Do PythonAnywhere, nossa API se comunica de forma autenticada com o **Cloud Firestore** através do Firebase Admin SDK e com o motor de linguagem **Google Gemini**, unindo ferramentas MCP e contexto de RAG."*

---

### SLIDE 4: CAMADA DE APRESENTAÇÃO (FRONTEND PWA)
- **Foco Visual:** Badges do Tailwind CSS, Vanilla JS, Service Worker (`sw.js`) e Web App Manifest (`manifest.json`).
- **Roteiro de Fala:**
  > *"Na camada de apresentação, optamos conscientemente por não utilizar frameworks pesados que inflacionam o bundle:
  > - Construímos uma aplicação **PWA (Progressive Web App)** nativa, com `manifest.json` e Service Worker em `sw.js` com estratégia 'Network First com fallback offline'. O usuário pode instalar o sistema tanto no Windows/Mac quanto no Android/iOS.
  > - O design é moderno e minimalista utilizando classes utilitárias do **Tailwind CSS**, garantindo responsividade em qualquer resolução.
  > - A lógica de reatividade e manipulação de estado é 100% **Vanilla JavaScript**, estruturada em módulos desacoplados. Isso resulta em carregamento instantâneo, com menos de 100 milissegundos para primeira renderização."*

---

### SLIDE 5: IDENTIDADE & DISTRIBUIÇÃO (FIREBASE AUTH & HOSTING)
- **Foco Visual:** Fluxograma de autenticação Google OAuth2, captura de perfil do usuário (nome, e-mail, foto) e distribuição global do Firebase Hosting.
- **Roteiro de Fala:**
  > *"A segurança de entrada é garantida pelo **Firebase Authentication** com login Google:
  > - O sistema garante que apenas usuários autenticados acessem as áreas de transação e orçamentação.
  > - Ao logar, capturamos os dados do perfil (UID imutável, e-mail, foto e nome de exibição) para alimentar o estado e personalizar a experiência.
  > - Para a distribuição, o **Firebase Hosting** nos fornece provisionamento automático de certificados SSL/TLS, compressão Brotli/Gzip e entrega com baixa latência em CDN global, conferindo uma URL profissional e de alta disponibilidade."*

---

### SLIDE 6: O MOTOR LÓGICO — BACKEND PYTHON NO PYTHONANYWHERE
- **Foco Visual:** Ficha técnica do backend: Python 3.10+, Framework Flask, Servidor WSGI do PythonAnywhere, arquivo `app_pythonanywhere.py` e Firebase Admin SDK.
- **Roteiro de Fala:**
  > *"Entrando agora nos bastidores onde está nosso backend:
  > - **Onde está hospedado?** Está rodando nos servidores em nuvem do **PythonAnywhere** sob endereço público de API.
  > - **Qual linguagem foi utilizada?** Foi desenvolvido em **Python** (versão 3.10+), utilizando a biblioteca leve **Flask** com suporte completo a CORS e comunicação JSON.
  > - **Como o código está estruturado?** O arquivo mestre é o `app_pythonanywhere.py`. Ele gerencia os endpoints da API REST: rotas de verificação `/api/health`, criação e moderação de orçamentos, o servidor de ferramentas `/api/mcp/tools` e a orquestração do Gemini em `/api/ia/chat`.
  > - A segurança com o banco é feita pelo **Firebase Admin SDK** autenticado por credencial de serviço, garantindo que o backend atue como árbitro confiável entre o frontend e a nuvem."*

---

### SLIDE 7: MODEL CONTEXT PROTOCOL (MCP) IMPLEMENTADO NA API PYTHON
- **Foco Visual:** Detalhamento do endpoint `/api/mcp/tools` expondo ferramentas: `buscar_prestadores`, `obter_catalogo_servicos`, `consultar_demandas_abertas`, `calcular_estimativa_orcamento`.
- **Roteiro de Fala:**
  > *"Como exigido pelo professor, nossa API Python implementa o **Model Context Protocol (MCP)**.
  > - O backend funciona como um servidor de ferramentas sistêmicas expostas para a Inteligência Artificial.
  > - Através do endpoint `/api/mcp/tools`, definimos o catálogo de ferramentas tipadas, com schemas rigorosos de entrada e saída.
  > - Com isso, a IA não executa códigos soltos nem acessa o banco diretamente: ela invoca ferramentas controladas como busca de prestadores por especialidade, verificação de catálogo e cálculo de custos. Isso confere à IA a capacidade de tomar ações reais de forma segura e auditável."*

---

### SLIDE 8: O CORAÇÃO DOS DADOS — CLOUD FIRESTORE & DUPLO RAG
- **Foco Visual:** Diagrama comparativo entre **RAG Estruturado** (coleções no Firestore: serviços, usuários, demandas, orçamentos) e **RAG Clássico / Não Estruturado** (manuais, regulamentos, termos de uso).
- **Roteiro de Fala:**
  > *"No centro do sistema temos o **Cloud Firestore**, que desempenha um papel duplo e fundamental:
  > - **RAG Estruturado:** Sustenta coleções em tempo real com schema NoSQL. Quando o usuário conversa com a IA ou busca um profissional, o backend faz consultas indexadas no Firestore (filtrando por categoria, status 'aberta' ou ranking) e injeta esses dados objetivos no prompt.
  > - **RAG Clássico / Não Estruturado:** Funde o conhecimento documental da plataforma — como regras de sigilo de propostas, regulamento de proteção de chaves Pix e fórmulas de reputação.
  > - A união dos dois mundos impede alucinações: se o usuário solicita um serviço inexistente, o RAG Estruturado informa que a base não possui aquele registro, e a IA responde com precisão factual."*

---

### SLIDE 9: GOVERNANÇA DOCUMENTAL DA RAIZ — GEMINI.MD VS. PROJETO.MD
- **Foco Visual:** Comparativo lado a lado entre `GEMINI.md` (Como a aplicação deve ser arquitetada) e `PROJETO.md` (O que a aplicação deve fazer).
- **Roteiro de Fala:**
  > *"Um ponto de excelência de engenharia cobrado pelo professor é a governança raiz do repositório:
  > - Criamos e mantemos na raiz o arquivo **`GEMINI.md`**, que atua como a constituição técnica da aplicação. Ele define a arquitetura serverless, as restrições de nuvem, a política de menor privilégio e instrui qualquer IA ou desenvolvedor sobre como o sistema deve operar.
  > - Em contrapartida, o **`PROJETO.md`** especifica o domínio de negócio, as regras de marketplace e as jornadas de usuário.
  > - Essa separação garante reprodutibilidade total do ambiente, impedindo que novas alterações quebrem a integridade da arquitetura."*

---

### SLIDE 10: ENGENHARIA DE PROMPTS ESTRUTURADOS EM MARKDOWN
- **Foco Visual:** Bloco de código demonstrando o template do prompt estruturado enviado ao Gemini, dividido em 4 seções Markdown: `# PAPEL E DIRETRIZES`, `# CONTEXTO RECUPERADO (RAG)`, `# FERRAMENTAS MCP DISPONÍVEIS` e `# MENSAGEM DO USUÁRIO`.
- **Roteiro de Fala:**
  > *"A comunicação com o modelo Gemini foi construída seguindo as melhores práticas de Prompt Engineering:
  > - Os prompts são montados dinamicamente em **Markdown puro**, divididos em blocos semânticos claros.
  > - O modelo recebe primeiro as instruções de persona e restrições de segurança; em seguida, o bloco de dados reais recuperados pelo RAG; depois, as assinaturas das ferramentas MCP; e por último, a mensagem do usuário.
  > - Essa estrutura impede injeção de prompt e garante respostas altamente previsíveis, sintéticas e contextualizadas ao ecossistema do aplicativo."*

---

### SLIDE 11: REGRAS DE NEGÓCIO REAIS & SIGILO CONCORRENCIAL
- **Foco Visual:** Cards ilustrando as regras de negócio: Solicitante != Prestador (a menos que selecione perfil Ambos), Decomposição de Custos do Orçamento (Mão de Obra + Peças + Deslocamento) e Sigilo Concorrencial de Propostas.
- **Roteiro de Fala:**
  > *"Nas regras de negócio da aplicação, implementamos fluxos realistas de mercado:
  > 1. **Separação estrita de papéis:** O Solicitante puro não vende serviços; o Prestador não posta demandas de clientes; e o perfil 'Ambos' possui um seletor no cabeçalho para alternar entre visão de cliente e prestador.
  > 2. **Orçamento analítico:** O prestador é obrigado a decompor sua proposta: valor da mão de obra, lista detalhada de peças com valores unitários, taxa de visita e dias de garantia.
  > 3. **Sigilo concorrencial ético:** Nenhum prestador enxerga a proposta dos demais concorrentes no mural, acabando com os leilões predatórios de preços que sucateiam o mercado."*

---

### SLIDE 12: ENGENHARIA DE USABILIDADE & UX/UI
- **Foco Visual:** Demonstração do sistema de **Toasts profissionais** (substituindo o antigo alert()), classes `.menu-scrollbar` com setas de rolagem bidirecional e proteção da chave Pix.
- **Roteiro de Fala:**
  > *"A experiência do usuário foi lapidada com padrões consagrados de UX:
  > - Removemos pop-ups nativos invasivos e implementamos um sistema de **Toasts animados**, com temporizador automático, ícones de status e suporte a múltiplos empilhamentos.
  > - Para resolver problemas de corte em telas menores, os menus de navegação agora contam com barra de rolagem horizontal estilizada (`.menu-scrollbar`) e botões de navegação por setas com rolagem suave de 200 pixels.
  > - E na parte financeira, a chave Pix dos prestadores fica sob selo de privacidade, sendo revelada com QR Code e fatura formal apenas quando o cliente aceita formalmente a proposta."*

---

### SLIDE 13: PONTOS FORTES & DIFERENCIAIS DA SOLUÇÃO
- **Foco Visual:** 4 pilares: 100% Nuvem com Custo Zero de Infraestrutura, Segurança por Princípio (Least Privilege), IA Confiável e Base de Código Limpa sem dependências inchadas.
- **Roteiro de Fala:**
  > *"Sintetizando os pontos fortes do projeto:
  > - **Arquitetura 100% em Nuvem:** Operamos em níveis gratuitos do Firebase Hosting, Firestore e PythonAnywhere, sem qualquer necessidade de servidor físico ou VPS caro.
  > - **Segurança por Design:** Firestore Security Rules bloqueando acesso indevido por UID e isolamento no backend.
  > - **IA Grounded:** IA fundamentada em dados reais e documentos normativos, eliminando alucinações.
  > - **Alta Manutenibilidade:** Código legível em Vanilla JS e Python modular, de fácil onboarding para novos desenvolvedores."*

---

### SLIDE 14: HONESTIDADE ACADÊMICA — LIMITAÇÕES & DESAFIOS
- **Foco Visual:** 4 desafios reais: Cota da API Gemini Free (limite de requisições por minuto e fallback), split de pagamento financeiro, banco vetorial dedicado e concorrência distribuída.
- **Roteiro de Fala:**
  > *"Com honestidade acadêmica, é fundamental apontar as limitações e desafios que identificamos para os próximos passos:
  > 1. **Cota de IA:** A camada gratuita do Gemini impõe limite de 5 a 15 requisições por minuto, exigindo tratamento resiliente de erros 429 no backend com fallbacks locais.
  > 2. **Custódia Financeira:** Atualmente geramos a fatura e QR Code Pix; para escala de produção, o ideal é integrar um gateway com split automático de pagamento e custódia (escrow) até a entrega do serviço.
  > 3. **Banco Vetorial Dedicado:** Nosso RAG não estruturado hoje utiliza injeção de contexto textual; uma evolução natural é integrar o Pinecone ou ChromaDB com embeddings vetoriais para grandes volumes de manuais em PDF."*

---

### SLIDE 15: CONCLUSÃO & DEMONSTRAÇÃO AO VIVO
- **Foco Visual:** QR Code e link para o aplicativo oficial (`https://projetosteste-e7490.web.app/`), credenciais do ambiente de teste com as 3 personas (Carlos, Amanda, Roberto) e tela de perguntas e respostas.
- **Roteiro de Fala:**
  > *"Em conclusão, o ServiçosApp prova que é possível construir uma aplicação comercialmente viável, segura e altamente inteligente combinando tecnologias web leves, nuvem serverless e APIs de IA.
  > Convido agora o professor e os colegas a acompanharem a demonstração ao vivo diretamente pela URL oficial publicada no Firebase Hosting, e estou à disposição para responder às perguntas da banca. Muito obrigado!"*

---

## DICAS PRÁTICAS PARA O MOMENTO DA APRESENTAÇÃO

1. **Atalhos do Teclado nos Slides:**
   - `→` ou `Barra de Espaço`: Próximo slide.
   - `←`: Slide anterior.
   - `F`: Ativar/desativar modo Tela Cheia (Fullscreen).
2. **Tempo Sugerido:** 10 a 15 minutos de fala (aproximadamente 1 minuto por slide), reservando 5 minutos para a demonstração prática e perguntas da banca.
3. **Link dos Slides em Produção:** `https://projetosteste-e7490.web.app/slides/`
4. **Link do Sistema:** `https://projetosteste-e7490.web.app/`
