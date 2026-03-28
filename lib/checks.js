import { execa } from 'execa';
import { ui } from './ui.js';

export async function checkEnvironment() {
  const results = {
    node: false,
    git: false,
    claudeCLI: false,
  };

  // Node.js (já verificado no bin, mas confirma versão)
  const [major] = process.versions.node.split('.').map(Number);
  results.node = major >= 18;

  // Git
  try {
    await execa('git', ['--version']);
    results.git = true;
  } catch {
    results.git = false;
  }

  // Claude Code CLI — tenta 'claude' e 'claude.cmd' (Windows)
  for (const cmd of ['claude', 'claude.cmd']) {
    try {
      await execa(cmd, ['--version']);
      results.claudeCLI = true;
      results.claudeCmd = cmd;
      break;
    } catch {
      // continua
    }
  }

  return results;
}

export function printCheckResults(results) {
  console.log(results.node
    ? ui.ok(`Node.js ${process.version}`)
    : ui.fail('Node.js < 18'));

  console.log(results.git
    ? ui.ok('Git instalado')
    : ui.fail('Git não encontrado — instale em https://git-scm.com'));

  console.log(results.claudeCLI
    ? ui.ok('Claude Code CLI instalado')
    : ui.warn('Claude Code CLI não encontrado — será instalado'));
}
