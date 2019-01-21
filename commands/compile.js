'use strict';
const extend = require('gextend');
const BaseCommand = require('base-cli-commands').BaseCommand;
const clean = require('../lib/task-clean');
const generate = require('../lib/generator').generateFromGUISchema;
const readFile = require('fs').readFile;
const { resolve, join } = require('path');
const applyTransform = require('../lib/task-apply-external-transform');

class CompileCommand extends BaseCommand {

    execute(event) {
        this.logger.info('----------- EXECUTE ----------');
        this.logger.info(event);
        event = extend({}, CompileCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        this.logger.debug('templates:', event.options.templates);

        let opts = event.options;
        opts.logger = this.logger;

        if (opts.transform) {
            opts.transform = event.pathSolver(opts.transform);
        }

        // this.validateTemplateDir(opts.templates);

        this.logger.debug('Compiling view templates...');

        return this.loadSchema(event.source).then(schema => {

            this.logger.debug('schema loaded...');

            return applyTransform(schema, opts).then(schema => {

                this.logger.debug('schema transformed...');

                return clean(event.output, opts.clean).then(_ => {
                    this.logger.debug('output directory %s cleaned: %s...', event.output, opts.clean);
                    return generate({
                        schema,
                        debug: opts.debug,
                        logger: opts.logger,
                        target: event.output,
                        templates: opts.templates,
                        saveGuiSchema: opts.saveGuiSchema
                    });
                });
            });
        }).catch(err => {
            this.logger.error('Compile step failed!');
            console.error(err);
            this.logger.error(err);
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

        cmd.argument('[output]', 'Directory for generated views',
            /.*/,
            CompileCommand.DEFAULTS.output
        );

        cmd.option('--clean',
            'Should the contents of [source] be removed before running',
            prog.BOOL,
            CompileCommand.DEFAULTS.options.clean
        );

        cmd.option('--debug',
            'Debug mode will generate some collateral files',
            prog.BOOL,
            CompileCommand.DEFAULTS.options.debug
        );

        cmd.option('-tr <path>, --transform <path>',
            '<path> to JS file to transform schema file. Use it to modify fields',
            cmd.STRING
        );

        cmd.option('-tc <path>, --transform-context <path>',
            '<path> to JSON file with data for transform script',
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
        debug: false,
        templates: join(__dirname, '../templates'),
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