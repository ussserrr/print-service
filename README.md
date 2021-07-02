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

Create a TemplateFile:
```
curl -X POST -F 'operations={"query":"mutation CreateTemplateFile($file:Upload!) {\n  createTemplateFile(file:$file data:{templateTypeId:\"b1c1d8aa-5f07-4475-8719-a6dbb669b13e\"})\n {id title}}", "variables":{"file":null}}' -F 'map={"0":["variables.file"]}' -F '0=@/Users/chufyrev/Pictures/IMG_3184.JPG' http://localhost:4000/graphql
```

https://github.com/jaydenseric/graphql-upload#tips

TypeORM i18n notes: https://github.com/typeorm/typeorm/issues/1612

Build the Docker image:
```
docker build -t print-service .
```

Run the development Docker container:
```
docker-compose up
```

Install Nginx ingress for Kubernetes: https://kubernetes.github.io/ingress-nginx/deploy/

Deploy the development Kubernetes cluster:
```
kubectl apply -f k8s
```

To access the cluster use port 80 (e.g. http://localhost:80/graphql) (4000 for "raw" Docker container).

Shutdown this cluster:
```
kubectl delete -f k8s
```

Connect to streaming logs:
```
kubectl logs -f -lapp=print-service --all-containers=true
```

List pods:
```
kubectl get pods
```

Execute the command inside the particular pod:
```
kubectl exec print-service-deployment-797f9f96b6-847qc -- ls
```

Generate docs:
```
npx @compodoc/compodoc -p tsconfig.json -d docs --silent
```
