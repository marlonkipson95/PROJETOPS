const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

async function updateRules() {
  console.log('==> Lendo firestore.rules...');
  const rulesContent = fs.readFileSync('firestore.rules', 'utf8');

  const auth = new GoogleAuth({
    keyFilename: 'serviceAccountKey.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']
  });
  const token = await auth.getAccessToken();
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  console.log('==> 1. Criando novo Ruleset no Firebase...');
  const createRes = await fetch('https://firebaserules.googleapis.com/v1/projects/projetosteste-e7490/rulesets', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: {
        files: [{ name: 'firestore.rules', content: rulesContent }]
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Erro ao criar ruleset: ${createRes.status} - ${err}`);
  }

  const createData = await createRes.json();
  console.log('    ✓ Ruleset criado:', createData.name);

  console.log('==> 2. Publicando Ruleset para produção (cloud.firestore)...');
  const releaseRes = await fetch('https://firebaserules.googleapis.com/v1/projects/projetosteste-e7490/releases/cloud.firestore', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      release: {
        name: 'projects/projetosteste-e7490/releases/cloud.firestore',
        rulesetName: createData.name
      }
    })
  });

  if (!releaseRes.ok) {
    const err = await releaseRes.text();
    throw new Error(`Erro ao aplicar release de rules: ${releaseRes.status} - ${err}`);
  }

  const releaseData = await releaseRes.json();
  console.log('    ✓ Release de regras atualizada com sucesso!');
  console.log('==================================================');
  console.log('✓ Firestore Security Rules atualizadas e ativas!');
  console.log('==================================================');
}

updateRules().catch(err => {
  console.error('❌ Falha:', err);
  process.exit(1);
});
