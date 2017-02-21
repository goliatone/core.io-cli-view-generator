/*jshint esversion:6, node:true*/
'use strict';
const rmfr = require('rmfr');
const resolver = require('./resolver');
const iterator = require('./iterator');


function transform(schema){
    let models = [];
    
    schema = resolver(schema);

    iterator(schema.definitions, (model)=>models.push(model));


    return models;
}

module.exports = transform;
