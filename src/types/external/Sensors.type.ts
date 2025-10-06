import { ObjectId } from "mongodb";

export interface SensorData {
    value: number;
    unit: string;
    timestamp: Date;
    coords: {
        lat: number;
        lon: number;
    };
    isDeleted?: boolean;
}

export interface MongoSensorData extends SensorData {
    _id: ObjectId;
}

export interface SensorResponse {
    temperatura: SensorData[];
}