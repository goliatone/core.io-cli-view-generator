/*jshint esversion:6, node:true*/
'use strict';



function template(filepath, data){
    var swig = require('swig');
    var tpl = swig.compileFile(filepath);
    //TODO: we could add locals to data :)
    return tpl(data);
}


module.exports = {
    parse: template,
    pattern: '*.ejs'
};
