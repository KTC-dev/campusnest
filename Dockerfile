FROM node:20-alpine

WORKDIR /app
COPY . /app

RUN if [ -f /app/backend/package.json ]; then \
    cd /app/backend && npm ci && npx prisma generate && npm run build; \
    else \
    npm ci && npx prisma generate && npm run build; \
    fi

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "if [ -f /app/backend/package.json ]; then cd /app/backend && npm run start; else npm run start; fi"]
