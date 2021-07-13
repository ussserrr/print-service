FROM node:16-alpine
# Fonts for correct slavic languages
# Java is not necessary but otherwise LibreOffice will print annoying messages
RUN apk add libreoffice-writer ttf-linux-libertine ttf-liberation openjdk8-jre
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:dev"]
