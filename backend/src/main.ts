import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://127.0.0.1:5173',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTION'],
  });
  
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce(
          (accumulator, error) => {
            if (error.constraints) {
              accumulator[error.property] = Object.values(
                error.constraints,
              ).join(', ');
            }
            return accumulator;
          },
          {} as { [key: string]: string },
        );

        throw new BadRequestException(formattedErrors);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
