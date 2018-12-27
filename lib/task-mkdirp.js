/*jshint esversion:6, node:true*/
'use strict';
const fs = require('fs-extra');

/**
 * 
 * @param {String} target Path to directory to clean
 * @param {Boolean} [doMkdir=true] - This task is optional
 * @returns {Promise} 
 */
function mkdirp(target, doMkdir = true) {
    if (!doMkdir) return Promise.resolve();
    return fs.ensureDir(target);
}

module.exports = mkdirp;