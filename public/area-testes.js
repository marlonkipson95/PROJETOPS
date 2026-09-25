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
  abaAtiva: "ranking", // ranking | comentarios | solicitacoes | servicos | orcamentos | fluxo
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

      <!-- Navegação das Abas de Teste -->
      <div class="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav class="-mb-px flex space-x-2 sm:space-x-6 min-w-max" id="demo-tabs-nav">
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-amber-600 text-amber-700" data-aba="ranking">
            <i class="fas fa-trophy text-amber-500"></i> Ranking de Demonstração
          </button>
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700" data-aba="comentarios">
            <i class="fas fa-comments text-blue-500"></i> Avaliações e Comentários
          </button>
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700" data-aba="solicitacoes">
            <i class="fas fa-clipboard-list text-purple-500"></i> Solicitações & Propostas
          </button>
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700" data-aba="servicos">
            <i class="fas fa-boxes text-emerald-500"></i> Catálogo de Serviços (112)
          </button>
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700" data-aba="orcamentos">
            <i class="fas fa-calculator text-indigo-500"></i> Orçamentos Detalhados
          </button>
          <button class="tab-demo-btn py-3 px-3 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700" data-aba="fluxo">
            <i class="fas fa-project-diagram text-rose-500"></i> Ciclo do Marketplace
          </button>
        </nav>
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

  // Listeners de Abas
  const tabButtons = containerEl.querySelectorAll(".tab-demo-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => {
        b.classList.remove("border-amber-600", "text-amber-700");
        b.classList.add("border-transparent", "text-gray-500");
      });
      btn.classList.remove("border-transparent", "text-gray-500");
      btn.classList.add("border-amber-600", "text-amber-700");
      demoState.abaAtiva = btn.getAttribute("data-aba");
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
      renderizarRanking(container);
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
          <p class="text-xs text-gray-500">Detalhamento dos componentes de custo (Mão de Obra + Material + Outros = Total) e status da proposta.</p>
        </div>
        <span class="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          ${orcamentos.length} Propostas
        </span>
      </div>

      <div class="overflow-x-auto">
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
      
      <div class="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
        <span class="text-gray-600"><i class="fab fa-whatsapp text-green-600 mr-1 text-sm"></i> ${p.whatsapp || p.telefone}</span>
        <span class="text-gray-600"><i class="fas fa-qrcode text-amber-700 mr-1"></i> Pix: ${p.chavePix || 'Não informada'}</span>
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
