import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, getDocs, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { inicializarAreaTestes } from "./area-testes.js";

const firebaseConfig = {
  apiKey: "AIzaSyAz_-CckCU3jg4LgGmU7R2N36eOOmvC9NY",
  authDomain: "projetosteste-e7490.firebaseapp.com",
  projectId: "projetosteste-e7490",
  storageBucket: "projetosteste-e7490.firebasestorage.app",
  messagingSenderId: "466513545192",
  appId: "1:466513545192:web:b57e03ee2e6d0ad685c65d",
  measurementId: "G-Z3X093JVR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const onboardingModal = document.getElementById('onboarding-modal');
let btnSalvarPerfil = document.getElementById('btn-salvar-perfil');

// Taxonomia Base Expandida (PROJETO.md e Fase 2)
const TAXONOMIA = {
    "Casa e Jardim": ["Jardinagem", "Piscinas", "Limpeza", "Elétrica residencial", "Hidráulica", "Manutenção", "Outros"],
    "Obras e Reforma": ["Pedreiro", "Pintura", "Reforma", "Instalação", "Acabamento", "Gesseiro", "Encanador", "Outros"],
    "Automotivo": ["Mecânica", "Elétrica automotiva", "Revisão", "Freios", "Motor", "Funilaria", "Outros"],
    "TI e Redes": ["Suporte técnico", "Redes", "Infraestrutura", "Desenvolvimento", "Manutenção de computadores", "CFTV / Segurança", "Outros"],
    "Freelancers / Acadêmico": ["Design", "Redação", "Revisão", "Formatação", "Tradução", "Serviços acadêmicos", "Outros"],
    "ELETRICIDADE": ["Instalação elétrica", "Manutenção elétrica", "Instalação de chuveiro", "Tomadas", "Iluminação", "Padrão de energia", "Outros"],
    "CONSTRUÇÃO E REFORMA": ["Pedreiro", "Pintor", "Encanador", "Gesseiro", "Azulejista", "Outros"],
    "TECNOLOGIA": ["Computadores", "Redes", "Suporte técnico", "Desenvolvimento", "Infraestrutura", "Outros"],
    "Saúde e Bem-Estar": ["Personal Trainer", "Fisioterapia", "Nutrição", "Massoterapia", "Cuidador de Idosos", "Outros"],
    "Eventos e Festas": ["Fotografia", "Buffet", "DJ e Iluminação", "Decoração", "Garçom", "Outros"],
    "Pets e Veterinária": ["Adestramento", "Passeador / Pet Sitter", "Banho e Tosa", "Consulta Veterinária", "Outros"]
};

// =============================================================================
// SISTEMA MODERNO DE NOTIFICAÇÕES (TOASTS) - Substitui alert() nativo
// =============================================================================
export function mostrarNotificacao(tipo = 'sucesso', titulo = '', mensagem = '', duracao = 4500) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.log(`[Toast ${tipo}] ${titulo}: ${mensagem}`);
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-2xl border shadow-xl transition-all duration-300 toast-animate-in';

    let iconHtml = '';
    let borderClass = 'border-emerald-200';
    let iconBgClass = 'bg-emerald-50 text-emerald-600';
    let defaultTitle = 'Sucesso';

    if (tipo === 'erro') {
        borderClass = 'border-red-200';
        iconBgClass = 'bg-red-50 text-red-600';
        iconHtml = '<i class="fas fa-times-circle text-lg"></i>';
        defaultTitle = 'Erro na Operação';
    } else if (tipo === 'aviso') {
        borderClass = 'border-amber-200';
        iconBgClass = 'bg-amber-50 text-amber-600';
        iconHtml = '<i class="fas fa-exclamation-triangle text-lg"></i>';
        defaultTitle = 'Atenção';
    } else if (tipo === 'info') {
        borderClass = 'border-blue-200';
        iconBgClass = 'bg-blue-50 text-blue-600';
        iconHtml = '<i class="fas fa-info-circle text-lg"></i>';
        defaultTitle = 'Informação';
    } else {
        borderClass = 'border-emerald-200';
        iconBgClass = 'bg-emerald-50 text-emerald-600';
        iconHtml = '<i class="fas fa-check-circle text-lg"></i>';
        defaultTitle = 'Sucesso!';
    }

    toast.classList.add(borderClass);

    toast.innerHTML = `
        <div class="w-8 h-8 rounded-full ${iconBgClass} flex items-center justify-center shrink-0 mt-0.5">
            ${iconHtml}
        </div>
        <div class="flex-1 min-w-0 pr-1">
            <h5 class="text-xs font-bold text-gray-900 leading-tight mb-0.5">${titulo || defaultTitle}</h5>
            <p class="text-xs text-gray-600 leading-relaxed">${mensagem}</p>
        </div>
        <button type="button" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer text-xs" aria-label="Fechar notificação">
            <i class="fas fa-times"></i>
        </button>
    `;

    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
        toast.classList.remove('toast-animate-in');
        toast.classList.add('toast-animate-out');
        setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, 260);
    };

    closeBtn.onclick = dismiss;
    container.appendChild(toast);

    if (duracao > 0) {
        setTimeout(dismiss, duracao);
    }
}
window.mostrarNotificacao = mostrarNotificacao;

// Garante que qualquer chamada de alert do navegador vire um Toast limpo e elegante
window.alert = function(msg) {
    mostrarNotificacao('info', 'Notificação do Sistema', String(msg));
};

// Handle Authentication State Changes
onAuthStateChanged(auth, async (user) => {
    const aiWidget = document.getElementById('ai-floating-widget-wrapper');
    const aiModal = document.getElementById('ai-chat-modal');
    if (user) {
        // User is logged in - Exibe o widget exclusivo da IA
        if (aiWidget) aiWidget.classList.remove('hidden');
        renderAuthenticatedNav(user);
        await checkUserProfile(user);
    } else {
        // User is logged out - Oculta completamente o assistente IA para anônimos
        if (aiWidget) aiWidget.classList.add('hidden');
        if (aiModal) aiModal.classList.add('hidden');
        renderUnauthenticatedNav();
        renderWelcomeScreen();
    }
});

function renderUnauthenticatedNav() {
    authContainer.innerHTML = `
        <button id="btn-login" class="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
            <i class="fab fa-google text-xs sm:text-sm"></i>
            <span class="hidden sm:inline">Entrar com Google</span>
            <span class="sm:hidden">Entrar</span>
        </button>
    `;
    document.getElementById('btn-login').addEventListener('click', login);
}

function renderAuthenticatedNav(user) {
    const photoUrl = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User') + '&background=random';
    authContainer.innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3 bg-gray-50 py-1 px-3 rounded-full border border-gray-100 shadow-sm">
                <img src="${photoUrl}" alt="Profile" class="h-8 w-8 rounded-full border border-gray-200 object-cover">
                <span class="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[120px]">${user.displayName?.split(' ')[0] || 'Usuário'}</span>
            </div>
            <button id="btn-logout" class="text-gray-400 hover:text-red-500 font-medium p-2 rounded-full hover:bg-red-50 transition-colors" title="Sair">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    `;
    document.getElementById('btn-logout').addEventListener('click', logout);
}

function renderWelcomeScreen() {
    mainContent.innerHTML = `
        <div class="flex flex-col justify-center items-center h-full min-h-[60vh] text-center px-4">
            <!-- Banner Destaque: Área de Testes -->
            <div class="w-full max-w-3xl mb-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md text-left">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
                        <i class="fas fa-flask"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-extrabold text-amber-950 text-base sm:text-lg">Área de Testes & Simulação Demo</h4>
                            <span class="bg-amber-300 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Acesso Imediato</span>
                        </div>
                        <p class="text-xs sm:text-sm text-amber-800">Inspecione o ranking de prestadores, catálogo de serviços, dezenas de solicitações e simule concorrência de orçamentos sem precisar de login.</p>
                    </div>
                </div>
                <button id="btn-banner-demo" class="shrink-0 w-full sm:w-auto text-center px-5 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-black rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                    <i class="fas fa-play mr-1.5"></i> Abrir Área de Testes
                </button>
            </div>

            <div class="bg-blue-50 text-blue-600 p-4 rounded-full mb-6 shadow-xs">
                <i class="fas fa-tools text-4xl"></i>
            </div>
            <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Conectando <span class="text-blue-600">necessidades</span> a <span class="text-blue-600">soluções</span>
            </h1>
            <p class="max-w-2xl text-lg sm:text-xl text-gray-500 mb-8">
                A plataforma ideal para encontrar profissionais qualificados ou oferecer seus serviços para milhares de clientes.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button id="btn-hero-login" class="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <i class="fab fa-google mr-2"></i> Começar Agora
                </button>
                <button id="btn-hero-demo" class="inline-flex items-center justify-center px-6 py-3.5 border-2 border-amber-400 text-base font-bold rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 shadow-sm transition-all cursor-pointer">
                    <i class="fas fa-flask mr-2 text-amber-600"></i> Área de Testes (Demo)
                </button>
            </div>
        </div>
    `;
    document.getElementById('btn-hero-login').addEventListener('click', login);
    document.getElementById('btn-hero-demo').addEventListener('click', () => abrirAreaTestes(null));
    document.getElementById('btn-banner-demo')?.addEventListener('click', () => abrirAreaTestes(null));
}

function renderDashboard(userData) {
    let tipoTexto = '';
    let iconClass = '';
    
    if (userData.tipo === 'solicitante') {
        tipoTexto = 'Solicitante';
        iconClass = 'fa-search';
    } else if (userData.tipo === 'prestador') {
        tipoTexto = 'Prestador de Serviços';
        iconClass = 'fa-toolbox';
    } else {
        tipoTexto = 'Solicitante e Prestador';
        iconClass = 'fa-handshake';
    }

    mainContent.innerHTML = `
        <div class="max-w-7xl mx-auto mt-4 pb-12">
            <!-- Tabs com scrollbar oculta -->
            <div class="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                <nav class="-mb-px flex space-x-6 sm:space-x-8 min-w-max" aria-label="Tabs" id="dashboard-tabs">
                    <button class="tab-button border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-dashboard">
                        <i class="fas fa-home mr-2"></i>Dashboard
                    </button>
                    <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-catalogo">
                        <i class="fas fa-store mr-2"></i>Catálogo de Serviços
                    </button>
                    ${(userData.tipo === 'solicitante' || userData.tipo === 'ambos') ? `
                    <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-solicitante">
                        <i class="fas fa-clipboard-list mr-2"></i>Minhas Solicitações
                    </button>
                    ` : ''}
                    ${(userData.tipo === 'prestador' || userData.tipo === 'ambos') ? `
                    <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-prestador">
                        <i class="fas fa-toolbox mr-2"></i>Área do Prestador
                    </button>
                    ` : ''}
                    <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-usuarios">
                        <i class="fas fa-users mr-2"></i>Explorar Usuários
                    </button>
                    <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-area-testes">
                        <i class="fas fa-flask text-amber-600 mr-2"></i>Área de Testes <span class="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">Demo</span>
                    </button>
                </nav>
            </div>

            <!-- Tab: Dashboard -->
            <div class="tab-content block" id="tab-dashboard">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 sm:p-10 text-white">
                        <h1 class="text-3xl font-bold mb-2">Olá, ${userData.nome.split(' ')[0]}! 👋</h1>
                        <p class="text-blue-100 text-lg">Bem-vindo(a) ao seu painel de controle.</p>
                    </div>
                    <div class="px-6 py-8 sm:p-10">
                        ${(!userData.telefone || !userData.documento || !userData.cidade) ? `
                        <div class="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <i class="fas fa-id-card"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-amber-900 text-xs sm:text-sm">Complete seus Dados Cadastrais</h4>
                                    <p class="text-[11px] sm:text-xs text-amber-700">Preencha seu WhatsApp, CPF/CNPJ e localização para usar todas as funções da plataforma.</p>
                                </div>
                            </div>
                            <button id="btn-alerta-editar-perfil" class="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs">
                                Preencher Agora
                            </button>
                        </div>
                        ` : ''}

                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">Seu Perfil Atual</h3>
                                <p class="text-xs text-gray-500">Dados do titular e status da conta</p>
                            </div>
                            <button id="btn-abrir-editar-perfil" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer">
                                <i class="fas fa-user-edit"></i> Editar Perfil / Dados Cadastrais
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center text-center">
                                <div class="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <i class="fas ${iconClass} text-xl"></i>
                                </div>
                                <span class="text-sm text-gray-500 mb-1">Tipo de Conta</span>
                                <span class="font-semibold text-gray-900">${tipoTexto}</span>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center text-center">
                                <div class="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                    <i class="fas fa-star text-xl"></i>
                                </div>
                                <span class="text-sm text-gray-500 mb-1">Pontos Acumulados</span>
                                <span class="font-semibold text-gray-900">${userData.pontos || 0}</span>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center text-center">
                                <div class="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <i class="fas fa-check-circle text-xl"></i>
                                </div>
                                <span class="text-sm text-gray-500 mb-1">Serviços Concluídos</span>
                                <span class="font-semibold text-gray-900">${userData.servicos_concluidos || 0}</span>
                            </div>
                        </div>

                        <!-- Detalhes de Cadastro -->
                        <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
                            <div>
                                <span class="font-semibold text-gray-500 block text-[10px] uppercase">Documento</span>
                                <span class="font-medium text-gray-800">${userData.documento || '<span class="text-amber-500 font-normal">Não informado</span>'}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-gray-500 block text-[10px] uppercase">WhatsApp</span>
                                <span class="font-medium text-gray-800">${userData.telefone || '<span class="text-amber-500 font-normal">Não informado</span>'}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-gray-500 block text-[10px] uppercase">Cidade / UF</span>
                                <span class="font-medium text-gray-800">${userData.cidade ? `${userData.cidade} - ${userData.estado || ''}` : '<span class="text-amber-500 font-normal">Não informado</span>'}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-gray-500 block text-[10px] uppercase">Tipo de Pessoa</span>
                                <span class="font-medium text-gray-800">${userData.tipoPessoa || 'Pessoa Física (PF)'}</span>
                            </div>
                        </div>
                        ${userData.bio ? `
                        <div class="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                            <span class="font-bold text-gray-700 block mb-1">Apresentação / Bio:</span>
                            <p class="italic">${userData.bio}</p>
                        </div>
                        ` : ''}

                        ${(userData.tipo === 'prestador' || userData.tipo === 'ambos') ? `
                        <div class="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <h3 class="text-lg font-semibold text-blue-900 mb-2">Sua Chave Pix (Opcional)</h3>
                            <p class="text-sm text-blue-700 mb-4">Cadastre sua chave Pix para gerar demonstrativos de cobrança quando seu orçamento for aprovado.</p>
                            <div class="flex gap-2">
                                <input type="text" id="input-chave-pix" placeholder="E-mail, CPF, Telefone ou Aleatória" value="${userData.chavePix || ''}" class="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2 border bg-white">
                                <button id="btn-salvar-pix" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap">
                                    Salvar
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Tab: Catálogo de Serviços -->
            <div class="tab-content hidden" id="tab-catalogo">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Catálogo de Serviços Profissionais</h3>
                            <p class="text-sm text-gray-500">Explore serviços cadastrados, filtre por categoria e contrate diretamente com o profissional.</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div class="relative flex-grow sm:w-64">
                                <input type="text" id="catalogo-search" placeholder="Buscar por serviço ou descrição..." class="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <i class="fas fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs"></i>
                            </div>
                            <select id="catalogo-categoria-filtro" class="text-xs border border-gray-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value="">Todas as Categorias</option>
                            </select>
                        </div>
                    </div>
                    <div id="catalogo-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="col-span-full text-center py-8 text-gray-500 text-sm">Carregando catálogo...</div>
                    </div>
                </div>
            </div>

            <!-- Tab: Solicitante -->
            ${(userData.tipo === 'solicitante' || userData.tipo === 'ambos') ? `
            <div class="tab-content hidden" id="tab-solicitante">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Minhas Solicitações</h3>
                            <p class="text-sm text-gray-500">Acompanhe os pedidos que você abriu.</p>
                        </div>
                        <button id="btn-nova-solicitacao" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                            <i class="fas fa-plus mr-2"></i> Nova Solicitação
                        </button>
                    </div>
                    <div id="minhas-solicitacoes-list" class="space-y-4">
                        <div class="text-center py-8 text-gray-500 text-sm">Carregando solicitações...</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Tab: Prestador -->
            ${(userData.tipo === 'prestador' || userData.tipo === 'ambos') ? `
            <div class="tab-content hidden" id="tab-prestador">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-6">
                    <!-- Dashboard de Desempenho do Prestador -->
                    <div class="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div class="mb-4">
                            <h3 class="text-xl font-bold text-gray-900">Painel de Desempenho & Aproveitamento</h3>
                            <p class="text-sm text-gray-500">Métricas de conversão de propostas e valores médios de orçamentos.</p>
                        </div>
                        <div id="prestador-metricas-grid" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <span class="text-xs text-gray-500 block mb-1 font-medium">Total de Propostas</span>
                                <span class="text-2xl font-black text-gray-900" id="metrica-total-orcamentos">0</span>
                            </div>
                            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <span class="text-xs text-emerald-700 block mb-1 font-medium">Taxa de Aprovação</span>
                                <span class="text-2xl font-black text-emerald-600" id="metrica-taxa-aprovacao">0%</span>
                            </div>
                            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <span class="text-xs text-blue-700 block mb-1 font-medium">Ticket Médio</span>
                                <span class="text-2xl font-black text-blue-600" id="metrica-ticket-medio">R$ 0,00</span>
                            </div>
                            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <span class="text-xs text-purple-700 block mb-1 font-medium">Total Fechado</span>
                                <span class="text-2xl font-black text-purple-600" id="metrica-total-fechado">R$ 0,00</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Mural de Solicitações</h3>
                            <p class="text-sm text-gray-500">Pedidos abertos aguardando propostas.</p>
                        </div>
                        <button id="btn-atualizar-mural" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                            <i class="fas fa-sync-alt mr-2"></i> Atualizar
                        </button>
                    </div>
                    <div id="mural-solicitacoes-list" class="space-y-4 mb-10">
                        <div class="text-center py-8 text-gray-500 text-sm">Carregando mural...</div>
                    </div>

                    <div class="border-t border-gray-100 pt-8 mb-10">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                            <div>
                                <h3 class="text-xl font-bold text-gray-900">Meus Orçamentos Enviados</h3>
                                <p class="text-sm text-gray-500">Histórico de propostas separadas por status.</p>
                            </div>
                            <div class="flex gap-1.5 bg-gray-100 p-1 rounded-xl" id="filtro-orcamentos-container">
                                <button class="btn-filtro-orcamento px-3 py-1 text-xs font-semibold rounded-lg bg-white shadow-2xs text-gray-800" data-status="TODOS">Todos</button>
                                <button class="btn-filtro-orcamento px-3 py-1 text-xs font-semibold rounded-lg text-gray-600 hover:text-gray-900" data-status="APROVADO">Aprovados</button>
                                <button class="btn-filtro-orcamento px-3 py-1 text-xs font-semibold rounded-lg text-gray-600 hover:text-gray-900" data-status="AGUARDANDO">Aguardando</button>
                                <button class="btn-filtro-orcamento px-3 py-1 text-xs font-semibold rounded-lg text-gray-600 hover:text-gray-900" data-status="REPROVADO">Reprovados</button>
                            </div>
                        </div>
                        <div id="meus-orcamentos-list" class="space-y-4">
                            <div class="text-center py-8 text-gray-500 text-sm">Carregando orçamentos...</div>
                        </div>
                    </div>

                    <div class="border-t border-gray-100 pt-8">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h3 class="text-xl font-bold text-gray-900">Meus Serviços Avulsos</h3>
                                <p class="text-sm text-gray-500">Serviços que você oferece diretamente.</p>
                            </div>
                            <button id="btn-novo-servico" class="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                                <i class="fas fa-plus mr-2"></i> Novo Serviço
                            </button>
                        </div>
                        <div id="servicos-avulsos-list" class="space-y-4">
                            <div class="text-center py-8 text-gray-500 text-sm">Carregando serviços...</div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Tab: Usuários -->
            <div class="tab-content hidden" id="tab-usuarios">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-6">
                    <div class="mb-6 flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Explorar Usuários</h3>
                            <p class="text-sm text-gray-500">Diretório de usuários cadastrados na plataforma (Visão Administrativa/Teste).</p>
                        </div>
                        <button id="btn-atualizar-usuarios" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                            <i class="fas fa-sync-alt mr-2"></i> Atualizar
                        </button>
                    </div>
                    <div id="usuarios-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="col-span-full text-center py-8 text-gray-500 text-sm">Carregando usuários...</div>
                    </div>
                </div>
            </div>

            <!-- Tab: Área de Testes -->
            <div class="tab-content hidden" id="tab-area-testes">
                <div class="text-center py-12 text-gray-500 text-sm">
                    <i class="fas fa-spinner fa-spin text-amber-600 text-xl mb-2"></i>
                    <p>Carregando Área de Testes e Demonstração...</p>
                </div>
            </div>
        </div>
    `;

    // Tabs Logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('block');
            });

            button.classList.remove('border-transparent', 'text-gray-500');
            button.classList.add('border-blue-500', 'text-blue-600');
            
            const target = button.getAttribute('data-target');
            const targetEl = document.getElementById(target);
            if (targetEl) {
                targetEl.classList.remove('hidden');
                targetEl.classList.add('block');
            }

            if (target === 'tab-area-testes') {
                inicializarAreaTestes(db, targetEl, () => {
                    const btnDash = document.querySelector('.tab-button[data-target="tab-dashboard"]');
                    if (btnDash) btnDash.click();
                });
            }
        });
    });

    if (userData.tipo === 'solicitante' || userData.tipo === 'ambos') {
        const btnNova = document.getElementById('btn-nova-solicitacao');
        if (btnNova) btnNova.addEventListener('click', abrirModalSolicitacao);
        carregarMinhasSolicitacoes(userData.uid);
    }

    if (userData.tipo === 'prestador' || userData.tipo === 'ambos') {
        const btnNovoSrv = document.getElementById('btn-novo-servico');
        if (btnNovoSrv) btnNovoSrv.addEventListener('click', abrirModalServico);
        
        const btnMural = document.getElementById('btn-atualizar-mural');
        if (btnMural) btnMural.addEventListener('click', carregarMuralSolicitacoes);
        
        const btnSalvarPix = document.getElementById('btn-salvar-pix');
        if (btnSalvarPix) {
            btnSalvarPix.addEventListener('click', async () => {
                const chave = document.getElementById('input-chave-pix').value.trim();
                btnSalvarPix.innerHTML = '...';
                try {
                    await updateDoc(doc(db, 'usuarios', userData.uid), { chavePix: chave });
                    alert('Chave Pix salva com sucesso!');
                    userData.chavePix = chave;
                } catch(e) {
                    console.error(e);
                    alert('Erro ao salvar chave Pix.');
                }
                btnSalvarPix.innerHTML = 'Salvar';
            });
        }

        carregarMuralSolicitacoes();
        carregarMeusOrcamentos(userData.uid, userData.chavePix);
        carregarServicosAvulsos(userData.uid);
    }

    // Configura o modal de edição de perfil
    configurarModalEditarPerfil(userData);

    // Carrega o catálogo de serviços
    carregarCatalogo(userData);

    // Load Users automatically
    carregarUsuariosLista();
    document.getElementById('btn-atualizar-usuarios').addEventListener('click', carregarUsuariosLista);
}

// ==========================================
// Modal: Edição de Dados Cadastrais / Perfil
// ==========================================
function configurarModalEditarPerfil(userData) {
    const modal = document.getElementById('modal-editar-perfil');
    if (!modal) return;

    const abrirModal = () => {
        document.getElementById('perfil-nome').value = userData.nome || '';
        document.getElementById('perfil-tipo-pessoa').value = userData.tipoPessoa || 'Física';
        document.getElementById('perfil-documento').value = userData.documento || '';
        document.getElementById('perfil-telefone').value = userData.telefone || '';
        document.getElementById('perfil-cidade').value = userData.cidade || '';
        document.getElementById('perfil-estado').value = userData.estado || '';
        document.getElementById('perfil-bio').value = userData.bio || '';
        document.getElementById('perfil-chave-pix').value = userData.chavePix || '';

        const tipoAtual = userData.tipo || 'solicitante';
        const radio = modal.querySelector(`input[name="editar-perfil-tipo"][value="${tipoAtual}"]`);
        if (radio) radio.checked = true;

        modal.classList.remove('hidden');
    };

    const fecharModal = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('btn-abrir-editar-perfil')?.addEventListener('click', abrirModal);
    document.getElementById('btn-alerta-editar-perfil')?.addEventListener('click', abrirModal);
    document.getElementById('btn-fechar-editar-perfil')?.addEventListener('click', fecharModal);
    document.getElementById('btn-cancelar-editar-perfil')?.addEventListener('click', fecharModal);
    document.getElementById('backdrop-editar-perfil')?.addEventListener('click', fecharModal);

    const form = document.getElementById('form-editar-perfil');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btnSubmit = document.getElementById('btn-salvar-dados-perfil');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';

            const nome = document.getElementById('perfil-nome').value.trim();
            const tipoPessoa = document.getElementById('perfil-tipo-pessoa').value;
            const documento = document.getElementById('perfil-documento').value.trim();
            const telefone = document.getElementById('perfil-telefone').value.trim();
            const cidade = document.getElementById('perfil-cidade').value.trim();
            const estado = document.getElementById('perfil-estado').value.trim().toUpperCase();
            const bio = document.getElementById('perfil-bio').value.trim();
            const chavePix = document.getElementById('perfil-chave-pix').value.trim();
            const radioTipo = modal.querySelector('input[name="editar-perfil-tipo"]:checked');
            const tipo = radioTipo ? radioTipo.value : (userData.tipo || 'solicitante');

            const dadosAtualizados = {
                nome,
                tipoPessoa,
                documento,
                telefone,
                cidade,
                estado,
                bio,
                chavePix,
                tipo,
                atualizadoEm: serverTimestamp()
            };

            try {
                await updateDoc(doc(db, "usuarios", userData.uid), dadosAtualizados);
                Object.assign(userData, dadosAtualizados);
                fecharModal();
                alert("Dados cadastrais atualizados com sucesso!");
                renderDashboard(userData);
            } catch (err) {
                console.error("Erro ao atualizar perfil:", err);
                alert("Erro ao salvar dados cadastrais: " + err.message);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Salvar Alterações';
            }
        };
    }
}

// ==========================================
// Catálogo de Serviços Profissionais
// ==========================================
async function carregarCatalogo(currentUserData) {
    const grid = document.getElementById('catalogo-grid');
    const selectCat = document.getElementById('catalogo-categoria-filtro');
    const searchInput = document.getElementById('catalogo-search');
    if (!grid) return;

    if (selectCat && selectCat.options.length <= 1) {
        selectCat.innerHTML = '<option value="">Todas as Categorias</option>';
        for (const cat in TAXONOMIA) {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            selectCat.appendChild(opt);
        }
    }

    grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i> Carregando catálogo de serviços...</div>';

    try {
        const srvSnap = await getDocs(collection(db, "servicos_avulsos"));
        if (srvSnap.empty) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 text-sm">Nenhum serviço disponível no catálogo no momento.</div>';
            return;
        }

        const prestadoresMap = {};
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        usuariosSnap.forEach(d => {
            prestadoresMap[d.id] = { id: d.id, ...d.data() };
        });

        const servicos = [];
        srvSnap.forEach(d => {
            const s = { id: d.id, ...d.data() };
            if (s.ativo !== false) {
                servicos.push(s);
            }
        });

        servicos.sort((a, b) => {
            const ta = a.criadoEm ? a.criadoEm.toMillis() : 0;
            const tb = b.criadoEm ? b.criadoEm.toMillis() : 0;
            return tb - ta;
        });

        const renderGrid = () => {
            const catFiltro = selectCat ? selectCat.value : '';
            const termoBusca = searchInput ? searchInput.value.trim().toLowerCase() : '';

            const filtrados = servicos.filter(s => {
                if (catFiltro && s.categoria !== catFiltro) return false;
                if (termoBusca) {
                    const matchTitulo = (s.titulo || '').toLowerCase().includes(termoBusca);
                    const matchDesc = (s.descricao || '').toLowerCase().includes(termoBusca);
                    const matchCat = (s.categoria || '').toLowerCase().includes(termoBusca);
                    const matchSub = (s.subcategoria || '').toLowerCase().includes(termoBusca);
                    if (!matchTitulo && !matchDesc && !matchCat && !matchSub) return false;
                }
                return true;
            });

            if (filtrados.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 text-sm">Nenhum serviço encontrado para os filtros selecionados.</div>';
                return;
            }

            let html = '';
            filtrados.forEach(s => {
                const prestador = prestadoresMap[s.prestador_uid] || { nome: 'Profissional', notaMedia: 5.0, totalAvaliacoes: 0, foto: '' };
                const valorFormatado = s.valor_base ? `R$ ${s.valor_base.toFixed(2).replace('.', ',')}` : 'Sob Consulta';
                const foto = prestador.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome || 'P')}&background=0D8ABC&color=fff`;
                const nota = prestador.notaMedia ? Number(prestador.notaMedia).toFixed(1) : '5.0';

                html += `
                    <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start gap-2 mb-2">
                                <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full truncate max-w-[200px]" title="${s.categoria} › ${s.subcategoria}">
                                    ${s.categoria} &rsaquo; ${s.subcategoria}
                                </span>
                                <span class="text-sm font-black text-emerald-700 shrink-0">${valorFormatado}</span>
                            </div>
                            <h4 class="text-base font-bold text-gray-900 mb-1 line-clamp-1" title="${s.titulo}">${s.titulo}</h4>
                            <p class="text-xs text-gray-600 line-clamp-3 mb-4">${s.descricao}</p>
                        </div>

                        <div class="pt-4 border-t border-gray-100 mt-2">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="${foto}" class="w-8 h-8 rounded-full object-cover border border-gray-200">
                                    <div class="truncate max-w-[120px]">
                                        <span class="text-xs font-bold text-gray-900 block truncate">${prestador.nome}</span>
                                        <span class="text-[10px] text-gray-400 block">${prestador.cidade ? `${prestador.cidade}-${prestador.estado || ''}` : 'Brasil'}</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                                        <i class="fas fa-star text-[10px]"></i> ${nota}
                                    </span>
                                    <span class="text-[10px] text-gray-400">(${prestador.totalAvaliacoes || 0} aval.)</span>
                                </div>
                            </div>
                            <button class="btn-ver-detalhes-catalogo w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                data-id="${s.id}">
                                <i class="fas fa-eye"></i> Detalhes & Contratar
                            </button>
                        </div>
                    </div>
                `;
            });

            grid.innerHTML = html;

            grid.querySelectorAll('.btn-ver-detalhes-catalogo').forEach(btn => {
                btn.addEventListener('click', () => {
                    const servId = btn.getAttribute('data-id');
                    const serv = servicos.find(item => item.id === servId);
                    if (serv) {
                        const prest = prestadoresMap[serv.prestador_uid] || { nome: 'Profissional' };
                        abrirModalDetalhesServico(serv, prest, currentUserData);
                    }
                });
            });
        };

        renderGrid();

        if (selectCat) selectCat.onchange = renderGrid;
        if (searchInput) searchInput.oninput = renderGrid;

    } catch (e) {
        console.error("Erro ao carregar catálogo:", e);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500 text-sm">Erro ao carregar serviços do catálogo.</div>';
    }
}

async function abrirModalDetalhesServico(servico, prestador, currentUserData) {
    const modal = document.getElementById('modal-detalhes-catalogo');
    if (!modal) return;

    document.getElementById('detalhes-servico-categoria').textContent = `${servico.categoria} › ${servico.subcategoria}`;
    document.getElementById('detalhes-servico-titulo').textContent = servico.titulo;
    document.getElementById('detalhes-servico-preco').textContent = servico.valor_base ? `R$ ${servico.valor_base.toFixed(2).replace('.', ',')}` : 'Sob Consulta';
    document.getElementById('detalhes-servico-descricao').textContent = servico.descricao;

    const foto = prestador.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome || 'P')}&background=0D8ABC&color=fff`;
    document.getElementById('detalhes-prestador-foto').src = foto;
    document.getElementById('detalhes-prestador-nome').textContent = prestador.nome || 'Profissional';
    document.getElementById('detalhes-prestador-cidade').textContent = prestador.cidade ? `${prestador.cidade} - ${prestador.estado || ''}` : 'Brasil';
    document.getElementById('detalhes-prestador-avaliacao').innerHTML = `<i class="fas fa-star text-xs"></i> ${prestador.notaMedia ? Number(prestador.notaMedia).toFixed(1) : '5.0'} (${prestador.totalAvaliacoes || 0} avaliações)`;
    document.getElementById('detalhes-prestador-bio').textContent = prestador.bio || 'Profissional cadastrado na plataforma com atendimento transparente e qualificado.';

    const btnWhats = document.getElementById('btn-whatsapp-prestador');
    if (btnWhats) {
        const fone = (prestador.telefone || '').replace(/\D/g, '');
        if (fone) {
            const msg = encodeURIComponent(`Olá ${prestador.nome}, encontrei seu serviço "${servico.titulo}" no aplicativo ServiçosApp e gostaria de solicitar mais informações.`);
            btnWhats.href = `https://wa.me/55${fone}?text=${msg}`;
        } else {
            btnWhats.href = `https://wa.me/?text=${encodeURIComponent(`Olá, vi o serviço "${servico.titulo}" no ServiçosApp!`)}`;
        }
    }

    const avalContainer = document.getElementById('detalhes-avaliacoes-lista');
    if (avalContainer) {
        avalContainer.innerHTML = '<div class="text-xs text-gray-400 py-2"><i class="fas fa-spinner fa-spin mr-1"></i> Carregando avaliações...</div>';
        try {
            const qAval = query(collection(db, "avaliacoes"), where("prestadorId", "==", servico.prestador_uid));
            const avalSnap = await getDocs(qAval);
            if (avalSnap.empty) {
                avalContainer.innerHTML = '<p class="text-xs text-gray-500 italic py-1">Nenhuma avaliação detalhada ainda. Seja o primeiro a contratar e avaliar!</p>';
            } else {
                let htmlAval = '';
                avalSnap.forEach(d => {
                    const av = d.data();
                    let estrelas = '';
                    for (let i = 1; i <= 5; i++) {
                        estrelas += `<i class="fas fa-star text-[10px] ${i <= (av.nota || 5) ? 'text-amber-400' : 'text-gray-200'}"></i>`;
                    }
                    htmlAval += `
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                            <div class="flex items-center justify-between mb-1">
                                <div class="flex gap-0.5">${estrelas}</div>
                                <span class="text-[10px] text-gray-400">Avaliação verificada</span>
                            </div>
                            <p class="text-xs text-gray-700 italic">"${av.comentario || 'Ótimo serviço prestado!'}"</p>
                        </div>
                    `;
                });
                avalContainer.innerHTML = htmlAval;
            }
        } catch (e) {
            console.error(e);
            avalContainer.innerHTML = '<p class="text-xs text-gray-400">Avaliações do prestador indisponíveis no momento.</p>';
        }
    }

    const btnContratar = document.getElementById('btn-contratar-servico-direto');
    if (btnContratar) {
        btnContratar.onclick = async () => {
            if (!confirm(`Deseja confirmar a contratação direta do serviço "${servico.titulo}" com ${prestador.nome}?`)) return;

            btnContratar.disabled = true;
            btnContratar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Contratando...';

            try {
                const user = auth.currentUser;
                if (!user) throw new Error("Você precisa estar conectado para contratar.");

                const novaSolicitacaoRef = await addDoc(collection(db, "solicitacoes"), {
                    solicitanteId: user.uid,
                    nomeSolicitante: user.displayName || currentUserData.nome || 'Cliente',
                    titulo: `Contratação Direta: ${servico.titulo}`,
                    categoria: servico.categoria,
                    subcategoria: servico.subcategoria,
                    descricao: `Contratação direta efetuada via Catálogo de Serviços.\n\nServiço: ${servico.titulo}\nValor Base: R$ ${servico.valor_base ? servico.valor_base.toFixed(2) : 'A combinar'}\n\nDetalhes:\n${servico.descricao}`,
                    endereco: currentUserData.cidade ? `${currentUserData.cidade} - ${currentUserData.estado || ''}` : 'Região do Solicitante',
                    status: "CONTRATADA",
                    prestadorContratadoId: servico.prestador_uid,
                    origem: "CATALOGO_DIRETO",
                    servicoOriginalId: servico.id,
                    criadoEm: serverTimestamp()
                });

                // Registra na coleção contratacoes para auditoria e histórico de contratos
                try {
                    await addDoc(collection(db, "contratacoes"), {
                        solicitacaoId: novaSolicitacaoRef.id,
                        solicitanteId: user.uid,
                        nomeSolicitante: user.displayName || currentUserData.nome || 'Cliente',
                        prestadorId: servico.prestador_uid,
                        nomePrestador: prestador.nome || 'Prestador',
                        servicoId: servico.id,
                        tituloServico: servico.titulo,
                        valor: servico.valor_base || 0,
                        status: "CONFIRMADA",
                        criadoEm: serverTimestamp()
                    });
                } catch (eContrato) {
                    console.warn("Aviso ao registrar contratação específica:", eContrato);
                }

                // Tenta atualizar reputação do prestador de forma segura
                try {
                    const prestadorRef = doc(db, "usuarios", servico.prestador_uid);
                    const prestadorSnap = await getDoc(prestadorRef);
                    if (prestadorSnap.exists()) {
                        const d = prestadorSnap.data();
                        await updateDoc(prestadorRef, {
                            pontos: (d.pontos || 0) + 15,
                            servicos_concluidos: (d.servicos_concluidos || 0) + 1
                        });
                    }
                } catch (ePerm) {
                    // Segurança do Firestore: se regras do perfil impedirem escrita direta no documento de outro usuário, ignora sem quebrar a contratação
                    console.info("Pontuação do prestador será contabilizada no backend:", ePerm.message);
                }

                modal.classList.add('hidden');
                alert(`Parabéns! Você contratou "${servico.titulo}" diretamente com ${prestador.nome}. O serviço foi adicionado à sua aba "Minhas Solicitações", onde você poderá finalizá-lo e avaliá-lo.`);

                const tabSolBtn = document.querySelector('.tab-button[data-target="tab-solicitante"]');
                if (tabSolBtn) {
                    tabSolBtn.click();
                } else {
                    carregarMinhasSolicitacoes(user.uid);
                }

            } catch (err) {
                console.error("Erro ao contratar:", err);
                alert("Erro ao contratar serviço: " + err.message);
            } finally {
                btnContratar.disabled = false;
                btnContratar.innerHTML = '<i class="fas fa-check-circle mr-1.5"></i> Contratar Serviço';
            }
        };
    }

    const fechar = () => modal.classList.add('hidden');
    document.getElementById('btn-fechar-detalhes-catalogo')?.addEventListener('click', fechar);
    document.getElementById('backdrop-detalhes-catalogo')?.addEventListener('click', fechar);

    modal.classList.remove('hidden');
}

async function carregarUsuariosLista() {
    const listContainer = document.getElementById('usuarios-list');
    if (!listContainer) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Nenhum usuário encontrado.</div>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach(doc => {
            const u = doc.data();
            const date = u.criadoEm ? new Date(u.criadoEm.toMillis()).toLocaleDateString('pt-BR') : 'Data desconhecida';
            
            html += `
                <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-4 mb-4">
                        <img class="h-12 w-12 rounded-full object-cover bg-gray-100" src="${u.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.nome || 'U') + '&background=0D8ABC&color=fff'}" alt="Foto do usuário">
                        <div>
                            <h4 class="text-lg font-bold text-gray-900 truncate" title="${u.nome}">${u.nome}</h4>
                            <p class="text-sm text-gray-500 truncate">${u.email || 'Sem e-mail'}</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"><i class="fas fa-tag mr-1"></i> ${u.tipo === 'ambos' ? 'Solicitante & Prestador' : (u.tipo === 'prestador' ? 'Prestador' : 'Solicitante')}</span>
                        <span class="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs rounded-full font-medium"><i class="fas fa-star mr-1"></i> ${u.pontos || 0} pts</span>
                    </div>
                    <div class="text-xs text-gray-400">
                        <i class="far fa-calendar-alt mr-1"></i> Registrado em: ${date}
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        listContainer.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Erro ao carregar usuários.</div>';
    }
}

async function login() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Falha ao realizar login com o Google. Verifique sua conexão e tente novamente.");
    }
}

async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro no logout:", error);
    }
}

async function checkUserProfile(user) {
    try {
        mainContent.innerHTML = `
            <div class="flex justify-center items-center h-full min-h-[50vh]">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        `;
        
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            renderDashboard(userSnap.data());
        } else {
            // First time login - show onboarding
            showOnboardingModal(user, userRef);
            // Show a basic loading or wait state in the background
            mainContent.innerHTML = `
                <div class="flex flex-col justify-center items-center h-full min-h-[50vh] text-center">
                    <h2 class="text-2xl font-bold text-gray-700">Quase lá...</h2>
                    <p class="text-gray-500 mt-2">Complete seu cadastro na janela pop-up.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        mainContent.innerHTML = `
            <div class="text-center py-20">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                    <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Erro de Conexão</h2>
                <p class="text-gray-500 max-w-md mx-auto mb-6">Não foi possível carregar seus dados no momento. Verifique sua conexão e tente novamente.</p>
                <button onclick="window.location.reload()" class="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                    Recarregar Página
                </button>
            </div>
        `;
    }
}

function showOnboardingModal(user, userRef) {
    onboardingModal.classList.remove('hidden');
    
    // Cleanup previous event listeners to avoid multiple triggers
    const novoBtn = btnSalvarPerfil.cloneNode(true);
    btnSalvarPerfil.parentNode.replaceChild(novoBtn, btnSalvarPerfil);
    btnSalvarPerfil = novoBtn;
    
    btnSalvarPerfil.addEventListener('click', async () => {
        const radioSelecionado = document.querySelector('input[name="perfil-tipo"]:checked');
        if (!radioSelecionado) {
            alert("Por favor, selecione uma opção para continuar.");
            return;
        }
        
        const tipoSelecionado = radioSelecionado.value;
        
        btnSalvarPerfil.disabled = true;
        btnSalvarPerfil.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
        btnSalvarPerfil.classList.add('opacity-75', 'cursor-not-allowed');
        
        const userData = {
            uid: user.uid,
            nome: user.displayName || 'Sem Nome',
            email: user.email || '',
            foto: user.photoURL || '',
            tipo: tipoSelecionado,
            pontos: 0,
            servicos_concluidos: 0,
            criadoEm: serverTimestamp()
        };
        
        try {
            await setDoc(userRef, userData);
            onboardingModal.classList.add('hidden');
            renderDashboard(userData);
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            alert("Erro ao salvar o perfil. Tente novamente.");
            btnSalvarPerfil.disabled = false;
            btnSalvarPerfil.innerHTML = 'Salvar Perfil';
            btnSalvarPerfil.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });
}

// ==========================================
// Lógica de Serviços Avulsos
// ==========================================
const servicoModal = document.getElementById('servico-modal');
const formServico = document.getElementById('form-servico');
const selectCategoria = document.getElementById('servico-categoria');
const selectSubcategoria = document.getElementById('servico-subcategoria');

function inicializarCategorias() {
    selectCategoria.innerHTML = '<option value="">Selecione...</option>';
    for (const cat in TAXONOMIA) {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
    }
}

selectCategoria?.addEventListener('change', (e) => {
    const categoria = e.target.value;
    if (categoria && TAXONOMIA[categoria]) {
        selectSubcategoria.disabled = false;
        selectSubcategoria.innerHTML = '<option value="">Selecione...</option>';
        selectSubcategoria.classList.replace('bg-gray-50', 'bg-white');
        TAXONOMIA[categoria].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            selectSubcategoria.appendChild(option);
        });
    } else {
        selectSubcategoria.disabled = true;
        selectSubcategoria.innerHTML = '<option value="">Selecione a categoria antes</option>';
        selectSubcategoria.classList.replace('bg-white', 'bg-gray-50');
    }
});

function abrirModalServico() {
    inicializarCategorias();
    formServico.reset();
    selectSubcategoria.disabled = true;
    selectSubcategoria.innerHTML = '<option value="">Selecione a categoria antes</option>';
    selectSubcategoria.classList.replace('bg-white', 'bg-gray-50');
    servicoModal.classList.remove('hidden');
}

document.getElementById('btn-cancelar-servico')?.addEventListener('click', () => {
    servicoModal.classList.add('hidden');
});

formServico?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-salvar-servico');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
    
    const titulo = document.getElementById('servico-titulo').value;
    const categoria = document.getElementById('servico-categoria').value;
    const subcategoria = document.getElementById('servico-subcategoria').value;
    const descricao = document.getElementById('servico-descricao').value;
    const valorInput = document.getElementById('servico-valor').value;
    const valor = valorInput ? parseFloat(valorInput) : null;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        await addDoc(collection(db, "servicos_avulsos"), {
            prestador_uid: user.uid,
            titulo: titulo,
            categoria: categoria,
            subcategoria: subcategoria,
            descricao: descricao,
            valor_base: valor,
            ativo: true,
            criadoEm: serverTimestamp()
        });
        
        servicoModal.classList.add('hidden');
        alert("Serviço cadastrado com sucesso!");
        carregarServicosAvulsos(user.uid);
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        alert("Erro ao salvar serviço. Tente novamente.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Salvar Serviço';
    }
});

async function carregarServicosAvulsos(uid) {
    const listContainer = document.getElementById('servicos-avulsos-list');
    if (!listContainer) return;
    
    try {
        const q = query(
            collection(db, "servicos_avulsos"), 
            where("prestador_uid", "==", uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <i class="fas fa-box-open text-3xl text-gray-400 mb-3"></i>
                    <p class="text-gray-500">Nenhum serviço avulso cadastrado ainda.</p>
                </div>
            `;
            return;
        }
        
        let servicos = [];
        querySnapshot.forEach(doc => {
            servicos.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenação client-side para evitar a necessidade de índice composto (onde + orderBy) nesta fase
        servicos.sort((a, b) => {
            const ta = a.criadoEm ? a.criadoEm.toMillis() : 0;
            const tb = b.criadoEm ? b.criadoEm.toMillis() : 0;
            return tb - ta; 
        });

        let html = '';
        servicos.forEach((s) => {
            const valorFormatado = s.valor_base ? `R$ ${s.valor_base.toFixed(2).replace('.', ',')}` : 'Valor sob consulta';
            
            html += `
                <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-2">
                                ${s.categoria} &rsaquo; ${s.subcategoria}
                            </span>
                            <h4 class="text-lg font-semibold text-gray-900">${s.titulo}</h4>
                            <p class="text-gray-600 text-sm mt-1 line-clamp-2">${s.descricao}</p>
                        </div>
                        <div class="text-right ml-4">
                            <span class="block text-lg font-bold text-gray-900 whitespace-nowrap">${valorFormatado}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar serviços. Tente atualizar a página.</div>';
    }
}

// ==========================================
// Lógica de Solicitações (FASE 3)
// ==========================================
const solicitacaoModal = document.getElementById('solicitacao-modal');
const formSolicitacao = document.getElementById('form-solicitacao');
const selectCategoriaSolic = document.getElementById('solic-categoria');
const selectSubcategoriaSolic = document.getElementById('solic-subcategoria');

function inicializarCategoriasSolic() {
    if(!selectCategoriaSolic) return;
    selectCategoriaSolic.innerHTML = '<option value="">Selecione...</option>';
    for (const cat in TAXONOMIA) {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        selectCategoriaSolic.appendChild(option);
    }
}

selectCategoriaSolic?.addEventListener('change', (e) => {
    const categoria = e.target.value;
    if (categoria && TAXONOMIA[categoria]) {
        selectSubcategoriaSolic.disabled = false;
        selectSubcategoriaSolic.innerHTML = '<option value="">Selecione...</option>';
        selectSubcategoriaSolic.classList.replace('bg-gray-50', 'bg-white');
        TAXONOMIA[categoria].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            selectSubcategoriaSolic.appendChild(option);
        });
    } else {
        selectSubcategoriaSolic.disabled = true;
        selectSubcategoriaSolic.innerHTML = '<option value="">Selecione a categoria antes</option>';
        selectSubcategoriaSolic.classList.replace('bg-white', 'bg-gray-50');
    }
});

function abrirModalSolicitacao() {
    inicializarCategoriasSolic();
    formSolicitacao.reset();
    selectSubcategoriaSolic.disabled = true;
    selectSubcategoriaSolic.innerHTML = '<option value="">Selecione a categoria antes</option>';
    selectSubcategoriaSolic.classList.replace('bg-white', 'bg-gray-50');
    solicitacaoModal.classList.remove('hidden');
}

document.getElementById('btn-cancelar-solic')?.addEventListener('click', () => {
    solicitacaoModal.classList.add('hidden');
});

formSolicitacao?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-salvar-solic');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Abrindo...';
    
    const titulo = document.getElementById('solic-titulo').value;
    const categoria = document.getElementById('solic-categoria').value;
    const subcategoria = document.getElementById('solic-subcategoria').value;
    const descricao = document.getElementById('solic-descricao').value;
    const endereco = document.getElementById('solic-endereco').value;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        await addDoc(collection(db, "solicitacoes"), {
            solicitanteId: user.uid,
            nomeSolicitante: user.displayName || 'Usuário',
            titulo: titulo,
            categoria: categoria,
            subcategoria: subcategoria,
            descricao: descricao,
            endereco: endereco,
            status: "ABERTA",
            criadoEm: serverTimestamp()
        });
        
        solicitacaoModal.classList.add('hidden');
        alert("Solicitação criada com sucesso!");
        carregarMinhasSolicitacoes(user.uid);
    } catch (error) {
        console.error("Erro ao salvar solicitação:", error);
        alert("Erro ao criar a solicitação. Tente novamente.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Abrir Solicitação';
    }
});

async function carregarMinhasSolicitacoes(uid) {
    const listContainer = document.getElementById('minhas-solicitacoes-list');
    if (!listContainer) return;
    
    try {
        const q = query(
            collection(db, "solicitacoes"), 
            where("solicitanteId", "==", uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <i class="fas fa-clipboard-list text-3xl text-gray-400 mb-3"></i>
                    <p class="text-gray-500">Nenhuma solicitação aberta ainda.</p>
                </div>
            `;
            return;
        }
        
        let solicitacoes = [];
        querySnapshot.forEach(doc => solicitacoes.push({ id: doc.id, ...doc.data() }));
        
        solicitacoes.sort((a, b) => {
            const ta = a.criadoEm ? a.criadoEm.toMillis() : 0;
            const tb = b.criadoEm ? b.criadoEm.toMillis() : 0;
            return tb - ta; 
        });

        let html = '';
        solicitacoes.forEach((s) => {
            const date = s.criadoEm ? new Date(s.criadoEm.toMillis()).toLocaleDateString('pt-BR') : 'Recente';
            const showOrcamentosBtn = s.status === 'ABERTA' || s.status === 'CONTRATADA';
            html += `
                <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div class="flex flex-col sm:flex-row justify-between items-start">
                        <div class="flex-grow pr-4">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    ${s.categoria} &rsaquo; ${s.subcategoria}
                                </span>
                                <span class="inline-block px-2.5 py-1 ${s.status === 'CONTRATADA' ? 'bg-purple-50 text-purple-700 border-purple-200' : (s.status === 'CONCLUIDA' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200')} text-xs font-bold rounded-full border">
                                    ${s.status}
                                </span>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900">${s.titulo}</h4>
                            <p class="text-gray-600 text-sm mt-1 line-clamp-2">${s.descricao}</p>
                            <div class="mt-3 text-xs text-gray-500 flex items-center">
                                <i class="fas fa-map-marker-alt mr-1"></i> ${s.endereco}
                                <span class="mx-2">&bull;</span>
                                <i class="far fa-clock mr-1"></i> ${date}
                            </div>
                        </div>
                        <div class="mt-4 sm:mt-0 flex-shrink-0 flex flex-col space-y-2">
                            ${showOrcamentosBtn ? `
                            <button class="btn-ver-orcamentos w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap" data-id="${s.id}">
                                Ver Orçamentos
                            </button>
                            ` : ''}
                            ${s.status === 'CONTRATADA' ? `
                            <button class="btn-avaliar w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap" data-id="${s.id}" data-prestador="${s.prestadorContratadoId}">
                                Concluir Serviço
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.btn-ver-orcamentos').forEach(btn => {
            btn.addEventListener('click', (e) => {
                abrirModalVerOrcamentos(e.target.dataset.id);
            });
        });

        listContainer.querySelectorAll('.btn-avaliar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                abrirModalAvaliacao(e.target.dataset.id, e.target.dataset.prestador);
            });
        });
        
    } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar solicitações. Tente atualizar a página.</div>';
    }
}

async function carregarMuralSolicitacoes() {
    const listContainer = document.getElementById('mural-solicitacoes-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div class="text-center py-6 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i> Carregando mural...</div>';
    
    try {
        const q = query(
            collection(db, "solicitacoes"), 
            where("status", "==", "ABERTA")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <i class="fas fa-inbox text-3xl text-gray-400 mb-3"></i>
                    <p class="text-gray-500">Não há solicitações abertas na plataforma no momento.</p>
                </div>
            `;
            return;
        }
        
        let solicitacoes = [];
        querySnapshot.forEach(doc => solicitacoes.push({ id: doc.id, ...doc.data() }));
        
        solicitacoes.sort((a, b) => {
            const ta = a.criadoEm ? a.criadoEm.toMillis() : 0;
            const tb = b.criadoEm ? b.criadoEm.toMillis() : 0;
            return tb - ta; 
        });

        let html = '';
        solicitacoes.forEach((s) => {
            html += `
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="inline-block px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full mb-2">
                                ${s.categoria} &rsaquo; ${s.subcategoria}
                            </span>
                            <h4 class="text-lg font-semibold text-gray-900">${s.titulo}</h4>
                            <p class="text-gray-600 text-sm mt-1 line-clamp-2">${s.descricao}</p>
                            <p class="text-gray-500 text-xs mt-2 font-medium">Por: ${s.nomeSolicitante} &bull; <i class="fas fa-map-marker-alt mr-1"></i> ${s.endereco}</p>
                        </div>
                        <button class="btn-fazer-oferta ml-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap" data-id="${s.id}">
                            Fazer Oferta
                        </button>
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.btn-fazer-oferta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                abrirModalOrcamento(e.target.dataset.id);
            });
        });
        
    } catch (error) {
        console.error("Erro ao carregar mural:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar o mural. Tente atualizar a página.</div>';
    }
}

// ==========================================
// Lógica de Orçamentos (FASE 4)
// ==========================================
const orcamentoModal = document.getElementById('orcamento-modal');
const formOrcamento = document.getElementById('form-orcamento');
const verOrcamentosModal = document.getElementById('ver-orcamentos-modal');

// Modelos Pré-formatados de Orçamento (Templates Reutilizáveis)
const ORCAMENTO_TEMPLATES = {
    eletrica: {
        escopo: "Etapa 1: Inspeção termográfica e teste de continuidade de circuitos elétricos;\nEtapa 2: Substituição de disjuntores obsoletos por padrão DIN e aperto de barramentos;\nEtapa 3: Balanceamento de fases, testes de fuga de corrente e identificação dos circuitos.",
        maoDeObra: 280.00,
        deslocamento: 40.00,
        itens: [
            { descricao: "Disjuntor Bipolar 40A Curva C Steck", quantidade: 1, valorUnitario: 55.00 },
            { descricao: "Disjuntor Unipolar 20A Curva B Steck", quantidade: 3, valorUnitario: 15.00 },
            { descricao: "Barramento tipo Pente Bifásico e Conectores", quantidade: 1, valorUnitario: 35.00 }
        ],
        prazo: 1,
        garantia: "180 dias",
        observacao: "Garantia de 6 meses sobre os serviços prestados. Aprovado conforme normas NBR 5410."
    },
    ar_condicionado: {
        escopo: "Etapa 1: Furação em alvenaria e fixação dos suportes da evaporadora e condensadora;\nEtapa 2: Instalação da tubulação de cobre com isolamento blindado e cabeamento PP;\nEtapa 3: Teste de estanqueidade com nitrogênio, vácuo abaixo de 500 micra e carga de fluído.",
        maoDeObra: 380.00,
        deslocamento: 50.00,
        itens: [
            { descricao: "Kit Tubulação Cobre 1/4 e 3/8 com Isolamento (3m)", quantidade: 1, valorUnitario: 80.00 },
            { descricao: "Suporte Reforçado para Condensadora Externa", quantidade: 1, valorUnitario: 35.00 },
            { descricao: "Cabo PP 4x1.5mm e dreno cristal reforçado", quantidade: 1, valorUnitario: 25.00 }
        ],
        prazo: 1,
        garantia: "365 dias",
        observacao: "Não inclui ponto elétrico dedicado de força 220V no local. Garantia de 1 ano na instalação."
    },
    pintura: {
        escopo: "Etapa 1: Lixamento prévio, raspagem de partes soltas e aplicação de fundo preparador;\nEtapa 2: Aplicação de duas demãos de massa corrida com lixamento intermediário;\nEtapa 3: Aplicação de duas a três demãos de tinta acrílica acetinada de primeira linha.",
        maoDeObra: 480.00,
        deslocamento: 30.00,
        itens: [
            { descricao: "Lixas para parede grãos 150 e 220 (pct c/ 10)", quantidade: 1, valorUnitario: 25.00 },
            { descricao: "Fitas crepe automotiva 48mm e rolo de lona protetora", quantidade: 2, valorUnitario: 22.50 },
            { descricao: "Massa Corrida PVA Balde 25kg Suvinil", quantidade: 1, valorUnitario: 95.00 }
        ],
        prazo: 3,
        garantia: "90 dias",
        observacao: "Ambiente devidamente protegido com lona e fita crepe. Limpeza completa após a pintura."
    },
    hidraulica: {
        escopo: "Etapa 1: Detecção acústica e visual de vazamentos em tubulação pressurizada;\nEtapa 2: Abertura cirúrgica, corte do trecho danificado e instalação de luva de correr/unilong;\nEtapa 3: Testes hidrostáticos de estanqueidade sob pressão de rede e fechamento com argamassa.",
        maoDeObra: 220.00,
        deslocamento: 30.00,
        itens: [
            { descricao: "Luva de Correr PVC Soldável 25mm Tigre", quantidade: 2, valorUnitario: 18.00 },
            { descricao: "Tubo PVC Soldável Marrom 25mm (1 barra)", quantidade: 1, valorUnitario: 22.00 },
            { descricao: "Adesivo Plástico para PVC e Fita Veda Rosca", quantidade: 1, valorUnitario: 20.00 }
        ],
        prazo: 1,
        garantia: "180 dias",
        observacao: "Garantia estendida contra novos vazamentos no trecho reparado."
    }
};

function calcularTotaisOrcamento() {
    const maoDeObra = parseFloat(document.getElementById('orc-mao-obra')?.value) || 0;
    const deslocamento = parseFloat(document.getElementById('orc-deslocamento')?.value) || 0;
    
    let subtotalPecas = 0;
    const pecasRows = document.querySelectorAll('.peca-row');
    pecasRows.forEach(row => {
        const qtd = parseFloat(row.querySelector('.peca-qtd')?.value) || 0;
        const unit = parseFloat(row.querySelector('.peca-unit')?.value) || 0;
        subtotalPecas += (qtd * unit);
    });

    const subtotalEl = document.getElementById('orc-subtotal-pecas');
    if (subtotalEl) {
        subtotalEl.textContent = `R$ ${subtotalPecas.toFixed(2).replace('.', ',')}`;
    }

    const totalConsolidado = maoDeObra + deslocamento + subtotalPecas;
    const displayTotal = document.getElementById('orc-total-consolidado-display');
    if (displayTotal) {
        displayTotal.textContent = `R$ ${totalConsolidado.toFixed(2).replace('.', ',')}`;
    }

    return { maoDeObra, deslocamento, subtotalPecas, totalConsolidado };
}

function vincularEventosPecasRow(row) {
    row.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', calcularTotaisOrcamento);
    });
    row.querySelector('.btn-remover-peca')?.addEventListener('click', () => {
        const totalRows = document.querySelectorAll('.peca-row').length;
        if (totalRows > 1) {
            row.remove();
            calcularTotaisOrcamento();
        } else {
            // Limpa os campos se for a única linha
            row.querySelector('.peca-desc').value = '';
            row.querySelector('.peca-qtd').value = '1';
            row.querySelector('.peca-unit').value = '';
            calcularTotaisOrcamento();
        }
    });
}

// Botão Adicionar Peça
document.getElementById('btn-add-peca')?.addEventListener('click', () => {
    const container = document.getElementById('orc-pecas-container');
    if (!container) return;
    const newRow = document.createElement('div');
    newRow.className = 'grid grid-cols-12 gap-1.5 items-center peca-row';
    newRow.innerHTML = `
        <input type="text" placeholder="Item/Peça (ex.: Disjuntor Bipolar 40A)" class="col-span-6 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-desc">
        <input type="number" placeholder="Qtd" value="1" min="1" class="col-span-2 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-qtd">
        <input type="number" step="0.01" min="0" placeholder="Unit (R$)" class="col-span-3 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-unit">
        <button type="button" class="col-span-1 text-gray-400 hover:text-red-600 transition-colors btn-remover-peca text-center" title="Remover item">
            <i class="fas fa-trash-alt text-xs"></i>
        </button>
    `;
    container.appendChild(newRow);
    vincularEventosPecasRow(newRow);
});

// Listener de input nos campos principais
document.getElementById('orc-mao-obra')?.addEventListener('input', calcularTotaisOrcamento);
document.getElementById('orc-deslocamento')?.addEventListener('input', calcularTotaisOrcamento);

// Inicializar eventos nas linhas existentes
document.querySelectorAll('.peca-row').forEach(vincularEventosPecasRow);

// Seletor de Templates Reutilizáveis
document.getElementById('select-orc-template')?.addEventListener('change', (e) => {
    const tplKey = e.target.value;
    if (!tplKey || !ORCAMENTO_TEMPLATES[tplKey]) return;

    const tpl = ORCAMENTO_TEMPLATES[tplKey];
    document.getElementById('orc-escopo').value = tpl.escopo;
    document.getElementById('orc-mao-obra').value = tpl.maoDeObra;
    document.getElementById('orc-deslocamento').value = tpl.deslocamento;
    document.getElementById('orc-prazo').value = tpl.prazo;
    document.getElementById('orc-garantia').value = tpl.garantia;
    document.getElementById('orc-observacao').value = tpl.observacao;

    const container = document.getElementById('orc-pecas-container');
    if (container && tpl.itens && tpl.itens.length > 0) {
        container.innerHTML = '';
        tpl.itens.forEach(it => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 gap-1.5 items-center peca-row';
            row.innerHTML = `
                <input type="text" placeholder="Item/Peça" value="${it.descricao}" class="col-span-6 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-desc">
                <input type="number" placeholder="Qtd" value="${it.quantidade}" min="1" class="col-span-2 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-qtd">
                <input type="number" step="0.01" min="0" placeholder="Unit (R$)" value="${it.valorUnitario}" class="col-span-3 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-unit">
                <button type="button" class="col-span-1 text-gray-400 hover:text-red-600 transition-colors btn-remover-peca text-center" title="Remover item">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            `;
            container.appendChild(row);
            vincularEventosPecasRow(row);
        });
    }

    calcularTotaisOrcamento();
});

function abrirModalOrcamento(solicitacaoId) {
    formOrcamento.reset();
    document.getElementById('orcamento-solicitacao-id').value = solicitacaoId;
    const container = document.getElementById('orc-pecas-container');
    if (container) {
        container.innerHTML = `
            <div class="grid grid-cols-12 gap-1.5 items-center peca-row">
                <input type="text" placeholder="Item/Peça (ex.: Disjuntor Bipolar 40A)" class="col-span-6 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-desc">
                <input type="number" placeholder="Qtd" value="1" min="1" class="col-span-2 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-qtd">
                <input type="number" step="0.01" min="0" placeholder="Unit (R$)" class="col-span-3 text-xs border border-gray-300 rounded-lg p-2 bg-white peca-unit">
                <button type="button" class="col-span-1 text-gray-400 hover:text-red-600 transition-colors btn-remover-peca text-center" title="Remover item">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        document.querySelectorAll('.peca-row').forEach(vincularEventosPecasRow);
    }
    calcularTotaisOrcamento();
    orcamentoModal.classList.remove('hidden');
}

document.getElementById('btn-cancelar-orcamento')?.addEventListener('click', () => {
    orcamentoModal.classList.add('hidden');
});

document.getElementById('backdrop-orcamento')?.addEventListener('click', () => {
    orcamentoModal.classList.add('hidden');
});

formOrcamento?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-enviar-orcamento');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
    
    const solicitacaoId = document.getElementById('orcamento-solicitacao-id').value;
    const escopo = document.getElementById('orc-escopo').value.trim();
    const maoDeObra = parseFloat(document.getElementById('orc-mao-obra').value) || 0;
    const deslocamento = parseFloat(document.getElementById('orc-deslocamento')?.value) || 0;
    const prazo = parseInt(document.getElementById('orc-prazo').value, 10) || 1;
    const garantia = document.getElementById('orc-garantia')?.value || '90 dias';
    const observacao = document.getElementById('orc-observacao').value.trim();

    // Coleta peças e insumos discriminados
    const itens = [];
    let subtotalMateriais = 0;
    document.querySelectorAll('.peca-row').forEach(row => {
        const desc = row.querySelector('.peca-desc')?.value.trim();
        const qtd = parseFloat(row.querySelector('.peca-qtd')?.value) || 0;
        const unit = parseFloat(row.querySelector('.peca-unit')?.value) || 0;
        if (desc && qtd > 0) {
            const sub = qtd * unit;
            subtotalMateriais += sub;
            itens.push({
                descricao: desc,
                quantidade: qtd,
                valorUnitario: unit,
                subtotal: sub
            });
        }
    });

    const totalConsolidado = maoDeObra + deslocamento + subtotalMateriais;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        await addDoc(collection(db, "orcamentos"), {
            solicitacaoId: solicitacaoId,
            prestadorId: user.uid,
            nomePrestador: user.displayName || currentUserData.nome || 'Prestador Profissional',
            escopo: escopo,
            maoDeObra: maoDeObra,
            material: subtotalMateriais,
            outrosCustos: deslocamento,
            itens: itens,
            total: totalConsolidado,
            prazo: prazo,
            garantia: garantia,
            observacao: observacao,
            status: "AGUARDANDO",
            criadoEm: serverTimestamp()
        });
        
        orcamentoModal.classList.add('hidden');
        alert("Proposta comercial formal enviada com sucesso! O solicitante receberá a notificação com a discriminação completa dos custos.");
    } catch (error) {
        console.error("Erro ao salvar orçamento:", error);
        alert("Erro ao enviar a proposta: " + error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane mr-2 text-xs"></i> Enviar Proposta Formal';
    }
});

document.getElementById('btn-fechar-ver-orcamentos')?.addEventListener('click', () => {
    verOrcamentosModal.classList.add('hidden');
});

async function abrirModalVerOrcamentos(solicitacaoId) {
    const listContainer = document.getElementById('orcamentos-list');
    listContainer.innerHTML = '<div class="text-center py-6 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i> Buscando orçamentos...</div>';
    verOrcamentosModal.classList.remove('hidden');
    
    try {
        const q = query(
            collection(db, "orcamentos"), 
            where("solicitacaoId", "==", solicitacaoId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <i class="fas fa-file-invoice-dollar text-3xl text-gray-400 mb-3"></i>
                    <p class="text-gray-500">Nenhum orçamento recebido ainda para esta solicitação.</p>
                </div>
            `;
            return;
        }
        
        let orcamentos = [];
        querySnapshot.forEach(doc => orcamentos.push({ id: doc.id, ...doc.data() }));
        
        orcamentos.sort((a, b) => a.total - b.total); // Ordenar por menor preço

        let html = '';
        let temAprovado = orcamentos.some(o => o.status === 'APROVADO');

        orcamentos.forEach((o) => {
            const valorFormatado = `R$ ${o.total.toFixed(2).replace('.', ',')}`;
            const btnAprovar = (!temAprovado && o.status === 'AGUARDANDO') ? 
                `<button class="btn-aprovar-orcamento mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer" data-id="${o.id}" data-solicitacao="${solicitacaoId}">
                    <i class="fas fa-check-circle"></i> Aceitar Proposta Comercial
                </button>` : '';

            const btnPagarPix = (o.status === 'APROVADO') ?
                `<button class="btn-ver-fatura-pix mt-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer" data-id="${o.id}">
                    <i class="fab fa-pix text-sm"></i> Pagar via Pix / Ver Fatura Comercial & PDF
                </button>` : '';

            let statusBadge = '';
            if (o.status === 'APROVADO') {
                statusBadge = '<span class="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">PROPOSTA APROVADA</span>';
            } else if (o.status === 'REPROVADO') {
                statusBadge = '<span class="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg">REPROVADO</span>';
            } else {
                statusBadge = '<span class="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md">AGUARDANDO SUA DECISÃO</span>';
            }

            // Decomposição dos Itens/Peças (se houver)
            let htmlItens = '';
            if (o.itens && o.itens.length > 0) {
                htmlItens = `
                    <div class="mt-2 text-xs bg-white p-2 rounded-lg border border-gray-100">
                        <span class="font-bold text-gray-700 block mb-1">Peças & Insumos Discriminados:</span>
                        <div class="space-y-1">
                            ${o.itens.map(it => `
                                <div class="flex justify-between text-gray-600 text-[11px]">
                                    <span>• ${it.descricao} (x${it.quantidade})</span>
                                    <span class="font-semibold">R$ ${(it.subtotal || (it.quantidade * it.valorUnitario) || 0).toFixed(2).replace('.', ',')}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            html += `
                <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 transition-shadow hover:shadow-xs">
                    <div class="flex justify-between items-start gap-3">
                        <div class="flex-grow">
                            <div class="flex justify-between items-center mb-1 flex-wrap gap-2">
                                <h4 class="text-base font-bold text-gray-900">${o.nomePrestador}</h4>
                                ${statusBadge}
                            </div>
                            
                            ${o.escopo ? `
                                <div class="mt-2 text-xs text-gray-700 bg-white p-2.5 border border-gray-100 rounded-xl">
                                    <span class="font-bold text-gray-900 block mb-0.5"><i class="fas fa-tasks text-blue-600 mr-1"></i> Escopo & Etapas:</span>
                                    <p class="whitespace-pre-line text-gray-600">${o.escopo}</p>
                                </div>
                            ` : ''}

                            <div class="text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 bg-white/60 p-2.5 rounded-xl border border-gray-100">
                                <div><span class="font-bold text-gray-700">Mão de Obra:</span><br>R$ ${(o.maoDeObra || 0).toFixed(2).replace('.', ',')}</div>
                                <div><span class="font-bold text-gray-700">Materiais:</span><br>R$ ${(o.material || 0).toFixed(2).replace('.', ',')}</div>
                                ${o.outrosCustos ? `<div><span class="font-bold text-gray-700">Deslocamento:</span><br>R$ ${o.outrosCustos.toFixed(2).replace('.', ',')}</div>` : ''}
                                <div><span class="font-bold text-gray-700">Prazo Estimado:</span><br>${o.prazo || 1} dia(s)</div>
                                ${o.garantia ? `<div><span class="font-bold text-gray-700">Garantia:</span><br>${o.garantia}</div>` : ''}
                            </div>

                            ${htmlItens}

                            ${o.observacao ? `<p class="mt-2 text-xs text-gray-500 italic bg-white p-2 border border-gray-100 rounded-lg">"${o.observacao}"</p>` : ''}
                        </div>
                        <div class="text-right shrink-0 flex flex-col items-end">
                            <span class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Total Proposto</span>
                            <span class="text-xl sm:text-2xl font-black text-gray-900">${valorFormatado}</span>
                        </div>
                    </div>
                    ${btnAprovar}
                    ${btnPagarPix}
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
        listContainer.querySelectorAll('.btn-aprovar-orcamento').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                aprovarOrcamento(btnEl.dataset.id, btnEl.dataset.solicitacao, orcamentos);
            });
        });

        listContainer.querySelectorAll('.btn-ver-fatura-pix').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnEl = e.currentTarget;
                const orc = orcamentos.find(item => item.id === btnEl.dataset.id);
                if (!orc) return;

                btnEl.disabled = true;
                btnEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Carregando fatura...';

                try {
                    let chavePixPrestador = '';
                    if (orc.prestadorId) {
                        const prestadorSnap = await getDoc(doc(db, "usuarios", orc.prestadorId));
                        if (prestadorSnap.exists()) {
                            chavePixPrestador = prestadorSnap.data().chavePix || '';
                        }
                    }

                    abrirModalPix(
                        `Serviço Contratado: ${orc.nomePrestador}`,
                        `R$ ${orc.total.toFixed(2).replace('.', ',')}`,
                        chavePixPrestador,
                        orc.nomePrestador,
                        {
                            escopo: orc.escopo,
                            maoDeObra: orc.maoDeObra,
                            material: orc.material,
                            deslocamento: orc.outrosCustos,
                            itens: orc.itens,
                            prazo: orc.prazo,
                            garantia: orc.garantia
                        }
                    );
                } catch (errPix) {
                    console.error("Erro ao abrir fatura Pix:", errPix);
                    alert("Erro ao carregar detalhes da fatura.");
                } finally {
                    btnEl.disabled = false;
                    btnEl.innerHTML = '<i class="fab fa-pix text-sm"></i> Pagar via Pix / Ver Fatura Comercial & PDF';
                }
            });
        });
        
    } catch (error) {
        console.error("Erro ao carregar orçamentos:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar orçamentos. Tente novamente.</div>';
    }
}

async function aprovarOrcamento(orcamentoAprovadoId, solicitacaoId, orcamentosList) {
    if(!confirm("Tem certeza que deseja aceitar esta proposta? Os outros orçamentos serão reprovados.")) return;
    
    try {
        const batch = writeBatch(db);
        
        const orcamentoAprovado = orcamentosList.find(o => o.id === orcamentoAprovadoId);
        
        // Atualiza a solicitação
        const solicRef = doc(db, "solicitacoes", solicitacaoId);
        batch.update(solicRef, { 
            status: "CONTRATADA",
            orcamentoAprovadoId: orcamentoAprovadoId,
            prestadorContratadoId: orcamentoAprovado ? orcamentoAprovado.prestadorId : null,
            atualizadoEm: serverTimestamp()
        });
        
        // Atualiza os orçamentos
        orcamentosList.forEach(orc => {
            const orcRef = doc(db, "orcamentos", orc.id);
            if (orc.id === orcamentoAprovadoId) {
                batch.update(orcRef, { status: "APROVADO", atualizadoEm: serverTimestamp() });
            } else {
                batch.update(orcRef, { status: "REPROVADO", atualizadoEm: serverTimestamp() });
            }
        });
        
        await batch.commit();
        alert("Orçamento aceito e solicitação contratada com sucesso!");
        abrirModalVerOrcamentos(solicitacaoId); 
        
        const user = auth.currentUser;
        if(user) {
            carregarMinhasSolicitacoes(user.uid);
        }
        
    } catch (error) {
        console.error("Erro ao aprovar orçamento:", error);
        alert("Erro ao aprovar proposta. Tente novamente.");
    }
}

// ==========================================
// Lógica de Avaliação e Conclusão (FASE 5)
// ==========================================
const avaliacaoModal = document.getElementById('avaliacao-modal');
const formAvaliacao = document.getElementById('form-avaliacao');
const starRatingContainer = document.getElementById('star-rating');
const inputNota = document.getElementById('avaliacao-nota');

function abrirModalAvaliacao(solicitacaoId, prestadorId) {
    if (!prestadorId) {
        alert("Erro: ID do prestador não encontrado para esta solicitação.");
        return;
    }
    formAvaliacao.reset();
    document.getElementById('avaliacao-solicitacao-id').value = solicitacaoId;
    document.getElementById('avaliacao-prestador-id').value = prestadorId;
    inputNota.value = 0;
    
    // Reset stars UI
    if (starRatingContainer) {
        starRatingContainer.querySelectorAll('i').forEach(star => {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        });
    }
    
    if (avaliacaoModal) avaliacaoModal.classList.remove('hidden');
}

if (starRatingContainer) {
    starRatingContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            const val = parseInt(e.target.dataset.val);
            inputNota.value = val;
            
            starRatingContainer.querySelectorAll('i').forEach(star => {
                const starVal = parseInt(star.dataset.val);
                if (starVal <= val) {
                    star.classList.remove('text-gray-300');
                    star.classList.add('text-yellow-400');
                } else {
                    star.classList.remove('text-yellow-400');
                    star.classList.add('text-gray-300');
                }
            });
        }
    });
}

document.getElementById('btn-cancelar-avaliacao')?.addEventListener('click', () => {
    if (avaliacaoModal) avaliacaoModal.classList.add('hidden');
});

formAvaliacao?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nota = parseInt(inputNota.value);
    
    if (nota === 0) {
        alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
        return;
    }
    
    const btnSubmit = document.getElementById('btn-enviar-avaliacao');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Concluindo...';
    
    const solicitacaoId = document.getElementById('avaliacao-solicitacao-id').value;
    const prestadorId = document.getElementById('avaliacao-prestador-id').value;
    const comentario = document.getElementById('avaliacao-comentario').value;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        const batch = writeBatch(db);
        
        // 1. Atualizar status da solicitação
        const solicRef = doc(db, "solicitacoes", solicitacaoId);
        batch.update(solicRef, { 
            status: "CONCLUIDA",
            atualizadoEm: serverTimestamp()
        });
        
        // 2. Salvar a avaliação
        const novaAvaliacaoRef = doc(collection(db, "avaliacoes"));
        batch.set(novaAvaliacaoRef, {
            solicitacaoId: solicitacaoId,
            prestadorId: prestadorId,
            solicitanteId: user.uid,
            nota: nota,
            comentario: comentario,
            criadoEm: serverTimestamp()
        });
        
        // 3. Atualizar perfil do prestador
        const prestadorRef = doc(db, "usuarios", prestadorId);
        const prestadorSnap = await getDoc(prestadorRef);
        
        if (prestadorSnap.exists()) {
            const dadosPrestador = prestadorSnap.data();
            const avaliacoesAnteriores = dadosPrestador.totalAvaliacoes || 0;
            const notaMediaAnterior = dadosPrestador.notaMedia || 0;
            
            const novoTotal = avaliacoesAnteriores + 1;
            const novaMedia = ((notaMediaAnterior * avaliacoesAnteriores) + nota) / novoTotal;
            
            batch.update(prestadorRef, {
                totalAvaliacoes: novoTotal,
                notaMedia: novaMedia,
                pontuacao: (dadosPrestador.pontuacao || 0) + 10 + nota // Exemplo de acúmulo de pontuação
            });
        }
        
        await batch.commit();
        
        if (avaliacaoModal) avaliacaoModal.classList.add('hidden');
        alert("Serviço concluído e avaliado com sucesso!");
        
        carregarMinhasSolicitacoes(user.uid);
        
    } catch (error) {
        console.error("Erro ao avaliar:", error);
        alert("Erro ao concluir serviço. Tente novamente.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Concluir e Avaliar';
    }
});

// ==========================================
// Lógica de PIX e Orçamentos do Prestador (FASE 6)
// ==========================================
async function carregarMeusOrcamentos(uid, chavePix) {
    const listContainer = document.getElementById('meus-orcamentos-list');
    if (!listContainer) return;
    
    try {
        const q = query(collection(db, "orcamentos"), where("prestadorId", "==", uid));
        const querySnapshot = await getDocs(q);
        
        let orcamentos = [];
        querySnapshot.forEach(doc => orcamentos.push({ id: doc.id, ...doc.data() }));
        orcamentos.sort((a, b) => {
            const ta = a.criadoEm ? a.criadoEm.toMillis() : 0;
            const tb = b.criadoEm ? b.criadoEm.toMillis() : 0;
            return tb - ta;
        });

        // 1. Calcular Métricas de Desempenho
        const totalOrcamentos = orcamentos.length;
        const aprovados = orcamentos.filter(o => o.status === 'APROVADO');
        const aguardando = orcamentos.filter(o => o.status === 'AGUARDANDO');
        const reprovados = orcamentos.filter(o => o.status === 'REPROVADO');
        
        const taxaAprovacao = totalOrcamentos > 0 ? ((aprovados.length / totalOrcamentos) * 100).toFixed(0) : 0;
        const somaTotal = orcamentos.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
        const ticketMedio = totalOrcamentos > 0 ? (somaTotal / totalOrcamentos).toFixed(2) : '0,00';
        const totalFechado = aprovados.reduce((acc, o) => acc + (Number(o.total) || 0), 0).toFixed(2);

        const elTotal = document.getElementById('metrica-total-orcamentos');
        const elTaxa = document.getElementById('metrica-taxa-aprovacao');
        const elTicket = document.getElementById('metrica-ticket-medio');
        const elFechado = document.getElementById('metrica-total-fechado');

        if (elTotal) elTotal.textContent = totalOrcamentos;
        if (elTaxa) elTaxa.textContent = `${taxaAprovacao}%`;
        if (elTicket) elTicket.textContent = `R$ ${ticketMedio.replace('.', ',')}`;
        if (elFechado) elFechado.textContent = `R$ ${totalFechado.replace('.', ',')}`;

        // 2. Atualizar Botões de Filtro
        const btnFiltros = document.querySelectorAll('.btn-filtro-orcamento');
        btnFiltros.forEach(b => {
            const st = b.getAttribute('data-status');
            if (st === 'TODOS') b.textContent = `Todos (${totalOrcamentos})`;
            else if (st === 'APROVADO') b.textContent = `Aprovados (${aprovados.length})`;
            else if (st === 'AGUARDANDO') b.textContent = `Aguardando (${aguardando.length})`;
            else if (st === 'REPROVADO') b.textContent = `Reprovados (${reprovados.length})`;
        });

        let statusAtivo = 'TODOS';

        // 3. Pré-carregar títulos das solicitações
        const solicitacoesMap = {};
        const solIds = [...new Set(orcamentos.map(o => o.solicitacaoId).filter(Boolean))];
        for (const sId of solIds) {
            try {
                const sDoc = await getDoc(doc(db, "solicitacoes", sId));
                if (sDoc.exists()) {
                    solicitacoesMap[sId] = sDoc.data().titulo;
                }
            } catch(e) {}
        }

        const renderLista = () => {
            const filtrados = orcamentos.filter(o => {
                if (statusAtivo === 'TODOS') return true;
                return o.status === statusAtivo;
            });

            if (filtrados.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <i class="fas fa-file-invoice text-3xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500 text-sm">Nenhum orçamento encontrado com o status "${statusAtivo.toLowerCase()}".</p>
                    </div>
                `;
                return;
            }

            let html = '';
            for (const o of filtrados) {
                let statusBadge = '';
                if (o.status === 'APROVADO') statusBadge = '<span class="inline-block px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">APROVADO</span>';
                else if (o.status === 'REPROVADO') statusBadge = '<span class="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">REPROVADO</span>';
                else statusBadge = '<span class="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md">AGUARDANDO</span>';

                const valorFormatado = `R$ ${(Number(o.total) || 0).toFixed(2).replace('.', ',')}`;
                const tituloSol = solicitacoesMap[o.solicitacaoId] || 'Solicitação Aberta';

                html += `
                    <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div class="mb-2">${statusBadge}</div>
                                <h4 class="text-md font-semibold text-gray-900">${tituloSol}</h4>
                                <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                    <span><strong>Mão de Obra:</strong> R$ ${(Number(o.maoDeObra) || 0).toFixed(2).replace('.', ',')}</span>
                                    <span><strong>Material:</strong> R$ ${(Number(o.material) || 0).toFixed(2).replace('.', ',')}</span>
                                    <span><strong>Prazo:</strong> ${o.prazo || 0} dias</span>
                                </div>
                                ${o.observacao ? `<p class="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">"${o.observacao}"</p>` : ''}
                            </div>
                            <div class="text-right flex flex-col items-end shrink-0">
                                <span class="text-xl font-black text-gray-900">${valorFormatado}</span>
                                ${o.status === 'APROVADO' ? `
                                <button class="btn-gerar-pix bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors mt-2 shadow-xs flex items-center gap-1.5 cursor-pointer" 
                                    data-id="${o.id}" 
                                    data-titulo="${tituloSol}" 
                                    data-valor="${valorFormatado}">
                                    <i class="fas fa-qrcode"></i> Cobrança Pix / PDF
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
            listContainer.innerHTML = html;

            listContainer.querySelectorAll('.btn-gerar-pix').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const target = e.currentTarget;
                    const userSnap = await getDoc(doc(db, "usuarios", uid));
                    const userData = userSnap.data();
                    const currentPix = userData.chavePix;
                    
                    if (!currentPix || currentPix.trim() === '') {
                        alert("Você precisa cadastrar sua Chave Pix no painel acima antes de gerar a cobrança.");
                        return;
                    }
                    abrirModalPix(target.dataset.titulo, target.dataset.valor, currentPix, userData.nome);
                });
            });
        };

        btnFiltros.forEach(btn => {
            btn.onclick = () => {
                btnFiltros.forEach(b => {
                    b.classList.remove('bg-white', 'shadow-2xs', 'text-gray-900');
                    b.classList.add('text-gray-600');
                });
                btn.classList.add('bg-white', 'shadow-2xs', 'text-gray-900');
                btn.classList.remove('text-gray-600');
                statusAtivo = btn.getAttribute('data-status');
                renderLista();
            };
        });

        renderLista();
        
    } catch (error) {
        console.error("Erro carregarMeusOrcamentos:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar orçamentos.</div>';
    }
}

const pixModal = document.getElementById('pix-modal');

function abrirModalPix(titulo, valor, chavePix, nomePrestador = 'Prestador Profissional', detalhes = {}) {
    if (!pixModal) return;

    document.getElementById('pix-modal-titulo').textContent = titulo;
    document.getElementById('pix-modal-valor').textContent = valor;
    document.getElementById('pix-modal-chave').textContent = chavePix || 'Chave Pix a combinar com o prestador';
    document.getElementById('pix-modal-data').textContent = new Date().toLocaleDateString('pt-BR');
    document.getElementById('pix-modal-subtitulo').textContent = `${nomePrestador} • ServiçosApp Marketplace Oficial`;

    // Renderiza Escopo e Etapas
    const escopoContainer = document.getElementById('pix-modal-escopo-container');
    const escopoTexto = document.getElementById('pix-modal-escopo-texto');
    if (escopoContainer && escopoTexto) {
        if (detalhes.escopo) {
            escopoTexto.textContent = detalhes.escopo;
            escopoContainer.classList.remove('hidden');
        } else {
            escopoTexto.textContent = 'Execução de serviço sob medida conforme especificado na solicitação.';
            escopoContainer.classList.remove('hidden');
        }
    }

    // Renderiza Itens de Materiais
    const itensContainer = document.getElementById('pix-modal-itens-container');
    if (itensContainer) {
        if (detalhes.itens && detalhes.itens.length > 0) {
            let htmlItens = '<span class="font-bold text-gray-900 block mb-1">Peças & Insumos Discriminados:</span>';
            detalhes.itens.forEach(it => {
                const sub = it.subtotal || (it.quantidade * (it.valorUnitario || 0));
                htmlItens += `
                    <div class="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 text-[11px]">
                        <span class="text-gray-700 font-medium">${it.descricao} (x${it.quantidade})</span>
                        <span class="font-bold text-gray-900">R$ ${sub.toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
            });
            itensContainer.innerHTML = htmlItens;
            itensContainer.classList.remove('hidden');
        } else {
            itensContainer.innerHTML = '';
            itensContainer.classList.add('hidden');
        }
    }

    // Valores discriminados na fatura
    const maoObraEl = document.getElementById('pix-modal-mao-obra');
    const materiaisEl = document.getElementById('pix-modal-materiais');
    const deslocamentoEl = document.getElementById('pix-modal-deslocamento');
    
    if (maoObraEl) maoObraEl.textContent = detalhes.maoDeObra !== undefined ? `R$ ${detalhes.maoDeObra.toFixed(2).replace('.', ',')}` : valor;
    if (materiaisEl) materiaisEl.textContent = detalhes.material !== undefined ? `R$ ${detalhes.material.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
    if (deslocamentoEl) deslocamentoEl.textContent = (detalhes.outrosCustos || detalhes.deslocamento) ? `R$ ${(detalhes.outrosCustos || detalhes.deslocamento).toFixed(2).replace('.', ',')}` : 'R$ 0,00';

    // Gera o QR Code Real em imagem
    const qrImg = document.getElementById('pix-qrcode-img');
    if (qrImg) {
        const qrData = chavePix || 'https://projetosteste-e7490.web.app';
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;
    }

    // Botão Copiar Chave Pix
    const btnCopiar = document.getElementById('btn-copiar-chave-pix');
    if (btnCopiar) {
        btnCopiar.onclick = async () => {
            try {
                await navigator.clipboard.writeText(chavePix);
                const originalHtml = btnCopiar.innerHTML;
                btnCopiar.innerHTML = '<i class="fas fa-check text-green-600 mr-1"></i> Copiado!';
                setTimeout(() => {
                    btnCopiar.innerHTML = originalHtml;
                }, 2000);
            } catch(e) {
                prompt("Copie a chave Pix:", chavePix);
            }
        };
    }

    // Botão Compartilhar no WhatsApp
    const btnWhats = document.getElementById('btn-whatsapp-pix');
    if (btnWhats) {
        btnWhats.onclick = () => {
            let texto = `*FATURA COMERCIAL & DEMONSTRATIVO DE ORÇAMENTO*\n\n` +
                `📌 *Serviço:* ${titulo}\n` +
                `👤 *Prestador:* ${nomePrestador}\n`;
            if (detalhes.escopo) {
                texto += `🛠 *Escopo:* ${detalhes.escopo}\n`;
            }
            if (detalhes.maoDeObra) {
                texto += `💼 *Mão de Obra:* R$ ${detalhes.maoDeObra.toFixed(2)}\n`;
            }
            if (detalhes.material) {
                texto += `📦 *Materiais/Insumos:* R$ ${detalhes.material.toFixed(2)}\n`;
            }
            if (detalhes.outrosCustos || detalhes.deslocamento) {
                texto += `🚚 *Deslocamento:* R$ ${(detalhes.outrosCustos || detalhes.deslocamento).toFixed(2)}\n`;
            }
            texto += `\n💰 *VALOR TOTAL CONSOLIDADO:* ${valor}\n\n` +
                `🔑 *Chave Pix para Liquidação:* ${chavePix || 'A combinar'}\n` +
                `📲 *Instruções:* Copie a chave Pix acima ou utilize o QR Code do demonstrativo para pagar diretamente pelo app do seu banco.\n\n` +
                `Comprovante gerado via ServiçosApp Marketplace Oficial.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        };
    }

    // Botão Baixar / Imprimir PDF
    const btnPdf = document.getElementById('btn-pdf-pix');
    if (btnPdf) {
        btnPdf.onclick = () => {
            window.print();
        };
    }

    // Controle de Exibição: Somente Especificação vs Checkout Pix Ativo
    const pixCheckoutSec = document.getElementById('pix-checkout-section');
    const btnAceitarModal = document.getElementById('btn-aceitar-proposta-modal');
    
    if (detalhes.somenteEspecificacao) {
        if (pixCheckoutSec) pixCheckoutSec.classList.add('hidden');
        if (btnAceitarModal) {
            btnAceitarModal.classList.remove('hidden');
            btnAceitarModal.onclick = () => {
                if (typeof detalhes.onAceitar === 'function') {
                    detalhes.onAceitar();
                }
            };
        }
    } else {
        if (pixCheckoutSec) pixCheckoutSec.classList.remove('hidden');
        if (btnAceitarModal) btnAceitarModal.classList.add('hidden');
    }

    pixModal.classList.remove('hidden');
}

window.abrirModalPix = abrirModalPix;

document.getElementById('btn-fechar-pix')?.addEventListener('click', () => {
    if (pixModal) pixModal.classList.add('hidden');
});
document.getElementById('backdrop-pix')?.addEventListener('click', () => {
    if (pixModal) pixModal.classList.add('hidden');
});

// ==========================================
// FASE 7 - Integração de IA (Assistente Gemini)
// ==========================================
const btnOpenChat = document.getElementById('btn-open-chat');
const chatModal = document.getElementById('ai-chat-modal');
const btnFecharChat = document.getElementById('btn-fechar-chat');
const backdropChat = document.getElementById('ai-chat-backdrop');
const formAiChat = document.getElementById('form-ai-chat');
const chatInput = document.getElementById('ai-chat-input');
const chatMessages = document.getElementById('ai-chat-messages');

function toggleChat() {
    if (chatModal) {
        chatModal.classList.toggle('hidden');
        if (!chatModal.classList.contains('hidden')) {
            chatInput.focus();
        }
    }
}

if (btnOpenChat) btnOpenChat.addEventListener('click', toggleChat);
if (btnFecharChat) btnFecharChat.addEventListener('click', toggleChat);
if (backdropChat) backdropChat.addEventListener('click', toggleChat);

function appendMessage(role, content) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = isUser ? 'flex items-start gap-2.5 flex-row-reverse' : 'flex items-start gap-2.5';
    
    let avatarHTML = '';
    let bubbleClass = '';
    
    if (isUser) {
        // User bubble
        avatarHTML = `
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                <i class="fas fa-user text-indigo-600 text-sm"></i>
            </div>
        `;
        bubbleClass = 'bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm whitespace-pre-wrap';
        div.innerHTML = `
            ${avatarHTML}
            <div class="${bubbleClass}">${content}</div>
        `;
    } else {
        // AI bubble
        avatarHTML = `
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                <i class="fas fa-robot text-indigo-600 text-sm"></i>
            </div>
        `;
        bubbleClass = 'bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 prose prose-sm max-w-none w-full overflow-hidden';
        
        // Use marked se disponivel, senao usa fallback
        let parsedContent = content;
        if (typeof marked !== 'undefined') {
            try {
                parsedContent = marked.parse(content);
            } catch(e) {}
        }
        
        div.innerHTML = `
            ${avatarHTML}
            <div class="${bubbleClass}">${parsedContent}</div>
        `;
    }
    
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoading() {
    const div = document.createElement('div');
    div.id = 'ai-typing-indicator';
    div.className = 'flex items-start gap-2.5';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
            <i class="fas fa-robot text-indigo-600 text-sm"></i>
        </div>
        <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 flex space-x-1 items-center h-10">
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoading() {
    const el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
}

if (formAiChat) {
    formAiChat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        
        chatInput.value = '';
        appendMessage('user', text);
        appendLoading();
        
        // Envia para o Backend PythonAnywhere
        try {
            const userId = auth.currentUser ? auth.currentUser.uid : '';
            // A API de producao esta hospedada em: https://marlonkipson.pythonanywhere.com/api/chat
            const apiUrl = 'https://marlonkipson.pythonanywhere.com/api/chat';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mensagem: text,
                    uid: userId
                })
            });
            
            removeLoading();
            
            if (response.ok) {
                const data = await response.json();
                appendMessage('ai', data.resposta || 'Sem resposta disponível no momento.');
            } else {
                try {
                    const errData = await response.json();
                    if (errData.erro && (errData.erro.includes('429') || errData.erro.toLowerCase().includes('quota'))) {
                        appendMessage('ai', '⏳ **Aviso de Limite da API:** O limite por minuto da versão gratuita do Gemini foi atingido. Por favor, aguarde cerca de 30 segundos e tente novamente!');
                    } else {
                        appendMessage('ai', 'Desculpe, ocorreu um erro ao processar sua pergunta com a IA. Tente novamente em alguns instantes.');
                    }
                } catch(err) {
                    appendMessage('ai', 'Desculpe, ocorreu um erro ao conectar com a API. Verifique se o backend está online.');
                }
            }
        } catch (error) {
            console.error("Erro no chat IA:", error);
            removeLoading();
            appendMessage('ai', 'Parece que houve um erro de conexão com o servidor. Verifique seu backend.');
        }
    });
}

// ==========================================
// Handlers Globais da Área de Testes (Demo)
// ==========================================
function abrirAreaTestes() {
    // Se o usuário estiver logado e a tab existir, ativa a tab
    const tabBtn = document.querySelector('.tab-button[data-target="tab-area-testes"]');
    if (auth.currentUser && tabBtn) {
        tabBtn.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Se estiver deslogado ou tela inicial, renderiza direto no mainContent
    mainContent.innerHTML = '<div id="main-area-testes"></div>';
    inicializarAreaTestes(db, document.getElementById('main-area-testes'), () => {
        if (auth.currentUser) {
            checkUserProfile(auth.currentUser);
        } else {
            renderWelcomeScreen();
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Botão da navbar
document.getElementById('btn-nav-area-testes')?.addEventListener('click', abrirAreaTestes);

// Clique no logo da navbar volta para home
document.getElementById('logo-app')?.addEventListener('click', () => {
    if (auth.currentUser) {
        checkUserProfile(auth.currentUser);
    } else {
        renderWelcomeScreen();
    }
});
