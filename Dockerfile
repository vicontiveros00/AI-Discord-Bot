FROM node:18-alpine3.17
WORKDIR /app
COPY package*.json ./
RUN npm i -g typescript 
RUN npm ci --omit=dev
COPY . .
# Check if the .env file exists
RUN test -f .env || echo "Warning: .env file is missing!"
CMD [ "npm", "run", "start" ]
