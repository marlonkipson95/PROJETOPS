# PROJETO.md

# SISTEMA DE BUSCA, SOLICITAÇÃO E ORÇAMENTOS DE SERVIÇOS

## 1. OBJETIVO DO PROJETO

Desenvolver uma plataforma em nuvem para conectar pessoas e empresas que precisam de serviços com profissionais e empresas que oferecem esses serviços.

O sistema deve permitir dois contextos principais:

```text
USUÁRIO
   │
   ├── SOLICITANTE / CONTRATANTE
   │
   └── PRESTADOR DE SERVIÇO
```

Um mesmo usuário autenticado poderá atuar como solicitante, prestador ou ambos, conforme a configuração de seu perfil.

O objetivo central é permitir que uma pessoa ou empresa:

- pesquise serviços e profissionais;
- descreva uma necessidade;
- publique uma solicitação;
- receba propostas de diferentes prestadores;
- compare propostas;
- escolha um prestador;
- acompanhe o histórico;
- registre a contratação;
- avalie o profissional após a execução.

Do lado do prestador, a plataforma deve permitir:

- manter um perfil profissional;
- publicar serviços avulsos;
- encontrar solicitações compatíveis;
- criar orçamentos;
- acompanhar o resultado de suas propostas;
- registrar serviços contratados/concluídos;
- construir reputação por avaliações e pontuação.

A inteligência artificial será utilizada futuramente como camada de busca, classificação, comparação e análise, sempre usando os dados reais disponíveis na plataforma.

A IA pode auxiliar na interpretação e organização das informações, mas a decisão final de contratação permanece com o solicitante.

---

# 2. DOCUMENTOS DE AUTORIDADE

O projeto possui dois documentos com responsabilidades distintas:

```text
GEMINI.md
    ↓
COMO o sistema deve ser arquitetado

PROJETO.md
    ↓
O QUE o sistema deve fazer
```

O `GEMINI.md` é a autoridade arquitetural e deve permanecer intacto.

O `PROJETO.md` define o produto, regras de negócio, entidades, fluxos, telas, fases e critérios de aceitação.

Nenhuma funcionalidade descrita neste documento autoriza automaticamente uma alteração incompatível com o `GEMINI.md`.

---

# 3. PERSONA DO ANTIGRAVITY

Atuar como:

**Engenheiro de Software Sênior, Arquiteto de Sistemas, Desenvolvedor Full Stack e Especialista em sistemas de busca, recomendação e dados.**

Princípios de atuação:

- analisar primeiro o código existente;
- preservar funcionalidades já implementadas;
- desenvolver incrementalmente;
- não recriar a aplicação sem necessidade;
- não inventar regras de negócio;
- não inventar dados;
- não criar tecnologias ou serviços paralelos sem necessidade e autorização;
- priorizar segurança, integridade, previsibilidade, manutenção e baixo custo;
- testar as alterações antes de considerá-las concluídas.

---

# 4. ARQUITETURA DO PROJETO

A arquitetura tecnológica é definida pelo `GEMINI.md`.

A aplicação utiliza, conforme a arquitetura-base:

- PWA;
- HTML;
- Vanilla JavaScript;
- Tailwind CSS;
- Firebase Authentication;
- Firebase Hosting;
- API REST em Python;
- PythonAnywhere;
- Cloud Firestore;
- Gemini;
- MCP;
- RAG estruturado;
- RAG não estruturado.

A existência desses componentes na arquitetura-base não significa que todas as funcionalidades devam utilizar todos eles imediatamente.

A implementação deve evoluir por fases.

---

# 5. USUÁRIOS E PERFIS

## 5.1 Identidade

A identidade é estabelecida pelo Firebase Authentication.

Cada usuário autenticado deve possuir um identificador único.

O frontend não deve ser considerado fonte suficiente para comprovar identidade ou autorização.

## 5.2 Tipo de atuação

Após o login inicial, o usuário deve escolher como pretende atuar:

- somente como solicitante/contratante;
- somente como prestador;
- como ambos.

Essa escolha define o contexto funcional apresentado pela aplicação.

## 5.3 Pessoa física e empresa

O sistema deve permitir que o usuário represente:

- pessoa física;
- empresa.

O perfil profissional e a identidade de autenticação devem permanecer conceitualmente separados.

---

# 6. ONBOARDING DE DADOS PESSOAIS

Depois do login e da escolha do tipo de atuação, o usuário deve preencher os dados cadastrais necessários.

Campos obrigatórios:

- nome completo ou nome empresarial;
- WhatsApp/telefone;
- cidade;
- estado;
- CPF ou CNPJ.

Para prestadores:

- chave Pix, opcional.

A chave Pix deve poder ser cadastrada depois, caso o prestador não queira informá-la no primeiro acesso.

## Regras

- O cadastro deve ser persistido no documento do usuário.
- Campos obrigatórios devem ser validados antes da conclusão do onboarding.
- Dados pessoais não devem ser expostos no catálogo sem necessidade.
- CPF/CNPJ não deve ser exibido publicamente no catálogo de serviços.
- O número usado publicamente para contato deve respeitar a estrutura de dados definida para contato do prestador.

---

# 7. CONTEXTO DO SOLICITANTE / CONTRATANTE

O solicitante é a pessoa ou empresa que precisa de determinado serviço.

Pode:

- pesquisar serviços;
- pesquisar profissionais;
- filtrar por categoria e subcategoria;
- abrir detalhes de serviços;
- consultar avaliações;
- criar uma solicitação;
- receber diferentes orçamentos;
- comparar propostas;
- escolher um prestador;
- encerrar a solicitação;
- registrar a contratação;
- avaliar o prestador depois da execução.

O solicitante **não participa da pontuação/ranking de prestadores** e não recebe pontos de ranking por solicitar serviços.

---

# 8. CONTEXTO DO PRESTADOR DE SERVIÇO

O prestador pode ser:

- profissional autônomo;
- pessoa física;
- empresa;
- profissional especializado em uma determinada atividade.

Pode:

- completar seu perfil profissional;
- cadastrar serviços avulsos;
- consultar solicitações abertas;
- enviar orçamentos;
- acompanhar seus orçamentos;
- gerar demonstrativo Pix para orçamentos sob sua autoria quando aplicável;
- acompanhar histórico;
- receber avaliações;
- acumular pontos;
- participar do ranking.

Somente o prestador é elegível para pontuação e ranking.

---

# 9. SERVIÇOS AVULSOS

## 9.1 Conceito

Serviço avulso é uma oferta permanente cadastrada por um prestador.

Exemplos:

- troca/instalação de chuveiro;
- jardinagem;
- limpeza de piscina;
- serviços de pedreiro;
- manutenção de computadores;
- manutenção de redes empresariais;
- correção/formatação de TCC;
- desenvolvimento de sistemas;
- serviços técnicos diversos.

O serviço avulso não depende de uma solicitação existente.

## 9.2 Persistência

O serviço avulso permanece disponível enquanto o prestador mantiver o serviço ativo.

Ele não deve desaparecer simplesmente porque alguém o contratou.

O prestador pode desativar ou retirar o serviço da vitrine.

## 9.3 Card resumido

O catálogo deve exibir inicialmente apenas as informações necessárias para a pesquisa:

- título;
- categoria;
- subcategoria;
- preço estimado;
- nome do prestador;
- nota média;
- total de avaliações;
- pontuação;
- informação resumida de atuação, quando útil.

## 9.4 Detalhes

Ao abrir um card, devem poder ser visualizados:

- descrição completa;
- breve descrição/biografia do profissional;
- modo de atuação;
- área de atendimento, quando aplicável;
- forma de contato;
- WhatsApp;
- avaliações;
- comentários;
- preço estimado;
- botão `Contratar Serviço`.

## 9.5 Contratação direta do serviço avulso

Quando o solicitante clicar em `Contratar Serviço`, o sistema deve registrar que houve uma contratação daquele serviço.

Esse registro deve permanecer associado ao:

- serviço avulso;
- prestador;
- solicitante;
- data;
- resultado da contratação, conforme o fluxo implementado.

A contratação deve poder alimentar posteriormente as estatísticas e a pontuação do prestador.

---

# 10. BUSCA E FILTROS DO CATÁLOGO

O catálogo deve permitir:

## Busca textual

Pesquisa por termos digitados pelo usuário.

## Filtros

- categoria;
- subcategoria;
- localização/área de atendimento quando aplicável;
- faixa de preço quando disponível.

## Ordenação

A interface deve permitir ordenar por critérios documentados, sem apresentar uma decisão automática da plataforma como se fosse uma escolha final do usuário.

Critérios previstos:

- destaque / pontos do prestador em ordem decrescente;
- nota média em ordem decrescente;
- menor preço estimado;
- maior preço estimado.

A implementação futura poderá incorporar critérios adicionais quando formalmente definidos.

---

# 11. SOLICITAÇÕES DE SERVIÇO

## 11.1 Conceito

A solicitação representa uma necessidade específica cadastrada por um solicitante.

Exemplos:

- trocar um chuveiro;
- contratar um jardineiro;
- encontrar um mecânico;
- contratar um eletricista;
- limpar uma piscina;
- realizar manutenção de rede;
- executar uma pequena reforma;
- desenvolver um serviço de tecnologia;
- contratar um freelancer.

## 11.2 Dados

Uma solicitação pode possuir:

- solicitante;
- título;
- descrição;
- categoria;
- subcategoria;
- localização;
- prazo;
- informações adicionais;
- anexos, quando aplicável;
- data de criação;
- data de atualização;
- status;
- prestador contratado, quando houver;
- orçamento escolhido, quando houver.

---

# 12. STATUS DAS SOLICITAÇÕES

A solicitação utiliza um ciclo de estados controlado.

Estados funcionais previstos:

```text
ABERTA
    ↓
ORÇAMENTOS_RECEBIDOS
    ↓
EM_ANALISE
    ↓
CONTRATADA
    ↓
CONCLUIDA
```

Também devem existir estados de encerramento/cancelamento quando o fluxo exigir:

```text
CANCELADA
ENCERRADA
```

A implementação não deve criar estados redundantes.

Os nomes finais devem permanecer consistentes em todo o sistema.

---

# 13. MURAL DE SOLICITAÇÕES

O prestador deve possuir uma área para encontrar solicitações abertas.

A listagem deve permitir consultar, quando disponíveis:

- título;
- descrição resumida;
- categoria;
- subcategoria;
- localização;
- prazo;
- data;
- status.

O prestador poderá abrir uma solicitação e formular um orçamento.

O prestador não deve ter acesso aos orçamentos enviados por outros prestadores para a mesma solicitação.

---

# 14. ORÇAMENTO VINCULADO A SOLICITAÇÃO

Um orçamento vinculado é uma proposta feita por um prestador para uma solicitação específica.

Relacionamento:

```text
SOLICITAÇÃO
     │
     ├── ORÇAMENTO A
     ├── ORÇAMENTO B
     ├── ORÇAMENTO C
     └── ...
```

Cada orçamento deve estar associado, direta ou indiretamente, a:

- solicitação;
- solicitante proprietário;
- prestador autor;
- itens/valores propostos.

---

# 15. ESTRUTURA DO ORÇAMENTO

O prestador deve conseguir construir o orçamento com campos como:

- mão de obra;
- material;
- matéria-prima;
- quantidade;
- valor unitário;
- valor total;
- observação/comentário;
- prazo estimado;
- condições;
- validade, quando aplicável.

O sistema deve calcular automaticamente os totais quando houver dados suficientes.

Exemplo:

```text
Mão de obra     R$ 200,00
Material        R$ 150,00
-------------------------
Total           R$ 350,00
```

A estrutura deve permitir evolução futura sem comprometer dados já existentes.

---

# 16. PRIVACIDADE DOS ORÇAMENTOS CONCORRENTES

Esta é uma regra central do sistema.

Quando uma solicitação possuir propostas de diversos prestadores:

```text
SOLICITANTE
    │
    ├── ORÇAMENTO A
    ├── ORÇAMENTO B
    └── ORÇAMENTO C
```

Somente o solicitante proprietário da solicitação pode visualizar **todas** as propostas vinculadas.

O prestador:

- pode visualizar o próprio orçamento;
- pode visualizar o estado de sua proposta;
- não pode visualizar o preço, itens ou demais detalhes dos orçamentos concorrentes.

Essa restrição deve ser protegida pela camada de autorização e pelas regras de acesso correspondentes.

---

# 17. ESCOLHA DO PRESTADOR

O solicitante analisa as propostas recebidas e decide qual prestador contratar.

A plataforma pode apresentar:

- valor;
- prazo;
- composição do orçamento;
- perfil do prestador;
- avaliações;
- comentários;
- pontuação;
- histórico relevante.

A plataforma não deve escolher automaticamente o prestador em nome do solicitante.

A IA, futuramente, poderá organizar e comparar as informações, mas a decisão final permanece com o usuário.

---

# 18. CONTRATAÇÃO DE UMA SOLICITAÇÃO

Quando o solicitante selecionar um orçamento:

```text
SOLICITAÇÃO
    ↓
ORÇAMENTO ESCOLHIDO
    ↓
PRESTADOR CONTRATADO
    ↓
CONTRATAÇÃO REGISTRADA
```

O sistema deve registrar a relação entre:

- solicitante;
- prestador;
- solicitação;
- orçamento escolhido;
- data do evento.

A solicitação deve deixar de estar aberta para novas propostas conforme o estado definido pelo fluxo.

---

# 19. RESULTADO DOS ORÇAMENTOS CONCORRENTES

Quando um orçamento for escolhido:

```text
Orçamento escolhido → APROVADO
Demais orçamentos  → REPROVADO
```

Um orçamento poderá também ser:

```text
AGUARDANDO
APROVADO
REPROVADO
CANCELADO
```

O histórico deve preservar o resultado da proposta.

O sistema deve permitir identificar quais propostas tiveram sucesso e quais não foram escolhidas.

---

# 20. HISTÓRICO

O histórico deve permitir acompanhar os eventos relevantes do sistema.

## Para o solicitante

- solicitações abertas;
- solicitações em análise;
- solicitações contratadas;
- solicitações concluídas;
- solicitações canceladas/encerradas;
- orçamentos recebidos;
- prestadores contratados.

## Para o prestador

- serviços avulsos ativos/inativos;
- orçamentos enviados;
- orçamentos aguardando;
- orçamentos aprovados;
- orçamentos reprovados;
- orçamentos cancelados;
- serviços contratados;
- serviços concluídos;
- avaliações recebidas;
- histórico de pontuação.

O histórico deve preservar dados suficientes para futura análise por dados, RAG estruturado e IA.

---

# 21. AVALIAÇÕES E COMENTÁRIOS

Após uma contratação/execução, o solicitante poderá avaliar o prestador.

A avaliação deve permitir:

- nota em estrelas;
- comentário textual.

A avaliação deve ficar vinculada ao prestador e ao contexto da contratação/orçamento correspondente.

O perfil do prestador deve poder apresentar:

- nota média;
- quantidade de avaliações;
- comentários;
- avaliações relacionadas aos serviços realizados.

As avaliações devem ser utilizadas como informação para quem estiver analisando um profissional.

---

# 22. PONTUAÇÃO E RANKING DOS PRESTADORES

Somente prestadores participam de pontuação e ranking.

O sistema deve registrar informações como:

- serviços contratados;
- serviços concluídos;
- quantidade de orçamentos enviados;
- orçamentos aprovados;
- avaliações recebidas;
- demais eventos de reputação definidos posteriormente.

O ranking pode utilizar a pontuação como um dos fatores de ordenação/exposição.

Quanto maior a pontuação definida pelas regras do produto, maior poderá ser a prioridade de aparição correspondente ao mecanismo de ranking.

### Regra importante

A fórmula exata de pontuação ainda não está definida neste documento.

Não inventar valores como `10 pontos por serviço`, `5 pontos por avaliação` etc.

Nesta etapa, estruturar os eventos e os dados necessários para que a regra de pontuação seja implementada posteriormente de maneira controlada.

Solicitantes não acumulam pontos de ranking.

---

# 23. DADOS PÚBLICOS X DADOS PRIVADOS

## Públicos no catálogo/perfil profissional, conforme necessidade

- nome do prestador;
- foto, quando aplicável;
- descrição profissional;
- serviços;
- categoria/subcategoria;
- cidade/área de atuação;
- WhatsApp/canal de contato destinado a atendimento;
- nota média;
- quantidade de avaliações;
- comentários;
- pontuação de ranking.

## Privados

- CPF/CNPJ;
- informações internas de autenticação;
- dados administrativos;
- informações não necessárias ao contato;
- informações protegidas de outras solicitações/orçamentos.

A aplicação deve expor somente os dados necessários para cada contexto.

---

# 24. PIX

O prestador poderá cadastrar uma chave Pix opcional.

Quando existir um orçamento aprovado e a operação for permitida ao prestador autor daquele orçamento, o sistema poderá gerar um demonstrativo de pagamento.

O demonstrativo deve conter, quando aplicável:

- serviço;
- solicitante;
- prestador;
- valor;
- data;
- chave Pix;
- QR Code;
- demais informações necessárias para identificação do serviço.

A visualização deve estar disponível no sistema.

Também deve existir estrutura para:

- compartilhar;
- enviar pelo WhatsApp;
- gerar/baixar PDF.

## Regra de autoria

Somente o prestador que criou o orçamento poderá acionar a geração do demonstrativo Pix correspondente.

O sistema não deve permitir que outro usuário gere uma cobrança em nome do prestador.

Nesta fase não existe gateway de pagamento nem processamento automático de transação.

---

# 25. CATEGORIAS E SUBCATEGORIAS

A taxonomia é estruturada:

```text
CATEGORIA
    ↓
SUBCATEGORIA
    ↓
SERVIÇO
```

Exemplos iniciais:

```text
ELETRICIDADE
├── Instalação elétrica
├── Manutenção elétrica
├── Instalação de chuveiro
├── Tomadas
└── Iluminação

CONSTRUÇÃO E REFORMA
├── Pedreiro
├── Pintor
├── Encanador
├── Gesseiro
└── Azulejista

CASA E JARDIM
├── Jardinagem
├── Limpeza de piscina
├── Limpeza residencial
└── Manutenção

AUTOMOTIVO
├── Mecânica
├── Elétrica automotiva
├── Funilaria
└── Manutenção

TECNOLOGIA
├── Computadores
├── Redes
├── Suporte técnico
├── Desenvolvimento
└── Infraestrutura
```

A lista é inicial e pode evoluir.

A taxonomia deve ser controlada.

A IA pode auxiliar a classificar uma solicitação nas categorias existentes, mas não deve criar categorias arbitrariamente.

---

# 26. MODELO CONCEITUAL DE ENTIDADES

A modelagem deve preservar relações claras entre as entidades.

Conceitualmente:

```text
USUARIO
   │
   ├── PERFIL
   │
   ├── SERVIÇOS AVULSOS
   │
   ├── SOLICITAÇÕES
   │
   ├── ORÇAMENTOS
   │
   ├── CONTRATAÇÕES
   │
   ├── AVALIAÇÕES
   │
   └── PONTUAÇÃO / HISTÓRICO
```

Relacionamentos centrais:

```text
PRESTADOR
   ↓
SERVIÇO AVULSO

SOLICITANTE
   ↓
SOLICITAÇÃO
   ↓
VÁRIOS ORÇAMENTOS
   ↓
PRESTADORES

ORÇAMENTO
   ↓
CONTRATAÇÃO / RESULTADO

CONTRATAÇÃO
   ↓
AVALIAÇÃO

PRESTADOR
   ↓
PONTUAÇÃO / REPUTAÇÃO
```

Os nomes físicos de coleções/documentos devem seguir o modelo do Firestore e a implementação existente, sem criar estruturas duplicadas desnecessariamente.

---

# 27. SEGURANÇA E ISOLAMENTO

A segurança deve existir no frontend, backend e regras de acesso correspondentes, conforme a responsabilidade de cada camada.

Regras essenciais:

- usuário autenticado não deve acessar dados privados de outro usuário;
- solicitante somente deve visualizar as próprias solicitações;
- solicitante proprietário pode visualizar todos os orçamentos da própria solicitação;
- prestador somente visualiza os próprios orçamentos quando se tratar de propostas concorrentes;
- prestador não visualiza propostas concorrentes;
- CPF/CNPJ não deve ser exposto sem necessidade;
- somente usuários autorizados podem alterar registros;
- ações sensíveis devem ter autorização de servidor quando aplicável.

Nunca confiar apenas em parâmetros enviados pelo frontend para definir identidade ou propriedade.

---

# 28. INTELIGÊNCIA ARTIFICIAL — ESCOPO FUTURO

A IA não é a fonte primária dos dados.

A fonte de verdade permanece nos dados persistentes autorizados.

A IA futuramente poderá auxiliar em:

- busca inteligente;
- classificação de solicitações;
- identificação de serviços compatíveis;
- comparação de orçamentos;
- análise de avaliações;
- análise de histórico;
- consulta de profissionais;
- consulta de desempenho;
- identificação de melhores correspondências segundo os critérios informados pelo usuário.

Exemplos de consultas futuras:

- "Preciso de um eletricista para trocar um chuveiro."
- "Quais profissionais trabalham com manutenção de redes?"
- "Mostre os profissionais com melhor avaliação nesta categoria."
- "Quais profissionais já atenderam mais solicitações desse tipo?"
- "Compare os orçamentos recebidos."
- "Qual é a faixa de preço observada para este serviço?"

A IA não deve inventar profissionais, preços, avaliações, históricos ou estatísticas.

---

# 29. RAG ESTRUTURADO

O RAG estruturado será utilizado futuramente sobre dados organizados da plataforma, quando necessário.

Exemplos:

- serviços;
- prestadores;
- categorias;
- solicitações;
- orçamentos;
- contratações;
- avaliações;
- métricas;
- históricos.

A recuperação deve ser direcionada.

Não enviar toda a base ao modelo sem necessidade.

Preferir:

- filtros;
- campos específicos;
- limites;
- paginação;
- agregações;
- consultas direcionadas.

---

# 30. RAG NÃO ESTRUTURADO

O RAG não estruturado será reservado para conhecimento textual/documental quando esse conteúdo existir no produto, por exemplo:

- documentação;
- políticas;
- procedimentos;
- materiais de apoio;
- arquivos;
- textos de conhecimento.

Ele não substitui as consultas aos dados operacionais do sistema.

---

# 31. MCP

O MCP será utilizado futuramente como camada de ferramentas controladas para acesso a operações e dados autorizados.

Exemplos conceituais:

- consultar serviços;
- buscar profissionais;
- obter detalhes;
- consultar histórico;
- executar operações autorizadas.

O MCP não deve fornecer acesso irrestrito ao Firestore.

As ferramentas devem possuir:

- escopo definido;
- entrada validada;
- autorização;
- retorno estruturado;
- tratamento de erros.

Não implementar MCP nesta fase do produto.

---

# 32. RELAÇÃO ENTRE RAG, MCP E GEMINI

Quando a camada de IA for implementada:

```text
USUÁRIO
   ↓
GEMINI
   │
   ├── RAG ESTRUTURADO
   ├── RAG NÃO ESTRUTURADO
   └── MCP
          ↓
       DADOS / OPERAÇÕES AUTORIZADAS
```

Cada componente possui responsabilidade própria:

```text
RAG    = recuperação de contexto

MCP    = ferramentas e operações controladas

GEMINI = interpretação e geração da resposta
```

Esses componentes não devem ser tratados como equivalentes.

---

# 33. FRONTEND

O frontend deve seguir a arquitetura do `GEMINI.md`:

- HTML;
- Vanilla JavaScript;
- Tailwind CSS;
- PWA.

A interface deve ser:

- responsiva;
- mobile-first;
- consistente;
- simples;
- acessível;
- modular;
- adequada a desktop e dispositivos móveis.

A aplicação já possui uma base PWA inicial que deve ser preservada.

---

# 34. TELAS / ÁREAS FUNCIONAIS

A aplicação deve evoluir para possuir, conforme as fases:

### Acesso

- tela inicial;
- login Google;
- estado autenticado.

### Onboarding

- escolha de atuação;
- dados cadastrais;
- complemento de perfil;
- Pix para prestadores, opcional.

### Solicitante

- busca;
- catálogo;
- detalhes do serviço;
- criar solicitação;
- minhas demandas;
- propostas recebidas;
- detalhes do prestador;
- contratação;
- histórico;
- avaliações.

### Prestador

- dashboard;
- perfil profissional;
- serviços avulsos;
- cadastrar/editar serviço;
- mural de solicitações;
- criar orçamento;
- meus orçamentos;
- histórico;
- pontuação;
- avaliações recebidas;
- demonstrativo Pix.

A implementação deve evoluir conforme as fases e não precisa criar todas essas telas em uma única etapa.

---

# 35. ESTADO ATUAL DO PROJETO

## Fase 1 — CONCLUÍDA E VALIDADA

A Fase 1 foi implementada sobre o projeto existente.

A base já criada inclui:

- estrutura PWA;
- `public/index.html`;
- `public/app.js`;
- `public/manifest.json`;
- `public/sw.js`;
- Tailwind CSS;
- integração com Firebase;
- Firebase Authentication;
- login com Google;
- integração com Cloud Firestore;
- verificação de `usuarios/{uid}`;
- onboarding inicial de escolha de atuação;
- criação inicial do perfil do usuário;
- dashboard inicial;
- `firebase.json` para suporte ao Hosting.

### Estado funcional da Fase 1

Fluxo atual:

```text
USUÁRIO
   ↓
TELA INICIAL
   ↓
LOGIN GOOGLE
   ↓
VERIFICA usuarios/{uid}
   │
   ├── NÃO EXISTE
   │       ↓
   │   ONBOARDING
   │       ↓
   │   PERFIL CRIADO
   │
   └── EXISTE
           ↓
       DASHBOARD
```

## Importante

A Fase 1 não deve ser refeita sem necessidade.

A próxima implementação deve partir da estrutura real existente e preservar o que já funciona.

---

# 36. BACKEND ATUAL

Existe backend em Python/Flask disponível em:

`https://marlonkipson.pythonanywhere.com/`

O backend faz parte da arquitetura definida no `GEMINI.md`.

Antes de adicionar novas rotas ou alterar fluxos, o código atual deve ser analisado.

Não criar um segundo backend ou uma API paralela sem autorização arquitetural.

---

# 37. FASES DO PROJETO

## FASE 1 — FUNDAÇÃO
Concluída.

- PWA base;
- autenticação;
- Firestore;
- perfil inicial;
- onboarding inicial;
- dashboard inicial.

## FASE 2 — DADOS E CATÁLOGO
Próxima etapa.

- atualização da documentação;
- seed de dados de teste;
- taxonomia;
- perfil completo;
- catálogo de serviços avulsos;
- busca;
- filtros;
- ordenação;
- detalhes;
- avaliações de demonstração.

## FASE 3 — SOLICITAÇÕES

- criação de solicitações;
- mural de demandas;
- filtros por categoria/localização;
- visão do solicitante;
- visão do prestador.

## FASE 4 — ORÇAMENTOS

- criação de propostas;
- composição de mão de obra/material;
- cálculo de totais;
- vinculação à solicitação;
- privacidade entre concorrentes;
- aprovação/reprovação;
- histórico.

## FASE 5 — CONTRATAÇÃO E REPUTAÇÃO

- registro de contratação;
- encerramento;
- conclusão;
- avaliações;
- comentários;
- pontuação;
- ranking.

## FASE 6 — PIX E DOCUMENTOS

- chave Pix;
- demonstrativo;
- QR Code;
- compartilhamento;
- PDF.

## FASE 7 — IA / RAG / MCP

Somente após a base operacional estar validada.

- busca inteligente;
- RAG estruturado;
- RAG não estruturado quando necessário;
- MCP;
- Gemini;
- análises e consultas inteligentes.

---

# 38. SEED DE DADOS DE TESTE

O seed deve ser utilitário e não destrutivo.

Arquivo previsto:

`scripts/seed_database.js`

Objetivo:

- criar dados fictícios realistas;
- não apagar dados existentes;
- não resetar o banco;
- não duplicar registros a cada execução;
- permitir validação da interface sem depender de produção real.

Massa de referência:

- aproximadamente 12 prestadores;
- aproximadamente 8 solicitantes;
- aproximadamente 100 serviços avulsos;
- aproximadamente 20 solicitações;
- 2 a 4 propostas por solicitação apropriada.

Os dados gerados devem ser identificáveis como dados de teste e não devem representar pessoas reais.

---

# 39. CRITÉRIOS DE ACEITAÇÃO DA FASE DE CATÁLOGO

A fase de catálogo será considerada funcional quando:

- o usuário autenticado conseguir acessar a vitrine;
- serviços avulsos forem lidos do Firestore;
- filtros funcionarem;
- busca textual funcionar;
- ordenações funcionarem;
- cards abrirem detalhes;
- informações do prestador forem apresentadas;
- avaliações e comentários puderem ser visualizados;
- o botão `Contratar Serviço` puder registrar o início do fluxo de contratação previsto;
- serviços continuarem disponíveis enquanto estiverem ativos.

---

# 40. CRITÉRIOS DE ACEITAÇÃO DA FASE DE SOLICITAÇÕES E ORÇAMENTOS

A fase será considerada funcional quando:

- solicitante conseguir criar uma demanda;
- prestadores conseguirem localizar demandas abertas;
- prestador conseguir enviar proposta;
- proposta estiver vinculada à solicitação e ao prestador;
- solicitante conseguir visualizar todas as propostas próprias;
- prestadores não conseguirem visualizar propostas concorrentes;
- solicitante conseguir aprovar uma proposta;
- proposta escolhida ficar `APROVADO`;
- demais propostas ficarem `REPROVADO`;
- solicitação registrar o prestador escolhido;
- histórico preservar o resultado.

---

# 41. CRITÉRIOS DE ACEITAÇÃO DO PIX

- prestador consegue manter uma chave Pix;
- somente o autor do orçamento consegue gerar o demonstrativo correspondente;
- demonstrativo apresenta os dados corretos;
- QR Code é gerado corretamente;
- visualização funciona;
- preparação para PDF e compartilhamento funciona;
- não existe cobrança financeira automática.

---

# 42. REGRAS DE INTEGRIDADE

É proibido, sem autorização explícita:

- resetar o Firestore;
- apagar dados em massa;
- recriar coleções sem necessidade;
- substituir a arquitetura;
- criar um segundo banco;
- criar um segundo sistema de autenticação;
- duplicar fluxos existentes;
- remover funcionalidades funcionando;
- realizar migração destrutiva;
- alterar `GEMINI.md`.

As alterações devem ser:

```text
INCREMENTAIS
REVERSÍVEIS
TESTÁVEIS
DOCUMENTADAS
```

---

# 43. REGRA PARA DESENVOLVIMENTO

Antes de implementar qualquer nova fase:

```text
1. Ler GEMINI.md
2. Ler PROJETO.md
3. Analisar o código existente
4. Identificar o que realmente está implementado
5. Identificar o que falta
6. Reutilizar o que já funciona
7. Implementar a menor alteração necessária
8. Testar
9. Documentar
```

Nunca considerar uma funcionalidade implementada somente porque ela está descrita neste documento.

O código atual é a referência do estado real da implementação.

---

# 44. REGRA FINAL

Este documento descreve o produto e suas regras de negócio.

A arquitetura técnica permanece subordinada ao `GEMINI.md`.

O sistema deve evoluir da seguinte forma:

```text
BASE FUNCIONAL
      ↓
DADOS E CATÁLOGO
      ↓
SOLICITAÇÕES
      ↓
ORÇAMENTOS
      ↓
CONTRATAÇÃO
      ↓
AVALIAÇÕES E RANKING
      ↓
PIX
      ↓
IA / RAG / MCP / GEMINI
```

A prioridade é construir primeiro uma plataforma operacional sólida, com dados estruturados e regras de negócio confiáveis.

A camada de IA será adicionada somente depois que a base operacional estiver validada.
