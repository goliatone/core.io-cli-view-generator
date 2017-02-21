/*jshint esversion:6, node:true*/
'use strict';

const iterator = require('./iterator');

function makeGUISchema(schemas){
    let guis = [],
        field,
        group;

    schemas = schemas.map((schema)=>{
        group = {
            uri: schema.id,
            label: schema.title,
            identity: schema.identity,
            description: schema.description,
            // definitions: schema.definitions,
            fields: []
        };

        let isRequired = isRequiredWrapper(schema);

        group.fields = iterator(schema.properties, (prop, key)=>{

            field = {};
            field.name = key;
            field.label = prop.title;
            field.format = prop.format;
            field.entityType = prop.type;
            field.pattern = prop.pattern;
            field.default = prop.default;
            field.tooltip = prop.description;

            makeElement(field, prop);

            if(isRequired(key)) field.required = true;

            return field;
        });

        return group;
    });

    let out = JSON.stringify(schemas, null, 4);
    require('./task-write')('./schema-gui.json', out);

    return schemas;
}

function isRequiredWrapper(schema){
    return function isRequired(key){
        return schema.required.indexOf(key) !== -1;
    };
}

function makeElement(field, prop){
    let element;

    switch (prop.type) {
        case 'text':
            field.element = 'textarea';
            break;
        case 'json':
        case 'array':
        case 'string':
            //we should cover hexColor
            //
            field.type = 'text';
            field.element = 'input';
            break;
        case 'boolean':
            field.tpye = 'checkbox';
            field.element = 'input';
            break;
        case 'float':
        case 'integer':
            field.type = 'number';
            field.element = 'input';
            break;
        case 'date':
            field.type = 'date';
            field.element = 'input';
            break;
        case 'time':
            field.type = 'time';
            field.element = 'input';
            break;
        case 'datetime':
            //this should include date & time
            //how to in there.
            field.type = 'datetime-local';
            field.element = 'input';
            break;
        default:
            field.type = 'text';
            field.element = 'input';
            break;
    }

    switch(prop.format){
        case 'url':
            field.type = 'url';
        break;
        case 'email':
            field.type = 'email';
        break;
        case 'hexColor':
            field.type = 'color';
        break;
    }

    if(prop.enum){
        field.element = 'select';
        field.options = prop.enum;
    }

    return element;
}


module.exports = makeGUISchema;
