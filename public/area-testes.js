/**
 * area-testes.js
 * 
 * Módulo de Interface para a Área de Testes e Demonstração do Marketplace.
 * Permite visualizar, filtrar e validar o dataset fictício (isDemo: true)
 * sem misturá-lo com dados reais e sem criar um segundo banco ou aplicação paralela.
 */

import { 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Estado em memória para buscas e filtros instantâneos sem recarregar o Firestore a cada clique
let demoState = {
  carregado: false,
  carregando: false,
  prestadores: [],
  solicitantes: [],
  servicos: [],
  solicitacoes: [],
  orcamentos: [],
  avaliacoes: [],
  filtros: {
    categoria: "todas",
    subcategoria: "todas",
    cidade: "todas",
    prestadorId: "todos",
    statusSolicitacao: "todos",
    notaMinima: 0,
    buscaTexto: ""
  },
  abaAtiva: "cenarios", // cenarios | ranking | comentarios | solicitacoes | servicos | orcamentos | fluxo
  cenarioAtivo: 1, // 1: Solicitante Puro | 2: Prestador Puro | 3: Perfil Misto
  subAbaCenario1: "solicitacoes", // solicitacoes | catalogo | concorrencia
  subAbaCenario2: "perfil", // perfil | propostas | templates
  subAbaCenario3: "contratante", // contratante | prestador
  filtroPropostasCenario2: "TODOS",
  statusOcupacaoCenario2: "Disponível Imediatamente",
  solicitacaoSelecionadaId: null
};

/**
 * Inicializa a Área de Testes no container fornecido
 */
export async function inicializarAreaTestes(db, containerEl, onVoltarDashboard) {
  if (!containerEl) return;
  
  // Renderiza layout base
  containerEl.innerHTML = `
    <div class="max-w-7xl mx-auto pb-16 animate-fadeIn">
      <!-- Banner Modo Demonstração -->
      <div class="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white rounded-2xl p-5 sm:p-6 shadow-md mb-8 border border-amber-400/30">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0 shadow-inner">
              <i class="fas fa-flask"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="bg-white text-amber-900 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                  Modo Demonstração
                </span>
                <span class="bg-amber-900/40 text-amber-100 text-[11px] font-mono px-2 py-0.5 rounded-md border border-amber-300/30">
                  isDemo: true
                </span>
                <span class="text-xs text-amber-100 flex items-center gap-1">
                  <i class="fas fa-shield-alt text-amber-200"></i> Dados Reais Preservados
                </span>
              </div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Painel de Demonstração e Validação do Marketplace</h1>
              <p class="text-amber-100 text-xs sm:text-sm mt-0.5 max-w-3xl">
                Ambiente de testes para inspeção das regras de negócio, solicitações, orçamentos concorrentes, avaliações contextuais e ranking dos prestadores.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end md:self-center">
            ${onVoltarDashboard ? `
            <button id="btn-voltar-app" class="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap">
              <i class="fas fa-arrow-left"></i> Voltar ao App
            </button>
            ` : ''}
            <button id="btn-recarregar-dados-demo" class="bg-white text-amber-900 hover:bg-amber-50 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <i class="fas fa-sync-alt"></i> Atualizar Dados
            </button>
          </div>
        </div>
      </div>

      <!-- Container de Métricas / Cards de Resumo -->
      <div id="demo-metrics-container" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div class="col-span-full py-8 text-center text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl text-amber-600 mb-2"></i>
          <p class="text-sm">Carregando dados de demonstração...</p>
        </div>
      </div>

      <!-- Filtros da Área de Testes -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div class="flex items-center gap-2">
            <i class="fas fa-filter text-amber-600 text-sm"></i>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Filtros de Demonstração</h3>
          </div>
          <button id="btn-limpar-filtros" class="text-xs text-gray-500 hover:text-amber-700 transition-colors">
            <i class="fas fa-times-circle mr-1"></i> Limpar filtros
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
            <select id="filtro-demo-categoria" class="w-full text-xs sm:text-sm border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <option value="todas">Todas as Categorias</option>
              <option value="Casa e Jardim">Casa e Jardim</option>
              <option value="Obras e Reforma">Obras e Reforma</option>
              <option value="Automotivo">Automotivo</option>
              <option value="TI e Redes">TI e Redes</option>
              <option value="Freelancers / Acadêmico">Freelancers / Acadêmico</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Cidade / Região</label>
            <select id="filtro-demo-cidade" class="w-full text-xs sm:text-sm border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <option value="todas">Todas as Cidades</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Status da Solicitação</label>
            <select id="filtro-demo-status" class="w-full text-xs sm:text-sm border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <option value="todos">Todos os Status</option>
              <option value="ABERTA">ABERTA</option>
              <option value="EM_ANALISE">EM_ANALISE</option>
              <option value="CONTRATADA">CONTRATADA</option>
              <option value="CONCLUIDA">CONCLUIDA</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Filtrar por Prestador</label>
            <select id="filtro-demo-prestador" class="w-full text-xs sm:text-sm border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <option value="todos">Todos os Prestadores (15)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Seletor Rápido de 3 Cenários Realistas (Persona Switcher) -->
      <div class="bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl mb-8 border border-indigo-500/30">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Persona Switcher
              </span>
              <span class="text-xs text-indigo-200">Simulação Interativa de Papéis</span>
            </div>
            <h2 class="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <i class="fas fa-users-cog text-indigo-400"></i> Seletor de Cenários Realistas
            </h2>
            <p class="text-xs text-gray-300 mt-0.5">
              Alterne instantaneamente a aplicação para experimentar o fluxo sob a perspectiva de cada tipo de usuário.
            </p>
          </div>
          <div class="flex items-center gap-1.5 self-start md:self-center">
            <span class="text-xs text-gray-400 mr-1">Cenário Ativo:</span>
            <span id="badge-cenario-ativo" class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
              Cenário 1: Solicitante Puro
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="seletor-cenarios-cards">
          <!-- Card Cenário 1 -->
          <button type="button" class="btn-trocar-cenario text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white/10 border-indigo-400 shadow-md ring-2 ring-indigo-400/40" data-cenario="1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <i class="fas fa-shopping-bag"></i> Cenário 1
              </span>
              <span class="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">Solicitante Puro</span>
            </div>
            <h4 class="text-sm font-bold text-white mb-1">Pessoa Física / Empresa Contratante</h4>
            <p class="text-xs text-gray-300 leading-relaxed mb-3">
              Cadastro com CPF validado, sem reputação de prestador. Foco em criar demandas, comparar orçamentos concorrentes e contratar.
            </p>
            <div class="flex items-center gap-2 text-[11px] text-indigo-200 font-semibold flex-wrap">
              <span>• Minhas Demandas</span>
              <span>• Catálogo Direto</span>
              <span>• Mural Concorrência</span>
            </div>
          </button>

          <!-- Card Cenário 2 -->
          <button type="button" class="btn-trocar-cenario text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" data-cenario="2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <i class="fas fa-tools"></i> Cenário 2
              </span>
              <span class="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-bold">Prestador Puro</span>
            </div>
            <h4 class="text-sm font-bold text-white mb-1">MEI / Empresa Especialista</h4>
            <p class="text-xs text-gray-300 leading-relaxed mb-3">
              CNPJ ativo, bio detalhada, horários de atendimento, status de ocupação, score de credibilidade e propostas pré-formatadas.
            </p>
            <div class="flex items-center gap-2 text-[11px] text-amber-200 font-semibold flex-wrap">
              <span>• Status Ocupação</span>
              <span>• Histórico Propostas</span>
              <span>• Templates Salvos</span>
            </div>
          </button>

          <!-- Card Cenário 3 -->
          <button type="button" class="btn-trocar-cenario text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" data-cenario="3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <i class="fas fa-random"></i> Cenário 3
              </span>
              <span class="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-bold">Perfil Misto</span>
            </div>
            <h4 class="text-sm font-bold text-white mb-1">Papel Dual (Ambos)</h4>
            <p class="text-xs text-gray-300 leading-relaxed mb-3">
              Alternância fluida em 1 clique entre o papel de quem contrata serviços e de quem atua prestando e emitindo propostas.
            </p>
            <div class="flex items-center gap-2 text-[11px] text-emerald-200 font-semibold flex-wrap">
              <span>• Toggle Contratante</span>
              <span>• Toggle Prestador</span>
              <span>• Visão Unificada</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Navegação das Abas de Teste com scrollbar elegante e setas de navegação lateral -->
      <div class="relative mb-6">
        <button type="button" id="btn-scroll-demo-left" class="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-md items-center justify-center text-gray-700 text-xs transition-all cursor-pointer hover:scale-105 active:scale-95" title="Rolar abas para a esquerda">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div id="demo-tabs-scroll-container" class="border-b border-gray-200 menu-scrollbar pb-1.5 px-1">
          <nav class="-mb-px flex space-x-2 sm:space-x-4 min-w-max" id="demo-tabs-nav">
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-indigo-600 text-indigo-700 whitespace-nowrap cursor-pointer" data-aba="cenarios">
              <i class="fas fa-users-cog text-indigo-500"></i> Simulação de Cenários (3 Perfis)
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="ranking">
              <i class="fas fa-trophy text-amber-500"></i> Ranking Geral (${demoState.prestadores.length || 15})
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="comentarios">
              <i class="fas fa-comments text-blue-500"></i> Avaliações e Comentários
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="solicitacoes">
              <i class="fas fa-clipboard-list text-purple-500"></i> Solicitações & Propostas
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="servicos">
              <i class="fas fa-boxes text-emerald-500"></i> Catálogo de Serviços
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="orcamentos">
              <i class="fas fa-calculator text-indigo-500"></i> Orçamentos Detalhados
            </button>
            <button class="tab-demo-btn py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer" data-aba="fluxo">
              <i class="fas fa-project-diagram text-rose-500"></i> Ciclo do Marketplace
            </button>
          </nav>
        </div>
        <button type="button" id="btn-scroll-demo-right" class="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-md items-center justify-center text-gray-700 text-xs transition-all cursor-pointer hover:scale-105 active:scale-95" title="Rolar abas para a direita">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Conteúdo Dinâmico da Aba Selecionada -->
      <div id="demo-tab-content" class="min-h-[400px]">
        <!-- Conteúdo injetado via JS -->
      </div>
    </div>

    <!-- Modal de Inspeção Detalhada da Solicitação -->
    <div id="modal-inspecao-solicitacao" class="fixed inset-0 z-50 hidden overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity backdrop-blur-xs" id="backdrop-inspecao"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800">DEMO</span>
              <h3 class="text-base font-bold text-gray-900" id="modal-inspecao-titulo">Detalhes da Solicitação</h3>
            </div>
            <button id="btn-fechar-inspecao" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          <div class="p-6 max-h-[70vh] overflow-y-auto" id="modal-inspecao-corpo">
            <!-- Dados da solicitação e seus orçamentos -->
          </div>
          <div class="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
            <button id="btn-fechar-inspecao-rodape" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes do Prestador -->
    <div id="modal-detalhes-prestador" class="fixed inset-0 z-50 hidden overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity backdrop-blur-xs" id="backdrop-prestador"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-base font-bold text-gray-900">Perfil Profissional (Demonstração)</h3>
            <button id="btn-fechar-prestador" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          <div class="p-6 max-h-[70vh] overflow-y-auto" id="modal-prestador-corpo">
            <!-- Injetado dinamicamente -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Listeners dos Modais
  document.getElementById("btn-fechar-inspecao")?.addEventListener("click", fecharModalInspecao);
  document.getElementById("btn-fechar-inspecao-rodape")?.addEventListener("click", fecharModalInspecao);
  document.getElementById("backdrop-inspecao")?.addEventListener("click", fecharModalInspecao);

  document.getElementById("btn-fechar-prestador")?.addEventListener("click", fecharModalPrestador);
  document.getElementById("backdrop-prestador")?.addEventListener("click", fecharModalPrestador);

  if (onVoltarDashboard) {
    document.getElementById("btn-voltar-app")?.addEventListener("click", onVoltarDashboard);
  }

  // Listener para recarregar dados do Firestore
  document.getElementById("btn-recarregar-dados-demo")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-recarregar-dados-demo");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
    btn.disabled = true;
    await carregarTodosDadosDemo(db);
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Dados';
    btn.disabled = false;
  });

  // Rolagem suave com setas de navegação das abas da Área de Testes
  const demoScroll = containerEl.querySelector("#demo-tabs-scroll-container");
  const btnDemoLeft = containerEl.querySelector("#btn-scroll-demo-left");
  const btnDemoRight = containerEl.querySelector("#btn-scroll-demo-right");
  if (btnDemoLeft && demoScroll) {
    btnDemoLeft.addEventListener("click", () => {
      demoScroll.scrollBy({ left: -240, behavior: "smooth" });
    });
  }
  if (btnDemoRight && demoScroll) {
    btnDemoRight.addEventListener("click", () => {
      demoScroll.scrollBy({ left: 240, behavior: "smooth" });
    });
  }

  // Listeners dos Cards do Seletor de Cenários
  const btnCenarios = containerEl.querySelectorAll(".btn-trocar-cenario");
  const tabButtons = containerEl.querySelectorAll(".tab-demo-btn");

  btnCenarios.forEach(btn => {
    btn.addEventListener("click", () => {
      const cId = parseInt(btn.getAttribute("data-cenario"), 10) || 1;
      demoState.cenarioAtivo = cId;
      demoState.abaAtiva = "cenarios";
      
      btnCenarios.forEach(b => {
        b.classList.remove("bg-white/10", "border-indigo-400", "shadow-md", "ring-2", "ring-indigo-400/40");
        b.classList.add("bg-white/5", "border-white/10");
      });
      btn.classList.remove("bg-white/5", "border-white/10");
      btn.classList.add("bg-white/10", "border-indigo-400", "shadow-md", "ring-2", "ring-indigo-400/40");

      const badgeAtivo = document.getElementById("badge-cenario-ativo");
      if (badgeAtivo) {
        if (cId === 1) badgeAtivo.textContent = "Cenário 1: Solicitante Puro";
        else if (cId === 2) badgeAtivo.textContent = "Cenário 2: Prestador Puro";
        else badgeAtivo.textContent = "Cenário 3: Perfil Misto";
      }

      tabButtons.forEach(b => {
        if (b.getAttribute("data-aba") === "cenarios") {
          b.classList.remove("border-transparent", "text-gray-500");
          b.classList.add("border-indigo-600", "text-indigo-700");
        } else {
          b.classList.remove("border-indigo-600", "text-indigo-700", "border-amber-600", "text-amber-700");
          b.classList.add("border-transparent", "text-gray-500");
        }
      });

      renderizarAbaAtiva();
    });
  });

  // Listeners de Abas Gerais
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => {
        b.classList.remove("border-indigo-600", "text-indigo-700", "border-amber-600", "text-amber-700");
        b.classList.add("border-transparent", "text-gray-500");
      });
      const aba = btn.getAttribute("data-aba");
      demoState.abaAtiva = aba;
      if (aba === "cenarios") {
        btn.classList.remove("border-transparent", "text-gray-500");
        btn.classList.add("border-indigo-600", "text-indigo-700");
      } else {
        btn.classList.remove("border-transparent", "text-gray-500");
        btn.classList.add("border-amber-600", "text-amber-700");
      }
      renderizarAbaAtiva();
    });
  });

  // Listeners de Filtros
  const selectCat = document.getElementById("filtro-demo-categoria");
  selectCat?.addEventListener("change", (e) => {
    demoState.filtros.categoria = e.target.value;
    renderizarAbaAtiva();
  });

  const selectCidade = document.getElementById("filtro-demo-cidade");
  selectCidade?.addEventListener("change", (e) => {
    demoState.filtros.cidade = e.target.value;
    renderizarAbaAtiva();
  });

  const selectStatus = document.getElementById("filtro-demo-status");
  selectStatus?.addEventListener("change", (e) => {
    demoState.filtros.statusSolicitacao = e.target.value;
    renderizarAbaAtiva();
  });

  const selectPrestador = document.getElementById("filtro-demo-prestador");
  selectPrestador?.addEventListener("change", (e) => {
    demoState.filtros.prestadorId = e.target.value;
    renderizarAbaAtiva();
  });

  document.getElementById("btn-limpar-filtros")?.addEventListener("click", () => {
    demoState.filtros = {
      categoria: "todas",
      subcategoria: "todas",
      cidade: "todas",
      prestadorId: "todos",
      statusSolicitacao: "todos",
      notaMinima: 0,
      buscaTexto: ""
    };
    if (selectCat) selectCat.value = "todas";
    if (selectCidade) selectCidade.value = "todas";
    if (selectStatus) selectStatus.value = "todos";
    if (selectPrestador) selectPrestador.value = "todos";
    renderizarAbaAtiva();
  });

  // Carrega os dados da nuvem
  await carregarTodosDadosDemo(db);
}

/**
 * Busca todas as coleções de demonstração do Firestore
 */
async function carregarTodosDadosDemo(db) {
  demoState.carregando = true;
  try {
    // 1. Prestadores & Solicitantes (usuários onde isDemo == true)
    const usuariosSnap = await getDocs(query(collection(db, "usuarios"), where("isDemo", "==", true)));
    const prestadores = [];
    const solicitantes = [];

    usuariosSnap.forEach(docSnap => {
      const data = { id: docSnap.id, ...docSnap.data() };
      if (data.tipo === "prestador" || data.tipo === "ambos" || docSnap.id.startsWith("demo_prestador_")) {
        prestadores.push(data);
      } else if (data.tipo === "solicitante" || docSnap.id.startsWith("demo_solicitante_")) {
        solicitantes.push(data);
      }
    });

    // 2. Serviços Avulsos
    const servicosSnap = await getDocs(query(collection(db, "servicos_avulsos"), where("isDemo", "==", true)));
    const servicos = [];
    servicosSnap.forEach(docSnap => {
      servicos.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 3. Solicitações
    const solicitacoesSnap = await getDocs(query(collection(db, "solicitacoes"), where("isDemo", "==", true)));
    const solicitacoes = [];
    solicitacoesSnap.forEach(docSnap => {
      solicitacoes.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 4. Orçamentos
    const orcamentosSnap = await getDocs(query(collection(db, "orcamentos"), where("isDemo", "==", true)));
    const orcamentos = [];
    orcamentosSnap.forEach(docSnap => {
      orcamentos.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 5. Avaliações
    const avaliacoesSnap = await getDocs(query(collection(db, "avaliacoes"), where("isDemo", "==", true)));
    const avaliacoes = [];
    avaliacoesSnap.forEach(docSnap => {
      avaliacoes.push({ id: docSnap.id, ...docSnap.data() });
    });

    demoState.prestadores = prestadores;
    demoState.solicitantes = solicitantes;
    demoState.servicos = servicos;
    demoState.solicitacoes = solicitacoes;
    demoState.orcamentos = orcamentos;
    demoState.avaliacoes = avaliacoes;
    demoState.carregado = true;

    // Atualiza opções dos selects de filtros
    popularSelectsFiltros();

    // Renderiza cards de métricas e tela inicial
    renderizarMetricas();
    renderizarAbaAtiva();

  } catch (error) {
    console.error("Erro ao carregar dados demo do Firestore:", error);
    const container = document.getElementById("demo-metrics-container");
    if (container) {
      container.innerHTML = `
        <div class="col-span-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center text-sm">
          <i class="fas fa-exclamation-triangle mr-2"></i> Não foi possível carregar os dados de demonstração. Verifique a conexão com o Firestore.
        </div>
      `;
    }
  } finally {
    demoState.carregando = false;
  }
}

/**
 * Preenche os selects de Cidade e Prestador dinamicamente
 */
function popularSelectsFiltros() {
  const selectCat = document.getElementById("filtro-demo-categoria");
  if (selectCat) {
    const categorias = new Set();
    demoState.servicos.forEach(s => { if (s.categoria) categorias.add(s.categoria); });
    demoState.solicitacoes.forEach(s => { if (s.categoria) categorias.add(s.categoria); });
    demoState.prestadores.forEach(p => {
      if (p.categoriaPrincipal) categorias.add(p.categoriaPrincipal);
      if (Array.isArray(p.categorias)) p.categorias.forEach(c => categorias.add(c));
    });
    let html = '<option value="todas">Todas as Categorias</option>';
    Array.from(categorias).sort().forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    selectCat.innerHTML = html;
  }

  const selectCidade = document.getElementById("filtro-demo-cidade");
  if (selectCidade) {
    const cidades = new Set();
    demoState.prestadores.forEach(p => { if (p.cidade) cidades.add(`${p.cidade} - ${p.estado || ''}`.trim()); });
    demoState.solicitacoes.forEach(s => { 
      if (s.endereco) {
        const partes = s.endereco.split(',');
        if (partes.length > 1) cidades.add(partes[1].trim());
      }
    });
    let html = '<option value="todas">Todas as Cidades</option>';
    Array.from(cidades).sort().forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    selectCidade.innerHTML = html;
  }

  const selectPrestador = document.getElementById("filtro-demo-prestador");
  if (selectPrestador) {
    let html = '<option value="todos">Todos os Prestadores (' + demoState.prestadores.length + ')</option>';
    demoState.prestadores.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(p => {
      html += `<option value="${p.id}">${p.nome}</option>`;
    });
    selectPrestador.innerHTML = html;
  }
}

/**
 * Renderiza os 6 Cards de Resumo no topo
 */
function renderizarMetricas() {
  const container = document.getElementById("demo-metrics-container");
  if (!container) return;

  const totalPrestadores = demoState.prestadores.length;
  const totalSolicitantes = demoState.solicitantes.length;
  const totalServicos = demoState.servicos.length;
  const totalSolicitacoes = demoState.solicitacoes.length;
  const totalOrcamentos = demoState.orcamentos.length;
  const totalAvaliacoes = demoState.avaliacoes.length;

  container.innerHTML = `
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-user-cog"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalPrestadores}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Prestadores</span>
      <span class="text-[10px] text-gray-400 mt-0.5">PF & PJ</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-users"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalSolicitantes}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Solicitantes</span>
      <span class="text-[10px] text-gray-400 mt-0.5">Clientes Fictícios</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-tools"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalServicos}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Serviços</span>
      <span class="text-[10px] text-gray-400 mt-0.5">5 Categorias</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalSolicitacoes}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Solicitações</span>
      <span class="text-[10px] text-gray-400 mt-0.5">Demandas Reais</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-calculator"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalOrcamentos}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orçamentos</span>
      <span class="text-[10px] text-gray-400 mt-0.5">Propostas Concorrentes</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col items-center text-center hover:border-amber-400 transition-colors">
      <div class="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg mb-2">
        <i class="fas fa-star"></i>
      </div>
      <span class="text-2xl font-black text-gray-900">${totalAvaliacoes}</span>
      <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Avaliações</span>
      <span class="text-[10px] text-gray-400 mt-0.5">Comentários Contextuais</span>
    </div>
  `;
}

/**
 * Roteamento interno entre as abas da área de testes
 */
function renderizarAbaAtiva() {
  const container = document.getElementById("demo-tab-content");
  if (!container) return;

  switch (demoState.abaAtiva) {
    case "cenarios":
      renderizarSimuladorCenarios(container);
      break;
    case "ranking":
      renderizarRanking(container);
      break;
    case "comentarios":
      renderizarComentarios(container);
      break;
    case "solicitacoes":
      renderizarSolicitacoes(container);
      break;
    case "servicos":
      renderizarServicosAvulsos(container);
      break;
    case "orcamentos":
      renderizarOrcamentos(container);
      break;
    case "fluxo":
      renderizarSimulacaoFluxo(container);
      break;
    default:
      renderizarSimuladorCenarios(container);
  }
}

// =============================================================================
// 0. ABA: SIMULAÇÃO DE CENÁRIOS REALISTAS (3 PERSONAS)
// =============================================================================

function renderizarSimuladorCenarios(container) {
  if (!container) return;

  const cenario = demoState.cenarioAtivo || 1;

  if (cenario === 1) {
    renderizarCenario1Solicitante(container);
  } else if (cenario === 2) {
    renderizarCenario2Prestador(container);
  } else {
    renderizarCenario3Misto(container);
  }
}

/**
 * CENÁRIO 1: SOLICITANTE PURO (PF / PJ Contratante)
 */
function renderizarCenario1Solicitante(container) {
  const subAba = demoState.subAbaCenario1 || 'solicitacoes';

  // Filtra solicitações do solicitante demo ou primeiras 3 solicitações
  const solicitacoesDemo = demoState.solicitacoes.slice(0, 4);

  let conteudoSubAba = '';

  if (subAba === 'solicitacoes') {
    conteudoSubAba = `
      <div class="space-y-4 animate-fadeIn">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Minhas Demandas Criadas (${solicitacoesDemo.length})</h4>
          <span class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold">
            <i class="fas fa-info-circle mr-1"></i> Orçamentos recebidos diretamente de prestadores
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${solicitacoesDemo.map((s, idx) => {
            const orcsDesta = demoState.orcamentos.filter(o => o.solicitacaoId === s.id);
            let statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
            if (s.status === 'CONTRATADA') statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
            if (s.status === 'CONCLUIDA') statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

            return `
              <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-2 gap-2">
                  <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusColor}">
                    ${s.status}
                  </span>
                  <span class="text-xs text-gray-400"><i class="fas fa-map-marker-alt mr-1"></i>${s.endereco || 'São Paulo, SP'}</span>
                </div>
                <h5 class="text-base font-bold text-gray-900 mb-1.5">${s.titulo}</h5>
                <p class="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">${s.descricao}</p>
                <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span class="text-gray-700 font-semibold flex items-center gap-1.5">
                    <i class="fas fa-file-invoice-dollar text-indigo-600"></i> ${orcsDesta.length} Propostas Recebidas
                  </span>
                  <button type="button" class="btn-ver-concorrencia-cenario text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs" data-solic-id="${s.id}">
                    Ver Propostas
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (subAba === 'catalogo') {
    const servicosAmostra = demoState.servicos.slice(0, 6);
    conteudoSubAba = `
      <div class="space-y-4 animate-fadeIn">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Catálogo de Serviços Avulsos Disponíveis</h4>
          <span class="text-xs text-gray-500">Contratação direta com preço base tabelado</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${servicosAmostra.map(srv => `
            <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors">
              <div>
                <span class="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">${srv.categoria}</span>
                <h5 class="text-sm font-bold text-gray-900 mt-2 mb-1">${srv.titulo}</h5>
                <p class="text-xs text-gray-500 line-clamp-2 mb-3">${srv.descricao || 'Atendimento com profissional especializado e com garantia.'}</p>
              </div>
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-gray-400 block font-bold uppercase">Preço Base</span>
                  <span class="text-base font-black text-emerald-600">R$ ${(srv.valor_base || srv.valor || 150).toFixed(2).replace('.', ',')}</span>
                </div>
                <button type="button" class="btn-simular-contratacao-direta px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer" data-id="${srv.id}" data-titulo="${srv.titulo}">
                  <i class="fas fa-check-circle mr-1"></i> Contratar
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    // Propostas do Mural de Concorrência do Cenário 1
    const propostasCenario1 = [
      {
        id: 'prop_carlos',
        prestador: 'Carlos Eletricista',
        iniciais: 'CE',
        corAvatar: 'bg-blue-100 text-blue-600',
        nota: 4.9,
        avaliacoes: 52,
        destaque: 'MAIS RECOMENDADA',
        corDestaque: 'bg-indigo-600 text-white',
        bordaCard: 'border-2 border-indigo-500 shadow-md',
        escopo: 'Etapa 1: Desenergização segura e remoção da fiação antiga de 2.5mm;\nEtapa 2: Passagem de novos condutores antichama de 4mm e 6mm;\nEtapa 3: Instalação do quadro de distribuição bifásico DIN 12 módulos;\nEtapa 4: Montagem do barramento de cobre bifásico tipo pente e aterramento TT;\nEtapa 5: Teste com multímetro/alicate amperímetro e identificação de circuitos.',
        itens: [
          { descricao: 'Cabo Flexível 4.0mm Antichama (Rolo 50m)', quantidade: 1, valorUnitario: 85.00, subtotal: 85.00 },
          { descricao: 'Cabo Flexível 6.0mm Antichama (Rolo 25m)', quantidade: 1, valorUnitario: 55.00, subtotal: 55.00 },
          { descricao: 'Disjuntores DIN Curva C (20A / 32A)', quantidade: 4, valorUnitario: 10.00, subtotal: 40.00 }
        ],
        maoDeObra: 450.00,
        material: 180.00,
        deslocamento: 30.00,
        total: 660.00,
        prazo: '2 dias úteis',
        garantia: '180 dias (Laudo Técnico e ART inclusos)',
        chavePix: 'carlos.eletro@servicosapp.com.br',
        status: (demoState.propostaAceitaCenario1 === 'prop_carlos') ? 'APROVADO' : (demoState.propostaAceitaCenario1 ? 'REPROVADO' : 'AGUARDANDO')
      },
      {
        id: 'prop_roberto',
        prestador: 'Roberto Silva Instalações',
        iniciais: 'RS',
        corAvatar: 'bg-emerald-100 text-emerald-600',
        nota: 5.0,
        avaliacoes: 64,
        destaque: 'ATENDIMENTO EMERGENCIAL',
        corDestaque: 'bg-emerald-600 text-white',
        bordaCard: 'border border-gray-200 shadow-xs hover:border-emerald-400',
        escopo: 'Etapa 1: Mapeamento de carga elétrica existente e teste de isolamento;\nEtapa 2: Instalação de quadro DIN de embutir 12 módulos com barramento bifásico;\nEtapa 3: Substituição total da fiação por cabos antichama alta performance;\nEtapa 4: Instalação de dispositivo DPS (proteção contra raios) e DR (proteção contra choques);\nEtapa 5: Entrega técnica com laudo de conformidade NBR 5410.',
        itens: [
          { descricao: 'Quadro de Distribuição 12 Módulos Tigre', quantidade: 1, valorUnitario: 45.00, subtotal: 45.00 },
          { descricao: 'Disjuntores Bipolares DIN Schneider', quantidade: 3, valorUnitario: 25.00, subtotal: 75.00 },
          { descricao: 'Barramento Pente Bifásico de Cobre 12M', quantidade: 1, valorUnitario: 40.00, subtotal: 40.00 }
        ],
        maoDeObra: 520.00,
        material: 160.00,
        deslocamento: 0.00,
        total: 680.00,
        prazo: '1 dia (Emergencial Prioritário)',
        garantia: '365 dias (1 ano completo com suporte)',
        chavePix: '11987654321',
        status: (demoState.propostaAceitaCenario1 === 'prop_roberto') ? 'APROVADO' : (demoState.propostaAceitaCenario1 ? 'REPROVADO' : 'AGUARDANDO')
      },
      {
        id: 'prop_luz',
        prestador: 'Luz & Força MEI',
        iniciais: 'LF',
        corAvatar: 'bg-amber-100 text-amber-600',
        nota: 4.7,
        avaliacoes: 38,
        destaque: 'PROPOSTA ECONÔMICA',
        corDestaque: 'bg-amber-600 text-white',
        bordaCard: 'border border-gray-200 shadow-xs hover:border-amber-400',
        escopo: 'Etapa 1: Inspeção preliminar e desativação da rede;\nEtapa 2: Passagem de novos condutores nos eletrodutos;\nEtapa 3: Instalação do quadro e ligação de 6 disjuntores monofásicos;\nEtapa 4: Teste de continuidade e balanceamento das fases.',
        itens: [
          { descricao: 'Cabos 4mm e 6mm Cobre Puro', quantidade: 2, valorUnitario: 75.00, subtotal: 150.00 },
          { descricao: 'Disjuntores Unipolares Tramontina', quantidade: 6, valorUnitario: 10.00, subtotal: 60.00 }
        ],
        maoDeObra: 400.00,
        material: 210.00,
        deslocamento: 40.00,
        total: 650.00,
        prazo: '3 dias úteis',
        garantia: '90 dias (conforme CDC)',
        chavePix: 'luzeforca@mei.com.br',
        status: (demoState.propostaAceitaCenario1 === 'prop_luz') ? 'APROVADO' : (demoState.propostaAceitaCenario1 ? 'REPROVADO' : 'AGUARDANDO')
      }
    ];

    // Mural Comparativo de Concorrência
    conteudoSubAba = `
      <div class="space-y-5 animate-fadeIn">
        <div class="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-400/30">
          <div class="flex items-center gap-2 mb-1">
            <span class="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Demanda em Análise</span>
            <span class="text-xs text-blue-200">ID: solic_demo_eletrica_01</span>
          </div>
          <h4 class="text-lg font-bold">Troca Completa de Fiação e Instalação de Quadro com Barramento Bifásico</h4>
          <p class="text-xs text-blue-100 mt-1 max-w-2xl">
            Imóvel residencial antigo em São Paulo necessitando substituição de cabos de 2.5mm para 4mm/6mm, disjuntores DIN e aterramento TT.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Comparativo de Propostas Concorrentes Recebidas (3 Orçamentos)
            </h4>
            <p class="text-xs text-gray-500">Clique em "Ver Especificação Completa" para inspecionar peças, escopo e fatura antes de contratar.</p>
          </div>
          <span class="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-bold">
            Sigilo Concorrencial Ativo
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${propostasCenario1.map(p => {
            const isAprovado = p.status === 'APROVADO';
            return `
              <div class="bg-white ${p.bordaCard} rounded-2xl p-5 flex flex-col justify-between relative transition-all">
                ${p.destaque ? `
                  <span class="absolute -top-3 right-4 ${p.corDestaque} text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    ${p.destaque}
                  </span>
                ` : ''}

                <div>
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full ${p.corAvatar} flex items-center justify-center font-bold text-sm">
                      ${p.iniciais}
                    </div>
                    <div>
                      <h5 class="text-sm font-bold text-gray-900">${p.prestador}</h5>
                      <div class="flex items-center text-xs text-amber-500 font-bold gap-1">
                        <i class="fas fa-star text-[10px]"></i> ${p.nota.toFixed(1)} <span class="text-gray-400 font-normal">(${p.avaliacoes} avaliações)</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 mb-3 border border-gray-100">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Mão de Obra:</span>
                      <span class="font-bold text-gray-800">R$ ${p.maoDeObra.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Materiais & Peças:</span>
                      <span class="font-bold text-gray-800">R$ ${p.material.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Deslocamento:</span>
                      <span class="font-bold ${p.deslocamento === 0 ? 'text-emerald-600' : 'text-gray-800'}">
                        ${p.deslocamento === 0 ? 'Grátis' : `R$ ${p.deslocamento.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <div class="flex justify-between border-t border-gray-200 pt-1 text-gray-500">
                      <span>Prazo:</span>
                      <span class="font-semibold text-gray-700">${p.prazo}</span>
                    </div>
                    <div class="flex justify-between text-gray-500">
                      <span>Garantia:</span>
                      <span class="font-semibold text-emerald-700">${p.garantia}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-baseline mb-3">
                    <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">TOTAL:</span>
                    <span class="text-2xl font-black text-gray-900">R$ ${p.total.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <!-- Botão 1: Especificação Completa & Fatura -->
                  <button type="button" class="btn-ver-especificacao-proposta w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all mb-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs" data-prop-id="${p.id}">
                    <i class="fas fa-file-invoice text-indigo-600"></i> Ver Especificação & Fatura
                  </button>

                  <!-- Botão 2: Aceite da Proposta ou Fatura Pix Liberada -->
                  ${isAprovado ? `
                    <button type="button" class="btn-ver-fatura-pix-aprovada w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5" data-prop-id="${p.id}">
                      <i class="fab fa-pix"></i> Proposta Aceita • Ver Pix / PDF
                    </button>
                  ` : `
                    <button type="button" class="btn-simular-aceite-proposta w-full py-2.5 ${p.destaque === 'MAIS RECOMENDADA' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'} text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5" data-prop-id="${p.id}" data-prestador="${p.prestador}" data-valor="R$ ${p.total.toFixed(2).replace('.', ',')}">
                      <i class="fas fa-check-circle"></i> Aceitar Esta Proposta
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Card do Perfil do Solicitante -->
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
            JM
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="text-lg font-bold text-gray-900">Juliana Mendes da Silva</h3>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <i class="fas fa-check-circle text-emerald-500 mr-1"></i> CPF Validado
              </span>
            </div>
            <p class="text-xs text-gray-500 flex items-center gap-3">
              <span><i class="fas fa-id-card text-gray-400 mr-1"></i> CPF: ***.748.291-**</span>
              <span><i class="fas fa-map-marker-alt text-gray-400 mr-1"></i> São Paulo - SP</span>
              <span><i class="fas fa-user-tag text-gray-400 mr-1"></i> Solicitante Puro (Sem pontos de ranking)</span>
            </p>
          </div>
        </div>

        <!-- Seletor de Sub-Abas do Cenário 1 com barra de rolagem suave quando necessário -->
        <div class="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto menu-scrollbar pb-1">
          <button type="button" class="btn-subaba-c1 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'solicitacoes' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="solicitacoes">
            Minhas Demandas
          </button>
          <button type="button" class="btn-subaba-c1 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'catalogo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="catalogo">
            Catálogo Avulso
          </button>
          <button type="button" class="btn-subaba-c1 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'concorrencia' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="concorrencia">
            Mural Concorrência
          </button>
        </div>
      </div>

      <!-- Conteúdo da Sub-Aba -->
      ${conteudoSubAba}
    </div>
  `;

  // Bind eventos da sub-aba
  container.querySelectorAll('.btn-subaba-c1').forEach(b => {
    b.addEventListener('click', () => {
      demoState.subAbaCenario1 = b.getAttribute('data-subaba');
      renderizarCenario1Solicitante(container);
    });
  });

  // Bind ver concorrencia
  container.querySelectorAll('.btn-ver-concorrencia-cenario').forEach(b => {
    b.addEventListener('click', () => {
      demoState.subAbaCenario1 = 'concorrencia';
      renderizarCenario1Solicitante(container);
    });
  });

  // Bind simular contratação direta com Toast
  container.querySelectorAll('.btn-simular-contratacao-direta').forEach(b => {
    b.addEventListener('click', () => {
      const titulo = b.getAttribute('data-titulo');
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao('sucesso', 'Serviço Contratado!', `A contratação direta de "${titulo}" foi registrada com sucesso! Acompanhe em "Minhas Demandas".`);
      }
    });
  });

  // Função interna para aceitar proposta e liberar fatura Pix
  const aceitarPropostaDemo = (propId) => {
    demoState.propostaAceitaCenario1 = propId;
    const p = propostasCenario1.find(item => item.id === propId);
    if (!p) return;

    if (typeof window.mostrarNotificacao === 'function') {
      window.mostrarNotificacao(
        'sucesso',
        'Proposta Comercial Aprovada!',
        `Parabéns! A proposta de ${p.prestador} no valor de R$ ${p.total.toFixed(2).replace('.', ',')} foi aceita. O demonstrativo Pix e fatura foram liberados!`
      );
    }

    if (typeof window.abrirModalPix === 'function') {
      window.abrirModalPix(
        `Contratação Aprovada: ${p.prestador}`,
        `R$ ${p.total.toFixed(2).replace('.', ',')}`,
        p.chavePix,
        p.prestador,
        {
          escopo: p.escopo,
          itens: p.itens,
          maoDeObra: p.maoDeObra,
          material: p.material,
          deslocamento: p.deslocamento,
          prazo: p.prazo,
          garantia: p.garantia,
          somenteEspecificacao: false
        }
      );
    }

    renderizarCenario1Solicitante(container);
  };

  // Bind botão "Ver Especificação Completa & Fatura"
  container.querySelectorAll('.btn-ver-especificacao-proposta').forEach(b => {
    b.addEventListener('click', () => {
      const propId = b.getAttribute('data-prop-id');
      const p = propostasCenario1.find(item => item.id === propId);
      if (!p) return;

      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          `Especificação Técnica & Orçamento: ${p.prestador}`,
          `R$ ${p.total.toFixed(2).replace('.', ',')}`,
          p.chavePix,
          p.prestador,
          {
            escopo: p.escopo,
            itens: p.itens,
            maoDeObra: p.maoDeObra,
            material: p.material,
            deslocamento: p.deslocamento,
            prazo: p.prazo,
            garantia: p.garantia,
            somenteEspecificacao: p.status !== 'APROVADO',
            onAceitar: () => aceitarPropostaDemo(p.id)
          }
        );
      }
    });
  });

  // Bind botão "Aceitar Esta Proposta"
  container.querySelectorAll('.btn-simular-aceite-proposta').forEach(b => {
    b.addEventListener('click', () => {
      const propId = b.getAttribute('data-prop-id');
      aceitarPropostaDemo(propId);
    });
  });

  // Bind botão "Proposta Aceita • Ver Pix / PDF"
  container.querySelectorAll('.btn-ver-fatura-pix-aprovada').forEach(b => {
    b.addEventListener('click', () => {
      const propId = b.getAttribute('data-prop-id');
      const p = propostasCenario1.find(item => item.id === propId);
      if (!p) return;

      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          `Fatura Comercial & Pagamento Pix: ${p.prestador}`,
          `R$ ${p.total.toFixed(2).replace('.', ',')}`,
          p.chavePix,
          p.prestador,
          {
            escopo: p.escopo,
            itens: p.itens,
            maoDeObra: p.maoDeObra,
            material: p.material,
            deslocamento: p.deslocamento,
            prazo: p.prazo,
            garantia: p.garantia,
            somenteEspecificacao: false
          }
        );
      }
    });
  });
}

/**
 * CENÁRIO 2: PRESTADOR PURO (Autônomo / MEI / Empresa)
 */
function renderizarCenario2Prestador(container) {
  const subAba = demoState.subAbaCenario2 || 'perfil';
  const statusOcupacao = demoState.statusOcupacaoCenario2 || 'Disponível Imediatamente';
  const filtroStatus = demoState.filtroPropostasCenario2 || 'TODOS';

  // Propostas enviadas pelo prestador demo
  const propostasEnviadas = [
    {
      id: 'prop_01',
      solicitacaoTitulo: 'Instalação de Ar-Condicionado Split 12.000 BTUs',
      cliente: 'Mariana Azevedo',
      escopo: 'Etapa 1: Fixação dos suportes e furação;\nEtapa 2: Tubulação de cobre e isolamento térmico;\nEtapa 3: Vácuo com bomba e testes de vazamento.',
      maoDeObra: 380.00,
      material: 140.00,
      outrosCustos: 40.00,
      total: 560.00,
      prazo: 1,
      garantia: '365 dias',
      status: 'APROVADO'
    },
    {
      id: 'prop_02',
      solicitacaoTitulo: 'Troca de Disjuntores e Quadro de Luz Residencial',
      cliente: 'Fernando Costa',
      escopo: 'Etapa 1: Inspeção termográfica;\nEtapa 2: Substituição de 4 disjuntores DIN;\nEtapa 3: Aperto de barramento e balanceamento.',
      maoDeObra: 280.00,
      material: 160.00,
      outrosCustos: 30.00,
      total: 470.00,
      prazo: 1,
      garantia: '180 dias',
      status: 'AGUARDANDO'
    },
    {
      id: 'prop_03',
      solicitacaoTitulo: 'Instalação de 8 Luminárias LED de Embutir',
      cliente: 'Patrícia Rocha',
      escopo: 'Recorte em gesso, cabeamento paralelo e fixação de spots.',
      maoDeObra: 200.00,
      material: 90.00,
      outrosCustos: 0.00,
      total: 290.00,
      prazo: 1,
      garantia: '90 dias',
      status: 'REPROVADO'
    }
  ];

  const propostasFiltradas = filtroStatus === 'TODOS' ? 
    propostasEnviadas : propostasEnviadas.filter(p => p.status === filtroStatus);

  let conteudoSubAba = '';

  if (subAba === 'perfil') {
    conteudoSubAba = `
      <div class="space-y-5 animate-fadeIn">
        <!-- Status de Ocupação e Credibilidade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Card de Ocupação -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status de Ocupação & Agenda</h4>
            <div class="flex items-center gap-2 mb-4">
              <span class="w-3 h-3 rounded-full ${statusOcupacao.includes('Disponível') ? 'bg-emerald-500 animate-pulse' : (statusOcupacao.includes('lotada') ? 'bg-amber-500' : 'bg-gray-400')}"></span>
              <span class="text-base font-bold text-gray-900">${statusOcupacao}</span>
            </div>
            <p class="text-xs text-gray-500 mb-3">Defina sua disponibilidade para novos atendimentos na região:</p>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" class="btn-mudar-ocupacao text-center px-2 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${statusOcupacao === 'Disponível Imediatamente' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}" data-status="Disponível Imediatamente">
                <i class="fas fa-check-circle text-emerald-600 block text-sm mb-1"></i> Disponível
              </button>
              <button type="button" class="btn-mudar-ocupacao text-center px-2 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${statusOcupacao === 'Agenda Lotada (3 dias)' ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}" data-status="Agenda Lotada (3 dias)">
                <i class="fas fa-clock text-amber-600 block text-sm mb-1"></i> Agenda Cheia
              </button>
              <button type="button" class="btn-mudar-ocupacao text-center px-2 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${statusOcupacao === 'Indisponível Temporariamente' ? 'bg-gray-100 border-gray-400 text-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}" data-status="Indisponível Temporariamente">
                <i class="fas fa-ban text-gray-500 block text-sm mb-1"></i> Indisponível
              </button>
            </div>
          </div>

          <!-- Indicador de Credibilidade / Score -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Índice de Credibilidade</h4>
              <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Score 98/100</span>
            </div>
            <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style="width: 98%"></div>
            </div>
            <div class="space-y-1.5 text-xs text-gray-600">
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-emerald-500 text-xs"></i> <span>CNPJ ativo e verificado na Receita Federal</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-emerald-500 text-xs"></i> <span>2 anos e 8 meses de histórico contínuo</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-emerald-500 text-xs"></i> <span>52 avaliações reais verificadas (Média: 4.9⭐)</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-emerald-500 text-xs"></i> <span>Tempo médio de resposta a orçamentos: 14 minutos</span></div>
            </div>
          </div>
        </div>

        <!-- Horários de Atendimento e Bio -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <h4 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fas fa-calendar-alt text-indigo-600"></i> Horários e Regimes de Atendimento
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span class="font-bold text-gray-900 block mb-1">Dias Úteis:</span>
              <span class="text-gray-600">Segunda a Sexta: 08:00 às 18:00</span>
            </div>
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span class="font-bold text-gray-900 block mb-1">Fins de Semana:</span>
              <span class="text-gray-600">Plantão aos Sábados: 08:00 às 14:00</span>
            </div>
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span class="font-bold text-gray-900 block mb-1">Regime Emergencial:</span>
              <span class="text-emerald-700 font-semibold">Atendimento Noturno 24h sob consulta</span>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-3">
            <span class="font-bold text-xs text-gray-900 block mb-1">Especialidades Cadastradas:</span>
            <div class="flex flex-wrap gap-1.5">
              <span class="bg-indigo-50 text-indigo-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">Elétrica Predial NBR 5410</span>
              <span class="bg-indigo-50 text-indigo-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">Automação Residencial</span>
              <span class="bg-indigo-50 text-indigo-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">Ar-Condicionado Split & Inverter</span>
              <span class="bg-indigo-50 text-indigo-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">Padrão de Entrada Enel</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (subAba === 'propostas') {
    conteudoSubAba = `
      <div class="space-y-4 animate-fadeIn">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Histórico de Propostas Enviadas (${propostasFiltradas.length})
          </h4>
          
          <!-- Filtro de Status -->
          <div class="flex p-1 bg-gray-100 rounded-xl text-xs overflow-x-auto w-full sm:w-auto">
            ${['TODOS', 'AGUARDANDO', 'APROVADO', 'REPROVADO'].map(st => `
              <button type="button" class="btn-filtro-prop px-3 py-1 rounded-lg font-bold transition-all ${filtroStatus === st ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-status="${st}">
                ${st}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="space-y-3">
          ${propostasFiltradas.map(p => {
            let badgeStatus = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">AGUARDANDO DECISÃO</span>';
            if (p.status === 'APROVADO') badgeStatus = '<span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">APROVADO PELO CLIENTE</span>';
            if (p.status === 'REPROVADO') badgeStatus = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800">REPROVADO</span>';

            return `
              <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                <div class="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h5 class="text-base font-bold text-gray-900 mb-0.5">${p.solicitacaoTitulo}</h5>
                    <span class="text-xs text-gray-500">Cliente: <b>${p.cliente}</b></span>
                  </div>
                  ${badgeStatus}
                </div>

                <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 my-3 border border-gray-100">
                  <span class="font-bold text-gray-900 block mb-1">Escopo discriminado:</span>
                  <p class="whitespace-pre-line text-gray-600 mb-2">${p.escopo}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200 text-[11px]">
                    <div><span>Mão de Obra:</span><br><b class="text-gray-900">R$ ${p.maoDeObra.toFixed(2)}</b></div>
                    <div><span>Materiais:</span><br><b class="text-gray-900">R$ ${p.material.toFixed(2)}</b></div>
                    <div><span>Deslocamento:</span><br><b class="text-gray-900">R$ ${p.outrosCustos.toFixed(2)}</b></div>
                    <div><span>Prazo & Garantia:</span><br><b class="text-gray-900">${p.prazo} dia(s) (${p.garantia})</b></div>
                  </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                  <div>
                    <span class="text-[10px] text-gray-400 font-bold uppercase block">Valor Total</span>
                    <span class="text-xl font-black text-gray-900">R$ ${p.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  ${p.status === 'APROVADO' ? `
                    <button type="button" class="btn-abrir-fatura-prestador px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5" data-titulo="${p.solicitacaoTitulo}" data-valor="R$ ${p.total.toFixed(2).replace('.', ',')}">
                      <i class="fab fa-pix"></i> Demonstrativo Pix & PDF
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (subAba === 'oportunidades') {
    // Módulo de Oportunidades Abertas (Demandas para o Prestador Formular Proposta)
    conteudoSubAba = `
      <div class="space-y-4 animate-fadeIn">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
          <div>
            <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Mural de Oportunidades (Demandas em Aberto)</h4>
            <p class="text-xs text-gray-500">Demandas reais publicadas por solicitantes. Formule orçamentos estruturados com sigilo concorrencial garantido.</p>
          </div>
          <span class="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <i class="fas fa-lock text-[10px]"></i> Sigilo Concorrencial Ativo
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <!-- Oportunidade 1 -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Elétrica Residencial</span>
                  <span class="text-xs text-gray-400"><i class="fas fa-map-marker-alt mr-1"></i> São Paulo, SP (Jardins)</span>
                </div>
                <h5 class="text-base font-bold text-gray-900">Troca Completa de Fiação e Instalação de Quadro DIN Bifásico</h5>
                <p class="text-xs text-gray-600 mt-1">Imóvel residencial antigo necessitando substituição de cabos 2.5mm para 4mm/6mm, disjuntores DIN e aterramento TT.</p>
              </div>
              <div class="shrink-0">
                <button type="button" class="btn-abrir-form-orcamento px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2" data-demanda-id="demanda_eletrica" data-demanda-titulo="Troca Completa de Fiação e Quadro DIN">
                  <i class="fas fa-calculator"></i> Formular Proposta
                </button>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-3 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
              <span>Publicado por: <b>Juliana Mendes da Silva (Solicitante)</b></span>
              <span class="text-indigo-600 font-semibold"><i class="fas fa-shield-alt mr-1"></i> Propostas concorrentes são ocultadas entre prestadores</span>
            </div>
          </div>

          <!-- Oportunidade 2 -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">Climatização & Refrigeração</span>
                  <span class="text-xs text-gray-400"><i class="fas fa-map-marker-alt mr-1"></i> Santana, São Paulo - SP</span>
                </div>
                <h5 class="text-base font-bold text-gray-900">Higienização e Carga de Gás em 2 Aparelhos Split 12.000 BTUs</h5>
                <p class="text-xs text-gray-600 mt-1">Limpeza profunda de serpentinas e turbinas com bactericida e reposição de gás R410A.</p>
              </div>
              <div class="shrink-0">
                <button type="button" class="btn-abrir-form-orcamento px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2" data-demanda-id="demanda_ar" data-demanda-titulo="Higienização e Carga de Gás Split">
                  <i class="fas fa-calculator"></i> Formular Proposta
                </button>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-3 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
              <span>Publicado por: <b>Clínica Odontológica Dra. Camila (PJ Solicitante)</b></span>
              <span class="text-indigo-600 font-semibold"><i class="fas fa-shield-alt mr-1"></i> Emissão de Fatura / Nota Fiscal solicitada</span>
            </div>
          </div>
        </div>

        <!-- Painel / Modal Interativo de Formulação de Orçamento -->
        <div id="painel-formular-orcamento" class="hidden bg-gray-50 border-2 border-indigo-200 rounded-2xl p-5 sm:p-6 shadow-sm mt-4">
          <div class="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
            <div>
              <span class="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">Formulação de Proposta Formal</span>
              <h4 id="form-orcamento-titulo-demanda" class="text-base font-bold text-gray-900 mt-1">Elaborar Orçamento Comercial</h4>
            </div>
            <button type="button" id="btn-fechar-form-orcamento" class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Mão de Obra (R$)</label>
                <input type="number" id="input-orc-mao-obra" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500" value="480.00" step="10">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Materiais / Peças (R$)</label>
                <input type="number" id="input-orc-materiais" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500" value="150.00" step="10">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Taxa Deslocamento (R$)</label>
                <input type="number" id="input-orc-deslocamento" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500" value="30.00" step="5">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Prazo de Execução (Dias)</label>
                <input type="number" id="input-orc-prazo" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500" value="2" min="1">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Garantia Técnica Oferecida</label>
                <select id="input-orc-garantia" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500">
                  <option value="90 dias">90 dias (Garantia Legal CDC)</option>
                  <option value="180 dias" selected>180 dias (6 meses de cobertura)</option>
                  <option value="365 dias (1 ano)">365 dias (1 ano de cobertura)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Escopo discriminado das etapas técnicas:</label>
              <textarea id="input-orc-escopo" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500">Etapa 1: Inspeção e isolamento preventivo;
Etapa 2: Substituição da fiação conforme norma NBR 5410;
Etapa 3: Instalação de barramento bifásico e teste de carga em todos os circuitos.</textarea>
            </div>

            <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span class="text-[10px] text-indigo-700 uppercase font-bold block">Valor Total Calculado</span>
                <span id="label-orc-total-calculado" class="text-xl font-black text-indigo-900">R$ 660,00</span>
              </div>
              <button type="button" id="btn-enviar-proposta-formal" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2">
                <i class="fas fa-paper-plane"></i> Enviar Proposta ao Solicitante
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Módulo de Orçamentos Pré-formatados (Templates)
    conteudoSubAba = `
      <div class="space-y-4 animate-fadeIn">
        <div class="flex justify-between items-center mb-2">
          <div>
            <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Orçamentos Pré-formatados (Templates Salvos)</h4>
            <p class="text-xs text-gray-500">Propostas modelo estruturadas prontas para vinculação e envio instantâneo</p>
          </div>
          <span class="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg font-bold">
            4 Modelos Ativos
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Template 1 -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md uppercase">Climatização</span>
                <span class="text-xs font-bold text-gray-500">Prazo: 1 dia</span>
              </div>
              <h5 class="text-base font-bold text-gray-900 mb-1.5">Instalação de Ar-Condicionado Split (até 12.000 BTUs)</h5>
              <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-3 border border-gray-100">
                <span class="font-bold text-gray-900 block mb-1">Escopo das 3 Etapas:</span>
                <p>1. Suportes e furação; 2. Linha de cobre com isolamento térmico; 3. Teste de estanqueidade e vácuo.</p>
                <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between text-[11px] font-semibold">
                  <span>Mão de Obra: R$ 380,00</span>
                  <span>Insumos: R$ 140,00</span>
                </div>
              </div>
            </div>
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Total Padrão</span>
                <span class="text-xl font-black text-gray-900">R$ 520,00</span>
              </div>
              <button type="button" class="btn-copiar-template px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs" data-tpl="ar">
                <i class="far fa-copy mr-1"></i> Usar Modelo
              </button>
            </div>
          </div>

          <!-- Template 2 -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md uppercase">Elétrica</span>
                <span class="text-xs font-bold text-gray-500">Prazo: 1 dia</span>
              </div>
              <h5 class="text-base font-bold text-gray-900 mb-1.5">Revisão Elétrica e Troca de Disjuntores DIN</h5>
              <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-3 border border-gray-100">
                <span class="font-bold text-gray-900 block mb-1">Escopo das 3 Etapas:</span>
                <p>1. Inspeção de circuitos; 2. Substituição de 4 disjuntores DIN; 3. Balanceamento de cargas e testes.</p>
                <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between text-[11px] font-semibold">
                  <span>Mão de Obra: R$ 280,00</span>
                  <span>Insumos: R$ 160,00</span>
                </div>
              </div>
            </div>
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Total Padrão</span>
                <span class="text-xl font-black text-gray-900">R$ 440,00</span>
              </div>
              <button type="button" class="btn-copiar-template px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs" data-tpl="eletrica">
                <i class="far fa-copy mr-1"></i> Usar Modelo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Card do Perfil do Prestador -->
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
            MV
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 class="text-lg font-bold text-gray-900">Marcos Vinicius Santos</h3>
              <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                <i class="fas fa-certificate text-blue-500 mr-1"></i> CNPJ MEI Verificado
              </span>
            </div>
            <p class="text-xs text-gray-500 flex items-center gap-3 flex-wrap">
              <span><b>M.V. Climatização & Elétrica MEI</b> (CNPJ: 45.892.120/0001-90)</span>
              <span><i class="fas fa-map-marker-alt text-gray-400 mr-1"></i> São Paulo e Região</span>
              <span class="text-amber-600 font-bold"><i class="fas fa-star text-[10px]"></i> 4.9⭐ (52 avaliações)</span>
            </p>
          </div>
        </div>

        <!-- Seletor de Sub-Abas do Cenário 2 com barra de rolagem suave quando necessário -->
        <div class="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto menu-scrollbar pb-1">
          <button type="button" class="btn-subaba-c2 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'perfil' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="perfil">
            Perfil & Agenda
          </button>
          <button type="button" class="btn-subaba-c2 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'propostas' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="propostas">
            Histórico Propostas
          </button>
          <button type="button" class="btn-subaba-c2 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'oportunidades' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="oportunidades">
            Oportunidades de Orçar
          </button>
          <button type="button" class="btn-subaba-c2 flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subAba === 'templates' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-subaba="templates">
            Templates Salvos
          </button>
        </div>
      </div>

      <!-- Conteúdo da Sub-Aba -->
      ${conteudoSubAba}
    </div>
  `;

  // Bind eventos da sub-aba
  container.querySelectorAll('.btn-subaba-c2').forEach(b => {
    b.addEventListener('click', () => {
      demoState.subAbaCenario2 = b.getAttribute('data-subaba');
      renderizarCenario2Prestador(container);
    });
  });

  // Bind mudança de ocupação
  container.querySelectorAll('.btn-mudar-ocupacao').forEach(b => {
    b.addEventListener('click', () => {
      demoState.statusOcupacaoCenario2 = b.getAttribute('data-status');
      renderizarCenario2Prestador(container);
    });
  });

  // Bind filtros de propostas
  container.querySelectorAll('.btn-filtro-prop').forEach(b => {
    b.addEventListener('click', () => {
      demoState.filtroPropostasCenario2 = b.getAttribute('data-status');
      renderizarCenario2Prestador(container);
    });
  });

  // Bind abrir fatura prestador via Modal Pix elegante
  container.querySelectorAll('.btn-abrir-fatura-prestador').forEach(b => {
    b.addEventListener('click', () => {
      const tit = b.getAttribute('data-titulo');
      const val = b.getAttribute('data-valor');
      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          `Demonstrativo & Fatura Pix: ${tit}`,
          val,
          '11987654321',
          'Marcos Vinicius Santos (M.V. Climatização)',
          {
            escopo: '1. Desmontagem e isolamento;\n2. Execução técnica especializada;\n3. Teste de conformidade e emissão de garantia.',
            itens: [
              { descricao: 'Mão de Obra Certificada NBR', preco: 380.00 },
              { descricao: 'Insumos de Fixação e Conexão', preco: 140.00 }
            ],
            maoDeObra: 380.00,
            material: 140.00,
            deslocamento: 0.00,
            prazo: '1 dia útil',
            garantia: '180 dias',
            somenteEspecificacao: false
          }
        );
      }
    });
  });

  // Bind abrir form de formulacao de orcamento na sub-aba oportunidades
  const painelForm = container.querySelector('#painel-formular-orcamento');
  if (painelForm) {
    container.querySelectorAll('.btn-abrir-form-orcamento').forEach(b => {
      b.addEventListener('click', () => {
        const demTitulo = b.getAttribute('data-demanda-titulo');
        const titElem = container.querySelector('#form-orcamento-titulo-demanda');
        if (titElem) titElem.textContent = `Proposta para: ${demTitulo}`;
        painelForm.classList.remove('hidden');
        painelForm.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const btnFechar = container.querySelector('#btn-fechar-form-orcamento');
    if (btnFechar) {
      btnFechar.addEventListener('click', () => {
        painelForm.classList.add('hidden');
      });
    }

    // Recalcular total dinâmico no form
    const inputMao = container.querySelector('#input-orc-mao-obra');
    const inputMat = container.querySelector('#input-orc-materiais');
    const inputDes = container.querySelector('#input-orc-deslocamento');
    const lblTotal = container.querySelector('#label-orc-total-calculado');

    const recalcularTotal = () => {
      const m = parseFloat(inputMao?.value || 0);
      const mat = parseFloat(inputMat?.value || 0);
      const d = parseFloat(inputDes?.value || 0);
      const total = m + mat + d;
      if (lblTotal) lblTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    [inputMao, inputMat, inputDes].forEach(inp => inp?.addEventListener('input', recalcularTotal));

    // Enviar Proposta
    const btnEnviar = container.querySelector('#btn-enviar-proposta-formal');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', () => {
        const m = parseFloat(inputMao?.value || 0);
        const mat = parseFloat(inputMat?.value || 0);
        const d = parseFloat(inputDes?.value || 0);
        const total = m + mat + d;
        const prazo = container.querySelector('#input-orc-prazo')?.value || '2';
        const garantia = container.querySelector('#input-orc-garantia')?.value || '180 dias';
        const escopo = container.querySelector('#input-orc-escopo')?.value || 'Serviço técnico especializado';

        // Inserir no histórico de propostas da demonstração
        propostasEnviadas.unshift({
          id: `prop_nova_${Date.now()}`,
          solicitacaoTitulo: 'Troca Completa de Fiação e Quadro DIN',
          cliente: 'Juliana Mendes da Silva',
          escopo: escopo,
          maoDeObra: m,
          material: mat,
          outrosCustos: d,
          total: total,
          prazo: parseInt(prazo),
          garantia: garantia,
          status: 'AGUARDANDO'
        });

        if (typeof window.mostrarNotificacao === 'function') {
          window.mostrarNotificacao(
            'sucesso',
            'Proposta Comercial Enviada!',
            `Seu orçamento de R$ ${total.toFixed(2).replace('.', ',')} foi transmitido ao solicitante com sigilo concorrencial ativo. Acompanhe a decisão em "Histórico Propostas".`
          );
        }

        demoState.subAbaCenario2 = 'propostas';
        renderizarCenario2Prestador(container);
      });
    }
  }

  // Bind copiar template
  container.querySelectorAll('.btn-copiar-template').forEach(b => {
    b.addEventListener('click', () => {
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao(
          'sucesso',
          'Modelo Carregado!',
          'Os parâmetros deste template (escopo técnico, etapas, mão de obra e insumos padrão) foram importados com sucesso.'
        );
      }
    });
  });
}

/**
 * CENÁRIO 3: PERFIL MISTO (AMBOS - Contratante & Prestador)
 */
function renderizarCenario3Misto(container) {
  const visao = demoState.subAbaCenario3 || 'contratante';

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Card do Perfil Misto com Toggle Switch -->
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
            AF
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="text-lg font-bold text-gray-900">Ana Carolina Ferraz</h3>
              <span class="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                Perfil Dual: Ambos
              </span>
            </div>
            <p class="text-xs text-gray-500">
              Contratante de reformas residenciais & Consultora Técnica de Interiores
            </p>
          </div>
        </div>

        <!-- Toggle Switch Unificado -->
        <div class="flex items-center p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button type="button" class="btn-toggle-misto flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${visao === 'contratante' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-visao="contratante">
            <i class="fas fa-shopping-cart text-emerald-600"></i> Visão Solicitante
          </button>
          <button type="button" class="btn-toggle-misto flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${visao === 'prestador' ? 'bg-white text-indigo-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'}" data-visao="prestador">
            <i class="fas fa-briefcase text-indigo-600"></i> Visão Prestadora
          </button>
        </div>
      </div>

      <!-- Conteúdo dependente da visão selecionada -->
      <div class="animate-fadeIn">
        ${visao === 'contratante' ? `
          <div class="space-y-4">
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h4 class="text-sm font-bold text-emerald-900">Ambiente do Contratante Ativo</h4>
                <p class="text-xs text-emerald-700">Você está navegando como cliente: gerenciando reformas e contratando profissionais.</p>
              </div>
              <button type="button" id="btn-c3-nova-solicitacao" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer">
                + Nova Solicitação
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">Em Andamento</span>
                <h5 class="text-sm font-bold text-gray-900 mt-2 mb-1">Reforma e Pintura de Sala Comercial</h5>
                <p class="text-xs text-gray-500 mb-3">Contratado com: M.V. Climatização & Pintura (R$ 1.250,00)</p>
                <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span class="text-gray-500">Status: Execução</span>
                  <button type="button" id="btn-c3-fatura-reforma" class="text-emerald-600 font-bold hover:underline cursor-pointer">Ver Fatura Pix</button>
                </div>
              </div>
              <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Aguardando Propostas</span>
                <h5 class="text-sm font-bold text-gray-900 mt-2 mb-1">Instalação de Bancadas e Porcelanato</h5>
                <p class="text-xs text-gray-500 mb-3">Recebeu 2 propostas de pedreiros locais.</p>
                <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span class="text-gray-500">2 Propostas</span>
                  <button type="button" id="btn-c3-comparar-bancadas" class="text-indigo-600 font-bold hover:underline cursor-pointer">Comparar Propostas</button>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div class="space-y-4">
            <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h4 class="text-sm font-bold text-indigo-900">Ambiente da Prestadora Ativo</h4>
                <p class="text-xs text-indigo-700">Você está navegando como profissional: emitindo orçamentos de consultoria e acompanhamento.</p>
              </div>
              <span class="text-xs bg-white text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg font-bold">
                Reputação: 4.8⭐ (31 avaliações)
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Proposta Aceita</span>
                <h5 class="text-sm font-bold text-gray-900 mt-2 mb-1">Consultoria de Layout e Iluminação Residencial</h5>
                <p class="text-xs text-gray-500 mb-3">Cliente: Roberto Camargo &bull; R$ 850,00</p>
                <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span class="text-gray-500">Prazo: 5 dias</span>
                  <button type="button" id="btn-c3-fatura-consultoria" class="text-emerald-700 font-bold hover:underline cursor-pointer">Cobrança Pix</button>
                </div>
              </div>
              <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Nova Demanda Compatível</span>
                <h5 class="text-sm font-bold text-gray-900 mt-2 mb-1">Projeto de Interiores para Apartamento Compacto</h5>
                <p class="text-xs text-gray-500 mb-3">Solicitante aguarda propostas de consultoria.</p>
                <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span class="text-gray-500">São Paulo, SP</span>
                  <button type="button" id="btn-c3-enviar-consultoria" class="text-indigo-600 font-bold hover:underline cursor-pointer">Enviar Proposta</button>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;

  // Bind toggle misto
  container.querySelectorAll('.btn-toggle-misto').forEach(b => {
    b.addEventListener('click', () => {
      demoState.subAbaCenario3 = b.getAttribute('data-visao');
      renderizarCenario3Misto(container);
    });
  });

  // Bind ações do Contratante sem alert()
  const btnNovaSol = container.querySelector('#btn-c3-nova-solicitacao');
  if (btnNovaSol) {
    btnNovaSol.addEventListener('click', () => {
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao('info', 'Nova Solicitação', 'Formulário aberto: descreva o escopo da sua reforma para receber orçamentos concorrentes.');
      }
    });
  }

  const btnFatReforma = container.querySelector('#btn-c3-fatura-reforma');
  if (btnFatReforma) {
    btnFatReforma.addEventListener('click', () => {
      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          'Fatura: Reforma e Pintura de Sala Comercial',
          'R$ 1.250,00',
          '11987654321',
          'M.V. Climatização & Pintura',
          {
            escopo: '1. Lixamento e preparação de superfícies;\n2. Aplicação de selador e massa corrida;\n3. Duas demãos de tinta acrílica acetinada.',
            itens: [
              { descricao: 'Mão de Obra de Pintura Especializada', preco: 950.00 },
              { descricao: 'Material (Massa, Fitas e Lixas)', preco: 300.00 }
            ],
            maoDeObra: 950.00,
            material: 300.00,
            deslocamento: 0.00,
            prazo: '3 dias úteis',
            garantia: '180 dias',
            somenteEspecificacao: false
          }
        );
      }
    });
  }

  const btnCompBancadas = container.querySelector('#btn-c3-comparar-bancadas');
  if (btnCompBancadas) {
    btnCompBancadas.addEventListener('click', () => {
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao('info', 'Comparador de Propostas', 'Carregando 2 propostas recebidas de profissionais com sigilo concorrencial.');
      }
    });
  }

  // Bind ações da Prestadora sem alert()
  const btnFatCons = container.querySelector('#btn-c3-fatura-consultoria');
  if (btnFatCons) {
    btnFatCons.addEventListener('click', () => {
      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          'Cobrança Comercial: Consultoria de Layout & Iluminação',
          'R$ 850,00',
          '11976543210',
          'Ana Carolina Ferraz (Arquiteta & Consultora)',
          {
            escopo: '1. Levantamento métrico e luminotécnico in loco;\n2. Elaboração de planta de paginação e luminárias 3D;\n3. Memorial de compras e catálogo de especificações.',
            itens: [
              { descricao: 'Honorários Técnicos de Projeto & Layout', preco: 750.00 },
              { descricao: 'Visita Técnica e Caderno de Especificações', preco: 100.00 }
            ],
            maoDeObra: 750.00,
            material: 100.00,
            deslocamento: 0.00,
            prazo: '5 dias úteis',
            garantia: 'Revisão técnica de 30 dias',
            somenteEspecificacao: false
          }
        );
      }
    });
  }

  const btnEnvCons = container.querySelector('#btn-c3-enviar-consultoria');
  if (btnEnvCons) {
    btnEnvCons.addEventListener('click', () => {
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao('sucesso', 'Formulação de Proposta', 'Estruturação de orçamento técnico aberta para envio ao solicitante.');
      }
    });
  }
}


// =============================================================================
// 1. ABA: RANKING DE DEMONSTRAÇÃO
// =============================================================================
function renderizarRanking(container) {
  let prestadores = [...demoState.prestadores];

  // Aplicar filtros
  if (demoState.filtros.categoria !== "todas") {
    prestadores = prestadores.filter(p => 
      p.categoriaPrincipal === demoState.filtros.categoria || 
      (p.categorias && p.categorias.includes(demoState.filtros.categoria))
    );
  }
  if (demoState.filtros.cidade !== "todas") {
    prestadores = prestadores.filter(p => 
      `${p.cidade} - ${p.estado || ''}`.includes(demoState.filtros.cidade) ||
      p.cidade === demoState.filtros.cidade
    );
  }
  if (demoState.filtros.prestadorId !== "todos") {
    prestadores = prestadores.filter(p => p.id === demoState.filtros.prestadorId);
  }

  // Ordenação decrescente por pontos (e por nota como critério de desempate)
  prestadores.sort((a, b) => {
    const ptA = a.pontos || a.pontuacao || 0;
    const ptB = b.pontos || b.pontuacao || 0;
    if (ptB !== ptA) return ptB - ptA;
    return (b.notaMedia || 0) - (a.notaMedia || 0);
  });

  if (prestadores.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
        <i class="fas fa-search text-3xl text-gray-400 mb-3"></i>
        <h4 class="font-bold text-gray-800">Nenhum prestador encontrado</h4>
        <p class="text-xs text-gray-500 mt-1">Ajuste os filtros acima para visualizar o ranking.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">Ranking Geral de Reputação dos Prestadores</h3>
          <p class="text-xs text-gray-500">Calculado a partir de serviços concluídos, orçamentos aprovados e média de avaliações reais recebidas.</p>
        </div>
        <div class="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 self-start">
          <i class="fas fa-award text-amber-600"></i> ${prestadores.length} Profissionais Ranqueados
        </div>
      </div>

      <div class="divide-y divide-gray-100">
  `;

  prestadores.forEach((p, index) => {
    const posicao = index + 1;
    let badgePosicao = `<span class="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-sm">${posicao}º</span>`;
    let bordaEspecial = "border-transparent";

    if (posicao === 1) {
      badgePosicao = `<span class="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-white font-extrabold flex items-center justify-center text-base shadow-sm"><i class="fas fa-trophy"></i></span>`;
      bordaEspecial = "bg-amber-50/40";
    } else if (posicao === 2) {
      badgePosicao = `<span class="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-300 to-slate-400 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">2º</span>`;
    } else if (posicao === 3) {
      badgePosicao = `<span class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">3º</span>`;
    }

    const nota = (p.notaMedia || 5.0).toFixed(1);
    const avaliacoesTotal = p.totalAvaliacoes || 0;
    const servicosConcluidos = p.servicos_concluidos || 0;
    const pontos = p.pontos || p.pontuacao || 0;
    const foto = p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=0D8ABC&color=fff`;

    html += `
      <div class="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors ${bordaEspecial}">
        <div class="flex items-center gap-4">
          <div class="shrink-0 flex items-center justify-center">
            ${badgePosicao}
          </div>
          <img src="${foto}" alt="${p.nome}" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-gray-900 text-base hover:text-amber-600 cursor-pointer btn-ver-perfil-prestador" data-id="${p.id}">
                ${p.nome}
              </h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.tipoPessoa === 'Jurídica' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
                ${p.tipoPessoa || 'Física'}
              </span>
              <span class="text-xs text-gray-400 font-medium">
                <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>${p.cidade} - ${p.estado || ''}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1 line-clamp-1 max-w-xl">${p.bio || 'Profissional qualificado da plataforma.'}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                ${p.categoriaPrincipal || 'Geral'}
              </span>
              ${(p.especialidades || []).slice(0, 2).map(e => `
                <span class="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-[10px]">
                  ${e}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6 self-stretch md:self-center justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <div class="text-center">
            <div class="flex items-center justify-center text-amber-500 text-xs gap-1 font-bold">
              <i class="fas fa-star"></i>
              <span class="text-gray-900 text-sm font-black">${nota}</span>
            </div>
            <span class="text-[10px] text-gray-500">${avaliacoesTotal} avaliações</span>
          </div>

          <div class="text-center">
            <span class="block text-sm font-black text-gray-900">${servicosConcluidos}</span>
            <span class="text-[10px] text-gray-500">Concluídos</span>
          </div>

          <div class="text-center bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            <span class="block text-lg font-black text-amber-900">${pontos}</span>
            <span class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pontos</span>
          </div>

          <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors btn-ver-perfil-prestador whitespace-nowrap" data-id="${p.id}">
            Ver Perfil
          </button>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  container.innerHTML = html;

  // Listeners para abrir modal de perfil
  container.querySelectorAll(".btn-ver-perfil-prestador").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      abrirModalPerfilPrestador(id);
    });
  });
}

// =============================================================================
// 2. ABA: AVALIAÇÕES E COMENTÁRIOS CONTEXTUAIS
// =============================================================================
function renderizarComentarios(container) {
  let avaliacoes = [...demoState.avaliacoes];

  // Filtros
  if (demoState.filtros.categoria !== "todas") {
    avaliacoes = avaliacoes.filter(a => a.categoria === demoState.filtros.categoria);
  }
  if (demoState.filtros.prestadorId !== "todos") {
    avaliacoes = avaliacoes.filter(a => a.prestadorId === demoState.filtros.prestadorId);
  }

  // Ordenação
  avaliacoes.sort((a, b) => {
    const tA = a.criadoEm ? a.criadoEm.toMillis() : 0;
    const tB = b.criadoEm ? b.criadoEm.toMillis() : 0;
    return tB - tA; // mais recentes primeiro por padrão
  });

  let html = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">Depoimentos & Avaliações Sintéticas</h3>
          <p class="text-xs text-gray-500">Comentários gerados contextualmente por categoria, serviço executado e notas de satisfação.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-gray-600">Ordenar por:</label>
          <select id="select-ordenar-avaliacoes" class="text-xs border border-gray-300 rounded-lg p-1.5 bg-gray-50 focus:bg-white focus:outline-none">
            <option value="recentes">Mais Recentes</option>
            <option value="maior_nota">Maior Nota</option>
            <option value="menor_nota">Menor Nota</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="grid-comentarios-itens">
  `;

  if (avaliacoes.length === 0) {
    html += `
      <div class="col-span-full py-12 text-center text-gray-500">
        <i class="far fa-comment-dots text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm">Nenhuma avaliação encontrada para os filtros selecionados.</p>
      </div>
    `;
  } else {
    avaliacoes.forEach(a => {
      const dataStr = a.criadoEm ? new Date(a.criadoEm.toMillis()).toLocaleDateString('pt-BR') : 'Data recente';
      
      // Estrelas
      let estrelasHTML = '';
      for (let s = 1; s <= 5; s++) {
        if (s <= a.nota) {
          estrelasHTML += '<i class="fas fa-star text-amber-400"></i>';
        } else {
          estrelasHTML += '<i class="far fa-star text-gray-300"></i>';
        }
      }

      // Prestador
      const prestador = demoState.prestadores.find(p => p.id === a.prestadorId);
      const nomePrestador = prestador ? prestador.nome : "Prestador Autônomo";

      html += `
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start gap-2 mb-2">
              <div>
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mb-1">
                  ${a.categoria || 'Geral'} &rsaquo; ${a.subcategoria || ''}
                </span>
                <h4 class="font-bold text-gray-900 text-sm line-clamp-1">${a.servicoTitulo || 'Serviço Concluído'}</h4>
              </div>
              <div class="flex items-center gap-1 text-xs shrink-0">
                ${estrelasHTML}
                <span class="font-bold text-gray-700 ml-1">${a.nota}.0</span>
              </div>
            </div>

            <p class="text-xs text-gray-700 italic my-3 bg-white p-3 rounded-lg border border-gray-100">
              "${a.comentario}"
            </p>
          </div>

          <div class="border-t border-gray-200 pt-3 flex justify-between items-center text-[11px] text-gray-500">
            <div>
              <span class="font-bold text-gray-800">${a.nomeSolicitante || 'Cliente Satisfeito'}</span>
              <span class="text-gray-400">&bull; avaliou </span>
              <span class="font-semibold text-amber-800">${nomePrestador}</span>
            </div>
            <span class="text-gray-400">${dataStr}</span>
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  container.innerHTML = html;

  // Handler de reordenação
  const selectOrd = document.getElementById("select-ordenar-avaliacoes");
  selectOrd?.addEventListener("change", (e) => {
    const val = e.target.value;
    const grid = document.getElementById("grid-comentarios-itens");
    if (!grid) return;

    let lista = [...avaliacoes];
    if (val === "maior_nota") {
      lista.sort((a, b) => b.nota - a.nota);
    } else if (val === "menor_nota") {
      lista.sort((a, b) => a.nota - b.nota);
    } else {
      lista.sort((a, b) => (b.criadoEm?.toMillis() || 0) - (a.criadoEm?.toMillis() || 0));
    }
    // Re-render
    demoState.avaliacoes = lista;
    renderizarComentarios(container);
  });
}

// =============================================================================
// 3. ABA: SOLICITAÇÕES & PROPOSTAS CONCORRENTES
// =============================================================================
function renderizarSolicitacoes(container) {
  let solicitacoes = [...demoState.solicitacoes];

  if (demoState.filtros.categoria !== "todas") {
    solicitacoes = solicitacoes.filter(s => s.categoria === demoState.filtros.categoria);
  }
  if (demoState.filtros.statusSolicitacao !== "todos") {
    solicitacoes = solicitacoes.filter(s => s.status === demoState.filtros.statusSolicitacao);
  }

  solicitacoes.sort((a, b) => (b.criadoEm?.toMillis() || 0) - (a.criadoEm?.toMillis() || 0));

  let html = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">Solicitações de Serviço e Concorrência de Orçamentos</h3>
          <p class="text-xs text-gray-500">Exibição transparente de propostas recebidas por cada demanda cadastrada para teste de regras de negócio.</p>
        </div>
        <span class="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
          ${solicitacoes.length} Solicitações
        </span>
      </div>

      <div class="space-y-4">
  `;

  if (solicitacoes.length === 0) {
    html += `
      <div class="py-12 text-center text-gray-500">
        <i class="fas fa-clipboard-list text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm">Nenhuma solicitação encontrada com os filtros atuais.</p>
      </div>
    `;
  } else {
    solicitacoes.forEach(s => {
      // Contar orçamentos desta solicitação
      const orcamentosDesta = demoState.orcamentos.filter(o => o.solicitacaoId === s.id);
      
      let badgeStatus = '';
      if (s.status === 'ABERTA') badgeStatus = '<span class="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">ABERTA</span>';
      else if (s.status === 'EM_ANALISE') badgeStatus = '<span class="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">EM_ANALISE</span>';
      else if (s.status === 'CONTRATADA') badgeStatus = '<span class="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">CONTRATADA</span>';
      else if (s.status === 'CONCLUIDA') badgeStatus = '<span class="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">CONCLUIDA</span>';

      const dataStr = s.criadoEm ? new Date(s.criadoEm.toMillis()).toLocaleDateString('pt-BR') : 'Data recente';
      
      let prestadorContratadoNome = null;
      if (s.prestadorContratadoId) {
        const prest = demoState.prestadores.find(p => p.id === s.prestadorContratadoId);
        prestadorContratadoNome = prest ? prest.nome : "Prestador Contratado";
      }

      html += `
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-amber-300 transition-all">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                ${badgeStatus}
                <span class="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                  ${s.categoria} &rsaquo; ${s.subcategoria}
                </span>
                <span class="text-xs text-gray-400">
                  <i class="far fa-calendar-alt mr-1"></i> ${dataStr}
                </span>
              </div>
              <h4 class="font-bold text-gray-900 text-base">${s.titulo}</h4>
              <p class="text-xs text-gray-600 mt-1 max-w-2xl line-clamp-2">${s.descricao}</p>
            </div>

            <div class="flex flex-col items-start md:items-end gap-2 shrink-0">
              <button class="btn-abrir-inspecao bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs" data-id="${s.id}">
                <i class="fas fa-eye mr-1.5"></i> Inspecionar Orçamentos (${orcamentosDesta.length})
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-3 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
            <div>
              <i class="fas fa-user text-gray-400 mr-1"></i> Solicitante: <strong class="text-gray-700">${s.nomeSolicitante}</strong>
              <span class="mx-2">&bull;</span>
              <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i> ${s.endereco}
            </div>

            ${prestadorContratadoNome ? `
            <div class="bg-green-50 text-green-800 px-2.5 py-1 rounded-md border border-green-200 font-semibold text-xs flex items-center gap-1.5">
              <i class="fas fa-check-circle text-green-600"></i> Contratado: ${prestadorContratadoNome}
            </div>
            ` : ''}
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  container.innerHTML = html;

  // Listeners para abrir inspeção da solicitação
  container.querySelectorAll(".btn-abrir-inspecao").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      abrirModalInspecaoSolicitacao(id);
    });
  });
}

/**
 * Abre o Modal com todos os orçamentos e detalhes de uma solicitação
 */
function abrirModalInspecaoSolicitacao(solicitacaoId) {
  const modal = document.getElementById("modal-inspecao-solicitacao");
  const corpo = document.getElementById("modal-inspecao-corpo");
  const titulo = document.getElementById("modal-inspecao-titulo");
  if (!modal || !corpo) return;

  const sol = demoState.solicitacoes.find(s => s.id === solicitacaoId);
  if (!sol) return;

  if (titulo) titulo.textContent = sol.titulo;

  const orcamentos = demoState.orcamentos.filter(o => o.solicitacaoId === solicitacaoId);
  orcamentos.sort((a, b) => a.total - b.total); // menor preço primeiro

  let orcamentosHTML = '';
  if (orcamentos.length === 0) {
    orcamentosHTML = `
      <div class="p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-xs">
        Nenhuma proposta enviada para esta solicitação ainda.
      </div>
    `;
  } else {
    orcamentos.forEach(o => {
      let badgeStatus = '';
      let bordaCard = 'border-gray-200 bg-white';
      
      if (o.status === 'APROVADO') {
        badgeStatus = '<span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-green-100 text-green-800 border border-green-300">APROVADO (Vencedor)</span>';
        bordaCard = 'border-green-300 bg-green-50/30';
      } else if (o.status === 'REPROVADO') {
        badgeStatus = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">REPROVADO</span>';
      } else {
        badgeStatus = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">AGUARDANDO</span>';
      }

      orcamentosHTML += `
        <div class="border rounded-xl p-4 shadow-2xs mb-3 ${bordaCard}">
          <div class="flex justify-between items-start gap-2 mb-2">
            <div>
              <span class="text-xs font-bold text-gray-900">${o.nomePrestador}</span>
              <p class="text-[11px] text-gray-500">Prazo: <strong>${o.prazo} dias</strong> &bull; Validade: ${o.validade || '15 dias'}</p>
            </div>
            ${badgeStatus}
          </div>

          <div class="bg-gray-50 p-2.5 rounded-lg grid grid-cols-3 gap-2 text-xs text-gray-700 my-2">
            <div>
              <span class="block text-[10px] text-gray-400 uppercase">Mão de Obra</span>
              <strong>R$ ${o.maoDeObra.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div>
              <span class="block text-[10px] text-gray-400 uppercase">Materiais</span>
              <strong>R$ ${o.material.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div>
              <span class="block text-[10px] text-amber-700 uppercase font-bold">Total Calculado</span>
              <strong class="text-amber-800 text-sm">R$ ${o.total.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          ${o.observacao ? `
            <p class="text-xs text-gray-600 italic bg-white/80 p-2 rounded border border-gray-100">
              "${o.observacao}"
            </p>
          ` : ''}

          <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end">
            <button type="button" class="btn-ver-espec-modal-inspecao px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5" data-orc-id="${o.id}">
              <i class="fas fa-file-invoice"></i> Ver Especificação Completa & Fatura
            </button>
          </div>
        </div>
      `;
    });
  }

  corpo.innerHTML = `
    <div class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h4 class="font-bold text-gray-900 text-sm mb-1">${sol.titulo}</h4>
        <p class="text-xs text-gray-700">${sol.descricao}</p>
        <div class="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span><i class="fas fa-tag mr-1 text-gray-400"></i> ${sol.categoria} / ${sol.subcategoria}</span>
          <span><i class="fas fa-map-marker-alt mr-1 text-gray-400"></i> ${sol.endereco}</span>
          <span><i class="fas fa-user mr-1 text-gray-400"></i> ${sol.nomeSolicitante}</span>
        </div>
      </div>

      <div>
        <h4 class="font-bold text-gray-900 text-sm mb-3 flex items-center justify-between">
          <span>Propostas Concorrentes Recebidas</span>
          <span class="text-xs font-normal text-gray-500">${orcamentos.length} orçamento(s)</span>
        </h4>
        ${orcamentosHTML}
      </div>
    </div>
  `;

  // Bind para abrir fatura detalhada dentro do modal de inspeção
  corpo.querySelectorAll('.btn-ver-espec-modal-inspecao').forEach(btn => {
    btn.addEventListener('click', () => {
      const orcId = btn.getAttribute('data-orc-id');
      const orc = demoState.orcamentos.find(item => item.id === orcId);
      if (!orc) return;

      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          `Especificação: ${orc.nomePrestador}`,
          `R$ ${orc.total.toFixed(2).replace('.', ',')}`,
          '11987654321',
          orc.nomePrestador,
          {
            escopo: orc.observacao || 'Execução técnica completa conforme diretrizes e memorial descritivo da solicitação.',
            itens: [
              { descricao: 'Mão de Obra Especializada', preco: orc.maoDeObra },
              { descricao: 'Materiais e Componentes', preco: orc.material }
            ],
            maoDeObra: orc.maoDeObra,
            material: orc.material,
            deslocamento: 0,
            prazo: `${orc.prazo} dias úteis`,
            garantia: '180 dias',
            somenteEspecificacao: orc.status !== 'APROVADO'
          }
        );
      }
    });
  });

  modal.classList.remove("hidden");
}

function fecharModalInspecao() {
  const modal = document.getElementById("modal-inspecao-solicitacao");
  if (modal) modal.classList.add("hidden");
}

// =============================================================================
// 4. ABA: CATÁLOGO DE SERVIÇOS AVULSOS
// =============================================================================
function renderizarServicosAvulsos(container) {
  let servicos = [...demoState.servicos];

  if (demoState.filtros.categoria !== "todas") {
    servicos = servicos.filter(s => s.categoria === demoState.filtros.categoria);
  }
  if (demoState.filtros.prestadorId !== "todos") {
    servicos = servicos.filter(s => s.prestador_uid === demoState.filtros.prestadorId);
  }

  let html = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">Catálogo de Serviços Avulsos</h3>
          <p class="text-xs text-gray-500">Serviços prontos cadastrados pelos prestadores de teste nas 5 categorias universais.</p>
        </div>
        <span class="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
          ${servicos.length} Serviços
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  `;

  if (servicos.length === 0) {
    html += `
      <div class="col-span-full py-12 text-center text-gray-500">
        <i class="fas fa-boxes text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm">Nenhum serviço avulso corresponde aos filtros.</p>
      </div>
    `;
  } else {
    servicos.forEach(s => {
      const valorStr = s.valor_base ? `R$ ${s.valor_base.toFixed(2).replace('.', ',')}` : 'Sob consulta';
      const prestador = demoState.prestadores.find(p => p.id === s.prestador_uid);
      const nomePrestador = prestador ? prestador.nome : "Prestador";
      const cidadePrestador = prestador ? `${prestador.cidade} - ${prestador.estado}` : '';

      html += `
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start gap-2 mb-2">
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ${s.categoria}
              </span>
              <span class="text-sm font-black text-gray-900">${valorStr}</span>
            </div>
            <span class="text-[11px] text-gray-500 block mb-1 font-medium">${s.subcategoria}</span>
            <h4 class="font-bold text-gray-900 text-sm line-clamp-2">${s.titulo}</h4>
            <p class="text-xs text-gray-600 mt-2 line-clamp-2">${s.descricao}</p>
          </div>

          <div class="border-t border-gray-200 pt-3 mt-4 flex items-center justify-between text-xs text-gray-500">
            <span class="truncate max-w-[140px] font-medium text-gray-800" title="${nomePrestador}">
              <i class="fas fa-user-check text-emerald-600 mr-1"></i>${nomePrestador}
            </span>
            <span class="text-[11px] text-gray-400">${cidadePrestador}</span>
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  container.innerHTML = html;
}

// =============================================================================
// 5. ABA: ORÇAMENTOS DETALHADOS
// =============================================================================
function renderizarOrcamentos(container) {
  let orcamentos = [...demoState.orcamentos];

  if (demoState.filtros.prestadorId !== "todos") {
    orcamentos = orcamentos.filter(o => o.prestadorId === demoState.filtros.prestadorId);
  }

  let html = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">Visão Geral dos Orçamentos Concorrentes</h3>
          <p class="text-xs text-gray-500">Detalhamento dos componentes de custo (Mão de Obra + Material + Deslocamento) e inspeção de faturas.</p>
        </div>
        <span class="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          ${orcamentos.length} Propostas
        </span>
      </div>

      <div class="overflow-x-auto menu-scrollbar pb-2">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th class="p-3">Prestador</th>
              <th class="p-3">Demanda Vinculada</th>
              <th class="p-3 text-right">Mão de Obra</th>
              <th class="p-3 text-right">Material</th>
              <th class="p-3 text-right">Valor Total</th>
              <th class="p-3 text-center">Prazo</th>
              <th class="p-3 text-center">Status</th>
              <th class="p-3 text-center">Especificação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
  `;

  orcamentos.forEach(o => {
    let statusClass = "bg-yellow-100 text-yellow-800";
    if (o.status === "APROVADO") statusClass = "bg-green-100 text-green-800 font-bold";
    if (o.status === "REPROVADO") statusClass = "bg-red-50 text-red-700";

    const sol = demoState.solicitacoes.find(s => s.id === o.solicitacaoId);
    const tituloDemanda = sol ? sol.titulo : o.solicitacaoId;

    html += `
      <tr class="hover:bg-gray-50/80 transition-colors">
        <td class="p-3 font-semibold text-gray-900">${o.nomePrestador}</td>
        <td class="p-3 text-gray-600 max-w-xs truncate" title="${tituloDemanda}">${tituloDemanda}</td>
        <td class="p-3 text-right text-gray-700">R$ ${o.maoDeObra.toFixed(2).replace('.', ',')}</td>
        <td class="p-3 text-right text-gray-700">R$ ${o.material.toFixed(2).replace('.', ',')}</td>
        <td class="p-3 text-right font-black text-gray-900">R$ ${o.total.toFixed(2).replace('.', ',')}</td>
        <td class="p-3 text-center text-gray-600">${o.prazo} dias</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] ${statusClass}">
            ${o.status}
          </span>
        </td>
        <td class="p-3 text-center">
          <button type="button" class="btn-ver-especificacao-tabela px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto shadow-2xs" data-orc-id="${o.id}">
            <i class="fas fa-file-invoice"></i> Ver Fatura
          </button>
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;
  container.innerHTML = html;

  // Bind botões "Ver Fatura" da tabela
  container.querySelectorAll('.btn-ver-especificacao-tabela').forEach(btn => {
    btn.addEventListener('click', () => {
      const orcId = btn.getAttribute('data-orc-id');
      const orc = demoState.orcamentos.find(item => item.id === orcId);
      if (!orc) return;

      if (typeof window.abrirModalPix === 'function') {
        window.abrirModalPix(
          `Orçamento Formal: ${orc.nomePrestador}`,
          `R$ ${orc.total.toFixed(2).replace('.', ',')}`,
          '11987654321',
          orc.nomePrestador,
          {
            escopo: orc.observacao || 'Execução técnica completa conforme diretrizes e memorial descritivo da solicitação.',
            itens: [
              { descricao: 'Mão de Obra Especializada', preco: orc.maoDeObra },
              { descricao: 'Materiais e Componentes', preco: orc.material }
            ],
            maoDeObra: orc.maoDeObra,
            material: orc.material,
            deslocamento: 0,
            prazo: `${orc.prazo} dias úteis`,
            garantia: '180 dias',
            somenteEspecificacao: orc.status !== 'APROVADO'
          }
        );
      }
    });
  });
}

// =============================================================================
// 6. ABA: SIMULAÇÃO DO CICLO DO MARKETPLACE
// =============================================================================
function renderizarSimulacaoFluxo(container) {
  container.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8">
      <div class="max-w-3xl mb-8">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase">Arquitetura de Fluxo</span>
          <span class="text-xs text-gray-500">&bull; Ciclo Completo de Contratação</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Como o Marketplace Conecta Solicitantes e Prestadores</h3>
        <p class="text-sm text-gray-600 mt-1">
          Navegue pelas etapas da esteira de serviços para compreender o isolamento concorrencial, a formação do preço e o cálculo orgânico de reputação.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Passo 1 -->
        <div class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-xs transition-all">
          <div class="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            1
          </div>
          <div>
            <h4 class="font-bold text-gray-900 text-base">Publicação da Solicitação de Serviço</h4>
            <p class="text-xs text-gray-600 mt-1">
              O solicitante (pessoa física ou empresa) descreve sua necessidade, escolhe a categoria/subcategoria e informa sua localidade. A demanda passa a ter status <strong>ABERTA</strong> e fica disponível no mural para prestadores qualificados.
            </p>
            <div class="mt-2 text-[11px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded inline-block font-semibold">
              Estado: ABERTA &bull; Permite receber múltiplas propostas
            </div>
          </div>
        </div>

        <!-- Passo 2 -->
        <div class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-xs transition-all">
          <div class="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            2
          </div>
          <div>
            <h4 class="font-bold text-gray-900 text-base">Envio de Orçamentos Concorrentes (Privacidade Garantida)</h4>
            <p class="text-xs text-gray-600 mt-1">
              Diferentes prestadores formulam propostas detalhando mão de obra, materiais e prazo. <strong>Regra central:</strong> Um prestador NUNCA vê os valores ou propostas dos seus concorrentes. Apenas o solicitante proprietário tem acesso ao painel comparativo.
            </p>
            <div class="mt-2 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block font-semibold">
              Regra de Sigilo: Prestador vê apenas sua própria proposta
            </div>
          </div>
        </div>

        <!-- Passo 3 -->
        <div class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-xs transition-all">
          <div class="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            3
          </div>
          <div>
            <h4 class="font-bold text-gray-900 text-base">Comparação e Escolha do Prestador (Contratação)</h4>
            <p class="text-xs text-gray-600 mt-1">
              O solicitante avalia prazo, valor e a reputação dos profissionais. Ao aceitar um orçamento: a proposta vencedora torna-se <strong>APROVADO</strong>, as concorrentes tornam-se <strong>REPROVADO</strong> e a solicitação muda para <strong>CONTRATADA</strong>.
            </p>
            <div class="mt-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded inline-block font-semibold">
              Transição atômica (WriteBatch): 1 Aprovado + N Reprovados
            </div>
          </div>
        </div>

        <!-- Passo 4 -->
        <div class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-xs transition-all">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            4
          </div>
          <div>
            <h4 class="font-bold text-gray-900 text-base">Execução, Cobrança Pix e Conclusão</h4>
            <p class="text-xs text-gray-600 mt-1">
              O prestador contratado pode gerar demonstrativo com chave Pix e QR Code para recebimento. Após a conclusão física do serviço, o solicitante finaliza a solicitação no sistema, movendo-a para <strong>CONCLUIDA</strong>.
            </p>
          </div>
        </div>

        <!-- Passo 5 -->
        <div class="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-xs transition-all">
          <div class="w-10 h-10 rounded-full bg-yellow-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            5
          </div>
          <div>
            <h4 class="font-bold text-gray-900 text-base">Avaliação Contextual e Atualização do Ranking</h4>
            <p class="text-xs text-gray-600 mt-1">
              O solicitante atribui uma nota de 1 a 5 estrelas e deixa um comentário contextual. O perfil do prestador é atualizado imediatamente: a nova nota recalcula a média aritmética e soma pontos de reputação na fórmula de ranking.
            </p>
            <div class="mt-2 text-[11px] text-gray-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg font-mono">
              Fórmula de Pontos: (Concluídos × 25) + (Aprovados × 15) + (NotaMédia × 20) + (Avaliações × 10)
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Abre o Modal de Perfil Completo do Prestador
 */
function abrirModalPerfilPrestador(prestadorId) {
  const modal = document.getElementById("modal-detalhes-prestador");
  const corpo = document.getElementById("modal-prestador-corpo");
  if (!modal || !corpo) return;

  const p = demoState.prestadores.find(x => x.id === prestadorId);
  if (!p) return;

  const foto = p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=0D8ABC&color=fff`;
  const servicosDeste = demoState.servicos.filter(s => s.prestador_uid === p.id);
  const avaliacoesDeste = demoState.avaliacoes.filter(a => a.prestadorId === p.id);

  let servicosHTML = servicosDeste.length > 0 ? servicosDeste.map(s => `
    <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div class="flex justify-between items-start">
        <h5 class="font-bold text-gray-900 text-xs">${s.titulo}</h5>
        <span class="text-xs font-bold text-emerald-700">R$ ${(s.valor_base || 0).toFixed(2).replace('.', ',')}</span>
      </div>
      <p class="text-[11px] text-gray-600 mt-1">${s.descricao}</p>
    </div>
  `).join('') : '<p class="text-xs text-gray-500">Nenhum serviço avulso listado.</p>';

  corpo.innerHTML = `
    <div class="flex items-center gap-4 mb-5">
      <img src="${foto}" alt="${p.nome}" class="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-sm shrink-0">
      <div>
        <h4 class="font-bold text-gray-900 text-lg leading-tight">${p.nome}</h4>
        <p class="text-xs text-gray-500">${p.tipoPessoa === 'Jurídica' ? (p.razaoSocial || 'Empresa PJ') : 'Profissional Autônomo (PF)'}</p>
        <p class="text-xs text-gray-500 mt-0.5"><i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>${p.cidade} - ${p.estado || ''}</p>
      </div>
    </div>

    <div class="bg-amber-50/60 border border-amber-200 p-4 rounded-xl mb-5">
      <h5 class="text-xs font-bold text-amber-900 uppercase mb-1">Biografia & Apresentação</h5>
      <p class="text-xs text-gray-700">${p.bio || 'Sem biografia informada.'}</p>
      
      <div class="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs flex-wrap gap-2">
        <span class="text-gray-600"><i class="fab fa-whatsapp text-green-600 mr-1 text-sm"></i> ${p.whatsapp || p.telefone}</span>
        <span class="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
          <i class="fas fa-shield-alt text-emerald-600"></i> Chave Pix Protegida (Liberada na Contratação)
        </span>
      </div>
    </div>

    <div class="mb-5">
      <h5 class="text-xs font-bold text-gray-900 uppercase mb-2">Serviços Avulsos Oferecidos (${servicosDeste.length})</h5>
      <div class="space-y-2">
        ${servicosHTML}
      </div>
    </div>

    <div>
      <h5 class="text-xs font-bold text-gray-900 uppercase mb-2">Avaliações Recebidas (${avaliacoesDeste.length})</h5>
      <div class="space-y-2">
        ${avaliacoesDeste.map(a => `
          <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <div class="flex justify-between items-center mb-1">
              <span class="font-bold text-gray-800">${a.nomeSolicitante || 'Cliente'}</span>
              <span class="text-amber-500 font-bold"><i class="fas fa-star text-[10px]"></i> ${a.nota}.0</span>
            </div>
            <p class="text-gray-600 italic">"${a.comentario}"</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function fecharModalPrestador() {
  const modal = document.getElementById("modal-detalhes-prestador");
  if (modal) modal.classList.add("hidden");
}
