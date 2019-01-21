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
        let out;

        try {
            out = options.transform(schema, options);
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(out);
    }

    return Promise.resolve(schema);
}

module.exports = applyTransform;