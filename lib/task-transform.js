'use strict';
const rmfr = require('rmfr');
const resolver = require('./resolver');
const iterator = require('./iterator');

/**
 * Transform schema into an intermediary
 * format.
 *
 * It resolves all internal
 * references to other models.
 *
 * It returns a subset of the orignal
 * JSON schema.
 *
 * @method transform
 * @param  {Object}  schema JSON schema
 *                   definition of models
 * @return {Array}   List of models
 */
function transform(schema) {
    let models = [];

    /*
     * Resolve internal references.
     */
    schema = resolver(schema);

    iterator(schema.definitions, (model) => models.push(model));
console.log('iterator done', models.length);
    return models;
}

module.exports = transform;
