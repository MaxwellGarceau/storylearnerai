import { LLMService } from './LLMService';
import { LLMServiceFactory } from './LLMServiceFactory';
import { EnvironmentConfig } from '../config/env';
import { LLMRequest, LLMResponse, ProviderConfig } from '../../types/llm/providers';
import type { RecordString } from '../../types/common';

export class LLMServiceManager {
  private static instance: LLMServiceManager;
  private llmService: LLMService;
  private config: ProviderConfig;

  private constructor() {
    this.config = EnvironmentConfig.getLLMConfig();
    this.llmService = LLMServiceFactory.createService(this.config);
  }

  /**
   * Get the singleton instance of LLMServiceManager
   */
  static getInstance(): LLMServiceManager {
    if (!this.instance) {
      this.instance = new LLMServiceManager();
    }
    return this.instance;
  }

  /**
   * Generate text completion using the configured LLM service
   */
  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    return this.llmService.generateCompletion(request);
  }

  /**
   * Perform health check on the LLM service
   */
  async healthCheck(): Promise<boolean> {
    return this.llmService.healthCheck();
  }

  /**
   * Get the current provider name
   */
  getProvider(): string {
    return this.llmService.getProvider();
  }

  /**
   * Get the current model name
   */
  getModel(): string {
    return this.llmService.getModel();
  }

  /**
   * Get the current configuration
   */
  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  /**
   * Reinitialize the service with new configuration
   * This would be used when switching providers in the future
   */
  reinitialize(config: ProviderConfig): void {
    this.config = config;
    this.llmService = LLMServiceFactory.createService(config);
  }

  /**
   * Get available providers from the factory
   */
  getAvailableProviders(): string[] {
    return LLMServiceFactory.getAvailableProviders();
  }

  /**
   * Get provider display names for UI
   */
  getProviderDisplayNames(): RecordString {
    return LLMServiceFactory.getProviderDisplayNames();
  }

  /**
   * Get provider descriptions for UI
   */
  getProviderDescriptions(): RecordString {
    return LLMServiceFactory.getProviderDescriptions();
  }
}

// Export a singleton instance for easy access
export const llmServiceManager = LLMServiceManager.getInstance(); 