FROM node:25.7.0-alpine

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm install pnpm -g
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
