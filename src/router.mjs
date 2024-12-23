import hkpost from "./hkpost.mjs";
import datagovhk from "./data-gov-hk.mjs";

/**
 *
 * @param {import('fastify').FastifyRequest}  request
 * @param {import('fastify').FastifyReply} reply
 * @returns {Promise<void>}
 * @constructor
 */
const AuthToken = async (request, reply) => {
    if (!process.env.AUTH_TOKEN) {
        return;
    }
    const {headers} = request;
    const AuthHeader = headers['authorization'];
    if (AuthHeader && AuthHeader === process.env.AUTH_TOKEN) {
        return;
    }
    console.error("Unauthorized");
    return reply.send({
        text: "Unauthorized",
    }, 406)
}

/**
 *  @param {import('fastify').FastifyInstance} app
 */
const installRoutes = (app) => {

    app.get("/", {
        schema: {
            hide: true,
        },
    }, async (request, reply) => {
        return reply.redirect('/swagger');
    })

    app.get('/api/format', {
        preHandler: AuthToken,
        schema: {
            security: process.env.AUTH_TOKEN ? [{bearerAuth: []}] : undefined,
            tags: ['DATAGOVHK'],
            summary: '查找符合格式的HK地址',
            consumes: ['application/json'],
            querystring: {
                type: 'object',
                properties: {
                    address: {
                        type: 'string',
                        description: '地址',
                    },
                }
            },
            response: {
                default: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            description: '是否成功',
                        },
                        result: {
                            type: 'array',
                            description: '結果',
                            items: {
                                type: 'object',
                                properties: {
                                    addr_block: {
                                        type: 'string',
                                        description: '區域',
                                    },
                                    addr_bldg: {
                                        type: 'string',
                                        description: '大廈/建築名稱',
                                    },
                                    addr_st_no: {
                                        type: 'string',
                                        description: '門牌號碼',
                                    },
                                    addr_st_name: {
                                        type: 'string',
                                        description: '街道名稱',
                                    },
                                    addr_estate: {
                                        type: 'string',
                                        description: '屋邨名稱',
                                    },
                                    addr_district: {
                                        type: 'string',
                                        description: '地區',
                                    },
                                    score: {
                                        type: 'number',
                                        description: '相似度 100满分',
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const {address} = request.query;
            const result = await datagovhk.lookup(address);
            return reply.send({
                status: true,
                result,
            });
        }
    })

    app.get('/api/lookup', {
        preHandler: AuthToken,
        schema: {
            security: process.env.AUTH_TOKEN ? [{bearerAuth: []}] : undefined,
            tags: ['HKPost'],
            summary: '透過此 API 尋找正確的香港地址',
            consumes: ['application/json'],
            querystring: {
                type: 'object',
                properties: {
                    street: {
                        type: 'string',
                        description: '街道或者屋邨名(不帶編號)',
                    },
                    building: {
                        type: 'string',
                        description: '樓宇/大廈/建築名稱'
                    },
                    estate: {
                        type: 'string',
                        description: '屋邨名稱'
                    },
                }
            },
            response: {
                default: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            description: '是否成功',
                        },
                        result: {
                            type: 'array',
                            description: '結果',
                            items: {
                                type: 'object',
                                properties: {
                                    district: {
                                        type: 'string',
                                        description: '地區',
                                    },
                                    street: {
                                        type: 'string',
                                        description: '街道',
                                    },
                                    building: {
                                        type: 'string',
                                        description: '大廈/建築名稱',
                                    },
                                    score: {
                                        type: 'number',
                                        description: '相似度',
                                    }
                                }
                            }
                        },
                        error: {
                            type: 'string',
                            description: '錯誤信息',
                        },
                    }
                }
            }
        },
    }, async (request, reply) => {

        let {street, building, estate} = request.query;

        street = (street || "").replace(/(rd|road|st|street)$/ig, '')
        building = (building || "").replace(/(house|building)$/ig, '')
        estate = (estate || "").replace(/(estate|villa|village)$/ig, '')

        console.log({
            street,
            building,
            estate,
        });

        try {
            let result = [];

            let keys = Array.from(new Set([building, estate].map(row => {
                return row.replace(/(the|park|tower)/ig, '').split(/\W+/);
            }).flat(1))).filter(row => row);

            let found_in_street = false;
            if (street) {
                if (keys.length === 0) {
                    keys = [""];
                }
                result = await Promise.all(keys.map(key => {
                    return hkpost.getStreetAddress({
                        street,
                        key,
                    });
                }));
                let street_result = result.filter((row) => {
                    return row instanceof Array && row.length > 0;
                });
                if (street_result.length > 0) {
                    found_in_street = true;
                }
            }

            // console.log('street result', result);

            if (!found_in_street) {
                keys = [building, estate].map(row => {
                    return row.replace(/(the|park|tower)/ig, '').trim();
                }).filter(row => row);

                if (keys.length > 0) {
                    result = await Promise.all(keys.map(key => {
                        return hkpost.getBuildingAddress({
                            building: key,
                        });
                    }));
                }
            }

            // console.log('building result', result);

            // 打散並合併
            let mappings = result.filter((row) => {
                return row instanceof Array && row.length > 0;
            }).reduce((prev, curr) => {
                return prev.concat(curr);
            }, []).map(row => {
                let district = row["District-en"] || "";
                let street = row["Street-en"] || "";
                let building = row["Building-en"] || "";

                return [`${district}${street}${building}`, row];
            });
            // 去重
            result = Object.values(Object.fromEntries(mappings));
            // 計算相似度并排序
            keys = keys.map(row => {
                return row.split(/\W+/);
            }).flat(1).filter(row => {
                return row;
            });
            console.log(`search keys`, keys);

            result = result.map((item => {
                let copyItem = {
                    ...item,
                    "District-en": "",
                    "District-zh": "",
                };
                const score = hkpost.scoreStrings(keys, JSON.stringify(copyItem));
                return {
                    ...item,
                    score,
                };
            })).sort((a, b) => {
                return b.score - a.score;
            });

            console.log(result);

            if (result instanceof Array && result.length > 0) {
                return reply.status(200).send({
                    status: true,
                    result: result.map((row) => {
                        return {
                            district: row["District-en"] || "",
                            street: row["Street-en"] || "",
                            building: row["Building-en"] || "",
                            score: row["score"] || 0,
                        }
                    }),
                });
            } else {
                return reply.status(200).send({
                    status: false,
                    error: "找不到相關地址",
                });
            }

        } catch (e) {
            return reply.status(500).send({
                status: false,
                error: e.message,
            });
        }

    });
};

export {
    installRoutes,
}
