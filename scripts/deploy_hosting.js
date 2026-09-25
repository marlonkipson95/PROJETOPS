const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { GoogleAuth } = require('google-auth-library');

const SITE_ID = 'projetosteste-e7490';
const PUBLIC_DIR = path.resolve(__dirname, '../public');

async function deploy() {
  console.log('==================================================');
  console.log(`Iniciando Deploy Direto no Firebase Hosting: ${SITE_ID}`);
  console.log('==================================================');

  const auth = new GoogleAuth({
    keyFilename: 'serviceAccountKey.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']
  });

  const token = await auth.getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 1. Criar nova versão
  console.log('\n==> 1. Criando nova versão no Firebase Hosting...');
  const createRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/versions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      config: {
        rewrites: [
          {
            glob: '**',
            path: '/index.html'
          }
        ]
      },
      labels: {
        'deployment-tool': 'antigravity-direct-deploy'
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Falha ao criar versão: ${createRes.status} - ${err}`);
  }

  const versionData = await createRes.json();
  const versionName = versionData.name;
  console.log(`    ✓ Versão criada com sucesso: ${versionName}`);

  // 2. Mapear arquivos da pasta public, compactar com gzip e calcular SHA256
  console.log('\n==> 2. Indexando arquivos de public/, aplicando gzip e calculando SHA256...');
  const filesMap = {};
  const gzippedBuffers = {};

  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = prefix + '/' + entry.name;
      if (entry.isDirectory()) {
        scanDir(fullPath, relPath);
      } else {
        const rawContent = fs.readFileSync(fullPath);
        const gzippedContent = zlib.gzipSync(rawContent, { level: 9 });
        const hash = crypto.createHash('sha256').update(gzippedContent).digest('hex');
        filesMap[relPath] = hash;
        gzippedBuffers[hash] = gzippedContent;
        console.log(`    - ${relPath} (raw: ${rawContent.length} B -> gzip: ${gzippedContent.length} B) -> hash: ${hash.substring(0, 12)}...`);
      }
    }
  }

  scanDir(PUBLIC_DIR);

  // 3. Informar ao Firebase quais arquivos temos
  console.log('\n==> 3. Notificando Firebase sobre os arquivos (populateFiles)...');
  const popRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      files: filesMap
    })
  });

  if (!popRes.ok) {
    const err = await popRes.text();
    throw new Error(`Falha no populateFiles: ${popRes.status} - ${err}`);
  }

  const popData = await popRes.json();
  const requiredHashes = popData.uploadRequiredHashes || [];
  const uploadUrl = popData.uploadUrl;
  console.log(`    ✓ Arquivos pendentes para upload: ${requiredHashes.length} de ${Object.keys(filesMap).length}`);

  // 4. Upload dos arquivos que o Firebase não possui em cache
  if (requiredHashes.length > 0) {
    console.log('\n==> 4. Enviando arquivos gzipped pendentes...');
    for (const hash of requiredHashes) {
      const buffer = gzippedBuffers[hash];
      const uploadTarget = `${uploadUrl}/${hash}`;
      const upRes = await fetch(uploadTarget, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer
      });

      if (!upRes.ok) {
        const errText = await upRes.text();
        throw new Error(`Falha no upload do hash ${hash} (${upRes.status}): ${errText}`);
      }
      console.log(`    ✓ Upload concluído para hash ${hash.substring(0, 12)}...`);
    }
  }

  // 5. Finalizar a versão (FINALIZED)
  console.log('\n==> 5. Finalizando a versão...');
  const finalizeRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}?update_mask=status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'FINALIZED'
    })
  });

  if (!finalizeRes.ok) {
    const err = await finalizeRes.text();
    throw new Error(`Falha ao finalizar versão: ${finalizeRes.status} - ${err}`);
  }
  console.log('    ✓ Versão finalizada com sucesso.');

  // 6. Criar Release para publicar no site ao vivo
  console.log('\n==> 6. Publicando Release para produção ao vivo...');
  const releaseRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/releases?versionName=${versionName}`, {
    method: 'POST',
    headers
  });

  if (!releaseRes.ok) {
    const err = await releaseRes.text();
    throw new Error(`Falha ao criar release: ${releaseRes.status} - ${err}`);
  }

  const releaseData = await releaseRes.json();
  console.log('\n==================================================');
  console.log('✓ DEPLOY CONCLUÍDO COM SUCESSO NO FIREBASE HOSTING!');
  console.log(`Release ID: ${releaseData.name}`);
  console.log(`URL ao vivo: https://${SITE_ID}.web.app/`);
  console.log('==================================================');
}

deploy().catch(err => {
  console.error('\n❌ Erro durante o deploy:', err);
  process.exit(1);
});
