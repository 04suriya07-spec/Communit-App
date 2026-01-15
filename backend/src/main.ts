import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global exception filter for standardized error responses
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Enable CORS for production and development
    const origins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'];

    console.log('🌐 CORS enabled for origins:', origins);

    app.enableCors({
        origin: origins,
        credentials: true, // CRITICAL: Required for cookies
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        exposedHeaders: 'Set-Cookie',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // Global prefix for API routes
    app.setGlobalPrefix('api/v1');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Community App running on port ${port}`);
    console.log(`📊 Metrics: http://localhost:${port}/api/v1/metrics`);
    console.log(`💚 Health: http://localhost:${port}/api/v1/health/ready`);
}

bootstrap();
