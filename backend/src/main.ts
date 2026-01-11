import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for development
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });

    // Global prefix for API routes
    app.setGlobalPrefix('api/v1');

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Community App running on port ${port}`);
    console.log(`📊 Metrics: http://localhost:${port}/api/v1/metrics`);
    console.log(`💚 Health: http://localhost:${port}/api/v1/health/ready`);
}

bootstrap();
