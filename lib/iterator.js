/*jshint esversion:6, node:true*/
'use strict';

function itr(obj={}, cb=function(){}) {
    let index = 0, value;
    return Object.keys(obj).map((key) => {
        value = obj[key];
        return cb(value, key, obj, index++);
    });
}


module.exports = itr;
