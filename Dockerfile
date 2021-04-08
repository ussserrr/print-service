FROM node:12-alpine
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
# Fonts for correct slavic languages, Java is not necessary but otherwise LibreOffice will print annoying messages
RUN apk add libreoffice ttf-linux-libertine ttf-liberation openjdk8-jre
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
