import { pool_mongo } from "../../connection/mongo";
import { SensorData } from "../../types/external/Sensors.type";
import { MongoSensorData } from "../../types/external/Sensors.type";
import { ObjectId } from "mongodb";

export const UpdateParcela = async (id: string, updatedData: Partial<SensorData>) => {
    try {
        const result = await pool_mongo.collection('parcelas').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );
        return result;
    } catch (error) {
        throw new Error("Error al actualizar parcela: " + error);
    }
};  

export const FindParcelas = async () => {
    try {
        const parcelas = await pool_mongo.collection<MongoSensorData>('parcelas').find().toArray();
        return parcelas;
    } catch (error) {
        throw new Error("Error al buscar parcelas: " + error);
    }
};

export const PostParcela = async (Parcela: SensorData) => {
    try {
        await pool_mongo.collection('parcelas').insertOne(Parcela);
    } catch (error) {
        throw new Error("Error al insertar nueva parcela: " + error);
    }
};

export const PostParcelas = async (Parcelas: SensorData[]) => {
    try {
        const response = await pool_mongo.collection('parcelas').insertMany(Parcelas);
        return response.acknowledged;
    } catch (error) {
        throw new Error("Error al insertar nuevas parcelas: " + error);
    }
};
