'use strict';
const extend = require('gextend');
const BaseCommand = require('base-cli-commands').BaseCommand;

const clean = require('../lib/task-clean');
const generate = require('../lib/generator').generateFromGUISchema;
const readFile = require('fs').readFile;
const resolve = require('path').resolve;
const applyTransform = require('../lib/task-apply-external-transform');

class CompileCommand extends BaseCommand {

    execute(event) {
        event = extend({}, CompileCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        let o = event.options;

        if (event.options.transform) {
            event.options.transform = event.pathSolver(event.options.transform);
        }
        // this.validateTemplateDir(o.templates);

        return this.loadSchema(event.source).then(schema => {
            return applyTransform(event.options, schema).then(schema => {
                return clean(event.output, o.clean).then(_ => {
                    return generate(schema, o.templates, event.output, o.saveGuiSchema);
                });
            });
        }).catch(err => {
            console.error(err);
            // this.logger.error(err);
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
        if (CompileCommand.HELP) {
            cmd.help(CompileCommand.HELP, { indent: true });
        }

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

        cmd.option('--transform <path>',
            '<path> to JS file to transform schema file. Use it to modify fields',
            cmd.STRING
        );

        cmd.option('--templates <path>',
            '<path> to template files',
            null,
            CompileCommand.DEFAULTS.options.templates
        );

        cmd.option('--save-gui-schema',
            'Saves a copy of the intermediary GUI schema file',
            prog.BOOL,
            CompileCommand.DEFAULTS.options.saveGuiSchema
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
        // transform: ''
    }
};

CompileCommand.COMMAND_NAME = 'compile';
CompileCommand.DESCRIPTION = 'Generate views from a GUI schema.';
CompileCommand.HELP = `Compile should generate a JSON file from a bunch of Waterline models. 

     The generated file can be used with the generate command. If you want to modify the GUI JSON file, 
     say to change the order of the fields or to remove some fiels, do you using the --transform flag.`;


module.exports = CompileCommand;