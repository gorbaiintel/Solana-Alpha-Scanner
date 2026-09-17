import { CONFIG } from '../config.js';
import { store } from '../db/store.js';

export class BnbRpcClient {
  async call(method: string, params: any[] = []): Promise<any> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(CONFIG.BNB_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      store.bnbRpcLatencyMs = Date.now() - startTime;

      if (!res.ok) return null;
      const data = await res.json();
      if (data.error) return null;
      return data.result;
    } catch (e) {
      store.bnbRpcLatencyMs = Date.now() - startTime;
      return null;
    }
  }

  async getBlockNumber(): Promise<number | null> {
    const hex = await this.call('eth_blockNumber');
    if (typeof hex === 'string') {
      const block = parseInt(hex, 16);
      store.bnbLastBlock = block;
      return block;
    }
    return null;
  }

  async getBalance(address: string): Promise<number | null> {
    const hex = await this.call('eth_getBalance', [address, 'latest']);
    if (typeof hex === 'string') {
      const wei = BigInt(hex);
      return Number(wei) / 1e18; // in BNB
    }
    return null;
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return this.call('eth_getTransactionReceipt', [txHash]);
  }

  // Poll latest BNB block
  startPolling(intervalMs = 4000) {
    this.getBlockNumber();
    setInterval(() => {
      this.getBlockNumber().catch(() => {});
    }, intervalMs);
  }
}

export const bnbClient = new BnbRpcClient();
