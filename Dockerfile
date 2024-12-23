FROM node:18-alpine

WORKDIR /app/hkpost-correct-addr-proxy

COPY ./dist/bundle.cjs /app/hkpost-correct-addr-proxy/bundle.cjs
COPY ./package.json /app/hkpost-correct-addr-proxy/package.json

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && apk add --no-cache dumb-init \
  && echo "nodeLinker: node-modules" > /app/hkpost-correct-addr-proxy/.yarnrc.yml \
  && yarn set version stable \
  && yarn workspaces focus --production \
  && rm -Rf ./.yarn \
  && chown nextjs:nodejs -Rf /app/hkpost-correct-addr-proxy

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
  TZ=Asia/Hong_Kong \
  NODE_ENV=production \
  API_ENDPOINT=https://webapp.hongkongpost.hk/correct_addressing \
  GEO_GOV_HK_ENDPOINT=https://geodata.gov.hk/gs/api/v1.0.0 \
  AUTH_TOKEN=

ENTRYPOINT ["dumb-init", "--"]

CMD node -- ./bundle.cjs
