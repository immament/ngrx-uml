import glob from 'glob';
import yargs from 'yargs';

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('generate', 'generate plantUML diagram', {
    year: {
      description: 'the year to check for',
      alias: 'g',
      type: 'string',
    }
  })
  .example('$0 generate -s "src/**/*.ts"', 'generate plantUML diagram for files')
  .option('source', {
    alias: 's',
    description: ' Glob-like file pattern specifying the filepath for the source files',
    type: 'string',
    nargs: 1,
    default: 'src/**/*.ts'
  })
  .option('outDir', {
    alias: 'o',
    description: 'Redirect output structure to the directory',
    type: 'string',
    nargs: 1,
  })
  .help()
  .alias('help', 'h')
  .epilog('copyright 2020')
  .argv;

const iterateFiles = (_err: Error | null, files: string[]): void => {
  console.log(files);
};

// options is optional
glob(argv.source, {}, iterateFiles );
