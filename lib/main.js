import path from 'path';
import enquirer from 'enquirer';
const { prompt } = enquirer;
import { ui } from './ui.js';
import { checkEnvironment, printCheckResults } from './checks.js';
import { installClaudeCLI } from './install-claude.js';
import { authenticate } from './auth.js';
import { setupSegundoCerebro } from './segundo-cerebro.js';
import { setupGenieOS } from './setup.js';
import { launch } from './launch.js';

async function main() {
  // Banner
  ui.banner();
  console.log(ui.dim('  Instalando seu time de agentes IA em alguns passos.\n'));

  // ── STEP 1: Verificar ambiente ──
  console.log(ui.step('1/5', 'Verificando ambiente...'));
  const env = await checkEnvironment();
  printCheckResults(env);

  if (!env.git) {
    console.log(ui.fail('\nGit é necessário. Instale em: https://git-scm.com'));
    process.exit(1);
  }

  // ── STEP 2: Instalar Claude Code CLI ──
  if (!env.claudeCLI) {
    console.log(ui.step('2/5', 'Instalando Claude Code CLI...'));
    const ok = await installClaudeCLI();
    if (!ok) {
      console.log(ui.warn('\nInstale manualmente e rode novamente:'));
      console.log(ui.dim('  npm i -g @anthropic-ai/claude-code'));
      console.log(ui.dim('  npx create-genia-mission-control'));
      process.exit(1);
    }
  } else {
    console.log(ui.step('2/5', 'Claude Code CLI ✅ (já instalado)'));
  }

  // ── STEP 3: Autenticação ──
  console.log(ui.step('3/5', 'Autenticação com Claude'));
  await authenticate();

  // ── STEP 4a: Nome do projeto ──
  ui.nl();
  const { projectName } = await prompt({
    type: 'input',
    name: 'projectName',
    message: 'Nome da pasta do projeto:',
    initial: 'meu-projeto-genia',
    validate: (v) => /^[a-z0-9\-_]+$/i.test(v) ? true : 'Use apenas letras, números e hífens',
  });

  const projectDir = path.join(process.cwd(), projectName);

  // ── STEP 4b: Segundo Cérebro ──
  console.log(ui.step('4/5', 'Segundo Cérebro — seu contexto persistente'));
  const cerebroResult = await setupSegundoCerebro(projectDir);

  // ── STEP 5: GEN.IA OS + Mission Control ──
  console.log(ui.step('5/5', 'Instalando GEN.IA OS e Mission Control...'));
  await setupGenieOS(projectDir, cerebroResult.businessDir);

  // ── Resumo ──
  ui.nl();
  ui.separator();
  console.log(ui.gold('  ✅ INSTALAÇÃO CONCLUÍDA'));
  ui.separator();
  ui.nl();
  console.log(ui.ok('Projeto: ' + projectDir));
  if (cerebroResult.repoUrl) {
    console.log(ui.ok('Segundo Cérebro: ' + cerebroResult.repoUrl));
  } else {
    console.log(ui.ok('Segundo Cérebro: local (sem GitHub)'));
    console.log(ui.dim('   Para conectar ao GitHub depois: veja .business/README.md'));
  }
  ui.nl();

  // ── Launch ──
  await launch(projectDir);
}

main().catch(err => {
  console.error(ui.fail('\nErro inesperado: ' + err.message));
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
