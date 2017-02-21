/*jshint esversion:6, node:true*/
'use strict';
const rmfr = require('rmfr');

function clean(target){
    return rmfr(target);
}

module.exports = clean;
