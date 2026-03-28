import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { ui } from './ui.js';

const GENIA_OS_REPO = 'https://github.com/elidyizzy/GENIA-SQUAD-OS.git';

export async function setupGenieOS(projectDir, businessDir) {
  await fs.ensureDir(projectDir);

  // Clonar GENIA-SQUAD-OS para diretório temporário e mesclar
  // (projectDir pode já ter .business/ criado pelo segundo-cérebro)
  const tempDir = projectDir + '__tmp__';
  const spinner = ora('Clonando GEN.IA SQUAD OS...').start();
  try {
    await fs.remove(tempDir); // garantir limpeza de tentativas anteriores
    await execa('git', ['clone', GENIA_OS_REPO, tempDir]);
    await fs.copy(tempDir, projectDir, { overwrite: false });
    await fs.remove(tempDir);
    spinner.succeed(ui.ok('GEN.IA SQUAD OS clonado'));
  } catch (err) {
    await fs.remove(tempDir).catch(() => {});
    spinner.fail(ui.fail('Erro ao clonar GENIA-SQUAD-OS'));
    throw err;
  }

  // Substituir .business/ do repo clonado pelo Segundo Cérebro do usuário
  const defaultBusiness = path.join(projectDir, '.business');
  if (businessDir !== defaultBusiness) {
    const linkSpinner = ora('Conectando Segundo Cérebro...').start();
    try {
      await fs.remove(defaultBusiness);
      await fs.copy(businessDir, defaultBusiness);
      linkSpinner.succeed(ui.ok('Segundo Cérebro conectado ao projeto'));
    } catch (err) {
      linkSpinner.warn(ui.warn('Segundo Cérebro: mantendo cópia local'));
    }
  }

  // Instalar dependências do Mission Control (se existir)
  const mcDir = path.join(projectDir, 'mission-control');
  if (await fs.pathExists(mcDir)) {
    const depsSpinner = ora('Instalando dependências do Mission Control...').start();
    try {
      await execa('npm', ['install'], { cwd: mcDir });
      depsSpinner.succeed(ui.ok('Dependências instaladas'));
    } catch {
      depsSpinner.warn(ui.warn('Instale manualmente: cd mission-control && npm install'));
    }
  }
}
