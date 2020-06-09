"use strict";
import mysql from 'mysql'
import { v4 } from 'uuid';
import { connectionConfig } from '@db/connection-provider'

export default class mysqlServer {
    private pool: mysql.Pool
    public guiID: string
    public config: connectionConfig

    constructor(config: connectionConfig, guiID: string) {
        this.guiID = guiID
        this.config = config

        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: this.config.server,
            user: this.config.username,
            password: this.config.password,
            // database: 'my_db'
        })
    }

    private generateUUID() {
      return v4()
    }

    public newConnection(): Promise<mysql.PoolConnection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                  return reject(err)
                }

                resolve(connection)
            })
        })
    }

    public close() {
      return this.pool.end()
    }

    public async runQuery(query: string): Promise<queryResults> {
      const conn = await this.newConnection()

      return <queryResults>await new Promise((resolve, reject) => {
        conn.query(query, async (err, results) => {
          if (err) {
            reject(err)
          }

          const currentQueryResults = {
            recordsets: (Array.isArray(results[0]) ? results : [results])
          }

          resolve(currentQueryResults)
        })
      })
    }

    public async getDatabases() {
        const conn = await this.newConnection()
        const ignoredSystemDatabases = [
          'sys',
          'information_schema',
          'performance_schema'
        ]

        return new Promise((resolve, reject) => {
            conn.query("SHOW DATABASES;", async (err, results) => {
                if (err) reject(err)

                let returnResults = []
                for(var index in results) {
                    const dbRow = results[index];

                    if(ignoredSystemDatabases.includes(dbRow.Database)) {
                      // avoid including system databases
                      continue
                    }

                    returnResults.push({
                        name: dbRow.Database,
                        guiID: this.generateUUID(),
                        guiType: 'database',
                        serverGuiID: this.guiID,
                        children:[{ "name": "Loading..." }]
                    })
                }

                resolve(returnResults)
                conn.destroy()
            })
        })
    }
    public async getTables(databaseName: string, databaseGuiID: string) {
        const conn = await this.newConnection()

        const query = `
          SELECT
            TABLE_NAME AS _table_name
          FROM
            INFORMATION_SCHEMA.TABLES
          WHERE
            TABLE_SCHEMA = '${databaseName}'
        `
        return new Promise((resolve, reject) => {
          conn.query(query, async (err, results) => {
                if (err) reject(err)

                let returnResults = []
                for (var index in results) {
                    const dbRow = results[index];

                    returnResults.push({
                        name: dbRow._table_name,
                        guiID: this.generateUUID(),
                        guiType: 'table',
                        serverGuiID: this.guiID,
                        databaseName: databaseName,
                        databaseGuiID: databaseGuiID,
                        children: [{ "name": "Loading..." }],
                    })
                }

                resolve(returnResults)
                conn.destroy()
            })
        })
    }
    public async getColumns(databaseName: string, databaseGuiID: string, tableName: string, tableGuiID: string) {
      const conn = await this.newConnection()

      const query = `
        SHOW COLUMNS FROM ${databaseName}.${tableName};
      `
      return new Promise((resolve, reject) => {
        conn.query(query, async (err, results) => {
          if (err) reject(err)

          let returnResults = []
          for (var index in results) {
            const dbRow = results[index];

            returnResults.push({
              name: dbRow.Field,
              dataType: dbRow.Type,
              nullable: dbRow.Null,
              constraintType: dbRow.Key,
              guiID: this.generateUUID(),
              guiType: 'columns',
              serverGuiID: this.guiID,
              databaseGuiID: databaseGuiID
            })
          }

          resolve(returnResults)
          conn.destroy()
        })
      })
    }
}