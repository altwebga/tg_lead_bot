FROM oven/bun:alpine

WORKDIR /app

COPY package*.json ./
RUN bun install --production

COPY dist ./dist

CMD ["node", "dist/bot.js"]