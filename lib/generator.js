/*jshint esversion:6, node:true*/
'use strict';

const mkdir = require('mkdirp-promise');
const exists = require('fs-exists-promised');
const join = require('path').join;
const titleize = require('pretty-camel');
const write = require('./task-write');
const makeGUISchema = require('./makeGUISchema');
const Compiler = require('./template-compiler');
const transform = require('./task-transform');
const Files = require('expand-files');
const postProcessSchema = require('./post-process-schema');
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

    if(!schema || schema.length === 0) {
        throw new Error('InvalidSchema: no items found');
    }

    /*
     * This is the intermediary format
     * that we use to generate the views.
     */
    let guiSchema = makeGUISchema(schema);

    /*
     * Once we have generated a GUI schema
     * we can apply transforms having all
     * data in place, like figuring out
     * actual relationship types.
     */
    guiSchema = postProcessSchema(guiSchema);

    if(!guiSchema || guiSchema.length === 0) {
        throw new Error('InvalidSchema: no items found');
    }

    return generateFromGUISchema(guiSchema, templates, target, saveGuiSchema);
}

function generateFromGUISchema(guiSchema, templates, target, saveGuiSchema=false) {
    console.log('generateFromGUISchema(%s)', saveGuiSchema, guiSchema.length, target);
    let saving;
    if(saveGuiSchema) {
        saving = saveFile(guiSchema);
    }
    console.log('we make it here', templates, target);
    console.log('saving', saving);

    return Promise.resolve(saving).then(()=>{
        console.log('file saved...');

        // return mkdir(target).then(() => {
            console.log('call processModels()');
            return processModels(guiSchema, templates, target);
        // });

    }).catch((err)=>{
        console.error('err generateFromGUISchema');
        console.error(err.message);
        console.error(err.stack);
    });
}

function processModels(models, templates, target) {

    let out = [];
    models.map((model) => {
        console.log('-> processModel', model.identity);
        out.push(processModel(model, templates, target));
        console.log('---');
    });
    console.log('processModels(%s)', out.length);
    return out;
}

function processModel(model, templates, target) {
    let config;

    let modelpath = join(target, model.identity);
    console.log('   modelpath', modelpath);
    const Promise = require('bluebird');

    return Promise.all([
        //change by mkdirp
        // mkdir(modelpath),
        filterModel(model)
    ]).then((results) => {
        console.log('here', results);
        return true;
        let model = results[0];
        console.info('Created directory "%s":     \t%s', model.identity, modelpath);
        console.log('pattern', Compiler.pattern);
        console.log('templates', templates);

        config = Files({
            cwd: templates
        });

        let files = config.expand({
            mapDest: true,
            dest: modelpath,
            src: Compiler.pattern,
        }).files;

        files.map((file) => {
console.log('map file', file.src);
            if(!file.src || file.src.length === 0 ){
                console.warn('Could not find templates for model', model.identity);
            }

            file.src.map((src) => {
                console.info('  - Process file "%s"', src);

                let content = Compiler.parse(src, model);
                if(typeof content === 'string') write(file.dest, content);
                else {
                    console.error(content);
                }
            });
        });
    }).catch((err)=>{
        console.error('err', err.message);
        return err;
    });
}

function filterModel(model) {
    console.log('    filterModel(%s)', model.identity);
    return Promise.resolve(model);
}

module.exports = generate;
module.exports.generateFromGUISchema = generateFromGUISchema;


function saveFile(schema, filepath='./gui-schema.json') {
    const fs = require('fs');
    return new Promise((resolve, reject) => {
        let content;
        try {
            content = JSON.stringify(schema, null, 4);
        } catch (e) {
            console.error('error saveFile', e.message);
            console.error(e.stack);
            return reject(e);
        }
console.log('writeFile', filepath, content.length);
        fs.writeFile(filepath, content, 'utf-8', (err)=>{
            console.log('callback!', err);
            if(err) reject(err);
            else resolve();
        });
    });
}
