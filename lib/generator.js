/*jshint esversion:6, node:true*/
'use strict';

const mkdir = require('mkdir-promise');
const exists = require('fs-exists-promised');
const join = require('path').join;
const titleize = require('pretty-camel');
const write = require('./task-write');
const makeGUISchema = require('./makeGUISchema');
const Compiler = require('./template-compiler');
const transform = require('./task-transform');
const Files = require('expand-files');
const postProcessSchema = require('./post-process-schema');

/**
 * Generate templates from provided schema
 *
 * If `saveGuiSchema` is `true` then we will save
 * the intermediary JSON data we use to generate the
 * GUI. You can modify it manually and then call
 * `generateFromGUISchema`.
 *
 * @method generate
 * @param  {Object}  options                       JSON-schema
 * @param  {Object}  options.schema                JSON-schema
 * @param  {String}  options.templates             Source path
 * @param  {String}  options.target                Destination path
 * @param  {Object}  options.logger                Winston like logger
 * @param  {Boolean} [options.saveGuiSchema=false] Save intermediary
 *                                                 JSON file
 * @return {void}
 */
function generate(options) {

    let {
        schema,
        templates,
        target,
        saveGuiSchema = false,
        logger = console
    } = options;

    /*
     * Massage schema so we can use it.
     * This will drop unnecessary JSON-schema
     * related cruft and will also resolve
     * all references/relationships.
     */
    try {
        schema = transform(schema);
    } catch (error) {
        logger.error('Failed to transform schema');
        return Promise.reject(error);
    }

    if (!schema || schema.length === 0) {
        return Promise.reject(new Error('InvalidSchema: no items found'));
    }

    /*
     * This is the intermediary format
     * that we use to generate the views.
     */
    let guiSchema = makeGUISchema({
        schema,
        logger,
        debug: options.debug
    });

    /*
     * Once we have generated a GUI schema
     * we can apply transforms having all
     * data in place, like figuring out
     * actual relationship types.
     */
    guiSchema = postProcessSchema(guiSchema);

    if (!guiSchema || guiSchema.length === 0) {
        throw new Error('InvalidSchema: no items found');
    }

    logger.debug('generate schema from gui');

    return generateFromGUISchema({
        target,
        templates,
        saveGuiSchema,
        schema: guiSchema,
        logger: options.logger
    });
}

function generateFromGUISchema(config) {
    let {
        schema,
        templates,
        target,
        saveGuiSchema = false,
        logger = console
    } = config;

    if (saveGuiSchema) {
        saveFile(schema, target);
    }

    logger.debug('generate gui schema');

    return processModels({
        logger,
        target,
        templates,
        models: schema,
    });
}

function processModels(config) {
    let {
        models,
        templates,
        target,
        logger = console
    } = config;

    let out = [];

    models.map(model => {
        out.push(processModel({
            model,
            templates,
            target,
            logger
        }));
    });

    return Promise.all(out).catch(err => {
        logger.error('Error processing models...');
        logger.error(err);
        return err;
    });
}

function processModel(config) {
    let options;

    let { model, templates, target, logger } = config;

    let modelpath = join(target, model.identity);

    return Promise.all([
        mkdir(modelpath),
        filterModel(model),
    ]).then(([_, model]) => {

        logger.debug('\nCreated directory "%s": %s', model.identity, modelpath);
        logger.debug('pattern: "%s"', Compiler.pattern);
        logger.debug('templates path "%s", file:', templates);

        options = Files({
            cwd: templates
        });

        let files = options.expand({
            mapDest: true,
            dest: modelpath,
            src: Compiler.pattern,
        }).files;

        files.map(file => {

            if (!file.src || file.src.length === 0) {
                logger.warn('Could not find templates for model', model.identity);
            }

            file.src.map(src => {
                logger.debug('  - Process file "%s"', src);

                let content = Compiler.parse(src, model);
                if (typeof content === 'string') write(file.dest, content);
                else {
                    logger.error(content);
                }
            });
        });

    });
}

function filterModel(model) {
    return Promise.resolve(model);
}

module.exports = generate;
module.exports.generateFromGUISchema = generateFromGUISchema;


function saveFile(schema, target, filename = 'gui-schema.json') {
    const fs = require('fs');
    const path = require('path');

    target = path.resolve(target);

    const filepath = path.join(target, filename);
    fs.writeFileSync(filepath, JSON.stringify(schema, null, 4), 'utf-8');
}