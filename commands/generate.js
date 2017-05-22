'use strict';
const extend = require('gextend');
const clean = require('../lib/task-clean');
const generate = require('../lib/generator');
const readFile = require('fs').readFile;
const resolve = require('path').resolve;

class GenerateCommand {

    constructor(options = {}) {
        extend(this, options);
    }

    execute(event) {
        event = extend({}, GenerateCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        let o = event.options;

        return this.loadSchema(event.source).then((schema) => {
            return clean(event.output, o.clean).then(()=> {
                generate(schema, o.templates, event.output, o.saveGuiSchema);
            }).catch((err) => {
                this.logger.error(err);
                return err;
            });
        }).catch((err)=> {
            this.logger.error(err);
            return err;
        });
    }

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
}

GenerateCommand.DEFAULTS = {
    output: './output',
    source: './schema.json',
    pathSolver: resolve,
    options: {
        clean: false,
        templates: './templates',
        saveGuiSchema: false,
    }
};

module.exports = GenerateCommand;
