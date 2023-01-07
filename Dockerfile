FROM node:18-alpine
WORKDIR /app
COPY ./package*.json .
COPY ./dist ./dist
RUN npm install serve -g
CMD ["serve", "dist"]