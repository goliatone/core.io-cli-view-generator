'use strict';
const extend = require('gextend');
const BaseCommand = require('base-cli-commands').BaseCommand;

const clean = require('../lib/task-clean');
const generate = require('../lib/generator').generateFromGUISchema;
const readFile = require('fs').readFile;
const resolve = require('path').resolve;

class CompileCommand extends BaseCommand {

    execute(event) {
        event = extend({}, CompileCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        let o = event.options;

        // this.validateTemplateDir(o.templates);

        return this.loadSchema(event.source).then(schema => {
            console.log('Schema loaded...');
            return clean(event.output, o.clean).then(_ => {
                console.log('output cleaned...');
                generate(schema, o.templates, event.output, o.saveGuiSchema);
            }).catch((err) => {
                this.logger.error(err);
                return err;
            });
        }).catch(err => {
            this.logger.error(err);
            return err;
        });
    }

    validateTemplateDir(templates) {

    }

    loadSchema(filepath) {
        return new Promise((resolve, reject) => {
            readFile(filepath, 'utf-8', (err, content) => {
                if (err) reject(err);
                try {
                    let models = JSON.parse(content);
                    resolve(models);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    static describe(prog, cmd) {
        cmd.argument('[source]',
            'Path to gui-schema',
            /.*/,
            CompileCommand.DEFAULTS.source
        );

        cmd.argument('[output]', 'Filename for output.',
            /.*/,
            CompileCommand.DEFAULTS.output
        );

        cmd.option('--clean',
            'Should the contents of [source] be removed before running',
            prog.BOOL,
            CompileCommand.DEFAULTS.options.clean
        );

        cmd.option('--templates <path>',
            '<path> to template files',
            null,
            CompileCommand.DEFAULTS.options.templates
        );
    }
}

CompileCommand.DEFAULTS = {
    output: './output',
    source: './gui-schema.json',
    pathSolver: resolve,
    options: {
        clean: false,
        templates: './templates',
        saveGuiSchema: false,
    }
};

CompileCommand.COMMAND_NAME = 'compile';
CompileCommand.DESCRIPTION = 'Generate views from a GUI schema';

module.exports = CompileCommand;