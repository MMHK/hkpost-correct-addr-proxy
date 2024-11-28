import hkpost from "./hkpost.mjs";

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

    app.get('/api/lookup', {
        preHandler: AuthToken,
        schema: {
            security: process.env.AUTH_TOKEN ? [{ bearerAuth: [] }] : undefined,
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
                    key : {
                        type: 'string',
                        description: '大廈/建築名稱'
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

      let { street, key } = request.query;

      street = street.replace(/(rd|road|st|street)$/ig, '')

      try {
          const result = await hkpost.correctAddressing({
              street,
              key,
          })
          if (result instanceof Array && result.length > 0) {
              return reply.status(200).send({
                  status: true,
                  result: result.map((row) => {
                      return {
                          district: row["District-en"] || "",
                          street: row["Street-en"] || "",
                          building: row["Building-en"] || "",
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
