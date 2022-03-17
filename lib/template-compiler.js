/*jshint esversion:6, node:true*/
'use strict';



function template(filepath, data) {
    const swig = require('swig-templates');
    var tpl;
    try {
        tpl = swig.compileFile(filepath);
    } catch (e) {
        return e;
    }

    //TODO: we could add locals to data :)
    return tpl(data);
}


module.exports = {
    parse: template,
    pattern: '*.ejs'
};
