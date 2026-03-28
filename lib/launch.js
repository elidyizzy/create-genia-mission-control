import { execa } from 'execa';
import path from 'path';
import open from 'open';
import { ui } from './ui.js';

export async function launch(projectDir) {
  const mcDir = path.join(projectDir, 'mission-control');
  const serverPath = path.join(mcDir, 'server.js');

  ui.nl();
  ui.separator();
  console.log(ui.gold('  🚀 INICIANDO MISSION CONTROL'));
  ui.separator();
  ui.nl();
  console.log(ui.ok('Projeto configurado em: ' + projectDir));
  console.log(ui.ok('Servidor: localhost:3001'));
  ui.nl();
  console.log(ui.dim('  Para iniciar novamente no futuro:'));
  console.log(ui.dim(`  cd ${path.basename(projectDir)}/mission-control`));
  console.log(ui.dim('  node server.js'));
  ui.nl();

  // Abrir browser após 2 segundos
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
    // 130 = Ctrl+C (SIGINT) — saída esperada
    if (err.exitCode !== 130) {
      console.error(ui.fail('Servidor encerrou com erro: ' + err.message));
    }
  }
}
