import { execa } from 'execa';
import path from 'path';
import open from 'open';
import fs from 'fs-extra';
import { ui } from './ui.js';

export async function launch(projectDir) {
  const mcDir = path.join(projectDir, 'mission-control');
  const serverPath = path.join(mcDir, 'server.js');

  const hasServer = await fs.pathExists(serverPath);

  ui.nl();
  ui.separator();
  console.log(ui.gold('  ✅ GEN.IA OS INSTALADO COM SUCESSO'));
  ui.separator();
  ui.nl();
  console.log(ui.ok('Projeto em: ' + projectDir));
  ui.nl();

  if (!hasServer) {
    // Mission Control visual ainda não existe — instruir como usar via Claude Code
    console.log(ui.gold('  Próximo passo — abrir no Claude Code:'));
    ui.nl();
    console.log(ui.dim('  1. Abra o VS Code ou terminal na pasta do projeto:'));
    console.log(ui.dim(`     cd "${projectDir}"`));
    console.log(ui.dim(''));
    console.log(ui.dim('  2. Inicie o Claude Code:'));
    console.log(ui.dim('     claude'));
    console.log(ui.dim(''));
    console.log(ui.dim('  3. Os 9 agentes e os Xquads já estão configurados.'));
    console.log(ui.dim('     Seu Segundo Cérebro está em .business/'));
    ui.nl();
    console.log(ui.gold('  Dica: preencha .business/OWNER.md e .business/EMPRESA.md'));
    console.log(ui.dim('  antes de começar — os agentes leem isso em toda sessão.'));
    ui.nl();
    return;
  }

  // Mission Control server existe — iniciar normalmente
  console.log(ui.ok('Servidor: localhost:3001'));
  ui.nl();
  console.log(ui.dim('  Para iniciar novamente no futuro:'));
  console.log(ui.dim(`  cd ${path.basename(projectDir)}/mission-control && node server.js`));
  ui.nl();

  setTimeout(async () => {
    await open('http://localhost:3001');
  }, 2000);

  console.log(ui.gold('Iniciando servidor... (Ctrl+C para parar)\n'));

  try {
    await execa('node', [serverPath], {
      cwd: mcDir,
      stdio: 'inherit',
    });
  } catch (err) {
    if (err.exitCode !== 130) {
      console.error(ui.fail('Servidor encerrou com erro: ' + err.message));
    }
  }
}
