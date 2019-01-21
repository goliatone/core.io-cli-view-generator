'use strict';

const extend = require('gextend');
const BaseCommand = require('base-cli-commands').BaseCommand;

const clean = require('../lib/task-clean');
const mkdirp = require('../lib/task-mkdirp');
const generate = require('../lib/generator');
const readFile = require('fs').readFile;
const resolve = require('path').resolve;
const join = require('path').join;

class GenerateCommand extends BaseCommand {

    execute(event) {
        this.logger.info('----------- EXECUTE ----------');
        this.logger.info(event);

        event = extend({}, GenerateCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        this.logger.debug('templates:', event.options.templates);

        const opts = event.options;

        return this.loadSchema(event.source).then(schema => {
            return clean(event.output, opts.clean).then(_ => {
                return mkdirp(event.output, opts.mkdir).then(_ => {
                    return generate({
                        schema,
                        debug: opts.debug,
                        logger: this.logger,
                        target: event.output,
                        templates: opts.templates,
                        saveGuiSchema: opts.saveGuiSchema
                    });
                });
            });
        }).catch(err => {
            console.error(err);
            //TODO: the logger does not work?!
            // this.logger.error(err);
            return err;
        });
    }

    /**
     * @TODO Make BaseCommand.loadJSON
     * @param {String} filepath 
     */
    loadSchema(filepath) {
        return new Promise((resolve, reject) => {
            readFile(filepath, 'utf-8', (err, content) => {
                if (err) reject(err);
                try {
                    let models = JSON.parse(content);
                    this.logger.debug('models loaded', models && models.length);
                    resolve(models);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    static describe(prog, cmd) {
        if (GenerateCommand.HELP) {
            cmd.help(GenerateCommand.HELP, { indent: true });
        }

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

        cmd.option('--mkdir',
            'Ensure path to output exists, will create directories missing',
            prog.BOOL,
            GenerateCommand.DEFAULTS.options.mkdir
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
        mkdir: true
    }
};

GenerateCommand.COMMAND_NAME = 'generate';
GenerateCommand.DESCRIPTION = 'Generate views from a JSON schema. Optionally generate GUI schema.';
GenerateCommand.HELP = `The generate commanwill parse a JSON schema and generate an intermediary 
     GUI schema, which can then be modified to handle the output in the templates.`;

module.exports = GenerateCommand;