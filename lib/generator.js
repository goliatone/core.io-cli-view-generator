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
const Files = require('expand-files');

/**
 * Generate templates from provided schema
 *
 * If `saveGuiSchema` is `true` then we will save
 * the intermediary JSON data we use to generate the
 * GUI. You can modify it manually and then call
 * `generateFromGUISchema`.
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
    models.map((model) => {
        processModel(model, templates, target)
    });
}

function processModel(model, templates, target) {
    let config;

    let modelpath = join(target, model.identity);

    return Promise.all([
        mkdir(modelpath),
        filterModel(model),
    ]).then((results) => {
        let model = results[1];
        console.info('Created directory "%s":     \t%s', model.identity, modelpath);

        config = Files({
            cwd: templates
        });

        config.expand({
            mapDest: true,
            dest: modelpath,
            src: Compiler.pattern,
        }).files.map((file) => {
            file.src.map((src) => {
                console.info('  - Process file "%s"', src);

                let content = Compiler.parse(src, model);
                if(typeof content === 'string') write(file.dest, content);
                else {
                    console.error(content);
                }
            });
        });
    });
}

function filterModel(model) {
    return Promise.resolve(model);
}

module.exports = generate;
module.exports.generateFromGUISchema = generateFromGUISchema;


function saveFile(schema, filepath='./gui-schema.json') {
    require('fs').writeFileSync(filepath, JSON.stringify(schema, null, 4), 'utf-8');
}
