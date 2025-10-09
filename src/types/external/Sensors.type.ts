import { ObjectId } from "mongodb";

export interface SensorData {
    _id: string;
    value: number;
    unit: string;
    timestamp: string;
    coords: {
        lat?: number;
        lon?: number;
        lng?: number;
    };
    type: "temperatura" | "humedad" | "lluvia";
    isDeleted: boolean;
}

export interface MongoSensorData {
    _id: ObjectId;
    value: number;
    unit: string;
    timestamp: string;
    coords: {
        lat?: number;
        lon?: number;
        lng?: number;
    };
    type: "temperatura" | "humedad" | "lluvia";
    isDeleted: boolean;
}

export interface SensorResponse {
    data: SensorData[];
    total: number;
}

export interface SensorQueryParams {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}