FROM node:25.7.0-alpine

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm install pnpm -g
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 4173

CMD ["pnpm", "start"]
