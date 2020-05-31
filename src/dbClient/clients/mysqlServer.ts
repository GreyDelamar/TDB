import mysql from 'mysql'
import { connectionConfig } from '@db/connection-provider'

export default class mysqlServer {
    public config: connectionConfig
    private connection: mysql.Connection
    public guiID: string

    constructor(config: connectionConfig, guiID: string) {
        this.guiID = guiID
        this.config = config

        this.connection = mysql.createConnection({
            host: this.config.server,
            user: this.config.username,
            password: this.config.password,
            // database: 'my_db'
        });
    }

    public newConnection(): mysql.Connection {
        this.connection.connect();

        /*this.connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results[0].solution);
        });*/
        
        return this.connection
    }

    public close() {
        // return this.connection.end();
    }

    public async getDatabases() {}
    public async getTables(databaseName: string, databaseGuiID: string) {}
    public async getColumns(databaseName: string, databaseGuiID: string, tableName: string, tableGuiID: string) {}
}