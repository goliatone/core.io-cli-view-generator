'use strict';
const extend = require('gextend');
const Keypath = require('gkeypath');
const iterator = require('./iterator');

/**
 * Resolve JSON-pointer resolver.
 * We don't support external referecnes.
 * We only support schema definitions.
 *
 * @param  {Array} models Models array
 * @return {Array}        [description]
 */
function resolver(schema) {
    let resolveReference = solveRefereceWrapper(schema);

    iterator(schema.definitions, (model) => {
        iterator(model.properties, (prop, key, src) => {
            resolveReference(prop, key, model);
        });
    });

    return schema;
}

function solveRefereceWrapper(schemas) {

    function findRef(prop) {
        return prop.$ref || prop.type.$ref || prop.items.$ref;
    }

    function assertLocalReferenceOnly(ref) {
        if (ref.indexOf('#/') === 0) return;
        throw new Error('Only local refrences supported: ' + ref);
    }

    function makePathFromReference(ref) {
        return ref.replace(/^#\//, '').replace(/\//g, '.');
    }

    return function(prop, key, src) {
        if (!hasReference(prop)) return;

        let ref = findRef(prop);

        assertLocalReferenceOnly(ref);

        let path = makePathFromReference(ref);
        let reference = Keypath.get(schemas, path);


        prop.uri = reference.id;

        src.definitions[key] = extend({}, reference);
    };
}

function hasReference(prop) {
    if (prop.$ref) return true;

    let test = 'type';
    if (prop.type === 'array') test = 'items';

    return typeof prop[test] === 'object';
}

function resolveSchemaDefinition(baseObject, refPath, callback) {

    if (baseObject === null) {
        callback(new Error("Missing Baseobject"));
        return;
    }

    baseObject.definitions = baseObject.definitions || {}; // stub in pointer


    if (baseObject.definitions[refPath]) {
        callback(null, baseObject.definitions[refPath]);
    } else {
        callback(new Error('missing definition'));
    }
}

module.exports = resolver;
