import WebSocket from 'ws';
import { store, RealToken, RealSwap } from '../db/store.js';

export class PumpPortalClient {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private isDestroyed = false;

  start() {
    if (this.isDestroyed) return;

    try {
      this.ws = new WebSocket('wss://pumpportal.fun/api/data');
    } catch (e) {
      this.scheduleReconnect();
      return;
    }

    this.ws.on('open', () => {
      store.pumpPortalConnected = true;
      this.reconnectAttempt = 0;
      console.log('[PumpPortal WS] Connected to live third-party feed');

      // Subscribe to real live new tokens
      this.send({ method: 'subscribeNewToken' });

      // Subscribe to real live trades
      this.send({ method: 'subscribeTokenTrade' });
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        const now = Date.now();

        // 1. Handle New Token Creation Event
        if (msg.mint && msg.name && msg.symbol) {
          const token: RealToken = {
            address: msg.mint,
            chain: 'SOLANA',
            symbol: String(msg.symbol),
            name: String(msg.name),
            decimals: 6,
            creator: msg.traderPublicKey || null,
            creationTx: msg.signature || null,
            creationBlock: null,
            creationTime: now,
            totalSupply: 1000000000,
            mintAuthority: null,
            freezeAuthority: null,
            source: 'PUMPPORTAL',
            provenance: {
              source: 'PUMPPORTAL',
              sourceType: 'third_party',
              sourceTimestamp: now,
              ingestedAt: now,
              signatureOrTxHash: msg.signature,
            },
          };
          store.upsertToken(token);
        }

        // 2. Handle Real Swap / Trade Event
        if (msg.txType && msg.mint) {
          const isBuy = msg.txType === 'buy';
          const solAmount = Number(msg.solAmount || 0);
          const tokenAmount = Number(msg.tokenAmount || 0);
          const price = tokenAmount > 0 ? solAmount / tokenAmount : 0;

          const swap: RealSwap = {
            id: `pumpportal-${msg.signature || now}`,
            chain: 'SOLANA',
            dex: 'PUMP_FUN',
            poolAddress: msg.mint,
            txHash: msg.signature || `sig-${now}`,
            slotOrBlock: store.solanaLastSlot,
            blockTime: Math.floor(now / 1000),
            tokenIn: isBuy ? 'So11111111111111111111111111111111111111112' : msg.mint,
            tokenOut: isBuy ? msg.mint : 'So11111111111111111111111111111111111111112',
            amountIn: isBuy ? solAmount : tokenAmount,
            amountOut: isBuy ? tokenAmount : solAmount,
            price,
            wallet: msg.traderPublicKey || 'UNKNOWN_WALLET',
            provenance: {
              source: 'PUMPPORTAL',
              sourceType: 'third_party',
              sourceTimestamp: now,
              ingestedAt: now,
              signatureOrTxHash: msg.signature,
            },
          };
          store.addSwap(swap);
        }
      } catch (err) {
        store.decoderErrors++;
      }
    });

    this.ws.on('close', () => {
      store.pumpPortalConnected = false;
      this.scheduleReconnect();
    });

    this.ws.on('error', () => {
      store.pumpPortalConnected = false;
    });
  }

  private send(obj: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(obj));
      } catch {}
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    this.reconnectAttempt++;
    const delay = Math.min(2000 * Math.pow(1.5, this.reconnectAttempt), 30000);
    setTimeout(() => this.start(), delay);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.ws) this.ws.close();
  }
}

export const pumpPortalClient = new PumpPortalClient();
