'use strict';
const extend = require('gextend');
const clean = require('../lib/task-clean');
const generate = require('../lib/generator').generateFromGUISchema;
const readFile = require('fs').readFile;
const resolve = require('path').resolve;

class CompileCommand {

    constructor(options = {}) {
        extend(this, options);
    }

    execute(event) {
        event = extend({}, CompileCommand.DEFAULTS, event);

        event.source = event.pathSolver(event.source);
        event.output = event.pathSolver(event.output);

        event.options.templates = event.pathSolver(event.options.templates);

        let o = event.options;

        // this.validateTemplateDir(o.templates);

        return this.loadSchema(event.source).then((schema) => {
            console.log('Schema loaded...');
            return clean(event.output, o.clean).then(()=> {
                console.log('output cleaned...');
                generate(schema, o.templates, event.output, o.saveGuiSchema);
            }).catch((err)=>{
                this.logger.error(err);
                return err;
            });
        }).catch((err)=> {
            this.logger.error(err);
            return err;
        });
    }

    validateTemplateDir(templates){

    }

    loadSchema(filepath) {
        return new Promise((resolve, reject) => {
            readFile(filepath, 'utf-8', (err, content) => {
                if(err) reject(err);
                try {
                    let models = JSON.parse(content);
                    resolve(models);
                } catch(e) {
                    reject(e);
                }
            });
        });
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

module.exports = CompileCommand;
