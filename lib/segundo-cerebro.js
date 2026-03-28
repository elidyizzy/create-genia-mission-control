import { prompt } from 'enquirer';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import open from 'open';
import ora from 'ora';
import { ui } from './ui.js';

const TEMPLATE_REPO = 'elidyizzy/segundo-cerebro-template';

export async function setupSegundoCerebro(projectDir) {
  ui.nl();
  console.log(ui.gold('Segundo Cérebro — Seu contexto persistente'));
  console.log(ui.dim('  Os agentes lerão isso em toda sessão para te conhecer.'));
  ui.nl();

  const { useGitHub } = await prompt({
    type: 'confirm',
    name: 'useGitHub',
    message: 'Quer conectar o Segundo Cérebro ao GitHub? (persiste entre máquinas)',
    initial: true,
  });

  if (!useGitHub) {
    return await createLocalOnly(projectDir);
  }

  const { hasRepo } = await prompt({
    type: 'confirm',
    name: 'hasRepo',
    message: 'Você já tem um repositório "segundo-cerebro" no GitHub?',
    initial: false,
  });

  if (hasRepo) {
    return await cloneExistingCerebro(projectDir);
  } else {
    return await createNewCerebro(projectDir);
  }
}

// ── Caminho local (sem GitHub) ──────────────────────────────────────────────
async function createLocalOnly(projectDir) {
  ui.nl();
  console.log(ui.info('Criando Segundo Cérebro localmente.'));
  console.log(ui.dim('  Você pode conectar ao GitHub depois quando quiser.'));
  ui.nl();

  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Seu nome:',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'input',
      name: 'empresa',
      message: 'Nome da sua empresa:',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'input',
      name: 'cargo',
      message: 'Seu cargo/role:',
      initial: 'Fundador(a)',
    },
    {
      type: 'input',
      name: 'descricao',
      message: 'Em uma frase: o que você faz?',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
  ]);

  const businessDir = path.join(projectDir, '.business');
  const spinner = ora('Criando Segundo Cérebro local...').start();

  try {
    await execa('git', ['clone', `https://github.com/${TEMPLATE_REPO}.git`, businessDir]);
    await fs.remove(path.join(businessDir, '.git'));
    await fillPlaceholders(businessDir, { ...answers, githubUser: '' });
    spinner.succeed(ui.ok('Segundo Cérebro criado localmente'));
  } catch {
    spinner.warn(ui.warn('Criando estrutura mínima...'));
    await createMinimalBusiness(businessDir, answers);
  }

  ui.nl();
  console.log(ui.dim('  📁 Localização: ' + businessDir));
  console.log(ui.dim('  ✏️  Edite OWNER.md e EMPRESA.md para personalizar.'));
  console.log(ui.dim('  🔗 Para conectar ao GitHub depois: git init && git remote add origin <url>'));
  ui.nl();

  return { businessDir, repoUrl: null, isLocal: true };
}

// ── Clonar repo existente ───────────────────────────────────────────────────
async function cloneExistingCerebro(projectDir) {
  const { repoUrl } = await prompt({
    type: 'input',
    name: 'repoUrl',
    message: 'URL do repositório (ex: https://github.com/seunome/segundo-cerebro):',
    validate: (v) => v.includes('github.com') ? true : 'URL inválida',
  });

  const spinner = ora('Clonando Segundo Cérebro...').start();
  const businessDir = path.join(projectDir, '.business');

  try {
    await execa('git', ['clone', repoUrl, businessDir]);
    spinner.succeed(ui.ok('Segundo Cérebro conectado'));
    return { businessDir, repoUrl };
  } catch (err) {
    spinner.fail(ui.fail('Erro ao clonar repositório'));
    console.error(ui.dim('  Certifique-se de ter acesso ao repositório'));
    console.error(ui.dim(`  Erro: ${err.message}`));
    process.exit(1);
  }
}

// ── Criar novo repo via API do GitHub ──────────────────────────────────────
async function createNewCerebro(projectDir) {
  console.log(ui.info('Vamos criar seu Segundo Cérebro no GitHub.'));
  ui.nl();

  const answers = await prompt([
    {
      type: 'input',
      name: 'githubUser',
      message: 'Seu usuário do GitHub:',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Seu nome completo:',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'input',
      name: 'empresa',
      message: 'Nome da sua empresa:',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'input',
      name: 'cargo',
      message: 'Seu cargo/role:',
      initial: 'Fundador(a)',
    },
    {
      type: 'input',
      name: 'descricao',
      message: 'Em uma frase: o que você faz?',
      validate: (v) => v.length > 0 ? true : 'Obrigatório',
    },
    {
      type: 'password',
      name: 'githubToken',
      message: 'GitHub Personal Access Token (para criar o repo privado):',
      hint: 'Gere em: github.com/settings/tokens — permissão: repo',
      validate: (v) => v.startsWith('ghp_') || v.startsWith('github_pat_')
        ? true
        : 'Token inválido (deve começar com ghp_ ou github_pat_)',
    },
  ]);

  const spinner = ora('Criando repositório privado no GitHub...').start();

  try {
    // Criar repo a partir do template público
    const createRes = await fetch(
      `https://api.github.com/repos/${TEMPLATE_REPO}/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${answers.githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: answers.githubUser,
          name: 'segundo-cerebro',
          description: 'Meu contexto persistente para o GEN.IA Mission Control',
          private: true,
          include_all_branches: false,
        }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.message || 'Erro na API do GitHub');
    }

    const repo = await createRes.json();
    spinner.succeed(ui.ok(`Repositório criado: ${repo.html_url}`));

    // Clonar localmente com token na URL
    const businessDir = path.join(projectDir, '.business');
    const cloneSpinner = ora('Clonando para o projeto...').start();
    const authUrl = repo.clone_url.replace('https://', `https://${answers.githubToken}@`);
    await execa('git', ['clone', authUrl, businessDir]);
    cloneSpinner.succeed(ui.ok('Segundo Cérebro clonado'));

    // Substituir placeholders
    const fillSpinner = ora('Preenchendo informações básicas...').start();
    await fillPlaceholders(businessDir, answers);
    fillSpinner.succeed(ui.ok('Informações básicas preenchidas'));

    // Commit inicial
    const commitSpinner = ora('Salvando no GitHub...').start();
    await execa('git', ['add', '.'], { cwd: businessDir });
    await execa('git', ['commit', '-m', 'feat: configuração inicial do segundo cérebro'], { cwd: businessDir });
    await execa('git', ['push'], { cwd: businessDir });
    commitSpinner.succeed(ui.ok('Segundo Cérebro salvo no GitHub'));

    // Oferecer abrir no browser para completar
    ui.nl();
    console.log(ui.gold('📝 Complete seu Segundo Cérebro:'));
    console.log(ui.dim(`   ${repo.html_url}`));
    console.log(ui.dim('   Preencha OWNER.md e EMPRESA.md com seus dados reais.'));
    ui.nl();

    const { openBrowser } = await prompt({
      type: 'confirm',
      name: 'openBrowser',
      message: 'Abrir no browser agora para completar?',
      initial: true,
    });

    if (openBrowser) {
      await open(repo.html_url);
      await prompt({
        type: 'input',
        name: '_',
        message: 'Pressione ENTER quando terminar de preencher...',
      });

      const pullSpinner = ora('Sincronizando alterações...').start();
      try {
        await execa('git', ['pull'], { cwd: businessDir });
        pullSpinner.succeed(ui.ok('Segundo Cérebro sincronizado'));
      } catch {
        pullSpinner.warn(ui.warn('Não foi possível sincronizar — continue assim mesmo'));
      }
    }

    return { businessDir, repoUrl: repo.html_url };

  } catch (err) {
    spinner.fail(ui.fail('Erro ao criar repositório'));
    console.error(ui.dim(`  ${err.message}`));

    // Fallback: criar .business/ local
    console.log(ui.warn('Criando .business/ localmente (sem GitHub)...'));
    const businessDir = path.join(projectDir, '.business');
    await createMinimalBusiness(businessDir, answers);
    return { businessDir, repoUrl: null };
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function fillPlaceholders(dir, answers) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(dir, file);
    let content = await fs.readFile(filePath, 'utf8');
    content = content
      .replace(/\{\{SEU_NOME\}\}/g, answers.name)
      .replace(/\{\{SUA_EMPRESA\}\}/g, answers.empresa)
      .replace(/\{\{NOME_DA_EMPRESA\}\}/g, answers.empresa)
      .replace(/\{\{SEU_CARGO\}\}/g, answers.cargo)
      .replace(/\{\{DESCREVA_EM_2_FRASES_O_QUE_VOCE_FAZ\}\}/g, answers.descricao)
      .replace(/\{\{CIDADE\}\}/g, 'Brasil');
    await fs.writeFile(filePath, content);
  }
}

async function createMinimalBusiness(dir, answers) {
  await fs.ensureDir(dir);
  await fs.ensureDir(path.join(dir, 'clientes'));
  await fs.writeFile(
    path.join(dir, 'OWNER.md'),
    `# ${answers.name}\n\n${answers.descricao}\n\n- **Empresa:** ${answers.empresa}\n- **Cargo:** ${answers.cargo}\n`
  );
  await fs.writeFile(
    path.join(dir, 'EMPRESA.md'),
    `# ${answers.empresa}\n\n> Preencha este arquivo com o contexto da sua empresa.\n`
  );
  await fs.writeFile(
    path.join(dir, 'PRIORIDADES.md'),
    `# Prioridades\n\n> Atualize semanalmente.\n\n## Esta semana\n- [ ] \n`
  );
  await fs.writeFile(
    path.join(dir, 'ACORDOS.md'),
    `# Acordos\n\n- Nunca assumir — perguntar antes\n- Sempre confirmar antes de deletar ou fazer push\n- Português brasileiro\n- Commits em português\n`
  );
}
