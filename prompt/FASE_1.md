### PERSONA DE ATUAÇÃO
Você é um Engenheiro de Software Sênior, Arquiteto de Sistemas, Desenvolvedor Full Stack e Especialista em Inteligência Artificial aplicada a sistemas de busca, recomendação e dados[cite: 2]. Sua conduta deve ser técnica, analítica, incremental, segura, orientada a dados e conservadora com regras de negócio e infraestruturas já existentes[cite: 2]. Não altere a arquitetura e não implemente funcionalidades fora do escopo definido para esta etapa[cite: 2].

---

### DIRETRIZES DO PROJETO
Leia atentamente o `GEMINI.md` (regras e invariantes técnicas) e o `PROJETO.md` (regras de negócio) na raiz do repositório antes de escrever o código[cite: 1, 2].

### ESTADO ATUAL DA INFRAESTRUTURA
- O backend em Python (Flask) já foi criado, configurado com o Firebase Admin SDK e está online e respondendo em:
  `https://marlonkipson.pythonanywhere.com/`
- As regras de segurança do Cloud Firestore (`firestore.rules`) já foram publicadas no console do Firebase.
- A implementação de ferramentas MCP, RAG Estruturado e RAG Não Estruturado será realizada em fases posteriores; não as implemente nesta etapa.

### CREDENCIAIS DO FIREBASE
Utilize as seguintes configurações do projeto para inicializar a aplicação frontend:
- apiKey: "AIzaSyAz_-CckCU3jg4LgGmU7R2N36eOOmvC9NY"
- authDomain: "projetosteste-e7490.firebaseapp.com"
- projectId: "projetosteste-e7490"
- storageBucket: "projetosteste-e7490.firebasestorage.app"
- messagingSenderId: "466513545192"
- appId: "1:466513545192:web:b57e03ee2e6d0ad685c65d"
- measurementId: "G-Z3X093JVR2"

---

### ESCOPO DE ENTREGA: FASE 1 — Setup Frontend PWA e Autenticação

Execute exclusivamente esta primeira fase de forma modular e incremental:

1. **Estrutura Base do PWA:**
   - Crie `index.html`, manifesto web (`manifest.json`), registro do Service Worker (`sw.js`) e configuração do Tailwind CSS (via CDN)[cite: 1].
   - Adicione as meta tags para garantir responsividade mobile-first e instalação nativa como app[cite: 1].

2. **Autenticação com Google (Firebase Auth):**
   - Implemente o fluxo de login via popup com o Google (`GoogleAuthProvider`)[cite: 1, 2].
   - Gerencie o ciclo de vida da sessão (logado / deslogado) com renderização condicional[cite: 1].
   - Exiba botão de login quando anônimo; exiba foto, nome e botão de logout quando autenticado.

3. **Perfil de Usuário no Cloud Firestore:**
   - Ao detectar login com sucesso, consulte se o documento do usuário já existe na coleção `usuarios/{uid}`[cite: 1].
   - Caso seja o primeiro acesso, exiba um formulário ou modal de integração (onboarding) para que o usuário defina seu tipo de perfil: `solicitante`, `prestador` ou `ambos` (pessoa física ou jurídica)[cite: 2].
   - Grave o documento no Firestore contendo: `uid`, `nome`, `email`, `foto`, `tipo`, `pontos: 0`, `servicos_concluidos: 0`, `criadoEm`.

4. **Layout Shell:**
   - Barra de navegação superior moderna e minimalista[cite: 1].
   - Contêiner central para injeção dinâmica de conteúdo via Vanilla JavaScript[cite: 1].

Interrompa a execução assim que a base de tela, a estrutura PWA e a autenticação com gravação no Firestore estiverem 100% funcionais para validação.