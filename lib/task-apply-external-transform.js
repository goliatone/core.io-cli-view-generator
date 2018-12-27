'use strict';
const resolve = require('path').resolve;

function applyTransform(schema, options = {}) {
    if (!options.transform) return Promise.resolve(schema);

    if (typeof options.transform === 'string') {
        try {
            options.transform = require(resolve(options.transform));
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    if (typeof options.transform === 'function') {
        return Promise.resolve(options.transform(schema, options));
    }

    return Promise.resolve(schema);
}

module.exports = applyTransform;