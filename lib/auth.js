import { execa } from 'execa';
import enquirer from 'enquirer';
const { prompt } = enquirer;
import { ui } from './ui.js';

export async function authenticate() {
  ui.nl();
  console.log(ui.gold('Como você quer autenticar com o Claude?'));
  ui.nl();

  const { method } = await prompt({
    type: 'select',
    name: 'method',
    message: 'Método de autenticação:',
    choices: [
      { name: 'browser', message: '🌐 Login pelo browser (recomendado)' },
      { name: 'apikey',  message: '🔑 Usar API key da Anthropic' },
    ],
  });

  if (method === 'browser') {
    return await authBrowser();
  } else {
    return await authAPIKey();
  }
}

async function authBrowser() {
  console.log(ui.info('Abrindo autenticação no browser...'));
  console.log(ui.dim('  O browser vai abrir. Faça login e volte aqui.'));
  ui.nl();

  try {
    // claude login abre o browser automaticamente
    // No Windows, tenta 'claude.cmd' se 'claude' falhar
    for (const cmd of ['claude', 'claude.cmd']) {
      try {
        await execa(cmd, ['login'], { stdio: 'inherit' });
        console.log(ui.ok('Autenticado com sucesso'));
        return { method: 'browser' };
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    throw new Error('Claude CLI não encontrado');
  } catch (err) {
    console.log(ui.warn('Não foi possível autenticar automaticamente'));
    console.log(ui.dim('  Execute manualmente: claude login'));
    return null;
  }
}

async function authAPIKey() {
  const { apiKey } = await prompt({
    type: 'password',
    name: 'apiKey',
    message: 'Cole sua API key da Anthropic:',
    validate: (v) => v.startsWith('sk-ant-') ? true : 'API key inválida (deve começar com sk-ant-)',
  });

  // Salvar na variável de ambiente para uso durante a instalação
  process.env.ANTHROPIC_API_KEY = apiKey;

  // Tentar configurar no claude CLI
  for (const cmd of ['claude', 'claude.cmd']) {
    try {
      await execa(cmd, ['config', 'set', 'apiKey', apiKey], { stdio: 'pipe' });
      break;
    } catch {
      // continua
    }
  }

  console.log(ui.ok('API key configurada'));
  return { method: 'apikey', apiKey };
}
