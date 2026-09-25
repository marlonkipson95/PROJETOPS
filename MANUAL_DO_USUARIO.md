# MANUAL DE USO E GUIA DAS FUNCIONALIDADES — SERVIÇOSAPP

---

## 1. VISÃO GERAL DA PLATAFORMA

O **ServiçosApp** é uma plataforma web moderna (PWA) de marketplace de serviços que conecta com rapidez, transparência e segurança quem precisa de um serviço (**Solicitantes**) a quem executa o serviço com qualidade técnica (**Prestadores de Serviços**).

A aplicação foi desenvolvida seguindo os princípios de segurança desde a arquitetura, transparência de custos, sigilo comercial leal e inteligência artificial contextual (Google Gemini com RAG Estruturado, RAG Não Estruturado e MCP).

---

## 2. PERFIS DE USUÁRIOS E SEPARAÇÃO DE PAPÉIS

Para manter o fluxo de negócio coerente e intuitivo, a plataforma separa de forma rigorosa as responsabilidades de cada tipo de conta:

### A. Solicitante (Contratante — Pessoa Física ou Jurídica)
- **Quem é:** Clientes residenciais, proprietários de imóveis, condomínios ou empresas que precisam contratar serviços.
- **O que faz:**
  - Publica solicitações de serviço personalizadas ("Minhas Solicitações").
  - Navega pelo Catálogo de Serviços e contrata serviços avulsos tabelados.
  - Recebe e compara propostas comerciais de múltiplos profissionais.
  - Inspeciona a especificação completa de custos (mão de obra, materiais, deslocamento, prazo e garantia).
  - Aprova formalmente a proposta escolhida e realiza o pagamento via Pix seguro.
  - Avalia a qualidade do serviço (1 a 5 estrelas e depoimento escrito), atualizando o ranking do prestador.
- **Restrição arquitetural:** **O solicitante puro NÃO é prestador de serviços.** Ele não publica serviços para venda no catálogo e não pode emitir propostas para outros usuários.

### B. Prestador de Serviços (Profissional Autônomo, MEI ou Empresa)
- **Quem é:** Eletricistas, encanadores, técnicos de ar-condicionado, pedreiros, marceneiros, pintores, etc.
- **O que faz:**
  - Cadastra e gerencia serviços avulsos oferecidos no catálogo público.
  - Acessa o Mural de Oportunidades (Demandas Abertas).
  - Elabora orçamentos estruturados com detalhamento técnico (Mão de Obra + Materiais + Logística + Etapas + Garantia).
  - Controla sua agenda de disponibilidade ("Disponível", "Agenda Cheia", "Indisponível").
  - Utiliza modelos salvos (Templates de Orçamento) para envio rápido de propostas.
  - Emite cobranças e faturas Pix formais para os clientes que aceitaram suas propostas.
  - Acumula pontos de reputação e sobe no Ranking Oficial da plataforma.

### C. Perfil Misto ("Ambos" — Contratante & Prestador)
- **Quem é:** Profissionais ou pequenas empresas (ex.: arquitetos, engenheiros, pequenas empreiteiras) que prestam serviços especializados e também contratam profissionais de apoio (ex.: pintores, gesseiros, eletricistas) para obras e reformas.
- **Como funciona:** O usuário dispõe de um botão alternador rápido ("Visão Solicitante" / "Visão Prestadora"), permitindo alternar de contexto sem necessidade de deslogar da conta.

---

## 3. MECANISMO DE ORÇAMENTOS E SIGILO CONCORRENCIAL

O sistema de orçamentos do ServiçosApp foi projetado para assegurar concorrência justa e total transparência:

```text
       SOLICITANTE PUBLICA DEMANDA
                   │
                   ▼
       MURAL DE OPORTUNIDADES ABERTAS
      (Visível a Prestadores Qualificados)
                   │
   ┌───────────────┼───────────────┐
   ▼               ▼               ▼
PRESTADOR A     PRESTADOR B     PRESTADOR C
(Elabora        (Elabora        (Elabora
 Proposta)       Proposta)       Proposta)
   │               │               │
   └───────────────┬───────────────┘
                   ▼
     SIGILO CONCORRENCIAL ATIVO:
   Prestadores NÃO veem preços alheios!
                   │
                   ▼
        SOLICITANTE COMPARA:
- Reputação e Avaliações (⭐)
- Decomposição Mão de Obra vs Materiais
- Prazos e Garantias Técnicas
                   │
                   ▼
        ACEITE DA PROPOSTA VENCEDORA
                   │
                   ▼
        FATURA COMERCIAL + PIX LIBERADO
```

### Decomposição Transparente de Custos
Cada proposta formal contém:
1. **Mão de Obra Especializada:** Valor pelo serviço técnico.
2. **Tabela de Materiais / Insumos:** Relação dos componentes (ex.: cabos, disjuntores, suportes, tintas) com valores detalhados.
3. **Taxa de Deslocamento / Logística:** Custo de locomoção transparente.
4. **Prazo de Execução:** Prazo prometido em dias úteis.
5. **Garantia Técnica:** Prazo de garantia (mínimo legal de 90 dias, podendo ser de 180 ou 365 dias).
6. **Escopo em Etapas:** Descritivo técnico das etapas de execução para acompanhamento do cliente.

---

## 4. POLÍTICA DE SEGURANÇA E PROTEÇÃO DA CHAVE PIX

Para proteger a integridade dos usuários e prevenir fraudes:
- **Chaves Pix NUNCA são expostas publicamente:** Nos perfis públicos e no catálogo de serviços, a chave Pix permanece oculta sob um selo de segurança.
- **Liberação Condicionada à Contratação:** O demonstrativo de pagamento Pix (com QR Code dinâmico, código Pix Copia e Cola e comprovante formal) é liberado exclusivamente após o solicitante clicar em "Aceitar Esta Proposta".
- **Comprovante em Modal:** A fatura pode ser inspecionada, impressa ou exportada a qualquer momento tanto pelo cliente quanto pelo prestador contratado.

---

## 5. ASSISTENTE DE INTELIGÊNCIA ARTIFICIAL (GEMINI + DUPLO RAG + MCP)

A plataforma conta com um Assistente de IA acessível aos usuários autenticados através do botão flutuante no canto inferior direito.

### Como a IA funciona sem alucinar?
A IA é alimentada por uma arquitetura de contexto duplo:

1. **RAG Estruturado (Dados em Tempo Real do Firestore):**
   - Consulta o catálogo real de serviços cadastrados.
   - Consulta o ranking oficial de prestadores, notas e cidades atendidas.
   - Consulta as solicitações de serviços abertas no mural.
2. **RAG Não Estruturado (Regulamento e Políticas Oficiais):**
   - Injeta no modelo as regras formais da plataforma (diretrizes de orçamentos, política de proteção Pix, segregação de perfis e fórmula do ranking).
3. **Diretrizes Anti-Alucinação Estritas:**
   - O Gemini é proibido de inventar prestadores, telefones, serviços inexistentes ou valores não presentes nas bases.
   - Quando um serviço não existe, o assistente orienta o usuário a publicar uma nova demanda em vez de inventar uma informação fictícia.
4. **MCP (Model Context Protocol):**
   - Disponibiliza ferramentas padronizadas para consultas seguras aos dados da plataforma.

---

## 6. SISTEMA DE NOTIFICAÇÕES (TOASTS MODERNOS)

A plataforma eliminou totalmente as janelas cinzas e invasivas de `alert()` do navegador. Todas as ações do sistema (como salvar perfil, enviar orçamentos, aprovar propostas e gerar faturas) exibem **Toasts animados e elegantes** no canto superior direito:
- **Verde (Sucesso):** Confirmação de cadastros, envios e aprovações.
- **Azul (Informação):** Orientações e avisos do sistema.
- **Vermelho (Atenção/Erro):** Validações de campos obrigatórios ou falhas de rede.

---

## 7. ÁREA DE TESTES E DEMONSTRAÇÃO (MODO SANDBOX)

Para permitir a validação e demonstração completa de todas as engrenagens da plataforma sem alterar dados reais de produção, existe a **Área de Testes**:

- **Aba 1: Simulação de Cenários (3 Perfis):**
  - *Cenário 1 — Juliana Mendes (Solicitante Puro):* demonstre publicação de demandas, comparação lado a lado de 3 orçamentos reais concorrentes (Carlos, Roberto e Luz & Força) com inspeção da fatura e aceite Pix.
  - *Cenário 2 — Marcos Vinicius (Prestador Puro):* demonstre controle de status da agenda, formulário de elaboração de orçamentos para demandas abertas e uso de templates.
  - *Cenário 3 — Ana Carolina (Perfil Misto):* demonstre a alternância instantânea entre visão contratante e visão prestadora.
- **Aba 2: Ranking de Prestadores:** Tabela ordenada por pontuação de reputação com filtros por categoria, nota e cidade.
- **Aba 3: Depoimentos & Avaliações:** Feed de avaliações contextuais dos clientes.
- **Aba 4: Mural de Demandas & Inspeção:** Exibição de solicitações com botão para inspecionar todos os orçamentos recebidos.
- **Aba 5: Catálogo Geral de Serviços:** Listagem de serviços avulsos com preço-base e tempo estimado.
- **Aba 6: Orçamentos Detalhados:** Tabela geral com botão "Ver Fatura" em cada linha para inspeção dos custos unitários.
- **Aba 7: Arquitetura de Fluxo do Marketplace:** Diagrama explicativo do ciclo de vida da demanda.

---

*Desenvolvido em conformidade com as diretrizes arquiteturais de `GEMINI.md`.*
