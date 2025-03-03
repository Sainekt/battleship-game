FROM node:23-bookworm AS base

# ================ Dependencies ================
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci && npm cache clean --force


# ================ Build stage  ================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ================ Execution    ================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV TZ ${TZ:-Europe/Moscow}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

RUN npm install --no-save next socket.io jose mysql2

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/migrations.js ./migrations.js
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

USER nextjs

# 80
EXPOSE 80 

ENV PORT 80
ENV HOSTNAME "0.0.0.0"

CMD ["sh", "./start.sh"] 
