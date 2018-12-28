/*jshint esversion:6, node:true*/
'use strict';

const iterator = require('./iterator');

function makeGUISchema(config) {
    let field,
        group;

    const { logger = console } = config;

    let schemas = config.schema;

    schemas = schemas.map(schema => {
        group = {
            uri: schema.id,
            now: new Date(),
            label: schema.title,
            identity: schema.identity,
            description: schema.description,
            definitions: schema.definitions,
            fields: []
        };

        let isRequired = isRequiredWrapper(schema);

        group.fields = iterator(schema.properties, (prop, key) => {
            field = {};
            field.name = key;
            field.label = prop.title;
            field.format = prop.format;
            field.entityType = prop.type;
            field.pattern = prop.pattern;
            field.default = prop.default;
            field.primaryKey = prop.primaryKey;
            field.tooltip = prop.description;
            field.uri = prop.uri;

            makeElement({ field, prop, logger });

            if (isRequired(key)) field.required = true;

            return checkIgnored(field);
        });

        return group;
    });

    if (config.debug) {
        saveDebugFile(schemas)
    }

    return schemas;
}

function saveDebugFile(schemas, filename = './debug-schema-gui.json') {
    const out = JSON.stringify(schemas, null, 4);
    require('./task-write')(filename, out);
}

function checkIgnored(field) {
    //BUG: We need to ignore functions...
    return field;
}

function isRequiredWrapper(schema) {
    return function isRequired(key) {
        return schema.required.indexOf(key) !== -1;
    };
}

function makeElement({ field, prop, logger }) {
    let element;

    logger.debug('make element: %s %s', field.name, prop.type);

    switch (prop.type) {
        case 'text':
            field.element = 'textarea';
            break;
        case 'array':
            field.type = 'text';
            field.element = 'multiselect';
            field.items = prop.items;
            field.subType = 'array';
            field.relType = 'many-to-one';
            break;
        case 'json':
            field.type = 'text';
            field.element = 'input';
            field.subType = 'json';
            break;
        case 'string':
            field.type = 'text';
            field.element = 'input';
            break;
        case 'boolean':
            field.type = 'checkbox';
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

    switch (prop.format) {
        case 'url':
            field.type = 'url';
            break;
        case 'email':
            field.type = 'email';
            break;
        case 'hexColor':
            field.type = 'color';
            break;
        case 'date':
            field.type = 'date';
            break;
    }

    if (prop.enum) {
        field.element = 'select';
        field.options = prop.enum;
    }

    //relationships
    if (typeof prop.type === 'object') {
        field.element = 'select';
        /* @TODO: Make post process to tie rel.
         * This is not necessarily true,
         * it's just a reference to a single
         * object, which could be part of a
         * one-to-one or a one-to-many rel.
         * To really have insights on the
         * `relType` we would need to know
         * about the other end.
         */
        field.relType = 'one-to-many';
    }

    return element;
}


module.exports = makeGUISchema;