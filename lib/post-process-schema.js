'use strict';

const postRelationshiptTypes = require('./processing/post-relationship-types');

function postProcessSchema(schema) {
    schema = postRelationshiptTypes(schema);
    return schema;
}

module.exports = postProcessSchema;
