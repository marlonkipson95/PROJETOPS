import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, getDocs, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Taxonomia Base
const TAXONOMIA = {
    "ELETRICIDADE": ["Instalação elétrica", "Manutenção elétrica", "Instalação de chuveiro", "Tomadas", "Iluminação", "Outros"],
    "CONSTRUÇÃO E REFORMA": ["Pedreiro", "Pintor", "Encanador", "Gesseiro", "Azulejista", "Outros"],
    "AUTOMOTIVO": ["Mecânica", "Elétrica automotiva", "Funilaria", "Manutenção", "Outros"],
    "CASA E JARDIM": ["Jardinagem", "Limpeza de piscina", "Limpeza residencial", "Manutenção", "Outros"],
    "TECNOLOGIA": ["Computadores", "Redes", "Suporte técnico", "Desenvolvimento", "Infraestrutura", "Outros"],
    "OUTROS": ["Serviços Gerais", "Consultoria", "Outros"]
};

// Handle Authentication State Changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        renderAuthenticatedNav(user);
        await checkUserProfile(user);
    } else {
        // User is logged out
        renderUnauthenticatedNav();
        renderWelcomeScreen();
    }
});

function renderUnauthenticatedNav() {
    authContainer.innerHTML = `
        <button id="btn-login" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-lg transition-all shadow-sm">
            Entrar com Google
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
            <div class="bg-blue-50 text-blue-600 p-4 rounded-full mb-6">
                <i class="fas fa-tools text-4xl"></i>
            </div>
            <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Conectando <span class="text-blue-600">necessidades</span> a <span class="text-blue-600">soluções</span>
            </h1>
            <p class="max-w-2xl text-lg sm:text-xl text-gray-500 mb-8">
                A plataforma ideal para encontrar profissionais qualificados ou oferecer seus serviços para milhares de clientes.
            </p>
            <button id="btn-hero-login" class="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <i class="fab fa-google mr-2"></i> Começar Agora
            </button>
        </div>
    `;
    document.getElementById('btn-hero-login').addEventListener('click', login);
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
            <!-- Tabs -->
            <div class="border-b border-gray-200 mb-6 overflow-x-auto">
                <nav class="-mb-px flex space-x-6 sm:space-x-8 min-w-max" aria-label="Tabs" id="dashboard-tabs">
                    <button class="tab-button border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors" data-target="tab-dashboard">
                        <i class="fas fa-home mr-2"></i>Dashboard
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
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Seu Perfil Atual</h3>
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
                        <div class="mb-6">
                            <h3 class="text-xl font-bold text-gray-900">Meus Orçamentos Enviados</h3>
                            <p class="text-sm text-gray-500">Acompanhe o status das suas propostas.</p>
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
            document.getElementById(target).classList.remove('hidden');
            document.getElementById(target).classList.add('block');
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

    // Load Users automatically
    carregarUsuariosLista();
    document.getElementById('btn-atualizar-usuarios').addEventListener('click', carregarUsuariosLista);
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

function abrirModalOrcamento(solicitacaoId) {
    formOrcamento.reset();
    document.getElementById('orcamento-solicitacao-id').value = solicitacaoId;
    orcamentoModal.classList.remove('hidden');
}

document.getElementById('btn-cancelar-orcamento')?.addEventListener('click', () => {
    orcamentoModal.classList.add('hidden');
});

formOrcamento?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-enviar-orcamento');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
    
    const solicitacaoId = document.getElementById('orcamento-solicitacao-id').value;
    const maoDeObra = parseFloat(document.getElementById('orc-mao-obra').value) || 0;
    const material = parseFloat(document.getElementById('orc-material').value) || 0;
    const prazo = parseInt(document.getElementById('orc-prazo').value, 10);
    const observacao = document.getElementById('orc-observacao').value;
    const total = maoDeObra + material;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        await addDoc(collection(db, "orcamentos"), {
            solicitacaoId: solicitacaoId,
            prestadorId: user.uid,
            nomePrestador: user.displayName || 'Prestador',
            maoDeObra: maoDeObra,
            material: material,
            total: total,
            prazo: prazo,
            observacao: observacao,
            status: "AGUARDANDO",
            criadoEm: serverTimestamp()
        });
        
        orcamentoModal.classList.add('hidden');
        alert("Proposta enviada com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar orçamento:", error);
        alert("Erro ao enviar a proposta. Tente novamente.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Enviar Proposta';
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
                `<button class="btn-aprovar-orcamento mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors" data-id="${o.id}" data-solicitacao="${solicitacaoId}">
                    Aceitar Proposta
                </button>` : '';

            let statusBadge = '';
            if (o.status === 'APROVADO') {
                statusBadge = '<span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">APROVADO</span>';
            } else if (o.status === 'REPROVADO') {
                statusBadge = '<span class="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">REPROVADO</span>';
            }

            html += `
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                            <div class="flex justify-between items-center mb-1">
                                <h4 class="text-md font-semibold text-gray-900">${o.nomePrestador}</h4>
                                ${statusBadge}
                            </div>
                            <div class="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                                <div><span class="font-medium">Mão de Obra:</span> R$ ${o.maoDeObra.toFixed(2).replace('.', ',')}</div>
                                <div><span class="font-medium">Material:</span> R$ ${o.material.toFixed(2).replace('.', ',')}</div>
                                <div><span class="font-medium">Prazo:</span> ${o.prazo} dias</div>
                            </div>
                            ${o.observacao ? `<p class="mt-2 text-sm text-gray-500 italic bg-white p-2 border border-gray-100 rounded-lg">"${o.observacao}"</p>` : ''}
                        </div>
                        <div class="text-right ml-4 flex flex-col items-end justify-center h-full pt-6">
                            <span class="block text-lg font-bold text-gray-900">${valorFormatado}</span>
                        </div>
                    </div>
                    ${btnAprovar}
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
        listContainer.querySelectorAll('.btn-aprovar-orcamento').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.target;
                aprovarOrcamento(btnEl.dataset.id, btnEl.dataset.solicitacao, orcamentos);
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
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div class="text-center py-6 text-gray-500 text-sm">Você ainda não enviou orçamentos.</div>';
            return;
        }
        
        let orcamentos = [];
        querySnapshot.forEach(doc => orcamentos.push({ id: doc.id, ...doc.data() }));
        orcamentos.sort((a, b) => b.criadoEm - a.criadoEm); // Mais recentes primeiro
        
        let html = '';
        for (const o of orcamentos) {
            let statusBadge = '';
            if (o.status === 'APROVADO') statusBadge = '<span class="inline-block px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">APROVADO</span>';
            else if (o.status === 'REPROVADO') statusBadge = '<span class="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">REPROVADO</span>';
            else statusBadge = '<span class="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md">AGUARDANDO</span>';

            const valorFormatado = `R$ ${o.total.toFixed(2).replace('.', ',')}`;
            
            // Buscar titulo da solicitacao
            let tituloSol = 'Solicitação Excluída ou Não Encontrada';
            try {
                const solSnap = await getDoc(doc(db, "solicitacoes", o.solicitacaoId));
                if (solSnap.exists()) {
                    tituloSol = solSnap.data().titulo;
                }
            } catch(e) {}

            html += `
                <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="mb-2">${statusBadge}</div>
                            <h4 class="text-md font-semibold text-gray-900">${tituloSol}</h4>
                            <p class="text-gray-500 text-sm mt-1">Valor Proposto: ${valorFormatado}</p>
                        </div>
                        ${o.status === 'APROVADO' ? `
                        <button class="btn-gerar-pix bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors mt-2" 
                            data-id="${o.id}" 
                            data-titulo="${tituloSol}" 
                            data-valor="${valorFormatado}">
                            <i class="fas fa-qrcode mr-1"></i> Cobrança Pix
                        </button>` : ''}
                    </div>
                </div>
            `;
        }
        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.btn-gerar-pix').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget;
                
                // Recarregar userData para garantir que pegamos a chave atualizada
                const userSnap = await getDoc(doc(db, "usuarios", uid));
                const userData = userSnap.data();
                const currentPix = userData.chavePix;
                
                if (!currentPix || currentPix.trim() === '') {
                    alert("Você precisa cadastrar sua Chave Pix no painel acima antes de gerar a cobrança.");
                    return;
                }
                abrirModalPix(target.dataset.titulo, target.dataset.valor, currentPix);
            });
        });
        
    } catch (error) {
        console.error("Erro carregarMeusOrcamentos:", error);
        listContainer.innerHTML = '<div class="text-red-500 text-sm">Erro ao carregar orçamentos.</div>';
    }
}

const pixModal = document.getElementById('pix-modal');
function abrirModalPix(titulo, valor, chavePix) {
    document.getElementById('pix-modal-titulo').textContent = titulo;
    document.getElementById('pix-modal-valor').textContent = valor;
    document.getElementById('pix-modal-chave').textContent = chavePix;
    if (pixModal) pixModal.classList.remove('hidden');
}

document.getElementById('btn-fechar-pix')?.addEventListener('click', () => {
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
                appendMessage('ai', data.resposta);
            } else {
                appendMessage('ai', 'Desculpe, ocorreu um erro ao conectar com a API. Verifique se o backend está online.');
            }
        } catch (error) {
            console.error("Erro no chat IA:", error);
            removeLoading();
            appendMessage('ai', 'Parece que houve um erro de conexão com o servidor. Verifique seu backend.');
        }
    });
}
