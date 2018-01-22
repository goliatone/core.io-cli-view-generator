/*jshint esversion:6, node:true*/
'use strict';
const rmfr = require('rmfr');

/**
 * 
 * @param {String} target Path to directory to clean
 * @param {Boolean} [doClean=true] - This task is optional
 * @returns {Promise} 
 */
function clean(target, doClean=true) {
    if(!doClean) return Promise.resolve();
    return rmfr(target);
}

module.exports = clean;
