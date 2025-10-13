import { ObjectId } from "mongodb";

export type SensorType = 'temperatura' | 'humedad' | 'lluvia' | 'radiacion_solar';

export interface SensorData {
    value: number;
    unit: string;
    timestamp: Date;
    coords: {
        lat: number;
        lon: number;
    };
    type: SensorType;
    isDeleted?: boolean;
}

export interface MongoSensorData extends SensorData {
    _id: ObjectId;
}

export interface GroupedSensorData {
    _id?: ObjectId;
    coords: {
        lat: number;
        lon: number;
    };
    sensores: {
        temperatura?: SensorData[];
        humedad?: SensorData[];
        lluvia?: SensorData[];
        radiacion_solar?: SensorData[];
    };
    timestamp: Date;
    isDeleted?: boolean;
}

export interface SensorResponse {
    temperatura: SensorData[];
    humedad: SensorData[];
    lluvia: SensorData[];
    radiacion_solar: SensorData[];
}

export interface GroupedSensorResponse {
    data: GroupedSensorData[];
    total: number;
    coordenadas_unicas: number;
}