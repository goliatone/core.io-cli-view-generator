/*jshint esversion:6, node:true*/
'use strict';

function write(filepath, content){
    return require('fs').writeFileSync(filepath, content);
}


module.exports = write;
