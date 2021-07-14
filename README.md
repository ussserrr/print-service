## Print service
Web system to store, manage and print DOCX templates. Supplied with the frontend [control panel](https://github.com/ussserrr/print-cms).


## Technologies overview
 - Latest & greatest NodeJS (v16 atm)
 - Core – modern yet popular NestJS framework:
   - Highly active community
   - Large plugins base
 - 100% latest TypeScript-powered
 - GraphQL Web API (NestJS feature):
   - Versatile request-response communication
   - Metadata, errors and extensions (warnings)
   - Schema-first approach – schema is a source of truth for all underlying layers
 - Database – PostgreSQL
 - ORM – TypeORM (by NestJS):
   - Auto-generates described schemas
   - Strongly typed
   - Create/update/remove etc. events triggers
 - Template files actual storage – file-system mount point:
   - Can be a dedicated hard drive, network disk or just a local directory – just provide a path as an ENV variable
   - Human-readable file structure – all files/foldres are named in respect to user input (with a proper sanitizing, of course) so the storage can be easily observed just by looking at a file explorer. Kept in-sync with possible renaming.
 - Templates filling (fields substitution): Docxtemplater package – time-proven solution
 - Printing to PDF by LibreOffice:
   - On-demand execution by native NodeJS `child_process` API as a separate forked non-blocking process
   - Easily installable by any popular Linux package manager
   - Convenient CLI
   - 3rd-party fonts support
   - Free & open modular software
 - Print jobs queue:
   - Powered by Redis DB
   - NestJS-recommended Bull queue NodeJS package
   - Asynchronous running
   - Full support for distributed multi-instance configurations and unexpected processes crashes
   - Set number of attempts
   - Straightforward monitoring by any 3rd-party tool, shipped with Web GUI Bull-board
 - Background job for a temp files/jobs cleanups
 - Server-sent events (SSE) API to notify clients about requested jobs progress/results
 - Simple HTML home page is returned on root URL endpont to help a user find their way
 - Documentation by Compodoc:
   - Complete Web static assets folder generation based on developer JSDocs (utilize existing controller)
   - Zero-touching dependencies/relations graphs rendering
 - Docker/Kubernetes proof-of-concept configuration provided (see a diagram below):
   - Ingress Nginx is catching requests at the entrance and route them to corresponding services. Also, acts as a load-balancer
   - Deployment of each service (front- and backend) describes a number of instances (replicas) and hydrates containers with ENV variables


## Kubernetes cluster architecture
![diagram](/k8s/cluster-diagram.png)


## Install & build
This project is a NestJS project and fully compilant with its CLI. Refer to Nest documentation on how to perform common tasks.


## Running the app
Development mode:
```bash
$ npm run prebuild && NODE_ENV=development npm run start:dev
```

In production, intended to be deployed on the Kubernetes cluster (see a diagram above):
```bash
$ kubectl apply -f k8s/prod -f k8s/ingress.yaml -f k8s/service.yaml
```


## Useful commands
These commands were used on different stages of development

### Create new TemplateFile via curl:
```bash
$ curl -X POST -F 'operations={"query":"mutation CreateTemplateFile($file:Upload!) {\n  createTemplateFile(file:$file data:{templateTypeId:\"b1c1d8aa-5f07-4475-8719-a6dbb669b13e\"})\n {id title}}", "variables":{"file":null}}' -F 'map={"0":["variables.file"]}' -F '0=@/Users/chufyrev/Pictures/IMG_3184.JPG' http://localhost/api/graphql
```

### Build a Docker image:
```bash
# development
$ docker build -t print-service .

# production
$ docker build -t print-service-prod -f Dockerfile.prod .
```

### Run the development Docker container:
```bash
$ docker-compose up
```

### Shutdown a cluster:
```bash
$ kubectl delete -f k8s/prod -f k8s/ingress.yaml -f k8s/service.yaml
```

### Connect to service logs stream:
```bash
$ kubectl logs -f -lapp=print-service --all-containers=true
```

### List pods:
```bash
$ kubectl get pods
```

### Execute a command inside the particular pod:
```
$ kubectl exec print-service-deployment-797f9f96b6-847qc -- ls
```

### Generate docs:
```
$ npx @compodoc/compodoc -p tsconfig.json -d docs --silent
```


## Useful links
 - GraphQL file upload spec: https://github.com/jaydenseric/graphql-upload#tips
 - TypeORM i18n notes: https://github.com/typeorm/typeorm/issues/1612
 - Install Nginx Ingress for Kubernetes: https://kubernetes.github.io/ingress-nginx/deploy/


## Roadmap
See [TODO](/TODO.md) and in-place TODOs to get a look on what can be improved in the future.
