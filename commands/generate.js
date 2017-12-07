'use strict';

const extend = require('gextend');
const BaseCommand = require('base-cli-commands').BaseCommand;

const clean = require('../lib/task-clean');
const generate = require('../lib/generator');
const readFile = require('fs').readFile;
const resolve = require('path').resolve;
const join = require('path').join;

class GenerateCommand extends BaseCommand {

    execute(event) {
        event = extend({}, GenerateCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);
        this.logger.info('templates', event.options.templates);

        let o = event.options;

        return this.loadSchema(event.source).then((schema) => {
            return clean(event.output, o.clean).then(()=> {
                return generate(schema, o.templates, event.output, o.saveGuiSchema);
            }).catch((err) => {
                this.logger.error(err);
                return err;
            });
        }).catch((err)=> {
            this.logger.error(err);
            return err;
        });
    }
    //@TODO Make BaseCommand.loadJSON
    loadSchema(filepath) {
        return new Promise((resolve, reject) => {
            readFile(filepath, 'utf-8', (err, content) => {
                if(err) reject(err);
                try {
                    let models = JSON.parse(content);
                    console.log('models loaded', models && models.length);
                    resolve(models);
                } catch(e) {
                    reject(e);
                }
            });
        });
    }

    static describe(prog, cmd){
        cmd.argument('[source]',
            'Path to directory with models',
            /.*/,
            GenerateCommand.DEFAULTS.source
        );

        cmd.argument('[output]',
            'Filename for output.',
            /.*/,
            GenerateCommand.DEFAULTS.output
        );

        cmd.option('--clean',
            'Should the contents of [source] be removed before running',
            prog.BOOL,
            GenerateCommand.DEFAULTS.options.clean
        );

        cmd.option('--save-gui-schema',
            'Saves a copy of the intermediary GUI schema file',
            prog.BOOL,
            GenerateCommand.DEFAULTS.options.saveGuiSchema
        );

        cmd.option('--templates <path>',
            '<path> to template files',
            null,
            GenerateCommand.DEFAULTS.options.templates
        );
    }
}

GenerateCommand.DEFAULTS = {
    output: './output',
    source: './schema.json',
    pathSolver: resolve,
    options: {
        clean: false,
        templates: join(__dirname, '../templates'),
        saveGuiSchema: false,
    }
};

GenerateCommand.COMMAND_NAME = 'generate';
GenerateCommand.DESCRIPTION = 'Generate views from a JSON schema';

module.exports = GenerateCommand;
