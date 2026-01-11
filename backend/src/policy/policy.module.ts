import { Module } from '@nestjs/common';
import { PolicyEngineService } from './services/policy-engine.service';

/**
 * Policy Module
 * 
 * Provides centralized policy evaluation
 */
@Module({
    providers: [PolicyEngineService],
    exports: [PolicyEngineService],
})
export class PolicyModule { }
