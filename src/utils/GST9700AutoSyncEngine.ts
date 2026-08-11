/**
 * GST-9700 Auto Sync Engine
 * Handles Web Serial lifecycle, buffering, parsing, stability and reconnect.
 */
export type GST9700ConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECEIVING'
  | 'STALE'
  | 'ERROR'
  | 'RECONNECTING';

export interface GST9700SyncSnapshot {
  weight: number | null;
  stable: boolean;
  zero: boolean;
  gross: boolean;
  net: boolean;
  rawFrame: string;
  state: GST9700ConnectionState;
  rxCount: number;
  lastRxAt: string;
  reconnectCount: number;
  error: string | null;
}

type Listener = (snapshot: GST9700SyncSnapshot) => void;

export interface GST9700SerialConfig {
  baudRate: number;
  dataBits: number;
  parity: 'none' | 'even' | 'odd';
  stopBits?: 1 | 2;
}

const DEFAULT_CONFIG: GST9700SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
};

export class GST9700AutoSyncEngine {
  private port: any = null;
  private reader: any = null;
  private keepReading = false;
  private buffer = '';
  private listener: Listener | null = null;
  private config: GST9700SerialConfig = DEFAULT_CONFIG;
  private snapshot: GST9700SyncSnapshot = {
    weight: null,
    stable: false,
    zero: true,
    gross: true,
    net: false,
    rawFrame: '',
    state: 'DISCONNECTED',
    rxCount: 0,
    lastRxAt: '',
    reconnectCount: 0,
    error: null,
  };
  private recentWeights: number[] = [];
  private staleTimer: any = null;

  constructor(listener?: Listener) {
    this.listener = listener || null;
  }

  setListener(listener: Listener | null) {
    this.listener = listener;
  }

  getSnapshot() {
    return this.snapshot;
  }

  private emit(patch: Partial<GST9700SyncSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listener?.(this.snapshot);
  }

  private parseNumber(raw: string, context: string): number | null {
    let s = raw.replace(/\s+/g, '').replace(/\.$/, '');
    if (!s) return null;
    if (/^[+-]?\d{1,3}[.,]\d{3}$/.test(s)) s = s.replace(/[.,]/g, '');
    else s = s.replace(',', '.');
    const n = Number.parseFloat(s);
    if (!Number.isFinite(n) || n < 0) return null;
    if (/\b(?:t|ton|tons|tonne)\b/i.test(context)) return Math.round(n * 1000);
    if (n > 0 && n < 200 && /\./.test(s) && !/kg/i.test(context)) return Math.round(n * 1000);
    return Math.round(n);
  }

  private extract(frame: string): { weight: number | null; stable: boolean; zero: boolean; gross: boolean; net: boolean } {
    const clean = frame.replace(/[^\x20-\x7E]/g, ' ').trim();
    if (!clean) return { weight: null, stable: false, zero: false, gross: false, net: false };

    const stable = /\bST\b|\bSTABLE\b/i.test(clean);
    const net = /\bNT\b|\bNET\b|\bN\.W\.?\b/i.test(clean);
    const gross = /\bGS\b|\bGROSS\b|\bG\.W\.?\b/i.test(clean) || !net;
    const zero = /\bZERO\b|\bZR\b/i.test(clean);

    const patterns = [
      /(?:ST|US|WN|WW|OL|QT|TR|GR)?\s*,?\s*(?:GS|NT|G\.W\.|N\.W\.|Gross|Net)?[,\s:=]*([+-]?\s*\d+(?:[\s.,]\d+)?)\s*(kg|t|g)?/i,
      /[+=:#]\s*(\d+(?:[\s.,]\d+)?)/i,
      /(\d+(?:[\s.,]\d+)?)\s*(kg|t|g)\b/i,
      /\b(\d{1,7})\b/,
    ];

    for (const re of patterns) {
      const m = clean.match(re);
      if (m?.[1]) {
        const value = this.parseNumber(m[1], `${clean} ${m[2] || ''}`);
        if (value !== null) return { weight: value, stable, zero: zero || value === 0, gross, net };
      }
    }

    const reverse = clean.match(/\b(\d{4,7})[+=-]/);
    if (reverse?.[1]) {
      const value = this.parseNumber(reverse[1].split('').reverse().join(''), clean);
      if (value !== null) return { weight: value, stable, zero: value === 0, gross, net };
    }
    return { weight: null, stable, zero, gross, net };
  }

  private processFrame(frame: string) {
    const parsed = this.extract(frame);
    if (parsed.weight === null) return;

    const now = new Date().toLocaleTimeString('id-ID');
    this.recentWeights.push(parsed.weight);
    if (this.recentWeights.length > 5) this.recentWeights.shift();

    const min = Math.min(...this.recentWeights);
    const max = Math.max(...this.recentWeights);
    const stableByWindow = max - min <= 10;
    const stable = parsed.stable || stableByWindow;

    this.emit({
      weight: parsed.weight,
      stable,
      zero: parsed.zero,
      gross: parsed.gross,
      net: parsed.net,
      rawFrame: frame,
      state: 'RECEIVING',
      rxCount: this.snapshot.rxCount + 1,
      lastRxAt: now,
      error: null,
    });

    if (this.staleTimer) clearTimeout(this.staleTimer);
    this.staleTimer = setTimeout(() => {
      if (this.keepReading) this.emit({ state: 'STALE' });
    }, 3000);
  }

  private consume(chunk: string) {
    this.buffer += chunk;
    if (this.buffer.length > 4096) this.buffer = this.buffer.slice(-2048);

    const parts = this.buffer.split(/[\r\n\x02\x03\x04\x1b]+/);
    const ended = /[\r\n\x02\x03\x04\x1b]$/.test(this.buffer);
    const complete = ended ? parts : parts.slice(0, -1);
    this.buffer = ended ? '' : (parts[parts.length - 1] || '');

    for (const frame of complete) {
      if (frame.trim()) this.processFrame(frame.trim());
    }

    if (!ended && this.buffer.length > 0) {
      const candidate = this.extract(this.buffer);
      if (candidate.weight !== null) {
        this.processFrame(this.buffer);
        this.buffer = '';
      }
    }
  }

  async start(port: any, config: GST9700SerialConfig = DEFAULT_CONFIG) {
    this.stopReaderOnly();
    this.port = port;
    this.config = config;
    this.buffer = '';
    this.recentWeights = [];
    this.emit({ state: 'CONNECTING', error: null });

    if (!this.port?.readable) throw new Error('Port GST-9700 tidak readable.');
    this.keepReading = true;

    try {
      try {
        await this.port.setSignals({ dataTerminalReady: true, requestToSend: true });
      } catch (_) {}

      while (this.keepReading && this.port?.readable) {
        try {
          this.reader = this.port.readable.getReader();
          const decoder = new TextDecoder('ascii');
          this.emit({ state: 'CONNECTED', error: null });
          while (this.keepReading) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (!value?.length) continue;
            const bytes = new Uint8Array(value.length);
            for (let i = 0; i < value.length; i++) bytes[i] = value[i] & 0x7f;
            this.consume(decoder.decode(bytes, { stream: true }));
          }
        } catch (err: any) {
          if (!this.keepReading) break;
          const msg = err?.message || String(err);
          this.emit({ state: 'RECONNECTING', error: msg, reconnectCount: this.snapshot.reconnectCount + 1 });
          await new Promise(r => setTimeout(r, 500));
        } finally {
          try { this.reader?.releaseLock(); } catch (_) {}
          this.reader = null;
        }
      }
    } finally {
      if (!this.keepReading) this.emit({ state: 'DISCONNECTED' });
    }
  }

  private stopReaderOnly() {
    try { this.reader?.cancel(); } catch (_) {}
    this.reader = null;
  }

  flush() {
    this.buffer = '';
    this.recentWeights = [];
    this.emit({ error: null });
  }

  async stop() {
    this.keepReading = false;
    this.stopReaderOnly();
    if (this.staleTimer) clearTimeout(this.staleTimer);
    this.staleTimer = null;
    this.buffer = '';
    this.recentWeights = [];
    this.emit({ state: 'DISCONNECTED' });
  }
}
