FROM node:23.3.0-alpine AS base

# ================ Dependencies ================
FROM base AS deps
WORKDIR /app

RUN apk --no-cache add --virtual builds-deps build-base python3
COPY package.json package-lock.json ./

RUN npm ci && npm cache clean --force
RUN npm rebuild bcrypt --build-from-source


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

RUN npm install --no-save next socket.io

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Custom server
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

USER nextjs

# 80
EXPOSE 80 

ENV PORT 80
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
