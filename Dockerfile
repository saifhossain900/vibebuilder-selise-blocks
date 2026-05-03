FROM node:21.7.0-alpine AS app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/log

RUN printf "VITE_BLOCKS_API_URL=https://api.seliseblocks.com\nVITE_API_BASE_URL=https://api.seliseblocks.com\nVITE_X_BLOCKS_KEY=D148485e5f90d407c8acd31e8282ea189\nVITE_CAPTCHA_SITE_KEY=\nVITE_CAPTCHA_TYPE=\nVITE_PROJECT_SLUG=dbdsqr\n" > .env

RUN npm run build

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "80"]