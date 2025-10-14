import { FindParcelas, PostParcelas, UpdateParcela, PostParcela } from "../../repository/api/Parcelas.Repository";
import { GetDataSensors, GetGroupedDataSensors } from "../../repository/external/Sensors.Repository";
import { ResponseHelper } from "../../types/api/ResponseHelper";
import { SensorData, SensorType } from "../../types/external/Sensors.type";
import { pool_mongo } from "../../connection/mongo";

let pollingInterval: NodeJS.Timeout | null = null;
let isPolling: boolean = false;

export const ParcelaService = () => {
    const postParcelasInternal = async() => {
            const result = await GetDataSensors();
            const backup = await FindParcelas();
            
            const allSensors: SensorData[] = [
                ...(result.temperatura?.map(s => ({ ...s, type: 'temperatura' as SensorType })) || []),
                ...(result.humedad?.map(s => ({ ...s, type: 'humedad' as SensorType })) || []),
                ...(result.lluvia?.map(s => ({ ...s, type: 'lluvia' as SensorType })) || []),
                ...(result.radiacion_solar?.map(s => ({ ...s, type: 'radiacion_solar' as SensorType })) || [])
            ];

            if (backup.length > 0) {
                const parcelasMap = new Map(
                    backup.map(parcela => {
                        const key = `${Number(parcela.coords.lat).toFixed(6)},${Number(parcela.coords.lon).toFixed(6)},${parcela.type || 'temperatura'}`;
                        return [key, parcela];
                    })
                );

                const apiParcelasKeys = new Set(
                    allSensors.map(p => 
                        `${Number(p.coords.lat).toFixed(6)},${Number(p.coords.lon).toFixed(6)},${p.type}`
                    )
                );

                const parcelasToUpdate: any[] = [];
                const parcelasToInsert: any[] = [];
                const parcelasToDelete: any[] = [];

                // Procesar todos los sensores de todos los tipos
                for (const newParcela of allSensors) {
                    const key = `${Number(newParcela.coords.lat).toFixed(6)},${Number(newParcela.coords.lon).toFixed(6)},${newParcela.type}`;
                    const existingParcela = parcelasMap.get(key);

                    if (existingParcela) {
                        parcelasToUpdate.push({
                            _id: existingParcela._id,
                            value: newParcela.value,
                            unit: newParcela.unit,
                            timestamp: newParcela.timestamp,
                            type: newParcela.type,
                            isDeleted: false
                        });
                    } else {
                        parcelasToInsert.push({
                            ...newParcela,
                            isDeleted: false
                        });
                    }
                }

                // Marcar como eliminadas las parcelas que ya no están en la API
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
                                            type: p.type,
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
                    data: {
                        sensores_procesados: {
                            temperatura: result.temperatura?.length || 0,
                            humedad: result.humedad?.length || 0,
                            lluvia: result.lluvia?.length || 0,
                            radiacion_solar: result.radiacion_solar?.length || 0
                        },
                        total_sensores: allSensors.length,
                        operaciones: {
                            actualizadas: parcelasToUpdate.length,
                            insertadas: parcelasToInsert.length,
                            eliminadas: parcelasToDelete.length
                        }
                    }
                };

                return response;
            } else {
                // Si no hay backup, insertar todos los sensores
                const parcelasWithDeleteFlag = allSensors.map(p => ({
                    ...p,
                    isDeleted: false
                }));
                
                const insertMany = await PostParcelas(parcelasWithDeleteFlag);
                const response: ResponseHelper = {
                    success: insertMany,
                    message: insertMany ? `${allSensors.length} sensores de 4 tipos insertados correctamente` : "Error al insertar parcelas",
                    data: insertMany ? {
                        sensores_insertados: {
                            temperatura: result.temperatura?.length || 0,
                            humedad: result.humedad?.length || 0,
                            lluvia: result.lluvia?.length || 0,
                            radiacion_solar: result.radiacion_solar?.length || 0
                        },
                        total_sensores: allSensors.length
                    } : null
                };

                return response;
            }
        };

    return {
        postParcelas: postParcelasInternal,

        // Iniciar sincronización automática cada 10 segundos
        startAutoSync: () => {
            if (isPolling) {
                console.log('La sincronización automática ya está activa');
                return;
            }

            console.log(' Iniciando sincronización automática de parcelas cada 10 segundos...');
            isPolling = true;

            // Ejecutar inmediatamente la primera vez
            postParcelasInternal()
                .then(result => {
                    console.log(`[${new Date().toISOString()}]  Primera sincronización completada`);
                })
                .catch(error => {
                    console.error(`[${new Date().toISOString()}]  Error en primera sincronización:`, error);
                });

            // Configurar el intervalo de 10 segundos
            pollingInterval = setInterval(async () => {
                try {
                    const result = await postParcelasInternal();
                    console.log(`[${new Date().toISOString()}] ${result.message}`);
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Error en sincronización automática:`, error);
                }
            }, 10000);
        },

        // Detener sincronización automática
        stopAutoSync: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                isPolling = false;
                console.log('Sincronización automática detenida');
            }
        },

        // Obtener estado del polling
        getPollingStatus: () => {
            return {
                isActive: isPolling,
                message: isPolling ? 'Sincronización activa' : 'Sincronización inactiva'
            };
        },

        // Nuevo método para obtener datos agrupados
        getGroupedParcelas: async() => {
            try {
                const groupedData = await GetGroupedDataSensors();
                const response: ResponseHelper = {
                    success: true,
                    message: "Datos agrupados obtenidos exitosamente",
                    data: groupedData
                };
                return response;
            } catch (error) {
                const response: ResponseHelper = {
                    success: false,
                    message: `Error al obtener datos agrupados: ${error}`,
                    data: null
                };
                return response;
            }
        }
    };
};