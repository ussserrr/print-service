/**
 * Using only the GraphQL endpoint, we don't need this atm. But lets keep it for consistency (as it was auto-generated by NestJS CLI) and hypothetical future requests
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
