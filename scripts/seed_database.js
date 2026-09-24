/**
 * seed_database.js
 * 
 * Script não-destrutivo, idempotente e reproduzível para povoar o Cloud Firestore
 * com um dataset completo de demonstração e testes para a plataforma de serviços.
 * 
 * Execução:
 *   node scripts/seed_database.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// 1. Inicialização do Firebase Admin com serviceAccountKey.json
const credPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(credPath)) {
  console.error("ERRO: Arquivo serviceAccountKey.json não encontrado na raiz do projeto!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

console.log("==================================================");
console.log("Iniciando Seed Idempotente de Demonstração (isDemo: true)");
console.log("Banco de dados conectado ao projeto:", serviceAccount.project_id);
console.log("==================================================\n");

// Helper para gerar datas nos últimos X dias
function dataPassada(diasAtras, horas = 12) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(horas, 0, 0, 0);
  return Timestamp.fromDate(d);
}

// -----------------------------------------------------------------------------
// 1. 15 PRESTADORES FICTÍCIOS
// -----------------------------------------------------------------------------
const PRESTADORES = [
  {
    id: "demo_prestador_01",
    nome: "Carlos Eduardo Silva",
    email: "carlos.eletrica.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&q=80",
    telefone: "(11) 98111-2001",
    whatsapp: "(11) 98111-2001",
    cidade: "São Paulo",
    estado: "SP",
    tipoPessoa: "Física",
    bio: "Eletricista residencial e predial com mais de 12 anos de experiência. Especialista em instalações seguras, quadros de distribuição, DR e iluminação inteligente.",
    especialidades: ["Instalação elétrica", "Manutenção elétrica", "Quadros de distribuição", "Chuveiros"],
    categoriaPrincipal: "Casa e Jardim",
    subcategorias: ["Elétrica residencial", "Instalação"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "carlos.eletrica.demo@servicosapp.com",
    isDemo: true
  },
  {
    id: "demo_prestador_02",
    nome: "Ana Carolina Santos (AquaLimpa Piscinas)",
    email: "aqualimpa.piscinas.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    telefone: "(19) 98222-3002",
    whatsapp: "(19) 98222-3002",
    cidade: "Campinas",
    estado: "SP",
    tipoPessoa: "Jurídica",
    razaoSocial: "AquaLimpa Tratamento e Manutenção de Piscinas ME",
    bio: "Empresa especializada no tratamento físico e químico de piscinas residenciais e comerciais. Equipe treinada, produtos certificados e controle de alcalinidade.",
    especialidades: ["Tratamento de piscinas", "Aspiração", "Troca de areia do filtro", "Instalação de bombas"],
    categoriaPrincipal: "Casa e Jardim",
    subcategorias: ["Piscinas", "Limpeza"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "19982223002",
    isDemo: true
  },
  {
    id: "demo_prestador_03",
    nome: "Roberto Mendes - Reformas & Pintura",
    email: "roberto.reformas.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    telefone: "(21) 98333-4003",
    whatsapp: "(21) 98333-4003",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    tipoPessoa: "Física",
    bio: "Mestre de obras e pintor profissional. Trabalho com acabamento fino, massa corrida, porcelanatos, reformas de cozinhas e banheiros completos com pontualidade.",
    especialidades: ["Pintura residencial", "Revestimentos cerâmicos", "Alvenaria", "Gesso"],
    categoriaPrincipal: "Obras e Reforma",
    subcategorias: ["Pintura", "Pedreiro", "Reforma", "Acabamento"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "roberto.mendes.pix@servicosapp.com",
    isDemo: true
  },
  {
    id: "demo_prestador_04",
    nome: "Oficina Mecânica Precision Car",
    email: "precision.car.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
    telefone: "(31) 98444-5004",
    whatsapp: "(31) 98444-5004",
    cidade: "Belo Horizonte",
    estado: "MG",
    tipoPessoa: "Jurídica",
    razaoSocial: "Precision Car Manutenção Automotiva Ltda",
    bio: "Centro automotivo equipado com scanner computadorizado multimarca. Serviços mecânicos gerais, suspensão, freios ABS, motor, injeção eletrônica e troca de correias.",
    especialidades: ["Diagnóstico eletrônico", "Freios", "Suspensão", "Motor", "Revisão preventiva"],
    categoriaPrincipal: "Automotivo",
    subcategorias: ["Mecânica", "Revisão", "Freios", "Motor"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "contato@precisioncar.demo",
    isDemo: true
  },
  {
    id: "demo_prestador_05",
    nome: "Lucas Farias - Tech & Redes",
    email: "lucas.tech.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    telefone: "(41) 98555-6005",
    whatsapp: "(41) 98555-6005",
    cidade: "Curitiba",
    estado: "PR",
    tipoPessoa: "Física",
    bio: "Analista de infraestrutura e redes de computadores. Cabeamento estruturado, configuração de roteadores Mikrotik/Ubiquiti, servidores Linux e suporte a home office.",
    especialidades: ["Redes Wi-Fi empresariais", "Servidores", "Manutenção de PCs e Notebooks", "Segurança de rede"],
    categoriaPrincipal: "TI e Redes",
    subcategorias: ["Redes", "Infraestrutura", "Suporte técnico"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "lucas.farias@pixdemo.com",
    isDemo: true
  },
  {
    id: "demo_prestador_06",
    nome: "Mariana Alencar - Revisão & Consultoria Acadêmica",
    email: "mariana.revisao.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    telefone: "(51) 98666-7006",
    whatsapp: "(51) 98666-7006",
    cidade: "Porto Alegre",
    estado: "RS",
    tipoPessoa: "Física",
    bio: "Mestre em Letras com mais de 8 anos auxiliando pesquisadores. Revisão gramatical e textual de artigos, dissertações e teses. Normatização rigorosa ABNT, APA e Vancouver.",
    especialidades: ["Formatação ABNT", "Revisão gramatical", "Tradução acadêmica EN/PT", "Artigos científicos"],
    categoriaPrincipal: "Freelancers / Acadêmico",
    subcategorias: ["Revisão", "Formatação", "Serviços acadêmicos", "Redação"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "mariana.letras.demo@pix.com",
    isDemo: true
  },
  {
    id: "demo_prestador_07",
    nome: "Marcos Paulo Encanador Express",
    email: "marcos.hidraulica.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
    telefone: "(11) 98777-8007",
    whatsapp: "(11) 98777-8007",
    cidade: "São Paulo",
    estado: "SP",
    tipoPessoa: "Física",
    bio: "Especialista em caça-vazamentos com geofone eletrônico, desentupimentos sem quebra-quebra, conserto de válvulas de descarga, caixas d'água e tubulações de PVC e cobre.",
    especialidades: ["Caça vazamentos", "Instalação de aquecedores", "Tubulações de esgoto", "Desentupimento"],
    categoriaPrincipal: "Casa e Jardim",
    subcategorias: ["Hidráulica", "Instalação"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "marcos.encanador@pixdemo.com",
    isDemo: true
  },
  {
    id: "demo_prestador_08",
    nome: "Studio Verde - Paisagismo & Jardinagem",
    email: "studioverde.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    telefone: "(71) 98888-9008",
    whatsapp: "(71) 98888-9008",
    cidade: "Salvador",
    estado: "BA",
    tipoPessoa: "Jurídica",
    razaoSocial: "Studio Verde Paisagismo e Conservação Ltda",
    bio: "Projetos de paisagismo, plantio de grama esmeralda, podas artísticas, controle biológico de pragas e manutenção periódica de jardins corporativos e condomínios.",
    especialidades: ["Poda de árvores", "Gramados", "Adubação orgânica", "Plantio de mudas", "Irrigação"],
    categoriaPrincipal: "Casa e Jardim",
    subcategorias: ["Jardinagem", "Limpeza"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "contato@studioverde.demo",
    isDemo: true
  },
  {
    id: "demo_prestador_09",
    nome: "Construtora & Reformas Aliança",
    email: "alianca.obras.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    telefone: "(61) 98999-0009",
    whatsapp: "(61) 98999-0009",
    cidade: "Brasília",
    estado: "DF",
    tipoPessoa: "Jurídica",
    razaoSocial: "Aliança Engenharia e Reformas Prediais EIRELI",
    bio: "Execução de obras residenciais e comerciais com acompanhamento técnico. Estruturas, drywall, contrapiso, telhados e reformas completas chave na mão.",
    especialidades: ["Reformas completas", "Drywall", "Alvenaria estrutural", "Telhados e calhas"],
    categoriaPrincipal: "Obras e Reforma",
    subcategorias: ["Pedreiro", "Reforma", "Instalação", "Acabamento"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "061989990009",
    isDemo: true
  },
  {
    id: "demo_prestador_10",
    nome: "Auto Elétrica & Baterias Faísca",
    email: "faisca.eletrica.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    telefone: "(81) 99111-1010",
    whatsapp: "(81) 99111-1010",
    cidade: "Recife",
    estado: "PE",
    tipoPessoa: "Jurídica",
    razaoSocial: "Faísca Auto Elétrica e Acessórios ME",
    bio: "Diagnóstico elétrico veicular, alternadores, motores de partida, instalação de alarmes, centrais multimídia, faróis de LED e troca de baterias com teste de carga.",
    especialidades: ["Alternador e motor de arranque", "Baterias", "Chicote elétrico", "Iluminação automotiva"],
    categoriaPrincipal: "Automotivo",
    subcategorias: ["Elétrica automotiva", "Revisão"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "financeiro@faiscaeletrica.demo",
    isDemo: true
  },
  {
    id: "demo_prestador_11",
    nome: "Gabriel Duarte - Desenvolvedor Web & Fullstack",
    email: "gabriel.dev.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
    telefone: "(48) 99222-2011",
    whatsapp: "(48) 99222-2011",
    cidade: "Florianópolis",
    estado: "SC",
    tipoPessoa: "Física",
    bio: "Desenvolvedor web full stack experiente na criação de landing pages de alta conversão, portais corporativos, integrações de APIs e e-commerces rápidos e responsivos.",
    especialidades: ["Desenvolvimento de sites", "Aplicações web", "Integração de APIs", "Otimização de velocidade"],
    categoriaPrincipal: "TI e Redes",
    subcategorias: ["Desenvolvimento", "Suporte técnico"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "gabriel.dev.pix@demo.com",
    isDemo: true
  },
  {
    id: "demo_prestador_12",
    nome: "Larissa Prado - Designer Visual & Branding",
    email: "larissa.design.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    telefone: "(31) 99333-3012",
    whatsapp: "(31) 99333-3012",
    cidade: "Belo Horizonte",
    estado: "MG",
    tipoPessoa: "Física",
    bio: "Designer especialista em identidade visual marcante para pequenas e médias empresas. Criação de logos, manuais de marca, papelaria, posts para redes sociais e apresentações corporativas.",
    especialidades: ["Identidade visual", "Criação de logotipos", "Design para redes sociais", "Branding"],
    categoriaPrincipal: "Freelancers / Acadêmico",
    subcategorias: ["Design", "Serviços acadêmicos"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "larissa.branding@demo.com",
    isDemo: true
  },
  {
    id: "demo_prestador_13",
    nome: "Jorge Pinturas & Texturas Especiais",
    email: "jorge.pinturas.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80",
    telefone: "(11) 99444-4013",
    whatsapp: "(11) 99444-4013",
    cidade: "São Paulo",
    estado: "SP",
    tipoPessoa: "Física",
    bio: "Pintor experiente com foco em cimento queimado, textura projetada, pintura airless de alta produtividade e proteção contra umidade e mofo em paredes internas e fachadas.",
    especialidades: ["Cimento queimado", "Pintura airless", "Textura projetada", "Tratamento de trincas"],
    categoriaPrincipal: "Obras e Reforma",
    subcategorias: ["Pintura", "Acabamento"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "jorge.pinturas@pixdemo.com",
    isDemo: true
  },
  {
    id: "demo_prestador_14",
    nome: "Doctor PC Manutenção & Hardware",
    email: "doctorpc.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=256&q=80",
    telefone: "(19) 99555-5014",
    whatsapp: "(19) 99555-5014",
    cidade: "Campinas",
    estado: "SP",
    tipoPessoa: "Jurídica",
    razaoSocial: "Doctor PC Informática e Serviços Técnicos ME",
    bio: "Laboratório técnico especializado em conserto de placas-mãe de notebooks, recuperação de dados em HD/SSD, limpeza preventiva térmica, upgrade de memória e remoção de malwares.",
    especialidades: ["Reparo de notebook", "Upgrade de SSD", "Troca de pasta térmica", "Recuperação de dados"],
    categoriaPrincipal: "TI e Redes",
    subcategorias: ["Manutenção de computadores", "Suporte técnico"],
    tipo: "prestador",
    status: "ativo",
    chavePix: "19995555014",
    isDemo: true
  },
  {
    id: "demo_prestador_15",
    nome: "LimpaFácil Higienização & Estofados",
    email: "limpafacil.demo@servicosapp.com",
    foto: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80",
    telefone: "(41) 99666-6015",
    whatsapp: "(41) 99666-6015",
    cidade: "Curitiba",
    estado: "PR",
    tipoPessoa: "Jurídica",
    razaoSocial: "LimpaFácil Higienização Residencial Ltda",
    bio: "Higienização profunda e impermeabilização de sofás, colchões, tapetes e interiores de veículos. Eliminação de ácaros, fungos e odores com extratora profissional.",
    especialidades: ["Higienização de sofás", "Impermeabilização", "Limpeza pós-obra", "Limpeza de carpetes"],
    categoriaPrincipal: "Casa e Jardim",
    subcategorias: ["Limpeza", "Manutenção"],
    tipo: "ambos",
    status: "ativo",
    chavePix: "contato@limpafacil.demo",
    isDemo: true
  }
];

// -----------------------------------------------------------------------------
// 2. 10 SOLICITANTES FICTÍCIOS
// -----------------------------------------------------------------------------
const SOLICITANTES = [
  {
    id: "demo_solicitante_01",
    nome: "Mariana Vasconcelos",
    email: "mariana.vasconcelos.demo@gmail.com",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    telefone: "(11) 97111-1101",
    cidade: "São Paulo",
    estado: "SP",
    tipoPessoa: "Física",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_02",
    nome: "Condomínio Residencial Jardins",
    email: "sindico.jardins.demo@condominio.com",
    foto: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=256&q=80",
    telefone: "(11) 97222-2202",
    cidade: "São Paulo",
    estado: "SP",
    tipoPessoa: "Empresa",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_03",
    nome: "Lucas Mendonça",
    email: "lucas.mendonca.demo@outlook.com",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    telefone: "(21) 97333-3303",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    tipoPessoa: "Física",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_04",
    nome: "Padaria & Confeitaria Estrela de Minas",
    email: "administracao.padaria.demo@gmail.com",
    foto: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=256&q=80",
    telefone: "(31) 97444-4404",
    cidade: "Belo Horizonte",
    estado: "MG",
    tipoPessoa: "Empresa",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_05",
    nome: "Juliana Peixoto",
    email: "juliana.peixoto.demo@yahoo.com.br",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    telefone: "(41) 97555-5505",
    cidade: "Curitiba",
    estado: "PR",
    tipoPessoa: "Física",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_06",
    nome: "Escritório Ribeiro & Associados Advocacia",
    email: "contato.advocacia.demo@ribeiro.com",
    foto: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=256&q=80",
    telefone: "(51) 97666-6606",
    cidade: "Porto Alegre",
    estado: "RS",
    tipoPessoa: "Empresa",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_07",
    nome: "Felipe Nogueira",
    email: "felipe.nogueira.demo@gmail.com",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    telefone: "(71) 97777-7707",
    cidade: "Salvador",
    estado: "BA",
    tipoPessoa: "Física",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_08",
    nome: "Clínica Odontológica Sorriso Bem",
    email: "recepcao.sorrisobem.demo@clinica.com",
    foto: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=256&q=80",
    telefone: "(61) 97888-8808",
    cidade: "Brasília",
    estado: "DF",
    tipoPessoa: "Empresa",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_09",
    nome: "Renata Coimbra",
    email: "renata.coimbra.demo@hotmail.com",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    telefone: "(81) 97999-9909",
    cidade: "Recife",
    estado: "PE",
    tipoPessoa: "Física",
    tipo: "solicitante",
    isDemo: true
  },
  {
    id: "demo_solicitante_10",
    nome: "Startup InovaTech Soluções Digitais",
    email: "operacoes.inovatech.demo@startup.io",
    foto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=256&q=80",
    telefone: "(48) 98000-0010",
    cidade: "Florianópolis",
    estado: "SC",
    tipoPessoa: "Empresa",
    tipo: "solicitante",
    isDemo: true
  }
];

// -----------------------------------------------------------------------------
// 3. 100 SERVIÇOS AVULSOS (Distribuídos nas 5 categorias)
// -----------------------------------------------------------------------------
function gerarServicosAvulsos() {
  const servicos = [];
  
  // Categorias base e subcategorias
  const templates = [
    // Casa e Jardim
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Instalação de Chuveiro Elétrico Blindado ou Comum", desc: "Substituição e instalação segura com fiação correta, conector cerâmico ou wago e teste de aquecimento.", val: 95.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Troca de Disjuntores e Adequação de Quadro de Luz", desc: "Dimensionamento e substituição de disjuntores antigos com proteção contra sobrecargas.", val: 240.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Instalação de Luminárias de Sobrepor e Pendentes", desc: "Fixação e conexão de pendentes e painéis de LED para sala, cozinha ou bancada.", val: 80.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Instalação de Ventilador de Teto com Controle", desc: "Balanceamento de pás e ligação elétrica no interruptor ou controle remoto sem ruído.", val: 160.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Troca e Instalação de Tomadas de 10A e 20A", desc: "Troca de espelhos e tomadas no novo padrão brasileiro com aterramento correto.", val: 60.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Revisão Geral da Fiação Residencial", desc: "Diagnóstico térmico contra aquecimento anormal de fiação e curto-circuitos.", val: 320.00 },
    { cat: "Casa e Jardim", sub: "Elétrica residencial", pUid: "demo_prestador_01", tit: "Instalação de Sensor de Presença e Fotocélula", desc: "Automatização de luzes de garagem, hall e áreas externas para economia de energia.", val: 110.00 },

    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Limpeza Física e Decantação de Piscina Verde", desc: "Tratamento de choque para piscinas turvas ou verdes, com aspiração lenta para o esgoto.", val: 380.00 },
    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Manutenção Mensal de Piscina (4 Visitas)", desc: "Controle semanal de alcalinidade, cloro, pH, escovação e limpeza do pré-filtro.", val: 450.00 },
    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Troca de Areia do Filtro da Piscina", desc: "Substituição completa do elemento filtrante para recuperar a transparência da água.", val: 290.00 },
    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Regulagem e Troca de Vedações da Bomba da Piscina", desc: "Correção de ruídos e pequenos vazamentos no selo mecânico e rotor da motobomba.", val: 210.00 },
    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Higienização e Escovação de Bordas de Vinil/Fibra", desc: "Remoção de oleosidade e manchas na linha d'água com produtos biodegradáveis.", val: 170.00 },
    { cat: "Casa e Jardim", sub: "Piscinas", pUid: "demo_prestador_02", tit: "Instalação de Gerador de Cloro por Sal", desc: "Montagem da célula eletrolítica para tratamento automatizado e mais suave aos olhos.", val: 350.00 },

    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Caça Vazamento Eletrônico com Geofone", desc: "Localização precisa de vazamentos não aparentes em tubulações sem quebrar paredes.", val: 280.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Reparo de Válvula Hydra e Caixa Acoplada", desc: "Troca do reparo interno, êmbolo ou torre de entrada contra vazamentos contínuos.", val: 120.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Desentupimento de Pia de Cozinha e Sifão", desc: "Desobstrução rápida da tubulação com maquinário manual e limpeza do encanamento.", val: 140.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Instalação de Torneira Monocomando e Filtro", desc: "Fixação e conexão flexível para bancada de cozinha ou banheiro sem pinga-pinga.", val: 90.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Limpeza e Desinfecção de Caixa D'Água (até 1000L)", desc: "Esvaziamento programado, escovação e desinfecção com hipoclorito conforme norma técnica.", val: 190.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Troca de Registro Geral de Água", desc: "Substituição do cabeçote ou corpo do registro com teste de pressão imediato.", val: 160.00 },
    { cat: "Casa e Jardim", sub: "Hidráulica", pUid: "demo_prestador_07", tit: "Instalação de Pressurizador de Água Residencial", desc: "Aumento da pressão das duchas e torneiras em residências térreas ou sobrados.", val: 260.00 },

    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Poda de Gramado e Refilamento de Canteiros", desc: "Corte uniforme com roçadeira, recolhimento de resíduos e acabamento nos meios-fios.", val: 180.00 },
    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Poda de Limpeza e Formação de Árvores de Pequeno Porte", desc: "Remoção de galhos secos e perigosos com segurança e destinação vegetal apropriada.", val: 250.00 },
    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Adubação e Recuperação de Solo para Canteiros", desc: "Incorporação de terra vegetal enriquecida, calcário e matéria orgânica para folhagens.", val: 160.00 },
    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Plantio e Assentamento de Grama Esmeralda (m²)", desc: "Nivelamento do solo, adubo de fundo e encaixe das placas de grama frescas.", val: 22.00 },
    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Tratamento de Pragas (Cochonilhas e Pulgões)", desc: "Aplicação controlada de óleo de neem e bioestimulantes para revigorar as plantas.", val: 130.00 },
    { cat: "Casa e Jardim", sub: "Jardinagem", pUid: "demo_prestador_08", tit: "Reforma de Vasos e Jardineiras Decorativas", desc: "Troca de substrato drenante, manta geotêxtil e replantio de espécies ornamentais.", val: 110.00 },

    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Higienização e Limpeza Profunda de Sofá (3 Lugares)", desc: "Extração de sujidades acumuladas, bactérias e manchas leves com produtos neutros.", val: 220.00 },
    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Impermeabilização de Estofados com Laudo", desc: "Aplicação de resina protetora que impede a absorção imediata de líquidos derramados.", val: 260.00 },
    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Higienização de Colchão Casal/Queen", desc: "Neutralização de odores e ácaros causadores de rinite com secagem semi-rápida.", val: 180.00 },
    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Limpeza Pesada Pós-Reforma e Pós-Obra (Diária)", desc: "Remoção de tintas, rejuntes e poeira fina em vidros, pisos e azulejos com maquinário.", val: 420.00 },
    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Limpeza e Hidratação de Bancos de Couro Automotivos", desc: "Higienização profunda dos poros do couro e selagem contra ressecamento e rachaduras.", val: 190.00 },
    { cat: "Casa e Jardim", sub: "Limpeza", pUid: "demo_prestador_15", tit: "Lavagem de Tapetes e Carpetes por Metro Quadrado", desc: "Lavagem com produto bactericida e centrifugação para secagem sem cheiro de mofo.", val: 35.00 },

    // Obras e Reforma
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_03", tit: "Pintura de Quarto com Emassamento Parcial", desc: "Lixamento prévio, aplicação de selador e duas demãos de tinta acrílica premium.", val: 380.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_03", tit: "Pintura Residencial Completa de Apartamento até 60m²", desc: "Pintura de tetos e paredes com isolamento meticuloso de rodapés e pisos com lona.", val: 1450.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_03", tit: "Aplicação de Massa Corrida PVA em Paredes Internas", desc: "Duas demãos de massa com desempenadeira de inox para acabamento liso perfeito.", val: 450.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_03", tit: "Pintura de Portas e Batentes em Esmalte Sintético", desc: "Preparação da madeira, aplicação de fundo nivelador e esmalte fosco ou acetinado.", val: 130.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_13", tit: "Aplicação de Efeito Cimento Queimado Rústico/Moderno", desc: "Textura decorativa sofisticada para paredes de destaque em salas e consultórios.", val: 390.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_13", tit: "Pintura Externa e Tratamento Hidrofugante de Fachada", desc: "Proteção contra chuva e infiltração externa com tinta emborrachada elástica.", val: 980.00 },
    { cat: "Obras e Reforma", sub: "Pintura", pUid: "demo_prestador_13", tit: "Pintura Airless de Grandes Áreas e Galpões", desc: "Aplicação mecanizada de altíssima produtividade e camada homogênea.", val: 650.00 },

    { cat: "Obras e Reforma", sub: "Pedreiro", pUid: "demo_prestador_03", tit: "Assentamento de Porcelanato até 80x80 (m²)", desc: "Colocação com argamassa AC-III, niveladores de piso e alinhamento milimétrico.", val: 65.00 },
    { cat: "Obras e Reforma", sub: "Pedreiro", pUid: "demo_prestador_03", tit: "Construção de Parede de Alvenaria com Reboco", desc: "Levantamento de alvenaria com blocos cerâmicos, prumo e chapisco estruturado.", val: 320.00 },
    { cat: "Obras e Reforma", sub: "Pedreiro", pUid: "demo_prestador_09", tit: "Quebra e Demolição Segura com Retirada de Entulho", desc: "Abertura de vãos, quebra de paredes não estruturais e ensacamento do entulho.", val: 400.00 },
    { cat: "Obras e Reforma", sub: "Pedreiro", pUid: "demo_prestador_09", tit: "Execução de Contrapiso Regularizado e Nivelado", desc: "Massa forte com caimento adequado para áreas molhadas ou nivelamento com laser.", val: 340.00 },
    { cat: "Obras e Reforma", sub: "Pedreiro", pUid: "demo_prestador_09", tit: "Construção de Muro de Fechamento com Viga Baldrame", desc: "Estrutura reforçada de concreto armado e blocos de concreto com acabamento.", val: 1200.00 },

    { cat: "Obras e Reforma", sub: "Reforma", pUid: "demo_prestador_09", tit: "Reforma Completa de Banheiro Padrão", desc: "Substituição completa de encanamentos, revestimentos de chão e parede e louças.", val: 2600.00 },
    { cat: "Obras e Reforma", sub: "Reforma", pUid: "demo_prestador_09", tit: "Adequação de Cozinha para Conceito Aberto", desc: "Criação de bancada americana, abertura de vão e reforço com viga metálica.", val: 1800.00 },
    { cat: "Obras e Reforma", sub: "Reforma", pUid: "demo_prestador_09", tit: "Instalação de Forro de Drywall Rebaixado com Cortineiro", desc: "Montagem de estrutura em perfis de aço galvanizado e placas de gesso acartonado.", val: 550.00 },
    { cat: "Obras e Reforma", sub: "Acabamento", pUid: "demo_prestador_13", tit: "Instalação de Rodapés de Poliestireno ou Madeira", desc: "Corte em meia esquadria 45° preciso com colagem resistente e calafetação superior.", val: 28.00 },
    { cat: "Obras e Reforma", sub: "Acabamento", pUid: "demo_prestador_13", tit: "Rejuntamento Epóxi e Retirada de Rejunte Antigo", desc: "Impermeabilização do rejunte em áreas de box para evitar bolor e manchas escuras.", val: 280.00 },
    { cat: "Obras e Reforma", sub: "Acabamento", pUid: "demo_prestador_03", tit: "Instalação de Nicho em Porcelanato para Box", desc: "Corte na parede, fixação de nicho esculpido e vedação anti-infiltração.", val: 190.00 },
    { cat: "Obras e Reforma", sub: "Instalação", pUid: "demo_prestador_09", tit: "Instalação de Porta de Madeira com Fechadura", desc: "Ajuste na folha com tupia, fixação de dobradiças e instalação de fechadura segura.", val: 180.00 },

    // Automotivo
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Troca de Pastilhas e Fluido de Freio DOT 4", desc: "Substituição com sangria do sistema e verificação da espessura dos discos.", val: 160.00 },
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Troca da Correia Dentada e Tensor", desc: "Sincronismo exato do motor com ferramentas de fasagem para evitar danos às válvulas.", val: 320.00 },
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Substituição de Amortecedores Dianteiros e Batentes", desc: "Desmontagem da torre de suspensão com encolhedor de molas e reaperto com torquímetro.", val: 280.00 },
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Troca de Embreagem (Platô, Disco e Rolamento)", desc: "Substituição do kit de embreagem com alinhamento do eixo piloto e teste de maciez.", val: 450.00 },
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Limpeza de Bicos Injetores por Ultrassom", desc: "Equalização em bancada de teste e troca dos filtros micro e anéis oring dos bicos.", val: 170.00 },
    { cat: "Automotivo", sub: "Mecânica", pUid: "demo_prestador_04", tit: "Troca da Bomba D'Água e Válvula Termostática", desc: "Prevenção contra superaquecimento com reposição de aditivo orgânico no radiador.", val: 250.00 },

    { cat: "Automotivo", sub: "Revisão", pUid: "demo_prestador_04", tit: "Revisão Preventiva de 10.000km / 1 Ano", desc: "Check-up de 40 itens essenciais, suspensão, vazamentos, freios, luzes e fluidos.", val: 220.00 },
    { cat: "Automotivo", sub: "Revisão", pUid: "demo_prestador_04", tit: "Troca de Óleo do Motor e Filtros (Óleo, Ar, Combustível)", desc: "Drenagem adequada, reposição com lubrificante sintético na viscosidade recomendada.", val: 120.00 },
    { cat: "Automotivo", sub: "Revisão", pUid: "demo_prestador_04", tit: "Diagnóstico Computadorizado com Scanner OBD2", desc: "Leitura de falhas na injeção, sensores de oxigênio, ABS e reset de luz de avaria.", val: 110.00 },
    { cat: "Automotivo", sub: "Revisão", pUid: "demo_prestador_04", tit: "Higienização do Ar-Condicionado Automotivo e Troca do Filtro", desc: "Nebulização de ozônio germicida contra ácaros e troca do elemento filtrante de cabine.", val: 130.00 },

    { cat: "Automotivo", sub: "Freios", pUid: "demo_prestador_04", tit: "Retífica ou Troca de Discos de Freio Ventilados", desc: "Eliminação de trepidações no pedal ao frear através de medição com micrômetro.", val: 190.00 },
    { cat: "Automotivo", sub: "Freios", pUid: "demo_prestador_04", tit: "Revisão do Sistema de Freio Traseiro a Tambor", desc: "Ajuste das sapatas, lubrificação dos patins e conferência dos cilindros de roda.", val: 150.00 },

    { cat: "Automotivo", sub: "Motor", pUid: "demo_prestador_04", tit: "Troca da Junta da Tampa de Válvulas contra Vazamento de Óleo", desc: "Limpeza da superfície, aplicação de torque correto e vedação resistente à temperatura.", val: 180.00 },
    { cat: "Automotivo", sub: "Motor", pUid: "demo_prestador_04", tit: "Descarbonização de Válvulas e Coletor de Admissão", desc: "Remoção de resíduos de carvão para recuperar a potência original do motor.", val: 420.00 },

    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Diagnóstico e Reparo do Motor de Partida (Arranque)", desc: "Troca de escovas, automático de partida e bendix para partida imediata.", val: 190.00 },
    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Revisão e Troca do Regulador de Voltagem do Alternador", desc: "Correção de oscilações na bateria e garantia da carga ideal durante a condução.", val: 210.00 },
    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Instalação de Sensor de Estacionamento e Câmera de Ré", desc: "Furação precisa no para-choque com integração no display interno ou multimídia.", val: 170.00 },
    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Instalação de Faróis de Neblina e Lâmpadas Super Brancas", desc: "Chicote independente com relé de proteção e botão original no painel.", val: 160.00 },
    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Conserto de Vidro Elétrico e Troca de Máquina", desc: "Substituição do cabo de aço ou motor elétrico da porta com encaixe perfeito.", val: 140.00 },
    { cat: "Automotivo", sub: "Elétrica automotiva", pUid: "demo_prestador_10", tit: "Instalação de Módulo de Subida de Vidros no Alarme", desc: "Fechamento automático dos 4 vidros com um clique no controle remoto do veículo.", val: 150.00 },

    // TI e Redes
    { cat: "TI e Redes", sub: "Redes", pUid: "demo_prestador_05", tit: "Configuração de Rede Wi-Fi Mesh Residencial/Comercial", desc: "Cobertura total sem pontos cegos de sinal com sincronização inteligente de roaming.", val: 180.00 },
    { cat: "TI e Redes", sub: "Redes", pUid: "demo_prestador_05", tit: "Passagem e Conectorização de Cabos de Rede Cat6 (ponto)", desc: "Cabeamento de alta performance para Smart TVs, PCs gamers e consoles de jogos.", val: 85.00 },
    { cat: "TI e Redes", sub: "Redes", pUid: "demo_prestador_05", tit: "Configuração de Roteador Mikrotik / Balanceamento de Carga", desc: "Gerenciamento de duas conexões de internet (failover) e limitação de banda por setor.", val: 340.00 },
    { cat: "TI e Redes", sub: "Redes", pUid: "demo_prestador_05", tit: "Montagem e Organização de Rack de Rede de TI", desc: "Identificação de patch cords, keystones e organização visual de switches corporativos.", val: 420.00 },
    { cat: "TI e Redes", sub: "Redes", pUid: "demo_prestador_05", tit: "Configuração de VPN Segura para Acesso Remoto", desc: "Criação de túnel criptografado para colaboradores acessarem arquivos da empresa de casa.", val: 260.00 },

    { cat: "TI e Redes", sub: "Infraestrutura", pUid: "demo_prestador_05", tit: "Instalação e Configuração de Servidor de Arquivos Linux (NAS)", desc: "Armazenamento centralizado com controle de permissões de pastas e espelhamento RAID.", val: 550.00 },
    { cat: "TI e Redes", sub: "Infraestrutura", pUid: "demo_prestador_05", tit: "Implementação de Rotina Automatizada de Backup em Nuvem", desc: "Proteção diária contra ataques de ransomware com retenção histórica de versões.", val: 310.00 },
    { cat: "TI e Redes", sub: "Infraestrutura", pUid: "demo_prestador_05", tit: "Instalação de Câmeras de Segurança IP com Acesso no Celular", desc: "Configuração de DVR/NVR e aplicativo mobile para monitoramento em tempo real.", val: 280.00 },

    { cat: "TI e Redes", sub: "Suporte técnico", pUid: "demo_prestador_05", tit: "Suporte Técnico Remoto Especializado (Hora Técnica)", desc: "Resolução rápida de problemas em softwares, impressoras em rede e lentidões gerais.", val: 90.00 },
    { cat: "TI e Redes", sub: "Suporte técnico", pUid: "demo_prestador_14", tit: "Remoção de Vírus, Malwares e Otimização do Sistema Operacional", desc: "Varredura profunda, limpeza de inicialização e exclusão de rastreadores indesejados.", val: 120.00 },
    { cat: "TI e Redes", sub: "Suporte técnico", pUid: "demo_prestador_14", tit: "Instalação Limpa de Windows 11 com Drivers Oficiais", desc: "Formatação com backup prévio de documentos e ativação das atualizações de segurança.", val: 130.00 },
    { cat: "TI e Redes", sub: "Suporte técnico", pUid: "demo_prestador_14", tit: "Configuração de Certificado Digital A1/A3 e Emissor Fiscal", desc: "Instalação de cadeia de certificados e leitora de cartão para notas fiscais.", val: 95.00 },

    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Upgrade de SSD NVMe e Clonagem do Sistema Operacional", desc: "Deixe seu computador até 10x mais veloz sem perder nenhum arquivo ou programa instalado.", val: 150.00 },
    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Limpeza Interna e Troca de Pasta Térmica Artic Silver", desc: "Redução da temperatura do processador e placa de vídeo contra desligamentos súbitos.", val: 140.00 },
    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Troca de Tela LCD/LED Quebrada de Notebook", desc: "Substituição com tela de reposição original e garantia contra pixels mortos.", val: 180.00 },
    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Reparo de Dobradiça e Carcaça Quebrada de Notebook", desc: "Reconstrução com resina plástica industrial reforçada para abertura suave da tampa.", val: 160.00 },
    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Montagem Completa de PC Gamer com Cable Management", desc: "Encaixe correto de placa-mãe, water cooler, GPU e organização visual dos cabos.", val: 250.00 },
    { cat: "TI e Redes", sub: "Manutenção de computadores", pUid: "demo_prestador_14", tit: "Recuperação de Arquivos de HD Externo ou Pendrive Corrompido", desc: "Recuperação lógica de fotos e documentos com ferramentas especializadas de laboratório.", val: 290.00 },

    { cat: "TI e Redes", sub: "Desenvolvimento", pUid: "demo_prestador_11", tit: "Desenvolvimento de Landing Page de Alta Conversão", desc: "Página responsiva moderna, otimizada para anúncios do Google e Meta com botão WhatsApp.", val: 890.00 },
    { cat: "TI e Redes", sub: "Desenvolvimento", pUid: "demo_prestador_11", tit: "Criação de Site Institucional com Painel Administrativo", desc: "Site profissional de até 5 páginas com blog e formulário de contato integrado.", val: 1600.00 },
    { cat: "TI e Redes", sub: "Desenvolvimento", pUid: "demo_prestador_11", tit: "Otimização de Performance e Core Web Vitals (SEO Técnico)", desc: "Melhoria da nota no Google PageSpeed para carregamento abaixo de 2 segundos.", val: 450.00 },
    { cat: "TI e Redes", sub: "Desenvolvimento", pUid: "demo_prestador_11", tit: "Integração de Gateway de Pagamento (Pix / Cartão)", desc: "Implementação de checkout transparente com confirmação instantânea via webhook.", val: 520.00 },
    { cat: "TI e Redes", sub: "Desenvolvimento", pUid: "demo_prestador_11", tit: "Consultoria em Arquitetura de Software e Cloud AWS/GCP", desc: "Auditoria de segurança, escalabilidade de banco de dados e microserviços.", val: 350.00 },

    // Freelancers / Acadêmico
    { cat: "Freelancers / Acadêmico", sub: "Revisão", pUid: "demo_prestador_06", tit: "Revisão Gramatical e Ortográfica Completa de TCC", desc: "Correção atenta de concordância, coesão textual, regência e clareza de ideias.", val: 260.00 },
    { cat: "Freelancers / Acadêmico", sub: "Revisão", pUid: "demo_prestador_06", tit: "Revisão Crítica de Dissertação de Mestrado ou Tese", desc: "Aprimoramento do rigor estilístico acadêmico com apontamentos de coerência conceitual.", val: 580.00 },
    { cat: "Freelancers / Acadêmico", sub: "Revisão", pUid: "demo_prestador_06", tit: "Revisão de Artigo Científico para Submissão em Periódico", desc: "Adequação às diretrizes da revista científica e aperfeiçoamento da escrita formal.", val: 220.00 },

    { cat: "Freelancers / Acadêmico", sub: "Formatação", pUid: "demo_prestador_06", tit: "Formatação Completa nas Normas ABNT (Trabalho Acadêmico)", desc: "Margens, paginação, sumário automático, referências bibliográficas e legendas de figuras.", val: 150.00 },
    { cat: "Freelancers / Acadêmico", sub: "Formatação", pUid: "demo_prestador_06", tit: "Adequação de Referências às Normas APA ou Vancouver", desc: "Padronização minuciosa de fontes e citações no corpo do texto e lista final.", val: 140.00 },
    { cat: "Freelancers / Acadêmico", sub: "Formatação", pUid: "demo_prestador_06", tit: "Criação de Template Word/Google Docs com Estilos Pré-Definidos", desc: "Arquivo base pronto com estilos de títulos, parágrafos e tabelas nos padrões oficiais.", val: 90.00 },

    { cat: "Freelancers / Acadêmico", sub: "Serviços acadêmicos", pUid: "demo_prestador_06", tit: "Elaboração de Resumo e Abstract em Inglês Acadêmico", desc: "Versão clara e fluida com vocabulário técnico rigoroso para indexação internacional.", val: 110.00 },
    { cat: "Freelancers / Acadêmico", sub: "Serviços acadêmicos", pUid: "demo_prestador_06", tit: "Orientação e Estruturação de Projeto de Pesquisa", desc: "Aconselhamento sobre problematização, objetivos, justificativa e metodologia.", val: 320.00 },
    { cat: "Freelancers / Acadêmico", sub: "Serviços acadêmicos", pUid: "demo_prestador_06", tit: "Apresentação em Slides Profissionais para Defesa de TCC", desc: "Design claro e didático para projeção com pontos-chave do trabalho sem poluição visual.", val: 180.00 },

    { cat: "Freelancers / Acadêmico", sub: "Redação", pUid: "demo_prestador_06", tit: "Redação de Artigo para Blog Corporativo / SEO (1.000 palavras)", desc: "Conteúdo original, envolvente e focado nas principais palavras-chave do seu nicho.", val: 120.00 },
    { cat: "Freelancers / Acadêmico", sub: "Redação", pUid: "demo_prestador_06", tit: "Criação de Copywriting para E-mails de Lançamento", desc: "Gatilhos mentais persuasivos e estrutura orientada a altas taxas de cliques e conversões.", val: 240.00 },
    { cat: "Freelancers / Acadêmico", sub: "Tradução", pUid: "demo_prestador_06", tit: "Tradução Técnica Inglês para Português (por lauda)", desc: "Tradução humana fiel ao sentido original de manuais, artigos e apresentações.", val: 35.00 },

    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Criação de Identidade Visual Completa para Empresas", desc: "Logotipo, variações de cor, tipografia oficial, paleta de cores e manual da marca em PDF.", val: 850.00 },
    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Redesign e Modernização de Logotipo Existente", desc: "Atualização visual mantendo o reconhecimento da sua marca com vetorização nítida.", val: 380.00 },
    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Pacote de 10 Artes Criativas para Feed e Stories no Instagram", desc: "Templates editáveis com alinhamento visual moderno e padrão da sua marca.", val: 320.00 },
    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Design de Cartão de Visita Digital Interativo com Links", desc: "Cartão em PDF clicável com ícones diretos para WhatsApp, e-mail, mapa e site.", val: 95.00 },
    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Diagramação de E-book ou Catálogo de Produtos em PDF", desc: "Design editorial com capa chamativa, tipografia agradável e sumário interativo.", val: 420.00 },
    { cat: "Freelancers / Acadêmico", sub: "Design", pUid: "demo_prestador_12", tit: "Criação de Apresentação Corporativa em PowerPoint/Canva", desc: "Design de slides de alto impacto visual para rodadas de investimento e reuniões de negócios.", val: 360.00 }
  ];

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const id = `demo_servico_${String(i + 1).padStart(3, '0')}`;
    servicos.push({
      id: id,
      prestador_uid: t.pUid,
      titulo: t.tit,
      categoria: t.cat,
      subcategoria: t.sub,
      descricao: t.desc,
      valor_base: t.val,
      ativo: true,
      isDemo: true,
      criadoEm: dataPassada(45 - (i % 30))
    });
  }

  return servicos;
}

// -----------------------------------------------------------------------------
// 4. 25 SOLICITAÇÕES DE SERVIÇO
// -----------------------------------------------------------------------------
const SOLICITACOES = [
  // ABERTAS (6)
  {
    id: "demo_solicitacao_01",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    titulo: "Troca de fiação e instalação de 2 chuveiros novos",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    descricao: "Mudei recentemente para um apartamento antigo e os chuveiros estão desarmando o disjuntor constantemente. Preciso da troca da fiação do quadro até os banheiros e instalação dos novos chuveiros de 7500W.",
    endereco: "Bela Vista, São Paulo - SP",
    status: "ABERTA",
    diasAtras: 3
  },
  {
    id: "demo_solicitacao_02",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    titulo: "Limpeza pós-chuva e manutenção da piscina do condomínio",
    categoria: "Casa e Jardim",
    subcategoria: "Piscinas",
    descricao: "A piscina do condomínio (aproximadamente 60 mil litros) ficou verde após as fortes chuvas do fim de semana. Necessitamos de decantação, aspiração e reposição de produtos químicos com urgência para o fim de semana.",
    endereco: "Jardins, São Paulo - SP",
    status: "ABERTA",
    diasAtras: 2
  },
  {
    id: "demo_solicitacao_03",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    titulo: "Barulho metálico na roda dianteira e pedal de freio vibrando",
    categoria: "Automotivo",
    subcategoria: "Freios",
    descricao: "Veículo sedan 2020 apresentando forte chiado ao frear e vibração no volante ao reduzir a velocidade em rodovia. Suspeito de pastilhas gastas ou discos empenados. Preciso de avaliação e orçamento com peças.",
    endereco: "Botafogo, Rio de Janeiro - RJ",
    status: "ABERTA",
    diasAtras: 4
  },
  {
    id: "demo_solicitacao_04",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    titulo: "Instalação de rede Wi-Fi para clientes e sistema de caixa",
    categoria: "TI e Redes",
    subcategoria: "Redes",
    descricao: "Estamos expandindo o salão de atendimento e precisamos separar a rede Wi-Fi corporativa (máquinas de cartão e computadores) da rede dos clientes, com controle de acesso e sinal forte em todo o espaço.",
    endereco: "Savassi, Belo Horizonte - MG",
    status: "ABERTA",
    diasAtras: 1
  },
  {
    id: "demo_solicitacao_05",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    titulo: "Formatação nas normas ABNT de dissertação de mestrado em Saúde",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Formatação",
    descricao: "Texto com 115 páginas necessitando de adequação das margens, criação de sumário automático com 4 níveis, listas de tabelas e gráficos, além de conferência e padronização das 92 referências bibliográficas.",
    endereco: "Batel, Curitiba - PR",
    status: "ABERTA",
    diasAtras: 5
  },
  {
    id: "demo_solicitacao_06",
    solicitanteId: "demo_solicitante_07",
    nomeSolicitante: "Felipe Nogueira",
    titulo: "Pintura completa de sala de estar e corredor com acabamento fosco",
    categoria: "Obras e Reforma",
    subcategoria: "Pintura",
    descricao: "Paredes com pequenas marcas de quadros e fissuras superficiais. Desejo aplicação de massa corrida nas correções, lixamento e pintura com tinta Suvinil ou Coral toque de seda cor cinza elefante.",
    endereco: "Pituba, Salvador - BA",
    status: "ABERTA",
    diasAtras: 2
  },

  // EM_ANALISE (4)
  {
    id: "demo_solicitacao_07",
    solicitanteId: "demo_solicitante_06",
    nomeSolicitante: "Escritório Ribeiro & Associados Advocacia",
    titulo: "Revisão e upgrade de 6 computadores do escritório",
    categoria: "TI e Redes",
    subcategoria: "Manutenção de computadores",
    descricao: "As máquinas estão lentas para abrir arquivos PDF pesados e sistemas jurídicos. Desejamos colocar SSD de 480GB em todas, dobrar a memória RAM e reinstalar o sistema limpo com backup seguro dos processos.",
    endereco: "Moinhos de Vento, Porto Alegre - RS",
    status: "EM_ANALISE",
    diasAtras: 7
  },
  {
    id: "demo_solicitacao_08",
    solicitanteId: "demo_solicitante_08",
    nomeSolicitante: "Clínica Odontológica Sorriso Bem",
    titulo: "Caça-vazamento em tubulação embutida do consultório",
    categoria: "Casa e Jardim",
    subcategoria: "Hidráulica",
    descricao: "Identificamos mancha de umidade no rodapé da sala de esterilização e a conta de água subiu significativamente. Precisamos de detecção precisa sem necessidade de quebrar todo o piso cerâmico.",
    endereco: "Asa Sul, Brasília - DF",
    status: "EM_ANALISE",
    diasAtras: 6
  },
  {
    id: "demo_solicitacao_09",
    solicitanteId: "demo_solicitante_09",
    nomeSolicitante: "Renata Coimbra",
    titulo: "Revisão da suspensão dianteira e troca de amortecedores",
    categoria: "Automotivo",
    subcategoria: "Mecânica",
    descricao: "Carro hatch 1.6 com 75 mil km rodados fazendo barulho seco ao passar por lombadas e ruas de paralelepípedo. Desejo troca do par de amortecedores, batentes, coifas e bieletas.",
    endereco: "Boa Viagem, Recife - PE",
    status: "EM_ANALISE",
    diasAtras: 8
  },
  {
    id: "demo_solicitacao_10",
    solicitanteId: "demo_solicitante_10",
    nomeSolicitante: "Startup InovaTech Soluções Digitais",
    titulo: "Criação de nova identidade visual e manual de marca",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Design",
    descricao: "Estamos reformulando nossa marca de tecnologia B2B. Precisamos de novo logotipo com conceito moderno, guia de aplicação, paleta de cores para produto web e kits de posts para LinkedIn.",
    endereco: "Centro, Florianópolis - SC",
    status: "EM_ANALISE",
    diasAtras: 9
  },

  // CONTRATADA (7)
  {
    id: "demo_solicitacao_11",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    titulo: "Higienização profunda de sofá retrátil e 6 cadeiras de jantar",
    categoria: "Casa e Jardim",
    subcategoria: "Limpeza",
    descricao: "Estofado de cor clara com manchas de uso diário e pelos de animais. Queremos higienização por extração com produtos certificados que não agridam o tecido.",
    endereco: "Bela Vista, São Paulo - SP",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_15",
    diasAtras: 14
  },
  {
    id: "demo_solicitacao_12",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    titulo: "Poda de 8 palmeiras e corte de gramado da área de lazer",
    categoria: "Casa e Jardim",
    subcategoria: "Jardinagem",
    descricao: "Manutenção periódica das árvores ornamentais com remoção de folhas secas caídas na calçada e corte da grama esmeralda com descarte ecológico das aparas.",
    endereco: "Jardins, São Paulo - SP",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_08",
    diasAtras: 12
  },
  {
    id: "demo_solicitacao_13",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    titulo: "Troca de correia dentada, tensor e bomba d'água de motor 1.4",
    categoria: "Automotivo",
    subcategoria: "Mecânica",
    descricao: "Manutenção preventiva aos 60 mil km. Desejo peças de primeira linha (Gates ou Continental) e substituição simultânea do líquido de arrefecimento.",
    endereco: "Botafogo, Rio de Janeiro - RJ",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_04",
    diasAtras: 15
  },
  {
    id: "demo_solicitacao_14",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    titulo: "Instalação de tomadas trifásicas para novo forno industrial",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    descricao: "Chegada de maquinário que exige tomada industrial com disjuntor dedicado no quadro geral de força para suportar a carga de aquecimento.",
    endereco: "Savassi, Belo Horizonte - MG",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_01",
    diasAtras: 11
  },
  {
    id: "demo_solicitacao_15",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    titulo: "Revisão ortográfica e gramatical de artigo científico para submissão",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Revisão",
    descricao: "Artigo de 22 laudas sobre saúde preventiva. O objetivo é ajustar a formalidade do vocabulário e clareza textual antes do envio para revista Qualis A2.",
    endereco: "Batel, Curitiba - PR",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_06",
    diasAtras: 10
  },
  {
    id: "demo_solicitacao_16",
    solicitanteId: "demo_solicitante_08",
    nomeSolicitante: "Clínica Odontológica Sorriso Bem",
    titulo: "Desenvolvimento de site institucional com agendamento online",
    categoria: "TI e Redes",
    subcategoria: "Desenvolvimento",
    descricao: "Página moderna para apresentação dos dentistas, especialidades tratadas, depoimentos e integração com link para conversa direta no WhatsApp da recepção.",
    endereco: "Asa Sul, Brasília - DF",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_11",
    diasAtras: 18
  },
  {
    id: "demo_solicitacao_17",
    solicitanteId: "demo_solicitante_09",
    nomeSolicitante: "Renata Coimbra",
    titulo: "Aplicação de efeito cimento queimado na parede da sala",
    categoria: "Obras e Reforma",
    subcategoria: "Acabamento",
    descricao: "Parede de 14m² com acabamento rústico sofisticado. Parede já está selada e lixada, necessitando de 3 demãos do produto e cera de proteção.",
    endereco: "Boa Viagem, Recife - PE",
    status: "CONTRATADA",
    prestadorContratadoId: "demo_prestador_13",
    diasAtras: 13
  },

  // CONCLUIDA (8)
  {
    id: "demo_solicitacao_18",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    titulo: "Troca de válvula de descarga Hydra no banheiro social",
    categoria: "Casa e Jardim",
    subcategoria: "Hidráulica",
    descricao: "A descarga estava vazando continuamente para o vaso sanitário gerando desperdício. Realizada a troca completa do reparo e regulagem do fluxo de água.",
    endereco: "Bela Vista, São Paulo - SP",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_07",
    diasAtras: 35
  },
  {
    id: "demo_solicitacao_19",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    titulo: "Revisão elétrica completa do portão automático e iluminação externa",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    descricao: "Quadro de comando externo sofrendo com infiltração. Realizada substituição de cabeamento blindado, barramentos e novas lâmpadas de LED nos postes do jardim.",
    endereco: "Jardins, São Paulo - SP",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_01",
    diasAtras: 42
  },
  {
    id: "demo_solicitacao_20",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    titulo: "Revisão dos 50 mil km e troca de óleo sintético 5W30",
    categoria: "Automotivo",
    subcategoria: "Revisão",
    descricao: "Substituição de óleo, filtro de óleo, filtro de ar do motor e filtro de combustível, com diagnóstico eletrônico computadorizado.",
    endereco: "Botafogo, Rio de Janeiro - RJ",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_04",
    diasAtras: 50
  },
  {
    id: "demo_solicitacao_21",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    titulo: "Pintura de fachada comercial com tinta lavável anti-mofo",
    categoria: "Obras e Reforma",
    subcategoria: "Pintura",
    descricao: "Pintura externa da frente da padaria com cores institucionais, proteção contra umidade e reparo de pequenas rachaduras.",
    endereco: "Savassi, Belo Horizonte - MG",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_03",
    diasAtras: 60
  },
  {
    id: "demo_solicitacao_22",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    titulo: "Recuperação e limpeza química pesada da piscina da chácara",
    categoria: "Casa e Jardim",
    subcategoria: "Piscinas",
    descricao: "Piscina de 45 mil litros que estava parada há mais de 3 meses. Recuperada com choque de cloro, algicida, decantação e troca da areia do filtro.",
    endereco: "Batel, Curitiba - PR",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_02",
    diasAtras: 75
  },
  {
    id: "demo_solicitacao_23",
    solicitanteId: "demo_solicitante_06",
    nomeSolicitante: "Escritório Ribeiro & Associados Advocacia",
    titulo: "Configuração de servidor de arquivos em rede e VPN com firewall",
    categoria: "TI e Redes",
    subcategoria: "Redes",
    descricao: "Instalação de servidor Linux seguro com permissões por grupos de trabalho e VPN criptografada para acesso dos sócios em viagens.",
    endereco: "Moinhos de Vento, Porto Alegre - RS",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_05",
    diasAtras: 80
  },
  {
    id: "demo_solicitacao_24",
    solicitanteId: "demo_solicitante_07",
    nomeSolicitante: "Felipe Nogueira",
    titulo: "Revisão e formatação ABNT de Trabalho de Conclusão de Curso (TCC)",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Revisão",
    descricao: "TCC em Engenharia Civil com 68 páginas. Revisado o texto, ajustadas tabelas, equações e padronização total conforme as regras ABNT vigentes.",
    endereco: "Pituba, Salvador - BA",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_06",
    diasAtras: 90
  },
  {
    id: "demo_solicitacao_25",
    solicitanteId: "demo_solicitante_10",
    nomeSolicitante: "Startup InovaTech Soluções Digitais",
    titulo: "Criação de landing page responsiva para captação de leads B2B",
    categoria: "TI e Redes",
    subcategoria: "Desenvolvimento",
    descricao: "Desenvolvimento de página rápida integrada com formulário de lead no Hubspot e Google Analytics 4 com métricas de conversão.",
    endereco: "Centro, Florianópolis - SC",
    status: "CONCLUIDA",
    prestadorContratadoId: "demo_prestador_11",
    diasAtras: 110
  }
];

// -----------------------------------------------------------------------------
// 5. 70 ORÇAMENTOS VINCULADOS ÀS SOLICITAÇÕES
// -----------------------------------------------------------------------------
function gerarOrcamentos() {
  const orcamentos = [];
  let count = 1;

  // Prestadores por categoria para sortear propostas realistas
  const prestadoresMap = {
    "Casa e Jardim": ["demo_prestador_01", "demo_prestador_02", "demo_prestador_07", "demo_prestador_08", "demo_prestador_15"],
    "Obras e Reforma": ["demo_prestador_03", "demo_prestador_09", "demo_prestador_13"],
    "Automotivo": ["demo_prestador_04", "demo_prestador_10"],
    "TI e Redes": ["demo_prestador_05", "demo_prestador_11", "demo_prestador_14"],
    "Freelancers / Acadêmico": ["demo_prestador_06", "demo_prestador_12"]
  };

  const getPrestadorNome = (id) => {
    const p = PRESTADORES.find(x => x.id === id);
    return p ? p.nome : "Prestador Autônomo";
  };

  for (const sol of SOLICITACOES) {
    let pool = prestadoresMap[sol.categoria] || ["demo_prestador_01", "demo_prestador_03"];
    
    // Se a solicitação já tem um prestador contratado, ele OBRIGATORIAMENTE deve estar na lista de propostas
    let prestadoresParaSolicitacao = [];
    if (sol.prestadorContratadoId) {
      prestadoresParaSolicitacao.push(sol.prestadorContratadoId);
    }
    
    // Completar com outros 2 a 3 prestadores concorrentes
    for (const cand of pool) {
      if (!prestadoresParaSolicitacao.includes(cand)) {
        prestadoresParaSolicitacao.push(cand);
      }
      if (prestadoresParaSolicitacao.length >= 3) break;
    }

    // Se ainda for menos que 3, pega de outra categoria similar
    if (prestadoresParaSolicitacao.length < 2) {
      prestadoresParaSolicitacao.push("demo_prestador_01");
    }

    // Para cada prestador desta solicitação, gera uma proposta
    for (let idx = 0; idx < prestadoresParaSolicitacao.length; idx++) {
      const pId = prestadoresParaSolicitacao[idx];
      const pNome = getPrestadorNome(pId);
      const orcId = `demo_orcamento_${String(count).padStart(3, '0')}`;
      count++;

      // Valores coerentes
      let baseMo = 150 + ((count * 37) % 350);
      let baseMat = (count % 3 === 0) ? 0 : 50 + ((count * 23) % 220);
      let outros = (count % 4 === 0) ? 30 : 0;
      let total = baseMo + baseMat + outros;
      let prazo = 2 + (count % 7);

      let status = "AGUARDANDO";
      if (sol.status === "CONTRATADA" || sol.status === "CONCLUIDA") {
        if (pId === sol.prestadorContratadoId) {
          status = "APROVADO";
          sol.orcamentoAprovadoId = orcId; // Vincula o orçamento vencedor
        } else {
          status = "REPROVADO";
        }
      }

      orcamentos.push({
        id: orcId,
        solicitacaoId: sol.id,
        solicitanteId: sol.solicitanteId,
        prestadorId: pId,
        nomePrestador: pNome,
        maoDeObra: parseFloat(baseMo.toFixed(2)),
        material: parseFloat(baseMat.toFixed(2)),
        outrosCustos: parseFloat(outros.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        prazo: prazo,
        validade: "15 dias",
        observacao: `Proposta técnica para ${sol.titulo.toLowerCase()}. Mão de obra especializada, garantia do serviço e emissão de recibo/nota.`,
        status: status,
        isDemo: true,
        criadoEm: dataPassada(sol.diasAtras + 1)
      });
    }
  }

  return orcamentos;
}

// -----------------------------------------------------------------------------
// 6. AVALIAÇÕES E COMENTÁRIOS HIPER-REALISTAS E CONTEXTUAIS
// -----------------------------------------------------------------------------
const AVALIACOES_DADOS = [
  // Eletricista (Carlos Eduardo - demo_prestador_01)
  {
    prestadorId: "demo_prestador_01",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    servicoTitulo: "Revisão elétrica completa do portão e iluminação externa",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    nota: 5,
    comentario: "Excelente profissional! Identificou prontamente o curto-circuito na iluminação do jardim do condomínio e refez os barramentos com muito capricho. Pontual e organizado.",
    diasAtras: 40
  },
  {
    prestadorId: "demo_prestador_01",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Instalação de Chuveiro Elétrico e Troca de Fiação",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    nota: 5,
    comentario: "O Carlos foi super atencioso. Explicou porque o disjuntor antigo desarmava, trocou pelos conectores de porcelana e deixou a fiação muito segura. Recomendo de olhos fechados.",
    diasAtras: 55
  },
  {
    prestadorId: "demo_prestador_01",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    servicoTitulo: "Instalação de Luminárias de Sobrepor e Painéis de LED",
    categoria: "Casa e Jardim",
    subcategoria: "Elétrica residencial",
    nota: 4,
    comentario: "Serviço executado com qualidade e segurança técnica. Apenas atrasou 40 minutos para chegar no horário combinado devido ao trânsito, mas compensou pela agilidade na execução.",
    diasAtras: 70
  },

  // Piscinas (Ana Carolina - demo_prestador_02)
  {
    prestadorId: "demo_prestador_02",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    servicoTitulo: "Recuperação e limpeza química pesada da piscina da chácara",
    categoria: "Casa e Jardim",
    subcategoria: "Piscinas",
    nota: 5,
    comentario: "A piscina estava completamente verde e turva há meses. A Ana fez a decantação, aspirou com calma sem revolver a sujeira e a água ficou cristalina como nova. Trabalho impecável!",
    diasAtras: 73
  },
  {
    prestadorId: "demo_prestador_02",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    servicoTitulo: "Troca de Areia do Filtro da Piscina",
    categoria: "Casa e Jardim",
    subcategoria: "Piscinas",
    nota: 4,
    comentario: "Equipe técnica muito competente. Trocaram a carga de areia do filtro e regularam os registros. A água voltou a filtrar rápido. Muito prestativos.",
    diasAtras: 88
  },
  {
    prestadorId: "demo_prestador_02",
    solicitanteId: "demo_solicitante_07",
    nomeSolicitante: "Felipe Nogueira",
    servicoTitulo: "Manutenção Mensal de Piscina",
    categoria: "Casa e Jardim",
    subcategoria: "Piscinas",
    nota: 3,
    comentario: "A limpeza da água ficou boa, mas esqueceram de limpar o cesto do skimmer na segunda visita. Avisei e corrigiram na semana seguinte sem custo adicional.",
    diasAtras: 105
  },

  // Obras e Pintura (Roberto Mendes - demo_prestador_03)
  {
    prestadorId: "demo_prestador_03",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    servicoTitulo: "Pintura de fachada comercial com tinta lavável anti-mofo",
    categoria: "Obras e Reforma",
    subcategoria: "Pintura",
    nota: 5,
    comentario: "O Roberto e sua equipe trabalharam muito bem. Cobriram todo o piso com lona, protegeram o letreiro da padaria e a pintura ficou com acabamento perfeito sem respingos.",
    diasAtras: 58
  },
  {
    prestadorId: "demo_prestador_03",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Pintura de Quarto com Emassamento Parcial",
    categoria: "Obras e Reforma",
    subcategoria: "Pintura",
    nota: 4,
    comentario: "Pintura muito bem feita, massa corrida bem lixada sem imperfeições visíveis na luz. O trabalho demorou meio dia a mais que o previsto, mas o resultado final valeu a pena.",
    diasAtras: 80
  },
  {
    prestadorId: "demo_prestador_03",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    servicoTitulo: "Assentamento de Porcelanato 80x80",
    categoria: "Obras e Reforma",
    subcategoria: "Pedreiro",
    nota: 5,
    comentario: "Excelente pedreiro! Os recortes de porcelanato no banheiro ficaram milimétricos e o caimento para o ralo oculto funcionou com perfeição. Recomendo fortemente.",
    diasAtras: 110
  },

  // Mecânica (Precision Car - demo_prestador_04)
  {
    prestadorId: "demo_prestador_04",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    servicoTitulo: "Revisão dos 50 mil km e troca de óleo sintético 5W30",
    categoria: "Automotivo",
    subcategoria: "Revisão",
    nota: 5,
    comentario: "Oficina muito organizada e transparente! Me enviaram fotos de todas as peças antigas substituídas e o relatório do scanner automotivo. O carro voltou rodando macio e silencioso.",
    diasAtras: 48
  },
  {
    prestadorId: "demo_prestador_04",
    solicitanteId: "demo_solicitante_09",
    nomeSolicitante: "Renata Coimbra",
    servicoTitulo: "Troca de Pastilhas e Fluido de Freio DOT 4",
    categoria: "Automotivo",
    subcategoria: "Freios",
    nota: 5,
    comentario: "Diagnóstico preciso. O mecânico explicou que os discos ainda tinham espessura boa e que bastava a troca das pastilhas e a sangria. Não tentaram me empurrar serviços desnecessários.",
    diasAtras: 65
  },
  {
    prestadorId: "demo_prestador_04",
    solicitanteId: "demo_solicitante_07",
    nomeSolicitante: "Felipe Nogueira",
    servicoTitulo: "Troca da Correia Dentada e Tensor",
    categoria: "Automotivo",
    subcategoria: "Mecânica",
    nota: 4,
    comentario: "Serviço mecânico de confiança. Entregaram o carro no mesmo dia conforme prometido. Apenas achei o valor do óleo da direção um pouco acima do mercado de autopeças.",
    diasAtras: 95
  },

  // Redes e TI (Lucas Farias - demo_prestador_05)
  {
    prestadorId: "demo_prestador_05",
    solicitanteId: "demo_solicitante_06",
    nomeSolicitante: "Escritório Ribeiro & Associados Advocacia",
    servicoTitulo: "Configuração de servidor de arquivos em rede e VPN com firewall",
    categoria: "TI e Redes",
    subcategoria: "Redes",
    nota: 5,
    comentario: "O Lucas estruturou toda a rede do nosso escritório de advocacia. Agora os advogados conseguem acessar os processos de casa com VPN segura e rápida. Suporte pós-venda nota 10.",
    diasAtras: 78
  },
  {
    prestadorId: "demo_prestador_05",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    servicoTitulo: "Configuração de Rede Wi-Fi Mesh Residencial/Comercial",
    categoria: "TI e Redes",
    subcategoria: "Redes",
    nota: 5,
    comentario: "Resolveu definitivamente a queda constante nas máquinas de cartão de crédito. Criou duas redes isoladas e o sinal chega forte até o fundo da confeitaria.",
    diasAtras: 92
  },
  {
    prestadorId: "demo_prestador_05",
    solicitanteId: "demo_solicitante_10",
    nomeSolicitante: "Startup InovaTech Soluções Digitais",
    servicoTitulo: "Montagem e Organização de Rack de Rede de TI",
    categoria: "TI e Redes",
    subcategoria: "Redes",
    nota: 4,
    comentario: "Identificou todos os cabos no patch panel e organizou o rack que antes parecia um ninho de fios. Muito técnico e paciente para tirar dúvidas.",
    diasAtras: 115
  },

  // Revisão Acadêmica (Mariana Alencar - demo_prestador_06)
  {
    prestadorId: "demo_prestador_06",
    solicitanteId: "demo_solicitante_07",
    nomeSolicitante: "Felipe Nogueira",
    servicoTitulo: "Revisão e formatação ABNT de Trabalho de Conclusão de Curso (TCC)",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Revisão",
    nota: 5,
    comentario: "A Mariana salvou o meu TCC! Apontou repetições de palavras, melhorou a fluidez dos parágrafos e deixou as referências bibliográficas impecáveis segundo a ABNT. Minha banca elogiou muito o rigor textual.",
    diasAtras: 88
  },
  {
    prestadorId: "demo_prestador_06",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    servicoTitulo: "Revisão Crítica de Dissertação de Mestrado",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Revisão",
    nota: 5,
    comentario: "Profissional extremamente capacitada em normas acadêmicas. Cumpriu o prazo rigorosamente e enviou o documento com todas as marcações de alteração no Word para eu acompanhar.",
    diasAtras: 100
  },
  {
    prestadorId: "demo_prestador_06",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Formatação Completa nas Normas ABNT",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Formatação",
    nota: 4,
    comentario: "Excelente formatação de tabelas e equações. Tive apenas que pedir um pequeno ajuste no espaçamento de uma citação longa, que ela corrigiu em menos de uma hora.",
    diasAtras: 120
  },

  // Encanador (Marcos Paulo - demo_prestador_07)
  {
    prestadorId: "demo_prestador_07",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Troca de válvula de descarga Hydra no banheiro social",
    categoria: "Casa e Jardim",
    subcategoria: "Hidráulica",
    nota: 5,
    comentario: "Chegou rápido, tinha as ferramentas certas e o reparo original da Hydra. Em 40 minutos o vazamento parou completamente. Limpou tudo após o serviço.",
    diasAtras: 33
  },
  {
    prestadorId: "demo_prestador_07",
    solicitanteId: "demo_solicitante_08",
    nomeSolicitante: "Clínica Odontológica Sorriso Bem",
    servicoTitulo: "Caça Vazamento Eletrônico com Geofone",
    categoria: "Casa e Jardim",
    subcategoria: "Hidráulica",
    nota: 5,
    comentario: "Encontrou um cano furado por parafuso atrás do azulejo sem precisar quebrar a parede toda. Furou exatamente no ponto marcado. Economizou muito dinheiro da clínica.",
    diasAtras: 62
  },
  {
    prestadorId: "demo_prestador_07",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    servicoTitulo: "Desentupimento de Pia de Cozinha e Sifão",
    categoria: "Casa e Jardim",
    subcategoria: "Hidráulica",
    nota: 4,
    comentario: "Desentupiu a tubulação de gordura com a máquina rotativa. Ficou perfeito. Bom preço e atendimento educado.",
    diasAtras: 84
  },

  // Paisagismo (Studio Verde - demo_prestador_08)
  {
    prestadorId: "demo_prestador_08",
    solicitanteId: "demo_solicitante_02",
    nomeSolicitante: "Condomínio Residencial Jardins",
    servicoTitulo: "Poda de Gramado e Refilamento de Canteiros",
    categoria: "Casa e Jardim",
    subcategoria: "Jardinagem",
    nota: 5,
    comentario: "O jardim do condomínio ficou maravilhoso! Adubaram as folhagens, podaram as palmeiras e recolheram todos os sacos de folhas no mesmo dia.",
    diasAtras: 45
  },
  {
    prestadorId: "demo_prestador_08",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    servicoTitulo: "Reforma de Vasos e Jardineiras Decorativas",
    categoria: "Casa e Jardim",
    subcategoria: "Jardinagem",
    nota: 4,
    comentario: "Montaram floreiras muito bonitas na entrada do estabelecimento. Ajudou muito na estética da fachada. Clientes elogiaram.",
    diasAtras: 75
  },

  // Construtora (Aliança - demo_prestador_09)
  {
    prestadorId: "demo_prestador_09",
    solicitanteId: "demo_solicitante_08",
    nomeSolicitante: "Clínica Odontológica Sorriso Bem",
    servicoTitulo: "Instalação de Forro de Drywall Rebaixado com Cortineiro",
    categoria: "Obras e Reforma",
    subcategoria: "Reforma",
    nota: 5,
    comentario: "Obra rápida e com pouquíssima sujeira. O forro de gesso com sanca iluminada deu um ar moderno ao consultório.",
    diasAtras: 67
  },
  {
    prestadorId: "demo_prestador_09",
    solicitanteId: "demo_solicitante_06",
    nomeSolicitante: "Escritório Ribeiro & Associados Advocacia",
    servicoTitulo: "Quebra e Demolição Segura com Retirada de Entulho",
    categoria: "Obras e Reforma",
    subcategoria: "Pedreiro",
    nota: 4,
    comentario: "Derrubaram a divisória e retiraram as caçambas conforme as normas do edifício comercial. Equipe trabalhadora.",
    diasAtras: 90
  },

  // Auto Elétrica (Faísca - demo_prestador_10)
  {
    prestadorId: "demo_prestador_10",
    solicitanteId: "demo_solicitante_09",
    nomeSolicitante: "Renata Coimbra",
    servicoTitulo: "Diagnóstico e Reparo do Motor de Partida",
    categoria: "Automotivo",
    subcategoria: "Elétrica automotiva",
    nota: 5,
    comentario: "O carro não dava sinal na chave. Trocaram as escovas do motor de partida e testaram o alternador. Resolveram em 2 horas.",
    diasAtras: 52
  },
  {
    prestadorId: "demo_prestador_10",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    servicoTitulo: "Instalação de Sensor de Estacionamento e Câmera de Ré",
    categoria: "Automotivo",
    subcategoria: "Elétrica automotiva",
    nota: 4,
    comentario: "Instalação limpa, sem fios aparentes e furação bem centralizada. Muito satisfeito com a precisão dos sensores.",
    diasAtras: 85
  },

  // Dev Web (Gabriel Duarte - demo_prestador_11)
  {
    prestadorId: "demo_prestador_11",
    solicitanteId: "demo_solicitante_10",
    nomeSolicitante: "Startup InovaTech Soluções Digitais",
    servicoTitulo: "Criação de landing page responsiva para captação de leads B2B",
    categoria: "TI e Redes",
    subcategoria: "Desenvolvimento",
    nota: 5,
    comentario: "Código limpo, carregamento super rápido no celular e ótima integração com nosso webhook de CRM. Aumentou nossa conversão de leads em 30%.",
    diasAtras: 108
  },
  {
    prestadorId: "demo_prestador_11",
    solicitanteId: "demo_solicitante_08",
    nomeSolicitante: "Clínica Odontológica Sorriso Bem",
    servicoTitulo: "Desenvolvimento de site institucional com agendamento online",
    categoria: "TI e Redes",
    subcategoria: "Desenvolvimento",
    nota: 5,
    comentario: "O Gabriel é muito prestativo e paciente. Entendeu exatamente a identidade da clínica e entregou antes do prazo estipulado.",
    diasAtras: 125
  },

  // Design (Larissa Prado - demo_prestador_12)
  {
    prestadorId: "demo_prestador_12",
    solicitanteId: "demo_solicitante_10",
    nomeSolicitante: "Startup InovaTech Soluções Digitais",
    servicoTitulo: "Criação de Identidade Visual Completa para Empresas",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Design",
    nota: 5,
    comentario: "A Larissa tem uma sensibilidade visual incrível. Criou um manual de marca completo com variações de logo e tipografia que deram vida à nossa empresa.",
    diasAtras: 98
  },
  {
    prestadorId: "demo_prestador_12",
    solicitanteId: "demo_solicitante_04",
    nomeSolicitante: "Padaria & Confeitaria Estrela de Minas",
    servicoTitulo: "Pacote de 10 Artes Criativas para Feed e Stories no Instagram",
    categoria: "Freelancers / Acadêmico",
    subcategoria: "Design",
    nota: 4,
    comentario: "Posts bonitos e chamativos para nossos lançamentos de pães artesanais. As artes atraíram novos clientes no bairro.",
    diasAtras: 112
  },

  // Pinturas Especiais (Jorge Pinturas - demo_prestador_13)
  {
    prestadorId: "demo_prestador_13",
    solicitanteId: "demo_solicitante_09",
    nomeSolicitante: "Renata Coimbra",
    servicoTitulo: "Aplicação de Efeito Cimento Queimado Rústico/Moderno",
    categoria: "Obras e Reforma",
    subcategoria: "Acabamento",
    nota: 5,
    comentario: "A parede da minha sala de estar virou ponto de foto de todas as visitas! Efeito aveludado incrível e sem nenhuma rebarba nas quinas.",
    diasAtras: 12
  },
  {
    prestadorId: "demo_prestador_13",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Pintura de Portas e Batentes em Esmalte Sintético",
    categoria: "Obras e Reforma",
    subcategoria: "Pintura",
    nota: 4,
    comentario: "Fez a pintura em laca com pistola. Ficou super liso. Apenas o cheiro do esmalte demorou alguns dias para sair, como já era esperado.",
    diasAtras: 72
  },

  // Doctor PC (demo_prestador_14)
  {
    prestadorId: "demo_prestador_14",
    solicitanteId: "demo_solicitante_06",
    nomeSolicitante: "Escritório Ribeiro & Associados Advocacia",
    servicoTitulo: "Upgrade de SSD NVMe e Clonagem do Sistema Operacional",
    categoria: "TI e Redes",
    subcategoria: "Manutenção de computadores",
    nota: 5,
    comentario: "O notebook antigo que demorava 4 minutos para ligar agora inicializa em 12 segundos! Clonou todos os programas sem perder nenhuma senha. Sensacional.",
    diasAtras: 64
  },
  {
    prestadorId: "demo_prestador_14",
    solicitanteId: "demo_solicitante_05",
    nomeSolicitante: "Juliana Peixoto",
    servicoTitulo: "Limpeza Interna e Troca de Pasta Térmica",
    categoria: "TI e Redes",
    subcategoria: "Manutenção de computadores",
    nota: 5,
    comentario: "Meu notebook gamer estava fervendo e travando nos programas de renderização. A troca da pasta térmica resolveu e o cooler agora trabalha silencioso.",
    diasAtras: 82
  },

  // LimpaFácil (demo_prestador_15)
  {
    prestadorId: "demo_prestador_15",
    solicitanteId: "demo_solicitante_01",
    nomeSolicitante: "Mariana Vasconcelos",
    servicoTitulo: "Higienização profunda de sofá retrátil e 6 cadeiras de jantar",
    categoria: "Casa e Jardim",
    subcategoria: "Limpeza",
    nota: 5,
    comentario: "Tirou todas as manchas de suco do sofá claro e o cheirinho de limpeza durou vários dias. Profissionais educados e muito cuidadosos com o piso de madeira.",
    diasAtras: 11
  },
  {
    prestadorId: "demo_prestador_15",
    solicitanteId: "demo_solicitante_03",
    nomeSolicitante: "Lucas Mendonça",
    servicoTitulo: "Higienização de Colchão Casal/Queen",
    categoria: "Casa e Jardim",
    subcategoria: "Limpeza",
    nota: 4,
    comentario: "Serviço eficiente e rápido. O colchão secou em menos de 4 horas com o tempo ensolarado. Minhas crises de rinite diminuíram bastante.",
    diasAtras: 44
  }
];

// -----------------------------------------------------------------------------
// EXECUÇÃO DO SEED
// -----------------------------------------------------------------------------
async function executarSeed() {
  try {
    console.log("==> 1. Inserindo/Atualizando 10 Solicitantes de Teste...");
    const batchSolicitantes = db.batch();
    for (const sol of SOLICITANTES) {
      const docRef = db.collection("usuarios").doc(sol.id);
      batchSolicitantes.set(docRef, {
        ...sol,
        uid: sol.id,
        criadoEm: dataPassada(120)
      }, { merge: true });
    }
    await batchSolicitantes.commit();
    console.log(`    ✓ ${SOLICITANTES.length} solicitantes salvos com sucesso.`);

    console.log("\n==> 2. Inserindo/Atualizando 15 Prestadores de Teste...");
    const batchPrestadores = db.batch();
    for (const p of PRESTADORES) {
      const docRef = db.collection("usuarios").doc(p.id);
      batchPrestadores.set(docRef, {
        ...p,
        uid: p.id,
        criadoEm: dataPassada(150)
      }, { merge: true });
    }
    await batchPrestadores.commit();
    console.log(`    ✓ ${PRESTADORES.length} prestadores salvos com sucesso.`);

    console.log("\n==> 3. Inserindo/Atualizando Serviços Avulsos (~100 serviços)...");
    const servicos = gerarServicosAvulsos();
    
    // Firestore batches suportam até 500 operações por batch
    const batchServicos = db.batch();
    for (const s of servicos) {
      const docRef = db.collection("servicos_avulsos").doc(s.id);
      batchServicos.set(docRef, s, { merge: true });
    }
    await batchServicos.commit();
    console.log(`    ✓ ${servicos.length} serviços avulsos cadastrados com sucesso.`);

    console.log("\n==> 4. Inserindo/Atualizando 25 Solicitações de Serviço...");
    const orcamentos = gerarOrcamentos(); // já vincula o orcamentoAprovadoId nas contratadas/concluidas
    
    const batchSolicitacoes = db.batch();
    for (const sol of SOLICITACOES) {
      const docRef = db.collection("solicitacoes").doc(sol.id);
      batchSolicitacoes.set(docRef, {
        solicitanteId: sol.solicitanteId,
        nomeSolicitante: sol.nomeSolicitante,
        titulo: sol.titulo,
        categoria: sol.categoria,
        subcategoria: sol.subcategoria,
        descricao: sol.descricao,
        endereco: sol.endereco,
        status: sol.status,
        prestadorContratadoId: sol.prestadorContratadoId || null,
        orcamentoAprovadoId: sol.orcamentoAprovadoId || null,
        isDemo: true,
        criadoEm: dataPassada(sol.diasAtras),
        atualizadoEm: dataPassada(Math.max(0, sol.diasAtras - 1))
      }, { merge: true });
    }
    await batchSolicitacoes.commit();
    console.log(`    ✓ ${SOLICITACOES.length} solicitações cadastradas com sucesso.`);

    console.log("\n==> 5. Inserindo/Atualizando Orçamentos Concorrentes (~70 orçamentos)...");
    const batchOrcamentos = db.batch();
    for (const orc of orcamentos) {
      const docRef = db.collection("orcamentos").doc(orc.id);
      batchOrcamentos.set(docRef, orc, { merge: true });
    }
    await batchOrcamentos.commit();
    console.log(`    ✓ ${orcamentos.length} orçamentos estruturados cadastrados com sucesso.`);

    console.log("\n==> 6. Inserindo Avaliações e Comentários Contextuais (~35 avaliações)...");
    const batchAvaliacoes = db.batch();
    const statsPrestadores = {};

    // Inicializa contador por prestador
    PRESTADORES.forEach(p => {
      statsPrestadores[p.id] = {
        totalAvaliacoes: 0,
        somaNotas: 0,
        servicosConcluidos: 0,
        orcamentosEnviados: 0,
        orcamentosAprovados: 0
      };
    });

    // Contabiliza orçamentos enviados e aprovados
    orcamentos.forEach(o => {
      if (statsPrestadores[o.prestadorId]) {
        statsPrestadores[o.prestadorId].orcamentosEnviados++;
        if (o.status === "APROVADO") {
          statsPrestadores[o.prestadorId].orcamentosAprovados++;
        }
      }
    });

    // Contabiliza serviços concluídos das solicitações
    SOLICITACOES.forEach(s => {
      if (s.status === "CONCLUIDA" && s.prestadorContratadoId && statsPrestadores[s.prestadorContratadoId]) {
        statsPrestadores[s.prestadorContratadoId].servicosConcluidos++;
      }
    });

    for (let i = 0; i < AVALIACOES_DADOS.length; i++) {
      const av = AVALIACOES_DADOS[i];
      const avId = `demo_avaliacao_${String(i + 1).padStart(3, '0')}`;
      const docRef = db.collection("avaliacoes").doc(avId);

      batchAvaliacoes.set(docRef, {
        id: avId,
        prestadorId: av.prestadorId,
        solicitanteId: av.solicitanteId,
        nomeSolicitante: av.nomeSolicitante || "Cliente Satisfeito",
        servicoTitulo: av.servicoTitulo || "Serviço Prestado",
        categoria: av.categoria || "Geral",
        subcategoria: av.subcategoria || "Geral",
        nota: av.nota || 5,
        comentario: av.comentario || "Ótimo serviço prestado.",
        isDemo: true,
        criadoEm: dataPassada(av.diasAtras || 30)
      }, { merge: true });

      if (statsPrestadores[av.prestadorId]) {
        statsPrestadores[av.prestadorId].totalAvaliacoes++;
        statsPrestadores[av.prestadorId].somaNotas += av.nota;
      }
    }
    await batchAvaliacoes.commit();
    console.log(`    ✓ ${AVALIACOES_DADOS.length} avaliações detalhadas salvas.`);

    console.log("\n==> 7. Calculando e Atualizando Reputação & Ranking dos Prestadores...");
    /**
     * FÓRMULA DE PONTUAÇÃO DOCUMENTADA (PROJETO.md Seção 22):
     * Pontos = (serviços_concluidos * 25) + (orcamentos_aprovados * 15) + (notaMedia * 20) + (totalAvaliacoes * 10)
     */
    const batchRanking = db.batch();
    for (const p of PRESTADORES) {
      const st = statsPrestadores[p.id];
      const media = st.totalAvaliacoes > 0 ? parseFloat((st.somaNotas / st.totalAvaliacoes).toFixed(1)) : 4.8;
      const concluidos = Math.max(st.servicosConcluidos, st.totalAvaliacoes);
      const pontos = Math.round(
        (concluidos * 25) + 
        (st.orcamentosAprovados * 15) + 
        (media * 20) + 
        (st.totalAvaliacoes * 10)
      );

      const docRef = db.collection("usuarios").doc(p.id);
      batchRanking.update(docRef, {
        totalAvaliacoes: st.totalAvaliacoes,
        notaMedia: media,
        servicos_concluidos: concluidos,
        orcamentos_enviados: st.orcamentosEnviados,
        orcamentos_aprovados: st.orcamentosAprovados,
        pontos: pontos,
        pontuacao: pontos
      });
    }
    await batchRanking.commit();
    console.log("    ✓ Ranking e pontuações calculadas com sucesso.");

    console.log("\n==================================================");
    console.log("✓ SEED FINALIZADO COM SUCESSO!");
    console.log("Todos os dados criados possuem 'isDemo: true'.");
    console.log("Total Prestadores:   ", PRESTADORES.length);
    console.log("Total Solicitantes:  ", SOLICITANTES.length);
    console.log("Total Serviços:      ", servicos.length);
    console.log("Total Solicitações:  ", SOLICITACOES.length);
    console.log("Total Orçamentos:    ", orcamentos.length);
    console.log("Total Avaliações:    ", AVALIACOES_DADOS.length);
    console.log("==================================================");

  } catch (error) {
    console.error("ERRO durante a execução do seed:", error);
    process.exit(1);
  }
}

executarSeed().then(() => {
  process.exit(0);
});
