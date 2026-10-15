FROM node:22-bookworm
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/src/main.js"]
