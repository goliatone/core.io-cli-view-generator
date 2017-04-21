'use strict';

module.exports = require('./lib/generator');

module.exports.generateFromGUISchema = requrie('./lib/generator').generateFromGUISchema;

module.exports.CompileCommand = require('./commands/compile');

module.exports.GenerateCommand = require('./commands/generate');
