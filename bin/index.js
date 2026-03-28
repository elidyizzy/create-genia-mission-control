#!/usr/bin/env node

// Verificar Node.js >= 18
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error('\n❌ Node.js 18 ou superior é necessário.');
  console.error(`   Versão atual: ${process.version}`);
  console.error('   Instale em: https://nodejs.org\n');
  process.exit(1);
}

// Entry point
import('../lib/main.js').catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
