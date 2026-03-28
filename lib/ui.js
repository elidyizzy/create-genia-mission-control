import chalk from 'chalk';

export const ui = {
  // Cores do sistema
  gold:    (t) => chalk.hex('#D4A843')(t),
  green:   (t) => chalk.hex('#3EE07A')(t),
  dim:     (t) => chalk.hex('#6A6460')(t),
  red:     (t) => chalk.red(t),
  blue:    (t) => chalk.hex('#5A9EF5')(t),

  // Ícones
  ok:      (t) => `${chalk.hex('#3EE07A')('✅')} ${t}`,
  fail:    (t) => `${chalk.red('❌')} ${t}`,
  warn:    (t) => `${chalk.hex('#F0B824')('⚠️')} ${t}`,
  info:    (t) => `${chalk.hex('#5A9EF5')('ℹ')}  ${t}`,
  step:    (n, t) => `\n${chalk.hex('#D4A843')(`[${n}]`)} ${chalk.white(t)}`,

  // Banner
  banner: () => {
    console.log('\n' + chalk.hex('#D4A843')(`
╔══════════════════════════════════════════════╗
║                                              ║
║   GEN.IA  MISSION  CONTROL                  ║
║   Instalador v1.0                            ║
║                                              ║
║   github.com/elidyizzy/GENIA-SQUAD-OS        ║
║                                              ║
╚══════════════════════════════════════════════╝
`));
  },

  separator: () => console.log(chalk.hex('#6A6460')('─'.repeat(48))),
  nl: () => console.log(),
};
