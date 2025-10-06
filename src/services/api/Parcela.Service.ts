import { FindParcelas, PostParcelas, UpdateParcela, PostParcela } from "../../repository/api/Parcelas.Repository";
import { GetDataSensors } from "../../repository/external/Sensors.Repository";
import { ResponseHelper } from "../../types/api/ResponseHelper";
import { pool_mongo } from "../../connection/mongo";

export const ParcelaService = () => {
    return {
        postParcelas: async() => {
            const result = await GetDataSensors();
            const backup = await FindParcelas();

            if (backup.length > 0) {
                const parcelasMap = new Map(
                    backup.map(parcela => {
                        const key = `${Number(parcela.coords.lat).toFixed(6)},${Number(parcela.coords.lon).toFixed(6)}`;
                        return [key, parcela];
                    })
                );

                const apiParcelasKeys = new Set(
                    result.temperatura.map(p => 
                        `${Number(p.coords.lat).toFixed(6)},${Number(p.coords.lon).toFixed(6)}`
                    )
                );

                const parcelasToUpdate: any[] = [];
                const parcelasToInsert: any[] = [];
                const parcelasToDelete: any[] = [];

                for (const newParcela of result.temperatura) {
                    const key = `${Number(newParcela.coords.lat).toFixed(6)},${Number(newParcela.coords.lon).toFixed(6)}`;
                    const existingParcela = parcelasMap.get(key);

                    if (existingParcela) {
                        parcelasToUpdate.push({
                            _id: existingParcela._id,
                            value: newParcela.value,
                            unit: newParcela.unit,
                            timestamp: newParcela.timestamp,
                            isDeleted: false
                        });
                    } else {
                        parcelasToInsert.push({
                            ...newParcela,
                            isDeleted: false
                        });
                    }
                }

                for (const [key, parcela] of parcelasMap) {
                    if (!apiParcelasKeys.has(key) && !parcela.isDeleted) {
                        parcelasToDelete.push({
                            _id: parcela._id
                        });
                    }
                }

                const promises = [];
                
                if (parcelasToUpdate.length > 0) {
                    promises.push(
                        pool_mongo.collection('parcelas').bulkWrite(
                            parcelasToUpdate.map(p => ({
                                updateOne: {
                                    filter: { _id: p._id },
                                    update: { 
                                        $set: { 
                                            value: p.value, 
                                            unit: p.unit, 
                                            timestamp: p.timestamp,
                                            isDeleted: p.isDeleted
                                        } 
                                    }
                                }
                            }))
                        )
                    );
                }

                if (parcelasToInsert.length > 0) {
                    promises.push(PostParcelas(parcelasToInsert));
                }

                if (parcelasToDelete.length > 0) {
                    promises.push(
                        pool_mongo.collection('parcelas').bulkWrite(
                            parcelasToDelete.map(p => ({
                                updateOne: {
                                    filter: { _id: p._id },
                                    update: { 
                                        $set: { 
                                            isDeleted: true
                                        } 
                                    }
                                }
                            }))
                        )
                    );
                }

                await Promise.all(promises);

                const response: ResponseHelper = {
                    success: true,
                    message: `Parcelas procesadas: ${parcelasToUpdate.length} actualizadas, ${parcelasToInsert.length} insertadas, ${parcelasToDelete.length} eliminadas`,
                    data: result.temperatura
                };

                return response;
            } else {
                const parcelasWithDeleteFlag = result.temperatura.map(p => ({
                    ...p,
                    isDeleted: false
                }));
                
                const insertMany = await PostParcelas(parcelasWithDeleteFlag);
                const response: ResponseHelper = {
                    success: insertMany,
                    message: insertMany ? "Parcelas insertadas correctamente" : "Error al insertar parcelas",
                    data: insertMany ? result.temperatura : null
                };

                return response;
            }
        }
    };
};
