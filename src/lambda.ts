import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import * as Sentry from '@sentry/serverless';
import { Context, Handler } from 'aws-lambda';
import express from 'express';

import { AppModule } from './app.module';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const sentryDSN =
      process.env.NODE_ENV !== 'dev' ? process.env.SENTRY_DSN : null;

    Sentry.AWSLambda.init({
      dsn: sentryDSN,
      environment: process.env.NODE_ENV,
    });

    const expressApp = express();

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // middleware
    nestApp.enableCors();
    nestApp.use(Sentry.Handlers.requestHandler());
    nestApp.use(Sentry.Handlers.errorHandler());

    await nestApp.init();
    // microservices handling end here

    // wrap nestJs app as lambda handler
    // this will handle both createServer and proxy with promise
    cachedServer = serverlessExpress({
      app: expressApp,
      respondWithErrors: process.env.NODE_ENV !== 'prod',
      log: {
        info(message, additional) {
          console.info(message, additional);
        },
        debug(message, additional) {
          // Comment out as disable while I'm not debuging
          //console.debug(message, additional);
        },
        error(message, additional) {
          console.error(message, additional);
        },
      },
    });
  }

  // wrap Sentry handler for inboundd request and outbound response to/from nestJs app
  return Sentry.AWSLambda.wrapHandler(cachedServer);
}

export const handler = async (event: any, context: Context, callback: any) => {
  const server = await bootstrap();
  // serverlessExpress generate API Gateway to route request to express app route handling
  return server(event, context, callback);
};
