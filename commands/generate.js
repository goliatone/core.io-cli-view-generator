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

        event.source = resolve(event.source);
        event.output = resolve(event.output);

        event.options.templates = resolve(event.options.templates);

        return this.loadSchema(event.source).then((schema) => {
            return clean(event.output, event.options.clean).then(()=> {
                generate(schema, event.options.templates, event.output);
            }).catch((err)=>{
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
    options: {
        clean: false,
        templates: './templates',
    }
};

module.exports = GenerateCommand;
