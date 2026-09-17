import { CONFIG } from '../config.js';

export interface FlapAdapterStatus {
  status: 'FLAP_ADAPTER_NOT_CONFIGURED' | 'READY';
  factoryAddress: string | null;
  routerAddress: string | null;
  poolFactoryAddress: string | null;
  eventTopicsConfigured: boolean;
  message: string;
}

export class FlapAdapter {
  getStatus(): FlapAdapterStatus {
    const isConfigured = Boolean(
      CONFIG.FLAP_FACTORY_ADDRESS &&
      CONFIG.FLAP_ROUTER_ADDRESS &&
      CONFIG.FLAP_EVENT_TOPICS
    );

    if (!isConfigured) {
      return {
        status: 'FLAP_ADAPTER_NOT_CONFIGURED',
        factoryAddress: CONFIG.FLAP_FACTORY_ADDRESS || null,
        routerAddress: CONFIG.FLAP_ROUTER_ADDRESS || null,
        poolFactoryAddress: CONFIG.FLAP_POOL_FACTORY_ADDRESS || null,
        eventTopicsConfigured: Boolean(CONFIG.FLAP_EVENT_TOPICS),
        message: 'FLAP contracts not configured. Provide FLAP_FACTORY_ADDRESS and FLAP_EVENT_TOPICS in .env to enable real BSC log decoding.',
      };
    }

    return {
      status: 'READY',
      factoryAddress: CONFIG.FLAP_FACTORY_ADDRESS,
      routerAddress: CONFIG.FLAP_ROUTER_ADDRESS,
      poolFactoryAddress: CONFIG.FLAP_POOL_FACTORY_ADDRESS || null,
      eventTopicsConfigured: true,
      message: 'FLAP adapter active with configured contracts.',
    };
  }
}

export const flapAdapter = new FlapAdapter();
