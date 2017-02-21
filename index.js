/*jshint esversion:6, node:true*/
'use strict';

const mkdir = require('mkdir-promise');
const exists = require('fs-exists-promised');
const join = require('path').join;

const titleize = require('pretty-camel');


const clean = require('./lib/task-clean');
const write = require('./lib/task-write');

const makeGUISchema = require('./lib/makeGUISchema');

const Compiler = require('./lib/template-compiler');

const transform = require('./lib/task-transform');

/**
 * Generate templates from provided schema
 * @param  {Object} schema    Schema
 * @param  {String} templates source path
 * @param  {String} target    destination path
 * @return {void}
 */
function generate(schema, templates, target){

    schema = transform(schema);

    schema = makeGUISchema(schema);

    exists(target).then(()=>{
        console.log('dir %s does exist', target);
        processModels(schema, templates, target);
    }).catch(()=>{
        console.log('dir %s does not exist', target);
        mkdir(target).then(()=>{
            processModels(schema, templates, target);
        });
    });
}

function processModels(models, templates, target){
    const Files = require('expand-files');

    models.map((model)=> {
        let config;
        let modelpath = join(target, model.identity);

        mkdir(modelpath).then(()=>{
            console.log('create directory for model "%s"', model.identity);

            config = Files({
                cwd: templates
            });

            config.expand({
                mapDest:true,
                dest: modelpath,
                src: Compiler.pattern,
            }).files.map((file)=>{
                file.src.map((src)=>{
                    let content = Compiler.parse(src, model);
                    write(file.dest, content);
                });
            });
        });
    });
}


let schema = require('./schema-models.json');

// clean('./output').then(()=>{
    generate(schema, './templates', './output');
// });


function uuid(){
    return Date.now();
}
