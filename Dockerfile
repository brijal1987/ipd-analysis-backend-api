FROM node:14.11.0-alpine3.11

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

EXPOSE 9000

CMD [ "node", "src/app.js" ]
