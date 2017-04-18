/*jshint esversion:6, node:true*/
'use strict';

const mkdir = require('mkdir-promise');
const exists = require('fs-exists-promised');
const join = require('path').join;
const titleize = require('pretty-camel');
const write = require('./task-write');
const makeGUISchema = require('./makeGUISchema');
const Compiler = require('./template-compiler');
const transform = require('./task-transform');

/**
 * Generate templates from provided schema
 * @param  {Object} schema    Schema
 * @param  {String} templates source path
 * @param  {String} target    destination path
 * @return {void}
 */
function generate(schema, templates, target) {

    schema = transform(schema);

    schema = makeGUISchema(schema);

    exists(target).then(() => {
        processModels(schema, templates, target);
    }).catch(() => {
        mkdir(target).then(() => {
            processModels(schema, templates, target);
        });
    });
}

function processModels(models, templates, target) {
    const Files = require('expand-files');

    models.map((model) => {
        let config;
        let modelpath = join(target, model.identity);

        mkdir(modelpath).then(() => {
            console.log('create directory for model "%s"', model.identity);

            config = Files({
                cwd: templates
            });

            config.expand({
                mapDest: true,
                dest: modelpath,
                src: Compiler.pattern,
            }).files.map((file) => {
                file.src.map((src) => {
                    let content = Compiler.parse(src, model);
                    if(typeof content === 'string') write(file.dest, content);
                    else {
                        console.error(content);
                    }
                });
            });
        });
    });
}

module.exports = generate;
