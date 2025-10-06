import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: mssql.config = {
    user: process.env.DB_USER_MSSQL || '',
    password: process.env.DB_PASSWORD_MSSQL || '',
    server: process.env.DB_SERVER_MSSQL || '',
    database: process.env.DB_DATABASE_MSSQL || '',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

export const pool_mssql = new mssql.ConnectionPool(config);