import { Injectable } from '@nestjs/common';
import { getCurrentInvoke } from '@vendia/serverless-express';

@Injectable()
export class AppService {
  getHello(): string {
    // get request event and context
    const { event, context } = getCurrentInvoke();
    return `Hello World! ${event?.httpMethod} from ${event?.headers?.Host}`;
  }

  posyBody(body: any): any {
    return body;
  }
}
