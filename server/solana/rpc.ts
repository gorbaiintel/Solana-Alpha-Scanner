import WebSocket from 'ws';
import { CONFIG } from '../config.js';
import { store } from '../db/store.js';

export class SolanaRpcClient {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private maxReconnectDelay = 30000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  // Real RPC Call with latency tracking & timeout
  async call(method: string, params: any[] = []): Promise<any> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(CONFIG.SOLANA_RPC_URL, {
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

      store.solanaRpcLatencyMs = Date.now() - startTime;

      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (data.error) {
        return null;
      }
      return data.result;
    } catch (err) {
      store.solanaRpcLatencyMs = Date.now() - startTime;
      return null;
    }
  }

  // Specific Real RPC Methods
  async getSlot(): Promise<number | null> {
    const slot = await this.call('getSlot');
    if (typeof slot === 'number') {
      store.solanaLastSlot = slot;
      return slot;
    }
    return null;
  }

  async getBalance(address: string): Promise<number | null> {
    const res = await this.call('getBalance', [address, { commitment: 'confirmed' }]);
    if (res?.value !== undefined) {
      return res.value / 1e9; // in SOL
    }
    return null;
  }

  async getAccountInfo(address: string): Promise<any> {
    return this.call('getAccountInfo', [address, { encoding: 'jsonParsed', commitment: 'confirmed' }]);
  }

  async getTokenSupply(mint: string): Promise<any> {
    return this.call('getTokenSupply', [mint, { commitment: 'confirmed' }]);
  }

  async getTokenLargestAccounts(mint: string): Promise<any> {
    return this.call('getTokenLargestAccounts', [mint, { commitment: 'confirmed' }]);
  }

  async getSignaturesForAddress(address: string, limit = 10): Promise<any[]> {
    const res = await this.call('getSignaturesForAddress', [address, { limit }]);
    return Array.isArray(res) ? res : [];
  }

  async getTransaction(signature: string): Promise<any> {
    return this.call('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' },
    ]);
  }

  // Start Real WebSocket with Heartbeat & Backoff Reconnect
  startWs(onTransactionSig?: (sig: string, slot: number) => void) {
    if (this.isDestroyed) return;

    try {
      this.ws = new WebSocket(CONFIG.SOLANA_WS_URL);
    } catch (err) {
      this.scheduleReconnect(onTransactionSig);
      return;
    }

    this.ws.on('open', () => {
      store.solanaWsConnected = true;
      this.reconnectAttempt = 0;
      console.log('[Solana WS] Connected to live Mainnet WebSocket');

      // Heartbeat ping
      this.heartbeatInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.ping();
        }
      }, 20000);

      // Subscribe to real slots
      this.sendWs({ jsonrpc: '2.0', id: 1, method: 'slotSubscribe' });

      // Subscribe to real program logs (Raydium / Pump.fun / Orca)
      // Raydium Liquidity Pool v4: 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8
      // Pump.fun: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
      this.sendWs({
        jsonrpc: '2.0',
        id: 2,
        method: 'logsSubscribe',
        params: [
          { mentions: ['6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'] },
          { commitment: 'confirmed' },
        ],
      });
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'slotNotification') {
          const slot = msg.params?.result?.slot;
          if (slot) {
            store.solanaLastSlot = slot;
          }
        } else if (msg.method === 'logsNotification') {
          const result = msg.params?.result;
          const signature = result?.value?.signature;
          const slot = result?.context?.slot || store.solanaLastSlot;
          if (signature && onTransactionSig) {
            onTransactionSig(signature, slot);
          }
        }
      } catch (e) {
        store.decoderErrors++;
      }
    });

    this.ws.on('close', () => {
      store.solanaWsConnected = false;
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.scheduleReconnect(onTransactionSig);
    });

    this.ws.on('error', () => {
      store.solanaWsConnected = false;
    });
  }

  private sendWs(obj: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(obj));
      } catch {}
    }
  }

  private scheduleReconnect(onTransactionSig?: (sig: string, slot: number) => void) {
    if (this.isDestroyed) return;
    this.reconnectAttempt++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), this.maxReconnectDelay);
    console.log(`[Solana WS] Disconnected. Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempt})`);
    setTimeout(() => {
      this.startWs(onTransactionSig);
    }, delay);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.ws) this.ws.close();
  }
}

export const solanaClient = new SolanaRpcClient();
