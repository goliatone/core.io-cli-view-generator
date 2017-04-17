/*jshint esversion:6, node:true*/
'use strict';
const rmfr = require('rmfr');

function clean(target, doClean=true) {
    if(!doClean) return Promise.resolve();
    return rmfr(target);
}

module.exports = clean;
