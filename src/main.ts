import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Initialize the NestJS application with the root AppModule
  const app = await NestFactory.create(AppModule);

  // Set a global prefix for all API routes (e.g., /api/auth/login)
  app.setGlobalPrefix('api');

  //  Enable Global Validation Pipes
  // This ensures all incoming requests are automatically validated against our DTO classes.
  // 'whitelist: true' automatically strips out any extra properties not defined in the DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  //  Configure Swagger Documentation
  // This builds the interactive API documentation accessible in the browser.
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The E-Commerce Backend API description')
    .setVersion('1.0')
    .addBearerAuth() // Allows users to input their JWT token in the Swagger UI
    .build();

  // Step 5: Mount the Swagger UI to the '/api/docs' route
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(
    'MongoDB URI:',
    process.env.MONGODB_URI ? 'configured' : 'NOT SET',
  );

  // Start the server on the configured PORT (or default to 3000)
  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}
void bootstrap();
