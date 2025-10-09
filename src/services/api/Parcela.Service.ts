import { FindParcelas, PostParcelas, UpdateParcela, PostParcela } from "../../repository/api/Parcelas.Repository";
import { GetDataSensors } from "../../repository/external/Sensors.Repository";
import { ResponseHelper } from "../../types/api/ResponseHelper";
import { pool_mongo } from "../../connection/mongo";

export const ParcelaService = () => {
    return {
        getParcelas: async() => {
            try {
                const parcelas = await FindParcelas();
                const activeParcelas = parcelas.filter(p => !p.isDeleted);
                
                // Transformar los datos al formato que espera el frontend
                const groupedData = activeParcelas.map(parcela => {
                    const timestamp = typeof parcela.timestamp === 'string' ? parcela.timestamp : new Date(parcela.timestamp).toISOString();
                    return {
                        coords: {
                            lat: parcela.coords.lat,
                            lon: parcela.coords.lon
                        },
                        sensores: {
                            temperatura: [{
                                value: parcela.value,
                                unit: parcela.unit,
                                timestamp: timestamp,
                                coords: parcela.coords,
                                type: "temperatura"
                            }]
                        },
                        timestamp: timestamp,
                        isDeleted: parcela.isDeleted || false
                    };
                });
                
                const response: ResponseHelper = {
                    success: true,
                    message: `${activeParcelas.length} parcelas encontradas`,
                    data: groupedData
                };

                return response;
            } catch (error) {
                const response: ResponseHelper = {
                    success: false,
                    message: "Error al obtener parcelas: " + error,
                    data: null
                };
                
                return response;
            }
        },
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
                    result.data.map((p: any) => 
                        `${Number(p.coords.lat).toFixed(6)},${Number(p.coords.lon).toFixed(6)}`
                    )
                );

                const parcelasToUpdate: any[] = [];
                const parcelasToInsert: any[] = [];
                const parcelasToDelete: any[] = [];

                for (const newParcela of result.data) {
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
                    data: result.data
                };

                return response;
            } else {
                const parcelasWithDeleteFlag = result.data.map((p: any) => ({
                    ...p,
                    isDeleted: false
                }));
                
                const insertMany = await PostParcelas(parcelasWithDeleteFlag);
                const response: ResponseHelper = {
                    success: insertMany,
                    message: insertMany ? "Parcelas insertadas correctamente" : "Error al insertar parcelas",
                    data: insertMany ? result.data : null
                };

                return response;
            }
        },
        getParcelasWithResponsables: async() => {
            // Temporalmente, usar la misma lógica que getParcelas (que funcionaba)
            try {
                const parcelas = await FindParcelas();
                const activeParcelas = parcelas.filter(p => !p.isDeleted);
                
                // Transformar al mismo formato que getParcelas pero agregando los campos de responsables
                const groupedData = activeParcelas.map(parcela => {
                    const timestamp = typeof parcela.timestamp === 'string' ? parcela.timestamp : new Date(parcela.timestamp).toISOString();
                    return {
                        coords: {
                            lat: parcela.coords.lat,
                            lon: parcela.coords.lon
                        },
                        sensores: {
                            temperatura: [{
                                value: parcela.value,
                                unit: parcela.unit,
                                timestamp: timestamp,
                                coords: parcela.coords,
                                type: "temperatura"
                            }]
                        },
                        timestamp: timestamp,
                        isDeleted: parcela.isDeleted || false,
                        // Campos adicionales para responsables (vacíos por ahora)
                        _id: parcela._id.toString(),
                        sqlData: null,
                        hasResponsable: false,
                        responsable: null,
                        nombre: null
                    };
                });
                
                const response: ResponseHelper = {
                    success: true,
                    message: `${activeParcelas.length} parcelas encontradas`,
                    data: groupedData
                };

                return response;
            } catch (error) {
                const response: ResponseHelper = {
                    success: false,
                    message: "Error al obtener parcelas: " + error,
                    data: null
                };
                
                return response;
            }
        }
    };
};
