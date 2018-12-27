'use strict';

const Compile = require('./compile');
const Generate = require('./generate');

/**
 * Attach commands to given application context,
 * if a `namespace` is given then commands will 
 * be added as sub-commands.
 */
module.exports.attach = function $attach(app, namespace = false) {

    const context = {
        namespace,
        prog: app.prog
    };

    Generate.attach(context);
    Compile.attach(context);

};