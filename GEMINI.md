# GEMINI.md

# ARQUITETURA BASE UNIVERSAL

## 1. PROPÓSITO DESTE ARQUIVO

Este arquivo define a **arquitetura-base, os princípios técnicos e as restrições arquiteturais** que devem ser respeitados durante o desenvolvimento de aplicações neste ambiente.

O `GEMINI.md` é um documento **universal e reutilizável**.

Ele não define um produto específico, domínio de negócio, público-alvo, entidades, telas ou funcionalidades específicas.

Esses elementos devem ser definidos pelo arquivo `PROJETO.md`.

### Regra fundamental

```text
GEMINI.md  = COMO A APLICAÇÃO DEVE SER ARQUITETADA

PROJETO.md = O QUE A APLICAÇÃO DEVE FAZER
```

Quando houver conflito entre uma decisão específica do projeto e uma regra arquitetural deste arquivo, a arquitetura definida neste documento prevalece, salvo alteração arquitetural explicitamente autorizada.

---

# 2. PAPEL DA IA DE DESENVOLVIMENTO

Durante o desenvolvimento, a IA deve atuar como:

* engenheiro de software;
* arquiteto de sistemas;
* especialista em aplicações web modernas;
* especialista em segurança de aplicações;
* especialista em integração com serviços em nuvem;
* especialista em integração de IA generativa;
* responsável por preservar a coerência arquitetural do projeto.

A IA deve analisar primeiro a arquitetura existente antes de implementar alterações.

Não deve inventar tecnologias, serviços, funcionalidades ou fluxos que não estejam definidos no projeto ou autorizados explicitamente.

---

# 3. PRINCÍPIOS ARQUITETURAIS

Toda aplicação desenvolvida sob esta arquitetura deve buscar:

* modularidade;
* separação de responsabilidades;
* segurança desde a arquitetura;
* baixo acoplamento;
* reutilização de componentes;
* escalabilidade adequada;
* manutenção simplificada;
* observabilidade;
* integridade dos dados;
* controle de acesso;
* evolução incremental;
* documentação;
* previsibilidade;
* baixo desperdício de recursos;
* utilização eficiente de IA;
* minimização de custos desnecessários.

A solução deve ser construída preferencialmente de forma incremental.

Não reconstruir uma aplicação funcional sem necessidade técnica comprovada.

---

# 4. ARQUITETURA GERAL

A arquitetura-base segue o seguinte modelo:

```text
                         USUÁRIO
                            │
                            ▼
                    ┌───────────────┐
                    │      PWA      │
                    │ HTML           │
                    │ Vanilla JS     │
                    │ Tailwind CSS   │
                    └───────┬───────┘
                            │
                            ▼
                    Firebase Hosting
                            │
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        Firebase Authentication   API REST Python
                                       │
                                       ▼
                                 PythonAnywhere
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
                    Firestore         MCP            Gemini
                        │              │              │
                        │              │        ┌─────┴─────┐
                        │              │        │           │
                        │              │        ▼           ▼
                        │              │   RAG Estr.   RAG Não-Estr.
                        │              │
                        └──────────────┴───────────────
```

A representação acima é conceitual.

A implementação pode possuir componentes intermediários adicionais quando tecnicamente necessários, desde que não contradigam os princípios desta arquitetura.

---

# 5. APLICAÇÃO 100% EM NUVEM

A arquitetura deve priorizar uma aplicação executada em infraestrutura de nuvem.

Os componentes principais devem ser projetados para operar sem dependência obrigatória de infraestrutura local do usuário.

O ambiente local deve ser utilizado principalmente para:

* desenvolvimento;
* testes;
* depuração;
* validação;
* preparação de versões.

A aplicação em produção deve utilizar os serviços de nuvem definidos pela arquitetura do projeto.

---

# 6. FRONTEND

O frontend deve ser concebido como uma aplicação web moderna baseada em:

* HTML;
* Vanilla JavaScript;
* Tailwind CSS;
* Progressive Web App (PWA).

O frontend deve priorizar:

* responsividade;
* acessibilidade;
* desempenho;
* organização;
* reutilização;
* baixo acoplamento;
* experiência consistente;
* funcionamento adequado em dispositivos móveis e desktop.

Não introduzir frameworks frontend diferentes sem autorização arquitetural explícita.

---

# 7. PROGRESSIVE WEB APP

A aplicação deve ser preparada como PWA quando o projeto utilizar a arquitetura completa definida neste documento.

A implementação deve considerar:

* `manifest`;
* service worker;
* instalação no dispositivo;
* comportamento responsivo;
* cache controlado;
* estratégias apropriadas de atualização;
* tratamento adequado de conectividade.

O uso de cache não deve causar inconsistência ou perda de dados.

Dados críticos não devem depender exclusivamente de armazenamento local.

---

# 8. TAILWIND CSS

O Tailwind CSS deve ser utilizado como principal mecanismo de estilização do frontend.

A interface deve manter:

* consistência visual;
* responsividade;
* componentes reutilizáveis;
* espaçamento coerente;
* hierarquia visual;
* acessibilidade;
* design moderno e minimalista.

Não criar estilos redundantes quando o Tailwind já resolver adequadamente a necessidade.

---

# 9. VANILLA JAVASCRIPT

A lógica de interface deve utilizar Vanilla JavaScript.

O código deve ser:

* modular;
* organizado;
* legível;
* reutilizável;
* desacoplado da apresentação quando possível.

Evitar concentração excessiva de lógica em arquivos únicos.

Separar adequadamente:

```text
Interface
    ↓
Estado
    ↓
Regras de interface
    ↓
Comunicação com API
    ↓
Backend
```

---

# 10. AUTENTICAÇÃO

A autenticação deve utilizar:

**Firebase Authentication.**

Quando o projeto utilizar autenticação por conta Google, o Google deve ser configurado como provedor do Firebase Authentication.

A autenticação é responsável por estabelecer a identidade do usuário.

```text
Autenticação = IDENTIDADE
```

A autenticação não deve ser confundida com autorização.

---

# 11. AUTORIZAÇÃO

Autorização determina:

* o que o usuário pode acessar;
* quais operações pode executar;
* quais dados pode consultar;
* quais dados pode alterar;
* quais recursos pertencem a ele;
* quais funções dependem de permissões específicas.

A autorização deve ser validada no backend sempre que a operação exigir proteção de servidor.

Nunca confiar apenas em informações fornecidas pelo frontend.

Nunca considerar um UID enviado pelo cliente como prova suficiente de identidade.

A identidade deve ser validada por credenciais autenticadas.

---

# 12. FIREBASE HOSTING

O frontend da aplicação deve ser publicado através do:

**Firebase Hosting.**

O Firebase Hosting é responsável pela publicação e distribuição da aplicação web.

Ele não deve ser tratado como substituto do backend Python.

Fluxo conceitual:

```text
Usuário
   ↓
Firebase Hosting
   ↓
Aplicação PWA
   ↓
API Python
```

---

# 13. BACKEND

O backend principal deve utilizar:

**Python + API RESTful.**

O backend é responsável por:

* regras de servidor;
* validações;
* autorização;
* integração com Firestore;
* integração com Gemini;
* integração com MCP;
* integração com RAG;
* processamento de dados;
* operações protegidas;
* controle de erros;
* segurança;
* observabilidade.

O backend não deve simplesmente reproduzir lógica que deveria estar protegida no servidor.

---

# 14. PYTHONANYWHERE

O backend Python deve ser preparado para execução em:

**PythonAnywhere.**

A aplicação deve ser organizada de forma compatível com o ambiente de hospedagem definido pelo projeto.

Credenciais e segredos nunca devem ser inseridos diretamente no código-fonte.

---

# 15. API REST

A comunicação entre frontend e backend deve utilizar APIs REST quando essa arquitetura for aplicável.

As APIs devem:

* possuir contratos claros;
* validar entradas;
* validar autenticação;
* validar autorização;
* retornar respostas previsíveis;
* utilizar códigos HTTP apropriados;
* tratar erros;
* evitar exposição de informações sensíveis.

A API não deve confiar cegamente em dados enviados pelo cliente.

---

# 16. CLOUD FIRESTORE

O banco de dados principal da arquitetura é:

**Cloud Firestore.**

O Firestore deve ser tratado como uma fonte de verdade dos dados persistentes da aplicação quando definido como banco principal do projeto.

A modelagem deve considerar:

* estrutura dos documentos;
* relacionamentos;
* índices;
* consultas;
* isolamento de dados;
* regras de segurança;
* escalabilidade;
* custo de leitura;
* consistência;
* integridade.

Não criar coleções ou estruturas sem necessidade funcional ou arquitetural.

---

# 17. FIRESTORE SECURITY RULES

O Firestore deve utilizar regras de segurança apropriadas.

As regras devem seguir o princípio:

```text
NEGAR POR PADRÃO
        ↓
LIBERAR SOMENTE O NECESSÁRIO
```

As regras devem considerar:

* identidade;
* UID;
* propriedade dos dados;
* permissões;
* operações permitidas;
* contexto do usuário.

Não utilizar regras excessivamente permissivas em produção.

---

# 18. BACKEND E FIREBASE ADMIN SDK

Quando o backend utilizar Firebase Admin SDK, deve-se considerar que operações administrativas podem não estar limitadas pelas mesmas regras do cliente do Firestore.

Portanto:

```text
Firebase Security Rules
        +
Autorização no Backend
        +
Validação de identidade
```

devem ser consideradas conjuntamente.

Nunca assumir que uma operação administrativa está automaticamente protegida apenas pelas Security Rules.

---

# 19. ISOLAMENTO DE DADOS

Aplicações multiusuário devem impedir acesso indevido entre usuários.

Sempre que aplicável:

```text
Usuário autenticado
        ↓
UID
        ↓
Autorização
        ↓
Dados permitidos
```

A aplicação não deve permitir que um usuário consulte, altere ou exclua dados pertencentes a outro usuário sem autorização explícita.

---

# 20. INTELIGÊNCIA ARTIFICIAL

O motor de inteligência artificial definido nesta arquitetura é:

**Google Gemini.**

O Gemini deve ser utilizado como camada de:

* interpretação;
* geração;
* classificação;
* análise;
* raciocínio sobre contexto fornecido;
* interação natural com o usuário.

O Gemini não deve ser tratado como fonte primária da verdade dos dados.

```text
FireStore / fontes autorizadas = VERDADE

Gemini = INTERPRETAÇÃO E INTELIGÊNCIA
```

---

# 21. RAG ESTRUTURADO

A arquitetura deve distinguir claramente:

**RAG Estruturado**

de

**RAG Não Estruturado.**

O RAG Estruturado é destinado à recuperação de dados organizados e estruturados.

Exemplos:

* registros;
* catálogos;
* históricos;
* usuários;
* produtos;
* transações;
* serviços;
* métricas;
* dados operacionais.

Quando o Firestore for a fonte desses dados, o RAG Estruturado deve utilizar consultas direcionadas às estruturas apropriadas.

Não enviar uma coleção inteira ao Gemini sem necessidade.

Preferir:

* filtros;
* campos específicos;
* limites;
* paginação;
* agregações;
* consultas direcionadas.

---

# 22. RAG NÃO ESTRUTURADO

O RAG Não Estruturado, também chamado de RAG Clássico, deve ser utilizado para conhecimento textual ou documental.

Exemplos:

* manuais;
* regulamentos;
* documentação;
* procedimentos;
* textos técnicos;
* políticas;
* arquivos;
* bases de conhecimento.

O processo pode envolver:

```text
Documento
   ↓
Extração
   ↓
Fragmentação
   ↓
Embeddings
   ↓
Índice / armazenamento vetorial
   ↓
Busca semântica
   ↓
Contexto relevante
   ↓
Gemini
```

A tecnologia específica de armazenamento vetorial deve ser definida pelo projeto quando necessária.

Não inventar um provedor de armazenamento vetorial apenas por conveniência.

---

# 23. USO CONJUNTO DOS DOIS RAGs

Quando uma aplicação utilizar IA com dados estruturados e conhecimento documental, os dois mecanismos devem coexistir:

```text
                    GEMINI
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       RAG ESTRUTURADO     RAG NÃO ESTRUTURADO
             │                   │
        Dados reais          Conhecimento
        estruturados         documental/textual
             │                   │
             └─────────┬─────────┘
                       ▼
                  CONTEXTO FINAL
                       │
                       ▼
                     GEMINI
```

Não tratar RAG Estruturado e RAG Não Estruturado como sendo a mesma coisa.

---

# 24. MODEL CONTEXT PROTOCOL — MCP

A API Python deve ser capaz de implementar o:

**Model Context Protocol (MCP)**

quando o projeto utilizar ferramentas MCP.

O MCP deve atuar como camada controlada de ferramentas.

Conceitualmente:

```text
Gemini
   ↓
MCP
   ↓
Ferramenta autorizada
   ↓
Backend
   ↓
Fonte de dados / serviço
```

O MCP não deve fornecer acesso irrestrito ao banco.

---

# 25. FERRAMENTAS MCP

As ferramentas MCP devem possuir:

* finalidade definida;
* entrada validada;
* autorização;
* escopo limitado;
* tratamento de erros;
* retorno estruturado;
* controle de acesso.

Exemplos conceituais:

```text
consultar dados
buscar registros
obter detalhes
criar registro
atualizar registro
executar operação autorizada
```

Os nomes reais das ferramentas devem ser definidos pelo projeto.

Não inventar ferramentas desnecessárias.

---

# 26. GEMINI + MCP + RAG

A arquitetura de IA deve permitir a combinação dos componentes:

```text
                  USUÁRIO
                     │
                     ▼
                  GEMINI
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       RAG E.      RAG N.E.    MCP
          │          │          │
          └──────────┼──────────┘
                     ▼
                  CONTEXTO
                     │
                     ▼
                  GEMINI
                     │
                     ▼
                  RESPOSTA
```

Cada componente possui responsabilidade própria.

### RAG

Recupera contexto.

### MCP

Permite acesso controlado a ferramentas e operações.

### Gemini

Interpreta o contexto e produz a resposta.

---

# 27. PROMPTS

Os prompts estruturais da aplicação devem ser escritos em:

**Markdown.**

A arquitetura dos prompts deve separar claramente:

```text
INSTRUÇÕES
   ↓
CONTEXTO
   ↓
DADOS RECUPERADOS
   ↓
RESULTADOS DAS FERRAMENTAS
   ↓
SOLICITAÇÃO DO USUÁRIO
```

Evitar prompts monolíticos e desorganizados.

Prompts devem ser versionáveis e documentados.

---

# 28. CONTROLE DE CONTEXTO E TOKENS

Não enviar dados desnecessários ao Gemini.

Evitar:

* coleções inteiras;
* históricos completos;
* documentos irrelevantes;
* campos que não participam da resposta;
* resultados duplicados;
* grandes blocos de contexto sem necessidade.

Preferir:

* recuperação direcionada;
* filtros;
* limites;
* campos selecionados;
* chunks relevantes;
* contexto mínimo necessário.

Objetivos:

* reduzir custo;
* reduzir latência;
* aumentar precisão;
* reduzir ruído;
* melhorar previsibilidade.

---

# 29. IA NÃO É FONTE DA VERDADE

A IA nunca deve inventar:

* usuários;
* registros;
* preços;
* produtos;
* serviços;
* documentos;
* transações;
* métricas;
* permissões;
* resultados;
* fatos não presentes nas fontes disponíveis.

Quando os dados disponíveis forem insuficientes, a aplicação deve comunicar a insuficiência de dados em vez de fabricar uma resposta.

---

# 30. SEGURANÇA

A segurança deve ser considerada desde a arquitetura.

Aplicar, quando pertinente:

* autenticação;
* autorização;
* princípio do menor privilégio;
* validação de entrada;
* proteção contra exposição de dados;
* proteção de credenciais;
* HTTPS;
* controle de sessão;
* tratamento seguro de erros;
* logs sem informações sensíveis;
* isolamento de usuários;
* regras de acesso;
* validação no backend.

Nunca confiar exclusivamente no frontend para garantir segurança.

---

# 31. SEGREDOS E CREDENCIAIS

Nunca armazenar em código público:

* chaves privadas;
* tokens;
* senhas;
* secrets;
* credenciais administrativas;
* chaves de API privadas.

Nunca colocar segredos em:

* frontend;
* GitHub;
* `GEMINI.md`;
* `PROJETO.md`;
* prompts públicos;
* logs;
* respostas do Gemini.

Credenciais devem permanecer em mecanismos apropriados de configuração segura.

---

# 32. PROTEÇÃO DE DADOS SENSÍVEIS

Quando houver necessidade de proteger dados sensíveis, a arquitetura pode utilizar criptografia apropriada no backend.

Quando criptografia de dados for necessária:

* utilizar algoritmos modernos;
* utilizar bibliotecas consolidadas;
* proteger chaves separadamente;
* nunca armazenar a chave junto ao dado;
* evitar implementar criptografia manualmente;
* considerar as necessidades de consulta e indexação antes de criptografar campos.

Não criptografar indiscriminadamente todos os campos se isso prejudicar a funcionalidade ou a capacidade de consulta.

---

# 33. INTEGRIDADE DOS DADOS

Dados existentes devem ser tratados como ativos importantes.

É proibido realizar sem autorização explícita:

* reset do banco;
* exclusão em massa;
* recriação indiscriminada de coleções;
* substituição completa dos dados;
* migrações destrutivas;
* alteração massiva sem validação;
* remoção de funcionalidades existentes.

Alterações devem ser preferencialmente:

```text
INCREMENTAIS
REVERSÍVEIS
TESTÁVEIS
DOCUMENTADAS
```

---

# 34. COMPATIBILIDADE E EVOLUÇÃO

Antes de modificar uma parte existente:

1. analisar a implementação atual;
2. identificar dependências;
3. identificar funcionalidades afetadas;
4. preservar comportamentos válidos;
5. implementar a menor alteração necessária;
6. testar;
7. documentar mudanças relevantes.

Não substituir uma solução funcional por outra apenas por preferência pessoal.

---

# 35. INTEGRAÇÕES EXTERNAS

Integrações externas devem possuir:

* responsabilidade definida;
* autenticação apropriada;
* tratamento de erros;
* timeout;
* validação de respostas;
* controle de credenciais;
* logs apropriados;
* comportamento previsível diante de indisponibilidade.

Não criar dependências externas desnecessárias.

---

# 36. OBSERVABILIDADE

Aplicações devem considerar mecanismos adequados para:

* logs;
* erros;
* eventos importantes;
* monitoramento;
* diagnóstico;
* auditoria quando necessária.

Logs nunca devem expor:

* senhas;
* tokens;
* chaves privadas;
* dados sensíveis desnecessários.

---

# 37. TESTES

Alterações relevantes devem ser testadas.

Quando aplicável, considerar:

* testes unitários;
* testes de integração;
* testes de API;
* testes de autenticação;
* testes de autorização;
* testes de segurança;
* testes de interface;
* testes de integração com IA;
* testes de RAG;
* testes de ferramentas MCP.

Não considerar uma funcionalidade concluída apenas porque o código foi escrito.

---

# 38. DOCUMENTAÇÃO

A arquitetura deve ser documentada de forma suficiente para permitir:

* manutenção;
* reprodução do ambiente;
* entendimento do fluxo;
* identificação das responsabilidades;
* evolução futura.

A documentação não deve descrever funcionalidades inexistentes como se fossem reais.

---

# 39. SEPARAÇÃO ENTRE ARQUITETURA E PROJETO

O `GEMINI.md` define a arquitetura-base.

O `PROJETO.md` define a aplicação concreta.

Portanto:

### GEMINI.md

Define:

* arquitetura;
* padrões;
* princípios;
* segurança;
* tecnologias-base;
* integração;
* infraestrutura;
* IA;
* RAG;
* MCP;
* restrições arquiteturais.

### PROJETO.md

Define:

* objetivo;
* problema;
* público;
* funcionalidades;
* regras de negócio;
* entidades;
* fluxos;
* telas;
* tarefas;
* fases;
* estado atual;
* critérios de aceitação.

---

# 40. FLEXIBILIDADE ARQUITETURAL

Os componentes desta arquitetura devem ser tratados como **arquitetura-base**, mas sua utilização concreta deve respeitar a necessidade do projeto.

O `GEMINI.md` não deve permitir que a IA substitua arbitrariamente:

* Firebase;
* Firestore;
* Python;
* PythonAnywhere;
* Gemini;
* MCP;
* RAG;
* PWA;
* Firebase Hosting;

por tecnologias diferentes simplesmente por preferência.

Caso uma substituição arquitetural seja tecnicamente necessária, ela deve ser explicitamente autorizada e documentada.

---

# 41. NÃO INVENTAR ARQUITETURA

A IA não deve criar espontaneamente:

* novos bancos de dados;
* novos frameworks;
* novos servidores;
* novas APIs;
* novas filas;
* novos serviços cloud;
* novos sistemas de autenticação;
* novos mecanismos de armazenamento;
* novas integrações;

sem necessidade técnica e sem autorização quando a mudança alterar a arquitetura definida.

Antes de introduzir uma tecnologia nova, verificar se a arquitetura existente já resolve o problema.

---

# 42. PRINCÍPIO DA MENOR COMPLEXIDADE

Quando duas soluções forem tecnicamente adequadas, preferir a solução que:

* tenha menor complexidade;
* possua menos dependências;
* seja mais fácil de manter;
* tenha menor custo operacional;
* seja mais segura;
* seja mais fácil de testar;
* preserve a arquitetura existente.

Não adicionar complexidade apenas para demonstrar tecnologia.

---

# 43. FLUXO ARQUITETURAL DE REFERÊNCIA

O fluxo geral deve seguir:

```text
USUÁRIO
   ↓
PWA
   ↓
Firebase Authentication
   ↓
Frontend autenticado
   ↓
API REST Python
   ↓
PythonAnywhere
   ↓
┌────────────────────────────────┐
│                                │
│       CAMADA DE APLICAÇÃO      │
│                                │
│  Regras + autorização + lógica │
│                                │
└───────────────┬────────────────┘
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
   Firestore   MCP      RAG
                         │
                  ┌──────┴──────┐
                  ▼             ▼
              Estruturado   Não Estruturado
                  │             │
                  └──────┬──────┘
                         ▼
                       Gemini
                         │
                         ▼
                     Resposta
                         │
                         ▼
                       Usuário
```

Esse fluxo é uma referência arquitetural, não uma implementação literal obrigatória de cada chamada.

---

# 44. REGRA PARA ALTERAÇÕES ARQUITETURAIS

Antes de alterar a arquitetura, a IA deve:

1. identificar o componente afetado;
2. explicar o motivo técnico;
3. verificar se existe solução dentro da arquitetura atual;
4. avaliar impacto;
5. avaliar segurança;
6. avaliar custo;
7. avaliar manutenção;
8. avaliar compatibilidade;
9. somente então propor a alteração.

Alterações arquiteturais significativas devem ser explicitamente autorizadas.

---

# 45. RELAÇÃO COM O PROJETO

Ao iniciar ou continuar qualquer desenvolvimento:

```text
1. Ler GEMINI.md
2. Ler PROJETO.md
3. Analisar o estado atual do código
4. Identificar o que realmente existe
5. Identificar o que o projeto solicita
6. Respeitar a arquitetura
7. Implementar incrementalmente
8. Testar
9. Documentar o progresso
```

Nunca assumir que uma funcionalidade existe apenas porque está descrita em documentação.

O código e o ambiente atual devem ser analisados antes de concluir que algo está implementado.

---

# 46. REGRA DE CONFLITO

Em caso de conflito:

```text
GEMINI.md
    ↓
Arquitetura e princípios

PROJETO.md
    ↓
Requisitos e execução

CÓDIGO ATUAL
    ↓
Estado real da implementação
```

Cada camada possui uma função diferente.

Uma funcionalidade prevista no `PROJETO.md` não autoriza automaticamente uma alteração arquitetural incompatível com o `GEMINI.md`.

---

# 47. PRINCÍPIOS NÃO NEGOCIÁVEIS

A arquitetura deve preservar:

```text
PWA
+
HTML
+
Vanilla JavaScript
+
Tailwind CSS
+
Firebase Authentication
+
Firebase Hosting
+
Python REST API
+
PythonAnywhere
+
Cloud Firestore
+
Gemini
+
MCP
+
RAG Estruturado
+
RAG Não Estruturado
+
Prompts estruturados em Markdown
+
Segurança
+
Autorização
+
Integridade dos dados
```

Esses componentes formam a arquitetura-base definida para este ambiente.

---

# 48. REGRA FINAL

O objetivo deste arquivo não é determinar qual aplicação deve ser construída.

Seu objetivo é garantir que **diferentes aplicações possam ser construídas sobre uma arquitetura consistente, segura, moderna, em nuvem e preparada para inteligência artificial.**

Portanto:

```text
GEMINI.md
    =
ARQUITETURA BASE UNIVERSAL

PROJETO.md
    =
APLICAÇÃO ESPECÍFICA

CÓDIGO
    =
IMPLEMENTAÇÃO REAL

GEMINI
    =
MOTOR DE IA

RAG
    =
RECUPERAÇÃO DE CONTEXTO

MCP
    =
FERRAMENTAS CONTROLADAS

FIRESTORE
    =
DADOS PERSISTENTES

BACKEND
    =
REGRAS + AUTORIZAÇÃO + INTEGRAÇÃO
```

Toda implementação deve preservar essa separação de responsabilidades.

Quando houver dúvida, a IA deve preferir a solução que mantenha a arquitetura simples, segura, modular, documentada, testável e coerente com este documento.
