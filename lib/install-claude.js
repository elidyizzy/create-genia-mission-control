import { execa } from 'execa';
import ora from 'ora';
import { ui } from './ui.js';

export async function installClaudeCLI() {
  const spinner = ora({
    text: 'Instalando Claude Code CLI...',
    color: 'yellow',
  }).start();

  try {
    await execa('npm', ['install', '-g', '@anthropic-ai/claude-code'], {
      stdio: 'pipe',
    });
    spinner.succeed(ui.ok('Claude Code CLI instalado'));
    return true;
  } catch (err) {
    spinner.fail(ui.fail('Falha ao instalar Claude Code CLI'));
    console.error(ui.dim('  Tente manualmente: npm i -g @anthropic-ai/claude-code'));
    console.error(ui.dim(`  Erro: ${err.message}`));
    return false;
  }
}
