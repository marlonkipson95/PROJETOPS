# GUIA COMPLETO DE APRESENTAÇÃO — SERVIÇOSAPP

Este documento serve como roteiro e fichamento completo para a sua apresentação na sala de aula / banca acadêmica. Ele contém o resumo visual de cada slide e o **roteiro de fala (o que você deve falar)** para demonstrar domínio técnico, arquitetural e de negócios.

---

## ESTRUTURA DOS SLIDES (14 SLIDES)

1. **Capa:** Título do Projeto, Autoria e Escopo
2. **Contexto & Desafios:** O Problema nos Marketplaces Tradicionais
3. **A Solução:** Proposta de Valor do ServiçosApp
4. **Arquitetura de Sistemas:** Visão Geral de Nuvem & Conformidade `GEMINI.md`
5. **Modelagem de Usuários:** Separação Estrita de Papéis (Solicitante vs. Prestador vs. Ambos)
6. **Concorrência Ética:** Mural de Demandas & Sigilo Concorrencial
7. **Segurança Financeira:** Proteção de Chave Pix & Checkout Formal
8. **Inteligência Artificial:** Google Gemini + Duplo RAG (Estruturado e Não Estruturado) + MCP
9. **Engenharia de Frontend & Usabilidade:** UX/UI, Notificações Toasts e PWA
10. **Validação Prática:** Ambiente Sandbox de Demonstração (3 Personas)
11. **Análise Crítica:** Pontos Fortes & Diferenciais da Solução
12. **Honestidade Acadêmica:** Limitações, Desafios & Pontos a Evoluir
13. **Próximos Passos:** Roadmap de Evolução Futura
14. **Conclusão & Demonstração ao Vivo:** Encerramento e Abertura para Perguntas

---

## ROTEIRO DE FALA DETALHADO (SLIDE POR SLIDE)

### SLIDE 1: CAPA
- **O que falar:**
  > "Boa noite/bom dia a todos. Hoje apresento o **ServiçosApp**, uma plataforma web progressiva (PWA) desenvolvida para resolver uma das maiores dores do mercado atual: a falta de transparência e os leilões predatórios na contratação de serviços técnicos e residenciais. Vamos abordar toda a arquitetura de nuvem utilizada, as decisões de segurança, a integração com Inteligência Artificial generativa via Duplo RAG e uma análise crítica dos pontos fortes e limitações do sistema."

---

### SLIDE 2: O PROBLEMA DOS MARKETPLACES TRADICIONAIS
- **O que falar:**
  > "Ao analisar concorrentes como GetNinjas, Cronoshare e plataformas de freelancer, identificamos três problemas graves:
  > 1. **Orçamentos genéricos:** O cliente recebe um valor 'fechado' sem saber quanto está pagando de mão de obra e quanto de peças, o que gera frequentes conflitos na execução.
  > 2. **Leilão predatório de preços:** Quando os prestadores conseguem ver quanto o concorrente cobrou, inicia-se uma corrida para o menor preço, o que acaba sucateando a qualidade dos materiais e o trabalho dos profissionais.
  > 3. **Vazamento e exposição de dados:** Chaves Pix e telefones são frequentemente expostos publicamente na internet, atraindo fraudes e invasão de privacidade."

---

### SLIDE 3: VISÃO GERAL DA SOLUÇÃO (SERVIÇOSAPP)
- **O que falar:**
  > "Para solucionar isso, o ServiçosApp foi construído sobre três pilares inegociáveis:
  > - **Decomposição transparente de custos:** O orçamento separa claramente mão de obra técnica, lista detalhada de insumos, taxa de deslocamento, prazo e tempo de garantia legal.
  > - **Sigilo concorrencial ativo:** Cada prestador formula sua proposta sem saber o valor dos concorrentes, garantindo uma concorrência justa baseada em competência técnica e reputação real.
  > - **Privacidade financeira:** A chave Pix fica oculta sob selo de proteção e só é liberada ao contratante após o aceite formal da proposta."

---

### SLIDE 4: ARQUITETURA GERAL DA APLICAÇÃO (CONFORMIDADE GEMINI.MD)
- **O que falar:**
  > "Do ponto de vista de engenharia de software, o projeto foi arquitetado em nuvem serverless, com custo quase zero e estrita separação de responsabilidades:
  > - **Frontend:** Desenvolvido em HTML5, Tailwind CSS e Vanilla JavaScript, estruturado como Progressive Web App (PWA) e distribuído globalmente via **Firebase Hosting**.
  > - **Identidade:** Gerenciada pelo **Firebase Authentication** com provedor Google OAuth.
  > - **Banco de Dados:** **Cloud Firestore**, com Security Rules rigorosas baseadas no princípio de *negar por padrão* e isolamento por UID.
  > - **Backend & IA:** Uma API RESTful em Python hospedada no **PythonAnywhere**, responsável por mediar as regras de negócio protegidas e orquestrar a IA do Google Gemini com Duplo RAG e ferramentas do Model Context Protocol (MCP)."

---

### SLIDE 5: SEPARAÇÃO ESTRITA DE PAPÉIS
- **O que falar:**
  > "Uma decisão de negócio e arquitetura essencial foi: **o Solicitante puro NÃO é prestador de serviços**. 
  > - Se uma pessoa ou empresa se cadastra como contratante, ela publica demandas e aceita orçamentos; ela não vende serviços e não emite propostas.
  > - O **Prestador** gerencia serviços, atende demandas abertas e controla sua agenda.
  > - Criamos também o perfil **Ambos (Dual)**, pensado para arquitetos ou pequenos empreiteiros que tanto prestam consultoria técnica quanto contratam pedreiros e pintores. Esse usuário conta com um seletor rápido para alternar entre visão cliente e prestador sem precisar deslogar."

---

### SLIDE 6: MURAL DE DEMANDAS & SIGILO CONCORRENCIAL
- **O que falar:**
  > "Aqui vemos o fluxo do marketplace na prática:
  > Quando o cliente publica uma solicitação (ex: troca de fiação bifásica), ela entra no mural. Os prestadores qualificados recebem a oportunidade e elaboram suas propostas.
  > Nenhum prestador enxerga a proposta do concorrente. 
  > Já o contratante recebe um painel comparativo lado a lado, podendo avaliar a nota média de avaliações reais, o detalhamento das peças, a garantia prometida (ex: 90, 180 ou 365 dias) e o prazo de execução."

---

### SLIDE 7: SEGURANÇA, PRIVACIDADE & PROTEÇÃO PIX
- **O que falar:**
  > "A proteção contra fraudes foi projetada desde a arquitetura:
  > - Em nenhum lugar público (catálogo ou perfil) a chave Pix do profissional é exibida.
  > - A liberação do pagamento só ocorre quando o solicitante inspeciona a especificação técnica e clica em 'Aceitar Esta Proposta'.
  > - Nesse momento, o sistema gera a fatura comercial formal com o QR Code Pix dinâmico, código copia-e-cola e memorial descritivo, permitindo impressão e arquivamento seguro."

---

### SLIDE 8: INTELIGÊNCIA ARTIFICIAL: DUPLO RAG E MCP
- **O que falar:**
  > "Um dos maiores diferenciais do projeto é a implementação do **Duplo RAG** para mitigar alucinações da IA:
  > - **RAG Estruturado:** O assistente recupera dados em tempo real direto do Cloud Firestore (serviços cadastrados, prestadores no ranking e demandas abertas).
  > - **RAG Não Estruturado:** As regras normativas da plataforma (políticas de sigilo, regulamento Pix e fórmula de reputação) são injetadas contextualmente no prompt do Gemini.
  > - Com isso, se o usuário perguntar por um serviço que não existe, o Gemini é instruído a não inventar nada e orientar o usuário a abrir uma nova demanda.
  > - Além disso, o endpoint `/api/mcp/tools` implementa o padrão do Model Context Protocol para consulta segura de ferramentas."

---

### SLIDE 9: USABILIDADE & ENGENHARIA DE FRONTEND (UX/UI)
- **O que falar:**
  > "Na camada de experiência do usuário, refinamos cada detalhe:
  > - Eliminamos 100% dos alertas nativos do navegador (`window.alert()`), substituindo-os por um sistema de **Toasts profissionais animados** no canto da tela.
  > - Criamos a classe utilitária `.menu-scrollbar` com altura suave de 5px e botões de navegação lateral com setas (`<` e `>`), garantindo que em telas menores nenhum texto de menu ou aba fique escondido.
  > - O sistema é um PWA completo, permitindo instalação direta na tela inicial de smartphones."

---

### SLIDE 10: AMBIENTE SANDBOX DE DEMONSTRAÇÃO
- **O que falar:**
  > "Para validar a plataforma sem misturar com dados de clientes reais, desenvolvemos a **Área de Testes**.
  > Ela opera sobre um dataset simulado (`isDemo: true`) com 15 prestadores, mais de 100 serviços e dezenas de solicitações.
  > Simulamos três personas completas: Juliana Mendes (solicitante), Marcos Vinicius (prestador MEI) e Ana Carolina (perfil dual), permitindo demonstrar todo o ciclo de contratação ao vivo."

---

### SLIDE 11: PONTOS FORTES E DIFERENCIAIS
- **O que falar:**
  > "Como pontos fortes do projeto destacamos:
  > 1. **Custo operacional quase zero:** Roda com excelência nas cotas gratuitas do Google Cloud, Firebase e PythonAnywhere.
  > 2. **Segurança por padrão:** Firestore Security Rules bloqueando acessos indevidos e isolamento de dados entre usuários.
  > 3. **Confiabilidade da IA:** Respostas ancoradas na realidade dos dados do banco.
  > 4. **Conformidade arquitetural estrita:** Respeito integral às diretrizes do `GEMINI.md`."

---

### SLIDE 12: LIMITAÇÕES E DESAFIOS (PONTOS NEGATIVOS)
- **O que falar (demonstrando maturidade técnica):**
  > "Com honestidade acadêmica, identificamos pontos que exigem evolução:
  > 1. **Cotas da API de IA:** No tier gratuito, o Gemini possui limite de 5 requisições por minuto. Para produção em larga escala, é necessário um plano pago ou cache semântico de respostas frequentes.
  > 2. **Custódia Financeira (Escrow):** O pagamento Pix atual é direto entre cliente e prestador. Em um marketplace maduro, o valor deve ficar retido na plataforma (custódia) até que o serviço seja inspecionado e aprovado pelo cliente.
  > 3. **Armazenamento Vetorial Autônomo:** O RAG Não Estruturado atual é injetado via prompt. Para manuais técnicos de centenas de páginas, o ideal é conectar um banco vetorial como Chroma ou Pinecone com busca por similaridade de cossenos."

---

### SLIDE 13: ROADMAP DE EVOLUÇÃO
- **O que falar:**
  > "Como próximos passos da evolução do sistema:
  > - Integração com APIs bancárias de split payment (Mercado Pago / Asaas / EFI) com retenção de comissão e custódia por etapas.
  > - Chat em tempo real mediado por IA para dirimir dúvidas contratuais.
  > - Publicação como aplicativo nas lojas Google Play e App Store."

---

### SLIDE 14: CONCLUSÃO & DEMONSTRAÇÃO AO VIVO
- **O que falar:**
  > "Concluindo, o ServiçosApp demonstra que é possível unir arquitetura serverless moderna, inteligência artificial contextual e regras de negócios éticas para transformar a contratação de serviços no Brasil.
  > A aplicação está em produção no Firebase Hosting no endereço `projetosteste-e7490.web.app` e com código-fonte versionado no GitHub.
  > Passo agora para a demonstração prática e fico à disposição para as perguntas da banca. Muito obrigado!"

---

## DICAS PARA A APRESENTAÇÃO
1. **Abra o arquivo `slide/index.html` em tela cheia no navegador (tecle `F`).**
2. **Use a seta direita do teclado ou espaço para avançar os slides com elegância.**
3. **Deixe a aplicação ao vivo aberta em outra aba (`https://projetosteste-e7490.web.app/`) para alternar e demonstrar o sistema funcionando em tempo real quando chegar nos slides 6, 7 e 10.**
