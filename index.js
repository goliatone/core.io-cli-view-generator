/*jshint esversion:6, node:true*/
'use strict';
const mkdir = require('mkdir-promise');
const exists = require('fs-exists-promised');
const join = require('path').join;
const rmfr = require('rmfr');
const titleize = require('pretty-camel');

function clean(target){
    return rmfr(target);
}

function template(filepath, data){
    var swig = require('swig');
    var tpl = swig.compileFile(filepath);
    //TODO: we could add locals to data :)
    return tpl(data);
}

function write(filepath, content){
    return require('fs').writeFileSync(filepath, content);
}

function prepareModels(models=[]){
    models.map((model)=>{
        if(!model.exportName) model.exportName = model.identity;
        itr(model.attributes, (attribute, name)=>{
            if(typeof attribute === 'string') attribute = {type: attribute};
            if(!attribute.name) attribute.name = name;
            if(!attribute.label) attribute.label = titleize(attribute.name);
            if(attribute.defaultsTo) attribute.default = attribute.defaultsTo;
            if(typeof attribute.default === 'function') attribute.default = attribute.default();
            if(attribute.enum) attribute.type = 'select';
        });
    });

    return models;
}

function itr(obj={}, cb=function(){}){
    let index = 0, value;
    Object.keys(obj).map((key)=>{
        value = obj[key];
        cb(value, key, obj, index++);
    });
}

function generate(models, templates, target){

    models = prepareModels(models);

    exists(target).then(()=>{
        console.log('dir %s does exist', target);
        parseModels(models, templates, target);
    }).catch(()=>{
        console.log('dir %s does not exist', target);
        mkdir(target).then(()=>{
            parseModels(models, templates, target);
        });
    });
}

function parseModels(models, templates, target){
    console.log('parsing models');

    models.map((model)=>{
        let modelpath = join(target, model.identity);
        mkdir(modelpath).then(()=>{
            console.log('create directory for model %s', model.identity);
            var Files = require('expand-files');
            let config = Files({cwd: 'templates'});
            config.expand({src:'*.ejs', dest: modelpath, mapDest:true}).files.map((file)=>{
                file.src.map((src)=>{
                    let content = template(src, model);
                    write(file.dest, content);
                });
            });
        });
    });
}
// eventName  -> Event Name
// event_name ->

let models = [{
    identity: 'box',
    exportName: 'Box',
    attributes: {
        id: {
            type: 'text',
            primaryKey: true,
            unique: true,
            required: true,
            defaultsTo: function() {
              return uuid.v4();
            }
        },
        name: {
            type: 'string',
            label: 'Name'
        },
        uuid: {
            type: 'string',
            required: true,
            label: 'UUID',
            defaultsTo: function() {
                return uuid();
            }
        },
        eventName: {
            label: 'Event Name',
            type: 'string'
        },
        eventResponse: {
            label: 'Event Response',
            type: 'string'
        },
        eventAction: {
            label: 'Event Action',
            type: 'string',
            defaultsTo: 'ACTIVATE'
        },
        boxset: {
            label: 'Boxset',
            model: 'boxset'
        },
        status: {
            label: 'Status',
            type: 'string',
            enum: [ 'available', 'assigned', 'delivered', 'full', 'broken'],
            defaultsTo: 'available'
        }
    }
}, {
    identity: 'boxset',
    exportName: 'BoxSet',
    attributes: {
        id: {
            type: 'text',
            primaryKey: true,
            unique: true,
            defaultsTo: function() {
              return uuid.v4();
            }
        },
        uuid: {
            type: 'string',
            required: true,
            defaultsTo: function() {
                return uuid();
            }
        },
        identifier: {
            type: 'string'
        },
        partitionId: {
            type: 'integer'
        },
        serverId: {
            type: 'integer'
        },
        partition: {
            type: 'string'
        },
        boxes: {
            collection: 'box',
            via: 'boxset'
        }
    }
}];

// clean('./output').then(()=>{
    generate(models, './templates', './output');
// });


function uuid(){
    return Date.now();
}
