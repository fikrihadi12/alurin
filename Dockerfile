# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Gunakan schema Prisma PostgreSQL untuk production build
RUN cp prisma/schema.prod.prisma prisma/schema.prisma
RUN npx prisma generate

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 alurin

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/css ./css
COPY --from=builder /app/js ./js
COPY --from=builder /app/assets ./assets

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh && chown -R alurin:nodejs /app

USER alurin

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
