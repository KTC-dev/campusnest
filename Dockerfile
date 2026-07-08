FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY . /app

RUN if [ -f /app/backend/package.json ]; then \
    cd /app/backend && npm ci --ignore-scripts && npx prisma generate && npm run build; \
    elif [ -f /app/package.json ]; then \
    npm ci --ignore-scripts && npx prisma generate && npm run build; \
    else \
    echo "No backend package.json found" && exit 1; \
    fi

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "if [ -f /app/backend/package.json ]; then cd /app/backend && npx prisma migrate deploy && node dist/server.js; elif [ -f /app/package.json ]; then npx prisma migrate deploy && node dist/server.js; else echo 'No backend package.json found' && exit 1; fi"]