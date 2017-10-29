'use strict';

const Compile = require('./compile');
const Generate = require('./generate');

module.exports.attach = function(prog, namespace=false) {
    Compile.attach(prog, namespace);
    Generate.attach(prog, namespace);
};
