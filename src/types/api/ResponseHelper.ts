import { Response } from 'express';

export interface ResponseHelper {
    success: boolean;
    message: string;
    data?: any;
}

export class ResponseHelperClass {
    static success(res: Response, data: any, message: string = 'Operación exitosa', statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res: Response, message: string = 'Error en la operación', statusCode: number = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }
}