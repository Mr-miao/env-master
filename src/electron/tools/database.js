// const fs = require('fs');
const path = require('path');
const process = require("process");
const log = require('@/electron/tools/log')

const dbPath = path.resolve(process.cwd(),'env_master_db.db');

const knexConfig = {
    client: 'sqlite3', // or 'better-sqlite3'
    useNullAsDefault: true,
    connection: {
        filename: dbPath
    }
};

const knex = require('knex')(knexConfig);

function databaseSetup(){
    knex.schema.hasTable('strategies').then((exists) => {

        if(!exists){
            knex.schema.createTable('strategies', function (table) {
                table.string('ID').primary();
                table.string('StartegiesName');
                table.string('Description');
            }).then(() =>{
                log.info('create strategies success')
            }).catch((err) =>{
                log.error(err);
            });
        }
    })

    knex.schema.hasTable('strategy_details').then(function(exists) {
        if(!exists){

            knex.schema.createTable('strategy_details', function (table) {
                table.string('ID').primary();
                table.integer('Index', 2)
                table.string('StrategyID');
                table.string('AssociatedEnvironment');
                table.string('EnvironmentType');
                table.string('ExecutablePath');
                table.string('EnvironmentExecDetial');
                table.foreign('StrategyID').references('strategies.ID').onDelete('cascade');
            }).then(() =>{
                log.info('create strategy_details success');
            }).catch((err) =>{
                log.error(err);
            });
        }
    })

    knex.schema.hasTable('strategy_script').then(function(exists) {
        if(!exists){
            knex.schema.createTable('strategy_script', function (table) {
                table.string('ID').primary();
                table.string('StrategyDetailsID');
                table.string('Type');
                table.string('PriorExec');
                table.string('Script');
                table.foreign('StrategyDetailsID').references('strategy_details.ID').onDelete('cascade');
            }).then(() =>{
                log.info('create strategy_script success');
            }).catch((err) =>{
                log.error(err);
            });
        }
    })

}

function getKnex(){
    return knex;
}

/**
 * 关闭数据库
 */
function databaseClose() {
    knex.destroy();
}

module.exports = {
    databaseSetup,
    databaseClose,
    getKnex
};
