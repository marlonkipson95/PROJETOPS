/**
 * test_demo_flow.js
 * 
 * Script de teste automatizado e validação rigorosa dos dados de demonstração
 * e da integridade relacional do marketplace no Cloud Firestore.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const cred = require('../serviceAccountKey.json');
initializeApp({ credential: cert(cred) });
const db = getFirestore();

async function runTests() {
  console.log("==================================================");
  console.log("Iniciando Verificação de Integridade dos Dados Demo");
  console.log("==================================================");

  let erros = 0;
  let sucessos = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [OK] ${message}`);
      sucessos++;
    } else {
      console.error(`  [FALHA] ${message}`);
      erros++;
    }
  }

  // 1. Prestadores
  console.log("\n1. Testando Prestadores Fictícios...");
  const prestadoresSnap = await db.collection("usuarios").where("isDemo", "==", true).get();
  const prestadores = [];
  const solicitantes = [];

  prestadoresSnap.forEach(d => {
    const data = d.data();
    if (data.tipo === 'prestador' || data.tipo === 'ambos') {
      prestadores.push({ id: d.id, ...data });
    } else if (data.tipo === 'solicitante') {
      solicitantes.push({ id: d.id, ...data });
    }
  });

  assert(prestadores.length === 15, `Exatamente 15 prestadores cadastrados (encontrados: ${prestadores.length})`);
  assert(solicitantes.length === 10, `Exatamente 10 solicitantes cadastrados (encontrados: ${solicitantes.length})`);

  // Verificar campos obrigatórios dos prestadores
  let prestadoresValidos = true;
  for (const p of prestadores) {
    if (!p.nome || !p.telefone || !p.cidade || !p.bio || p.pontos === undefined || p.notaMedia === undefined) {
      prestadoresValidos = false;
      break;
    }
  }
  assert(prestadoresValidos, "Todos os prestadores possuem nome, telefone, cidade, bio, pontos e notaMedia");

  // 2. Serviços Avulsos
  console.log("\n2. Testando Serviços Avulsos Fictícios...");
  const servicosSnap = await db.collection("servicos_avulsos").where("isDemo", "==", true).get();
  assert(servicosSnap.size >= 100, `Quantidade de serviços avulsos >= 100 (encontrados: ${servicosSnap.size})`);

  let precosValidos = true;
  servicosSnap.forEach(d => {
    const s = d.data();
    if (typeof s.valor_base !== 'number' || s.valor_base <= 0 || !s.titulo || !s.categoria) {
      precosValidos = false;
    }
  });
  assert(precosValidos, "Todos os serviços possuem títulos, categorias válidas e preços coerentes (> R$ 0)");

  // 3. Solicitações
  console.log("\n3. Testando Solicitações de Serviço...");
  const solicitacoesSnap = await db.collection("solicitacoes").where("isDemo", "==", true).get();
  assert(solicitacoesSnap.size >= 25, `Quantidade de solicitações cadastradas >= 25 (encontradas: ${solicitacoesSnap.size})`);

  const statusCount = { ABERTA: 0, EM_ANALISE: 0, CONTRATADA: 0, CONCLUIDA: 0 };
  solicitacoesSnap.forEach(d => {
    const s = d.data();
    if (statusCount[s.status] !== undefined) statusCount[s.status]++;
  });
  console.log(`     Status das solicitações:`, statusCount);
  assert(statusCount.ABERTA > 0 && statusCount.CONTRATADA > 0 && statusCount.CONCLUIDA > 0, "Distribuição equilibrada entre ABERTA, EM_ANALISE, CONTRATADA e CONCLUIDA");

  // 4. Orçamentos e Concorrência
  console.log("\n4. Testando Orçamentos Concorrentes...");
  const orcamentosSnap = await db.collection("orcamentos").where("isDemo", "==", true).get();
  assert(orcamentosSnap.size >= 60, `Quantidade de orçamentos >= 60 (encontrados: ${orcamentosSnap.size})`);

  let calculoTotalCorreto = true;
  orcamentosSnap.forEach(d => {
    const o = d.data();
    const somaCalculada = parseFloat((o.maoDeObra + o.material + (o.outrosCustos || 0)).toFixed(2));
    if (Math.abs(o.total - somaCalculada) > 0.01) {
      calculoTotalCorreto = false;
      console.error(`Erro no cálculo do orçamento ${d.id}: total=${o.total}, soma=${somaCalculada}`);
    }
  });
  assert(calculoTotalCorreto, "O total de cada orçamento é exatamente a soma de mão de obra + materiais + outros custos");

  // 5. Avaliações e Coerência
  console.log("\n5. Testando Avaliações e Comentários...");
  const avaliacoesSnap = await db.collection("avaliacoes").where("isDemo", "==", true).get();
  assert(avaliacoesSnap.size >= 30, `Quantidade de avaliações >= 30 (encontradas: ${avaliacoesSnap.size})`);

  let notasCoerentes = true;
  avaliacoesSnap.forEach(d => {
    const a = d.data();
    if (a.nota < 1 || a.nota > 5 || !a.comentario || a.comentario.length < 10) {
      notasCoerentes = false;
    }
  });
  assert(notasCoerentes, "Todas as avaliações possuem notas entre 1 e 5 e comentários detalhados");

  // 6. Ranking e Pontuação
  console.log("\n6. Testando Ranking de Prestadores...");
  let rankingOrdenado = true;
  const prestadoresOrdenados = [...prestadores].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
  for (let i = 0; i < prestadoresOrdenados.length - 1; i++) {
    if (prestadoresOrdenados[i].pontos < prestadoresOrdenados[i + 1].pontos) {
      rankingOrdenado = false;
    }
  }
  assert(rankingOrdenado, "Prestadores podem ser ranqueados por pontuação de reputação decrescente");
  assert(prestadoresOrdenados[0].pontos > 0, `Líder do ranking tem pontuação positiva (${prestadoresOrdenados[0].pontos} pontos)`);

  console.log("\n==================================================");
  console.log(`Resultado dos Testes: ${sucessos} Sucessos, ${erros} Falhas.`);
  console.log("==================================================");

  if (erros > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
