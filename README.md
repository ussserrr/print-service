## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Create a file:
```
curl -X POST -F 'operations={"query":"mutation CreateTemplateFile($file:Upload!) {\n  createTemplateFile(file:$file data:{templateTypeId:\"b1c1d8aa-5f07-4475-8719-a6dbb669b13e\"})\n {id title}}", "variables":{"file":null}}' -F 'map={"0":["variables.file"]}' -F '0=@/Users/chufyrev/Pictures/IMG_3184.JPG' http://localhost:3000/graphql
```

https://github.com/jaydenseric/graphql-upload#tips
