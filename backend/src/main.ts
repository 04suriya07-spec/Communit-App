import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for production and development
    const origins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:8080'];
    app.enableCors({
        origin: origins,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
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
