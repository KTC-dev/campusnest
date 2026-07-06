FROM node:20-alpine

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "start"]
