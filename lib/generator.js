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
 *
 * @method generate
 * @param  {Object}  schema                JSON-schema
 * @param  {String}  templates             Source path
 * @param  {String}  target                Destination path
 * @param  {Boolean} [saveGuiSchema=false] Save intermediary
 *                                         JSON file
 * @return {void}
 */
function generate(schema, templates, target, saveGuiSchema=false) {

    /*
     * Massage schema so we can use it.
     * This will drop unnecessary JSON-schema
     * related cruft and will also resolve
     * all references/relationships.
     */
    schema = transform(schema);

    /*
     * This is the intermediary format
     * that we use to generate the views.
     */
    let guiSchema = makeGUISchema(schema);

    return generateFromGUISchema(guiSchema, templates, target, saveGuiSchema);
}

function generateFromGUISchema(guiSchema, templates, target, saveGuiSchema=false) {

    if(saveGuiSchema) {
        saveFile(guiSchema);
    }

    return mkdir(target).then(() => {
        return processModels(guiSchema, templates, target);
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
module.exports.generateFromGUISchema = generateFromGUISchema;


function saveFile(schema, filepath='./gui-schema.json') {
    require('fs').writeFileSync(filepath, JSON.stringify(schema, null, 4), 'utf-8');
}
