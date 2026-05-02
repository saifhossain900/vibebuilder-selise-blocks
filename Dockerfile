FROM node:21.7.0-alpine AS app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ci_build=dev

RUN mkdir -p /app/log

RUN if [ -z "$ci_build" ]; then npm run build; else npm run build:${ci_build}; fi

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "80"]