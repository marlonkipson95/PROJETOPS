# PROJETO.md

# PLATAFORMA DE BUSCA, SOLICITAÇÃO, SERVIÇOS E ORÇAMENTOS

## 1. OBJETIVO DO PRODUTO

Desenvolver uma plataforma em nuvem que conecte pessoas e empresas que precisam de serviços com profissionais e empresas que oferecem serviços.

O produto possui dois contextos principais:

```text
USUÁRIO
   │
   ├── SOLICITANTE / CONTRATANTE
   │
   └── PRESTADOR DE SERVIÇO
```

O mesmo usuário autenticado pode atuar como solicitante, prestador ou ambos.

A plataforma deve permitir que qualquer pessoa ou empresa encontre serviços, publique necessidades, receba propostas, compare informações, contrate um profissional e posteriormente avalie a experiência.

No outro lado, o profissional ou empresa poderá divulgar serviços permanentes, encontrar solicitações compatíveis, enviar orçamentos, acompanhar seus resultados, administrar seu histórico, construir reputação e consultar indicadores do próprio desempenho.

O sistema deve ser útil para serviços de qualquer natureza, desde manutenção residencial e automotiva até tecnologia, serviços acadêmicos, freelancers e serviços empresariais.

---

# 2. PRINCÍPIO CENTRAL DO PRODUTO

Existem dois objetos de negócio diferentes e eles não devem ser confundidos:

```text
SERVIÇO AVULSO
=
o que o prestador oferece continuamente

SOLICITAÇÃO
=
o que o solicitante precisa naquele momento
```

Um serviço avulso pode existir durante todo o período em que o prestador o mantiver ativo.

Uma solicitação representa uma necessidade específica e pode receber várias propostas concorrentes.

Um orçamento pode ser vinculado a uma solicitação específica ou estar relacionado a um serviço avulso quando ocorrer uma contratação direta, sem transformar o serviço avulso em uma solicitação concorrente.

---

# 3. DOCUMENTOS DE AUTORIDADE

```text
GEMINI.md
    ↓
COMO O SISTEMA DEVE SER ARQUITETADO

PROJETO.md
    ↓
O QUE O PRODUTO DEVE FAZER

CÓDIGO ATUAL
    ↓
O QUE REALMENTE ESTÁ IMPLEMENTADO
```

O `GEMINI.md` é a autoridade arquitetural e não deve ser modificado sem autorização arquitetural explícita.

O `PROJETO.md` define o produto, regras de negócio, entidades, fluxos, áreas, relatórios, chat inteligente, fases e critérios de aceitação.

Nunca considerar uma funcionalidade implementada somente porque ela está descrita neste documento. O código real deve ser analisado.

---

# 4. ARQUITETURA

Seguir integralmente a arquitetura-base definida no `GEMINI.md`.

Componentes arquiteturais previstos:

- PWA;
- HTML;
- Vanilla JavaScript;
- Tailwind CSS;
- Firebase Authentication;
- Firebase Hosting;
- API REST Python;
- PythonAnywhere;
- Cloud Firestore;
- Gemini;
- MCP;
- RAG estruturado;
- RAG não estruturado;
- prompts estruturados em Markdown.

A presença de Gemini, MCP e RAG na arquitetura não significa que todas as operações devam utilizá-los. O núcleo operacional deve funcionar de forma confiável sem depender de IA para registrar ou validar dados.

---

# 5. USUÁRIOS E PERFIS

## 5.1 Identidade

A identidade do usuário é estabelecida pelo Firebase Authentication.

## 5.2 Atuação

Após autenticar, o usuário escolhe:

- somente solicitante/contratante;
- somente prestador;
- ambos.

Essa escolha deve controlar as áreas disponíveis na interface.

## 5.3 Tipo de pessoa

O sistema deve permitir:

- pessoa física;
- empresa/pessoa jurídica.

O modelo de perfil deve manter identidade e dados de negócio separados.

---

# 6. ONBOARDING E DADOS DA CONTA

Após o login, o usuário deve concluir os dados obrigatórios antes de utilizar as funções que dependem deles.

Dados cadastrais previstos:

- nome completo ou nome empresarial;
- WhatsApp/telefone;
- cidade;
- estado;
- CPF/CNPJ;
- tipo de pessoa;
- tipo de atuação.

Para prestadores:

- breve apresentação/bio;
- modo de atuação;
- área de atendimento;
- chave Pix opcional;
- demais informações profissionais necessárias ao perfil.

CPF/CNPJ e outros dados privados não devem ser exibidos no catálogo público.

A conta deve possuir uma área própria de **Dados da Conta / Meu Perfil**, permitindo consultar e atualizar os dados permitidos.

---

# 7. ÁREA DO SOLICITANTE / CONTRATANTE

O solicitante deve possuir navegação clara para:

```text
INÍCIO
BUSCAR SERVIÇOS
SERVIÇOS AVULSOS
NOVA SOLICITAÇÃO
MINHAS SOLICITAÇÕES
ORÇAMENTOS RECEBIDOS
CONTRATAÇÕES
HISTÓRICO
AVALIAÇÕES
CHAT INTELIGENTE
DADOS DA CONTA
```

O solicitante pode:

- buscar serviços;
- pesquisar profissionais;
- abrir detalhes de serviços;
- visualizar avaliações e comentários;
- contratar diretamente um serviço avulso;
- criar uma solicitação específica;
- receber várias propostas;
- comparar propostas;
- escolher um prestador;
- acompanhar contratação;
- concluir/encerrar a solicitação;
- avaliar o profissional;
- consultar o histórico.

Solicitantes não acumulam pontos de ranking.

---

# 8. ÁREA DO PRESTADOR

O prestador deve possuir uma área completa:

```text
DASHBOARD
SERVIÇOS AVULSOS
MINHAS SOLICITAÇÕES / MURAL
MEUS ORÇAMENTOS
HISTÓRICO
RELATÓRIOS
RANKING / REPUTAÇÃO
AVALIAÇÕES
PIX / PAGAMENTOS
CHAT INTELIGENTE
DADOS DA CONTA
```

O prestador poderá:

- cadastrar serviços avulsos;
- editar, ativar, desativar e retirar serviços;
- visualizar solicitações abertas;
- criar orçamentos;
- acompanhar propostas enviadas;
- consultar históricos por status;
- visualizar indicadores de aproveitamento;
- consultar informações de preço por grupo/subgrupo;
- visualizar avaliações;
- acompanhar pontos e posição de ranking;
- gerar demonstrativo Pix quando autorizado;
- consultar informações por meio do chat inteligente.

---

# 9. SERVIÇOS AVULSOS

## 9.1 Conceito

Serviço avulso é uma oferta permanente do prestador.

Exemplos:

- eletricista;
- mecânico;
- jardinagem;
- limpeza de piscina;
- pedreiro;
- manutenção de computadores;
- manutenção de redes empresariais;
- correção/formatação de TCC;
- desenvolvimento de sites e sistemas;
- freelancer;
- serviços técnicos diversos.

## 9.2 Persistência

O serviço avulso nunca deve desaparecer automaticamente porque alguém o contratou.

Ele permanece publicado enquanto:

```text
ativo = true
```

e o prestador não o retirar/desativar.

## 9.3 Dados mínimos

Um serviço avulso deve possuir, conforme o modelo adotado:

- título;
- descrição;
- categoria;
- subcategoria;
- preço estimado ou forma de precificação;
- prestadorId;
- prestadorNome;
- bio resumida;
- canal público de contato;
- cidade/área de atendimento;
- pontuação atual do prestador;
- nota média;
- total de avaliações;
- ativo;
- criadoEm;
- atualizadoEm.

## 9.4 Card resumido

A listagem deve inicialmente mostrar apenas as informações necessárias:

- título;
- categoria;
- subcategoria;
- preço estimado;
- prestador;
- nota;
- avaliações;
- pontos;
- localização/área, quando aplicável.

## 9.5 Detalhes do card

Ao clicar, abrir modal ou página de detalhes contendo:

- descrição completa;
- bio;
- modo de atuação;
- área de atendimento;
- contato/WhatsApp;
- avaliações;
- comentários;
- preço;
- demais informações públicas;
- botão `CONTRATAR SERVIÇO`.

---

# 10. CONTRATAÇÃO DIRETA DE SERVIÇO AVULSO

Quando o solicitante selecionar `CONTRATAR SERVIÇO`, registrar o evento de contratação.

A contratação deve ficar relacionada a:

- serviço avulso;
- prestador;
- solicitante;
- data;
- status;
- eventual conclusão;
- avaliação posterior.

O serviço avulso continua ativo após a contratação.

A contratação deve servir de base para histórico, estatísticas, reputação e pontuação conforme as regras de negócio definidas.

---

# 11. SOLICITAÇÕES

Uma solicitação representa uma necessidade específica.

Exemplos:

- trocar chuveiro;
- consertar vazamento;
- contratar jardineiro;
- encontrar mecânico;
- instalar equipamento;
- manutenção de rede;
- reforma;
- serviço de tecnologia;
- freelancer.

Dados previstos:

- solicitanteId;
- título;
- descrição;
- categoria;
- subcategoria;
- cidade;
- bairro/região;
- localização ou área;
- prazo;
- informações adicionais;
- anexos, quando aplicável;
- status;
- prestadorContratadoId, quando houver;
- orçamentoEscolhidoId, quando houver;
- criadoEm;
- atualizadoEm.

---

# 12. ÁREA DE SOLICITAÇÕES

Deve existir uma área própria para consulta de solicitações.

## Solicitante

`MINHAS SOLICITAÇÕES`

Organizar por:

- abertas;
- com orçamentos recebidos;
- em análise;
- contratadas;
- concluídas;
- canceladas/encerradas.

## Prestador

`MURAL DE SOLICITAÇÕES`

Mostrar apenas solicitações que possam receber novas propostas.

O mural deve permitir abrir os detalhes e iniciar um orçamento.

---

# 13. STATUS DAS SOLICITAÇÕES

Estados previstos:

```text
ABERTA
ORÇAMENTOS_RECEBIDOS
EM_ANALISE
CONTRATADA
CONCLUIDA
CANCELADA
ENCERRADA
```

A implementação deve usar um conjunto consistente e controlado de estados, evitando duplicidade semântica.

---

# 14. ORÇAMENTOS VINCULADOS A SOLICITAÇÕES

Uma solicitação pode receber propostas de vários prestadores:

```text
SOLICITAÇÃO
   │
   ├── ORÇAMENTO A
   ├── ORÇAMENTO B
   ├── ORÇAMENTO C
   └── ...
```

Cada orçamento deve estar ligado a:

- solicitação;
- solicitante proprietário;
- prestador autor;
- composição de valores;
- status;
- datas;
- resultado da proposta.

---

# 15. FORMULÁRIO DE ORÇAMENTO

O prestador deve conseguir montar uma proposta de maneira simples.

O formulário deve permitir:

## Mão de obra

- descrição;
- quantidade, se aplicável;
- valor.

## Material / matéria-prima

Permitir vários itens:

- descrição;
- quantidade;
- valor unitário;
- subtotal.

## Outros

Permitir custos adicionais somente quando realmente necessários ao orçamento.

## Informações adicionais

- comentário;
- prazo estimado;
- condições;
- validade, quando aplicável.

O sistema calcula:

```text
MÃO DE OBRA
+ MATERIAIS
+ OUTROS
----------------
TOTAL
```

---

# 16. PRIVACIDADE DAS PROPOSTAS CONCORRENTES

Regra central:

```text
SOLICITANTE
   ↓
VÊ TODOS OS ORÇAMENTOS DA PRÓPRIA SOLICITAÇÃO

PRESTADOR
   ↓
VÊ SOMENTE O PRÓPRIO ORÇAMENTO
```

Um prestador não pode visualizar:

- preço de concorrente;
- materiais do concorrente;
- observações do concorrente;
- prazo do concorrente;
- status detalhado de concorrente, salvo informações públicas expressamente previstas.

A proteção deve existir no controle de acesso e não apenas na interface.

---

# 17. ÁREA DE ORÇAMENTOS DO PRESTADOR

Deve existir uma área própria chamada:

**MEUS ORÇAMENTOS**

Ela não deve ser misturada com:

- serviços avulsos;
- mural de solicitações;
- perfil.

Filtros/status:

```text
TODOS
AGUARDANDO
APROVADOS
REPROVADOS
CANCELADOS
```

Cada orçamento deve abrir os detalhes completos.

---

# 18. HISTÓRICO DE ORÇAMENTOS DO PRESTADOR

O prestador deve possuir um histórico completo de suas propostas.

O histórico deve manter os registros mesmo após mudança de status.

Exemplo:

```text
MEUS ORÇAMENTOS

Aguardando       8
Aprovados       14
Reprovados      21
Cancelados       2
```

Para cada orçamento, permitir visualizar:

- solicitação relacionada;
- cliente/solicitante, conforme permissão;
- serviço;
- composição de valores;
- total;
- prazo;
- comentário;
- status;
- data;
- resultado.

Esse histórico deve servir como fonte de dados para relatórios e para análises futuras de IA.

---

# 19. APROVAÇÃO E ENCERRAMENTO DE UMA SOLICITAÇÃO

Quando o solicitante escolher uma proposta:

```text
ORÇAMENTO ESCOLHIDO
        ↓
APROVADO
```

As demais propostas da mesma solicitação:

```text
REPROVADO
```

A solicitação registra:

- prestador contratado;
- orçamento escolhido;
- data;
- novo status.

Novas propostas devem deixar de ser aceitas conforme o fluxo de estado adotado.

---

# 20. CONCLUSÃO DO SERVIÇO

Após a execução, o sistema deve permitir registrar a conclusão quando o fluxo exigir.

A conclusão deve ser relacionada à contratação e servir como base para:

- histórico;
- avaliação;
- pontuação;
- indicadores.

---

# 21. AVALIAÇÕES E COMENTÁRIOS

Após uma contratação válida/conclusão, o solicitante pode avaliar o prestador.

A avaliação deve permitir:

- nota em estrelas;
- comentário.

A avaliação deve permanecer vinculada ao contexto da contratação e ao prestador.

O perfil do prestador deve exibir:

- nota média;
- quantidade de avaliações;
- comentários;
- histórico público de avaliações conforme as regras de privacidade.

Os comentários devem poder ser lidos antes de uma contratação.

---

# 22. PONTUAÇÃO DOS PRESTADORES

Somente quem atua como prestador acumula pontos.

Solicitantes não possuem pontuação de ranking.

O sistema deve registrar eventos que posteriormente possam participar da pontuação, como:

- orçamento enviado;
- orçamento aprovado;
- serviço contratado;
- serviço concluído;
- avaliação recebida;
- outros eventos explicitamente definidos.

A fórmula definitiva de pontos não deve ser inventada pelo desenvolvedor.

A arquitetura deve permitir a implementação futura de uma regra de pontuação controlada.

---

# 23. RANKING E PRIORIDADE DE EXIBIÇÃO

O sistema deve possuir ranking de prestadores.

O prestador deve conseguir visualizar na área da conta/dashboard:

- pontos atuais;
- posição no ranking, quando calculável;
- evolução dos pontos;
- indicadores de reputação;
- quantidade de serviços contratados/concluídos;
- avaliações.

A pontuação poderá participar da ordenação/destaque da vitrine e das listas de prestadores.

Não esconder critérios importantes do usuário caso eles sejam utilizados para ordenar a plataforma.

O ranking não deve substituir a decisão do solicitante.

---

# 24. CATEGORIAS E SUBCATEGORIAS

A taxonomia deve ser estruturada:

```text
GRUPO / CATEGORIA
        ↓
SUBGRUPO / SUBCATEGORIA
        ↓
SERVIÇO
```

Exemplos:

```text
ELETRICIDADE
├── Instalação elétrica
├── Manutenção elétrica
├── Chuveiros
├── Tomadas
├── Iluminação
└── Quadros elétricos

CONSTRUÇÃO E REFORMA
├── Pedreiro
├── Pintura
├── Encanamento
├── Gesso
├── Azulejo
└── Reforma geral

CASA E JARDIM
├── Jardinagem
├── Piscina
├── Limpeza residencial
├── Pequenos reparos
└── Manutenção

AUTOMOTIVO
├── Mecânica
├── Elétrica automotiva
├── Ar-condicionado
├── Funilaria
└── Manutenção

TECNOLOGIA
├── Computadores
├── Redes
├── Suporte técnico
├── Desenvolvimento
├── Sites e sistemas
└── Infraestrutura

FREELANCERS E SERVIÇOS ESPECIALIZADOS
├── Redação
├── Revisão e formatação
├── TCC / trabalhos acadêmicos
├── Design
├── Consultoria
└── Outros serviços profissionais
```

A taxonomia é controlada.

Não criar novas categorias silenciosamente apenas porque um texto de usuário não encontrou correspondência.

---

# 25. RELATÓRIOS

Deve existir uma área própria chamada:

**RELATÓRIOS**

Ela terá visões diferentes conforme o contexto do usuário.

## Relatórios do prestador

Indicadores previstos:

- quantidade de orçamentos enviados;
- quantidade de orçamentos aprovados;
- quantidade de orçamentos reprovados;
- quantidade de orçamentos cancelados;
- taxa de aproveitamento/conversão das propostas;
- quantidade de serviços contratados;
- quantidade de serviços concluídos;
- nota média;
- total de avaliações;
- pontos;
- posição no ranking;
- evolução da pontuação;
- valor médio dos orçamentos;
- valor médio dos orçamentos aprovados;
- tempo médio de resposta, quando o dado existir;
- distribuição de atividade por categoria;
- distribuição de atividade por subcategoria.

## Relatórios de preço

Mostrar, quando houver quantidade suficiente de dados:

- média de valor dos orçamentos por categoria;
- média por subcategoria;
- mediana quando fizer sentido;
- menor valor observado;
- maior valor observado;
- quantidade de propostas utilizadas no cálculo;
- comparação entre orçamento enviado pelo prestador e referências agregadas disponíveis.

### Importante

Nunca apresentar uma média sem informar ou permitir identificar a quantidade de registros utilizados quando isso for relevante para interpretação.

Relatórios não devem inventar estatísticas com poucos dados.

---

# 26. DASHBOARD DO PRESTADOR

O dashboard será a principal visão inicial do prestador.

Deve apresentar um resumo do desempenho sem exigir que ele abra cada área individual.

## Indicadores principais

Cards ou componentes equivalentes:

```text
PONTOS
RANKING
ORÇAMENTOS ENVIADOS
ORÇAMENTOS APROVADOS
TAXA DE APROVEITAMENTO
SERVIÇOS CONCLUÍDOS
NOTA MÉDIA
AVALIAÇÕES
```

## Indicadores por categoria

O prestador deve conseguir visualizar seu desempenho separado por grupo e subgrupo.

Exemplo:

```text
ELETRICIDADE
   Orçamentos: 20
   Aprovados: 8
   Aproveitamento: 40%
   Ticket médio: R$ 285

CHUVEIROS
   Orçamentos: 7
   Aprovados: 4
   Aproveitamento: 57%
   Ticket médio: R$ 190
```

Os dados devem ser calculados com base no histórico real.

## Informações adicionais úteis

O dashboard pode apresentar:

- tendência de aprovação ao longo do tempo;
- categorias com maior volume de atividade do próprio prestador;
- evolução da nota;
- evolução dos pontos;
- quantidade de serviços ativos;
- quantidade de propostas aguardando resposta;
- últimos serviços/propostas relevantes.

Não criar métricas sem definição clara de como são calculadas.

---

# 27. ÁREA DE RELATÓRIOS GERAIS

Além do dashboard resumido, a área de relatórios deve permitir aprofundamento.

Possíveis filtros:

- período;
- categoria;
- subcategoria;
- status;
- faixa de valor;
- cidade/região, quando aplicável.

Os relatórios do prestador devem mostrar somente dados aos quais ele possui autorização.

Relatórios administrativos, caso venham a existir, devem exigir permissões administrativas próprias.

---

# 28. CHAT INTELIGENTE

Deve existir uma área própria chamada:

**CHAT INTELIGENTE**

O chat servirá para facilitar consultas sobre os dados presentes na plataforma.

Exemplos:

```text
Quais serviços eu ofereço atualmente?

Quantos orçamentos eu enviei este mês?

Qual é minha taxa de aproveitamento?

Em quais categorias tenho mais aprovações?

Qual é meu orçamento médio em Eletricidade?

Quais profissionais trabalham com manutenção de redes?

Quais profissionais têm mais avaliações nessa categoria?

Quais solicitações estão abertas para determinada subcategoria?

Compare os orçamentos recebidos nesta solicitação.
```

O chat deve respeitar exatamente as permissões do usuário.

---

# 29. CHAT INTELIGENTE — DADOS E SEGURANÇA

O chat não pode consultar indiscriminadamente o banco inteiro.

Deve recuperar somente os dados necessários para responder à pergunta.

Exemplo:

```text
Pergunta
  ↓
interpretação
  ↓
consulta autorizada
  ↓
dados relevantes
  ↓
Gemini
  ↓
resposta
```

Nunca enviar coleções completas ao modelo sem necessidade.

Nunca permitir que o modelo altere dados diretamente sem uma ferramenta autorizada e fluxo de confirmação apropriado.

O Gemini não é a fonte da verdade.

O Firestore e as fontes autorizadas continuam sendo a fonte dos dados.

---

# 30. CHAT INTELIGENTE — RAG ESTRUTURADO

Para perguntas sobre dados operacionais, priorizar RAG estruturado/consultas estruturadas.

Exemplos:

- quantidade de orçamentos;
- médias;
- ranking;
- avaliações;
- serviços;
- solicitações;
- histórico;
- preços agregados;
- desempenho.

Usar filtros, campos selecionados, limites, paginação e agregações quando aplicável.

Não realizar uma leitura indiscriminada do Firestore para cada pergunta.

---

# 31. CHAT INTELIGENTE — RAG NÃO ESTRUTURADO

Usar RAG não estruturado somente quando houver conteúdo documental/textual relevante, como:

- políticas;
- manuais;
- documentação;
- procedimentos;
- arquivos;
- materiais de apoio.

RAG não estruturado não substitui consultas aos dados operacionais.

---

# 32. CHAT INTELIGENTE — MCP

Quando MCP for implementado, utilizá-lo como camada controlada de ferramentas.

Exemplos conceituais:

- buscar serviços;
- consultar prestadores;
- consultar solicitações;
- consultar histórico;
- consultar relatórios;
- executar operações autorizadas.

Cada ferramenta deve ter:

- finalidade clara;
- entradas validadas;
- autorização;
- escopo limitado;
- retorno estruturado;
- tratamento de erros.

O MCP não deve ter acesso irrestrito ao Firestore.

---

# 33. CHAT INTELIGENTE — RESPOSTAS

O chat deve:

- responder com base nos dados disponíveis;
- informar quando não houver dados suficientes;
- diferenciar média, total, contagem e valor individual;
- informar período da consulta quando relevante;
- evitar inventar registros;
- respeitar permissões;
- utilizar linguagem simples para o usuário final.

Exemplo:

```text
Pergunta:
"Qual é meu aproveitamento em Eletricidade?"

Resposta:
"No período selecionado, você enviou 20 orçamentos
em Eletricidade e 8 foram aprovados.
Seu aproveitamento calculado foi de 40%."
```

---

# 34. ÁREA DE DADOS DA CONTA

Deve existir uma área clara:

**DADOS DA CONTA**

Para prestador, apresentar:

- dados pessoais/empresariais;
- tipo de pessoa;
- atuação;
- bio;
- contato;
- cidade/estado;
- área de atendimento;
- chave Pix;
- pontos;
- ranking;
- nota média;
- quantidade de avaliações;
- serviços ativos;
- serviços concluídos;
- demais informações públicas do perfil.

Para solicitante, mostrar seus dados e informações relacionadas ao próprio uso.

Não exibir dados privados para outros usuários.

---

# 35. PIX E DEMONSTRATIVO DE PAGAMENTO

O prestador poderá cadastrar chave Pix opcional.

Após orçamento aprovado, o autor do orçamento poderá gerar demonstrativo de pagamento.

O demonstrativo pode conter:

- serviço;
- solicitante;
- prestador;
- valor;
- data;
- chave Pix;
- QR Code;
- identificação do orçamento/contratação quando disponível.

Ações:

- visualizar;
- gerar/baixar PDF;
- compartilhar;
- enviar por WhatsApp quando suportado.

### Regra de autoria

Somente o prestador que criou o orçamento pode gerar o demonstrativo correspondente.

Não implementar gateway ou confirmação automática de pagamento nesta etapa.

---

# 36. HISTÓRICO DO USUÁRIO

Histórico é obrigatório para que a plataforma mantenha rastreabilidade.

## Prestador

- orçamentos enviados;
- aprovados;
- reprovados;
- cancelados;
- serviços avulsos ativos/inativos;
- contratações;
- conclusões;
- avaliações;
- pontuação.

## Solicitante

- solicitações;
- propostas recebidas;
- contratações;
- serviços concluídos;
- avaliações realizadas.

Não apagar registros históricos somente porque o status mudou.

---

# 37. MODELO CONCEITUAL DE DADOS

A modelagem deve manter relacionamentos explícitos.

```text
USUARIO
   │
   ├── PERFIL
   ├── SERVIÇOS AVULSOS
   ├── SOLICITAÇÕES
   ├── ORÇAMENTOS
   ├── CONTRATAÇÕES
   ├── AVALIAÇÕES
   ├── PONTUAÇÃO
   └── HISTÓRICO
```

Relacionamentos:

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
PONTUAÇÃO / RANKING / RELATÓRIOS
```

Coleções físicas devem respeitar as estruturas existentes e evitar duplicações desnecessárias.

---

# 38. SEGURANÇA E PRIVACIDADE

Regras mínimas:

- usuário só acessa dados próprios quando o recurso for privado;
- solicitante acessa suas solicitações;
- prestador acessa seus serviços e seus orçamentos;
- dono da solicitação acessa todas as propostas daquela solicitação;
- prestador não acessa propostas concorrentes;
- dados privados não são expostos no catálogo;
- CPF/CNPJ não é público;
- chave Pix não é exposta em contextos indevidos;
- operações sensíveis devem ser autorizadas no backend quando aplicável.

Nunca confiar somente no frontend.

---

# 39. SEED DE DADOS

Quando necessário para validação, utilizar script utilitário:

`scripts/seed_database.js`

O seed deve ser não destrutivo, idempotente ou com mecanismo equivalente de prevenção de duplicação.

Não:

- resetar Firestore;
- apagar usuários reais;
- sobrescrever registros reais;
- criar dados que pareçam pessoas reais.

Massa de testes prevista:

- aproximadamente 12 prestadores;
- aproximadamente 8 solicitantes;
- aproximadamente 100 serviços avulsos;
- aproximadamente 20 solicitações;
- 2 a 4 orçamentos por solicitação apropriada;
- avaliações variadas;
- pontuações variadas;
- múltiplos status.

---

# 40. EXPERIÊNCIA DA INTERFACE

A interface deve seguir a arquitetura existente de PWA + Vanilla JS + Tailwind.

Prioridades:

- mobile-first;
- desktop responsivo;
- navegação simples;
- cards;
- modais;
- hierarquia visual clara;
- estados vazios;
- carregamento;
- erros;
- confirmações;
- acessibilidade;
- consistência visual.

A interface deve deixar claro onde o usuário está:

```text
SERVIÇOS AVULSOS
SOLICITAÇÕES
ORÇAMENTOS
HISTÓRICO
RELATÓRIOS
CHAT
CONTA
```

---

# 41. DASHBOARD E RELATÓRIOS — REGRAS DE CÁLCULO

Métricas devem ser calculadas sobre dados reais e documentadas.

Exemplo de taxa de aproveitamento:

```text
orçamentos aprovados
--------------------
orçamentos enviados
× 100
```

A fórmula pode ser alterada somente quando a regra de negócio for definida.

Não misturar serviços avulsos com orçamentos concorrentes sem deixar claro qual conjunto de dados está sendo analisado.

Para médias de preços, informar a base utilizada sempre que isso for necessário para interpretação.

---

# 42. INSPIRAÇÃO DE PRODUTO

A experiência do produto pode utilizar padrões observados em plataformas de contratação de serviços, sem copiar identidade visual ou implementar regras comerciais de terceiros.

Referências funcionais úteis:

- plataformas desse tipo costumam organizar o fluxo em busca/categoria → perfil do profissional → informações/preço → contato/contratação;
- também são relevantes recursos como avaliações, histórico de pedidos e categorias bem estruturadas;
- sistemas de marketplace de serviços podem oferecer tanto descoberta de profissionais quanto recebimento de propostas para uma necessidade específica.

Essas referências servem somente para inspiração de experiência e organização. As regras deste projeto permanecem as definidas neste documento.

---

# 43. FASES DE IMPLEMENTAÇÃO

## FASE 1 — FUNDAÇÃO

CONCLUÍDA.

Inclui:

- PWA;
- HTML;
- Vanilla JS;
- Tailwind;
- manifest;
- service worker;
- Firebase Authentication;
- login Google;
- Firestore;
- `usuarios/{uid}`;
- onboarding inicial;
- escolha de atuação;
- dashboard inicial.

## FASE 2 — DADOS E CATÁLOGO

- dados cadastrais completos;
- taxonomia;
- seed;
- serviços avulsos;
- busca;
- filtros;
- ordenação;
- cards;
- detalhes;
- avaliações exibidas.

## FASE 3 — SOLICITAÇÕES

CONCLUÍDA NO ESTADO ATUAL, devendo ser preservada e integrada às próximas fases.

Inclui:

- nova solicitação;
- categorias em cascata;
- descrição;
- bairro/região;
- `solicitanteId`;
- status `ABERTA`;
- minhas solicitações;
- mural de solicitações abertas.

## FASE 4 — ORÇAMENTOS

- formulário de orçamento;
- mão de obra;
- materiais;
- total;
- comentários;
- prazo;
- vinculação à solicitação;
- privacidade concorrente;
- meus orçamentos;
- histórico;
- aprovação/reprovação.

## FASE 5 — CONTRATAÇÃO E REPUTAÇÃO

- contratação;
- conclusão;
- avaliações;
- comentários;
- pontuação;
- ranking;
- prioridade de exibição baseada nos critérios definidos.

## FASE 6 — DASHBOARD E RELATÓRIOS

- indicadores do prestador;
- aproveitamento;
- médias;
- análises por categoria/subcategoria;
- histórico;
- evolução da reputação.

## FASE 7 — PIX

- chave Pix;
- demonstrativo;
- QR Code;
- PDF;
- compartilhamento.

## FASE 8 — CHAT INTELIGENTE / IA

- chat;
- consultas estruturadas;
- RAG estruturado;
- RAG não estruturado quando necessário;
- MCP;
- Gemini;
- respostas contextualizadas;
- respeito às permissões.

A fase de IA só deve consumir dados operacionais depois que esses dados estiverem consistentes e os fluxos estiverem validados.

---

# 44. PREPARAÇÃO DOS DADOS PARA IA

Mesmo antes do chat, armazenar dados que permitam análises futuras:

- categoria/subcategoria;
- preço;
- datas;
- status;
- prestador;
- solicitante;
- contratação;
- conclusão;
- avaliação;
- pontuação;
- eventos de orçamento;
- histórico.

Isso permitirá consultas como:

```text
Quais serviços possuem maior demanda?

Quais profissionais mais atendem solicitações?

Quais profissionais têm mais aprovações?

Qual a média de orçamento por subcategoria?

Quais profissionais possuem mais avaliações?

Quais serviços avulsos são mais contratados?

Qual é a taxa de aproveitamento de determinado prestador?
```

A resposta deve sempre ser produzida com base em dados disponíveis e autorizados.

---

# 45. RELAÇÃO ENTRE BUSCA TRADICIONAL E IA

Primeiro, a aplicação deve funcionar com busca estruturada:

```text
categoria
+ subcategoria
+ texto
+ localização
+ preço
+ avaliações
+ pontuação
```

Depois, a IA poderá interpretar linguagem natural e transformar perguntas em recuperação estruturada e/ou semântica.

Exemplo:

```text
"Preciso de alguém para trocar um chuveiro e que atenda
na minha região."
```

A camada inteligente poderá identificar:

```text
serviço = instalação/troca de chuveiro
categoria = eletricidade ou grupo correspondente
localização = região do usuário
```

e então recuperar os dados autorizados.

---

# 46. INTEGRIDADE DOS DADOS

É proibido sem autorização explícita:

- resetar o banco;
- excluir dados em massa;
- recriar tudo do zero;
- trocar o Firestore por outro banco;
- criar banco paralelo;
- criar autenticação paralela;
- duplicar coleções por conveniência;
- apagar histórico;
- alterar dados de produção durante testes de seed;
- modificar `GEMINI.md`.

Alterações devem ser:

```text
INCREMENTAIS
REVERSÍVEIS
TESTÁVEIS
DOCUMENTADAS
```

---

# 47. REGRA DE DESENVOLVIMENTO

Antes de qualquer implementação:

```text
1. Ler GEMINI.md
2. Ler PROJETO.md
3. Analisar o código atual
4. Identificar o que já existe
5. Identificar o que falta
6. Preservar o que funciona
7. Implementar a menor mudança necessária
8. Testar
9. Documentar
```

Não fazer refatoração grande apenas por preferência.

Não inventar regra de negócio quando houver ambiguidade.

---

# 48. CRITÉRIOS DE ACEITAÇÃO DO PRODUTO

O produto deverá permitir, de ponta a ponta:

```text
LOGIN
  ↓
ONBOARDING
  ↓
ESCOLHER ATUAÇÃO
  ↓
SOLICITANTE --------------------- PRESTADOR
     │                                  │
     ├── BUSCAR SERVIÇOS               ├── SERVIÇOS AVULSOS
     ├── CONTRATAR AVULSO              ├── MURAL
     ├── CRIAR SOLICITAÇÃO             ├── CRIAR ORÇAMENTO
     ├── RECEBER ORÇAMENTOS             ├── MEUS ORÇAMENTOS
     ├── COMPARAR                       ├── HISTÓRICO
     ├── ESCOLHER                       ├── DASHBOARD
     ├── ACOMPANHAR                     ├── RELATÓRIOS
     ├── AVALIAR                        ├── RANKING
     └── HISTÓRICO                      ├── PIX
                                         └── CHAT
```

O núcleo deve permitir:

```text
SOLICITAÇÃO
   ↓
VÁRIOS ORÇAMENTOS
   ↓
SOLICITANTE COMPARA
   ↓
ESCOLHE UM
   ↓
UM APROVADO
   ↓
DEMAIS REPROVADOS
   ↓
CONTRATAÇÃO
   ↓
CONCLUSÃO
   ↓
AVALIAÇÃO
   ↓
REPUTAÇÃO / PONTUAÇÃO
```

E, paralelamente:

```text
PRESTADOR
   ↓
SERVIÇO AVULSO
   ↓
CARD
   ↓
DETALHES
   ↓
AVALIAÇÕES + CONTATO
   ↓
CONTRATAR SERVIÇO
```

---

# 49. CRITÉRIOS DE ACEITAÇÃO DO CHAT

Quando a fase do chat for implementada:

- perguntas sobre o próprio usuário respeitam seu escopo;
- perguntas sobre profissionais respeitam dados públicos/autorizados;
- consultas de métricas utilizam dados reais;
- filtros e agregações são coerentes;
- o chat informa ausência de dados quando necessário;
- não inventa profissionais, valores ou avaliações;
- não acessa propostas concorrentes indevidamente;
- não altera dados sem ferramenta e autorização apropriadas.

---

# 50. REGRA FINAL

Este projeto deve evoluir como uma plataforma de serviços completa, e não como uma simples tela de cadastro de orçamento.

O produto possui, como núcleos permanentes:

```text
1. BUSCA
2. SERVIÇOS AVULSOS
3. SOLICITAÇÕES
4. ORÇAMENTOS
5. CONTRATAÇÕES
6. HISTÓRICO
7. AVALIAÇÕES
8. PONTUAÇÃO / RANKING
9. DASHBOARD
10. RELATÓRIOS
11. PIX
12. CHAT INTELIGENTE
```

A camada de IA deve ser construída em cima de dados confiáveis, estruturados e autorizados.

A decisão final de contratação pertence ao usuário.

A prioridade de desenvolvimento é:

```text
FUNCIONALIDADE
   ↓
DADOS CORRETOS
   ↓
SEGURANÇA
   ↓
HISTÓRICO
   ↓
INDICADORES
   ↓
INTELIGÊNCIA
```

Quando houver dúvida, preservar a arquitetura do `GEMINI.md`, preservar o código funcional existente e escolher a solução de menor complexidade que atenda ao requisito sem perder informação.
