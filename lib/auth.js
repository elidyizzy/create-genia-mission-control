import { execa } from 'execa';
import enquirer from 'enquirer';
import { ui } from './ui.js';

const { prompt } = enquirer;

export async function authenticate() {
  // Verificar se já está autenticado
  const alreadyAuth = await checkAlreadyAuthenticated();

  if (alreadyAuth) {
    console.log(ui.ok('Claude Code já autenticado — pulando etapa de login'));
    return { method: 'existing' };
  }

  ui.nl();
  console.log(ui.warn('Claude Code não autenticado.'));
  ui.nl();
  console.log(ui.gold('Como autenticar:'));
  console.log(ui.dim('  Opção 1 (recomendado): abra outro terminal e rode:'));
  console.log(ui.dim('    claude login'));
  console.log(ui.dim(''));
  console.log(ui.dim('  Opção 2: defina a variável de ambiente:'));
  console.log(ui.dim('    ANTHROPIC_API_KEY=sk-ant-... npx create-genia-mission-control'));
  ui.nl();

  // Se ANTHROPIC_API_KEY já está no ambiente, usar direto
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(ui.ok('API key detectada via variável de ambiente'));
    return { method: 'env' };
  }

  const { action } = await prompt({
    type: 'select',
    name: 'action',
    message: 'O que quer fazer?',
    choices: [
      { name: 'continue', message: 'Já fiz login em outro terminal — continuar' },
      { name: 'apikey',   message: 'Inserir API key agora' },
      { name: 'skip',     message: 'Pular autenticação por agora' },
    ],
  });

  if (action === 'apikey') {
    return await collectAPIKey();
  }

  // 'continue' ou 'skip' — prosseguir
  return { method: action };
}

async function checkAlreadyAuthenticated() {
  // Checar se ANTHROPIC_API_KEY está no ambiente
  if (process.env.ANTHROPIC_API_KEY) return true;

  // Checar se claude já tem sessão ativa (sem abrir interativo)
  for (const cmd of ['claude', 'claude.cmd']) {
    try {
      const result = await execa(cmd, ['config', 'get', 'apiKey'], {
        stdio: 'pipe',
        timeout: 3000,
      });
      if (result.stdout && result.stdout.trim()) return true;
    } catch {
      // continua
    }
  }

  return false;
}

async function collectAPIKey() {
  const { apiKey } = await prompt({
    type: 'password',
    name: 'apiKey',
    message: 'Cole sua API key da Anthropic (sk-ant-...):',
    validate: (v) => v.startsWith('sk-ant-') ? true : 'Inválida — deve começar com sk-ant-',
  });

  process.env.ANTHROPIC_API_KEY = apiKey;
  console.log(ui.ok('API key configurada para esta sessão'));
  return { method: 'apikey', apiKey };
}
