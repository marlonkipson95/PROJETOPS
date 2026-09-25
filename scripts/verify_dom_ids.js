const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const appJs = fs.readFileSync('public/app.js', 'utf8');
const areaJs = fs.readFileSync('public/area-testes.js', 'utf8');

const idRegex = /getElementById\(['"]([a-zA-Z0-9\-_]+)['"]\)/g;
let match;
const appIds = new Set();
while ((match = idRegex.exec(appJs)) !== null) {
  appIds.add(match[1]);
}
while ((match = idRegex.exec(areaJs)) !== null) {
  appIds.add(match[1]);
}

const missing = [];
for (const id of appIds) {
  const inHtml = html.includes('id="' + id + '"') || html.includes("id='" + id + "'");
  const inAppJs = appJs.includes('id="' + id + '"') || appJs.includes("id='" + id + "'");
  const inAreaJs = areaJs.includes('id="' + id + '"') || areaJs.includes("id='" + id + "'");
  if (!inHtml && !inAppJs && !inAreaJs) {
    missing.push(id);
  }
}

console.log('Total de IDs inspecionados:', appIds.size);
if (missing.length === 0) {
  console.log('✓ Todos os IDs referenciados no JS existem no HTML ou são gerados dinamicamente!');
} else {
  console.log('Atenção, IDs não encontrados:', missing);
}
