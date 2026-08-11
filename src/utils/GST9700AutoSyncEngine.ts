/**
 * GST-9700 Auto Sync Engine
 *
 * Production serial lifecycle for GSC GST-9700 / GST-700 style indicators.
 * - Web Serial lifecycle + reconnect
 * - CR/LF/STX/ETX frame buffering
 * - tolerant weight parsing
 * - stable-weight window
 * - stale-data protection
 * - explicit connection state (0 kg is never treated as "live" by itself)
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
  hasLiveData: boolean;
  ageMs: number | null;
}

type Listener = (snapshot: GST9700SyncSnapshot) => void;

export interface GST9700SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  parity: 'none' | 'even' | 'odd';
  stopBits: 1 | 2;
  flowControl?: 'none' | 'hardware';
  bufferSize?: number;
  staleAfterMs?: number;
  stableWindowSize?: number;
  stableToleranceKg?: number;
  reconnectDelayMs?: number;
}

const DEFAULT_CONFIG: GST9700SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: 'none',
  bufferSize: 2048,
  staleAfterMs: 3000,
  stableWindowSize: 5,
  stableToleranceKg: 10,
  reconnectDelayMs: 700,
};

const FRAME_BOUNDARY = /[\r\n\x02\x03\x04\x1b]+/;

export class GST9700AutoSyncEngine {
  private port: any = null;
  private reader: any = null;
  private keepReading = false;
  private buffer = '';
  private listener: Listener | null = null;
  private config: GST9700SerialConfig = { ...DEFAULT_CONFIG };
  private staleTimer: ReturnType<typeof setTimeout> | null = null;
  private recentWeights: number[] = [];
  private runId = 0;

  private snapshot: GST9700SyncSnapshot = {
    weight: null,
    stable: false,
    zero: false,
    gross: true,
    net: false,
    rawFrame: '',
    state: 'DISCONNECTED',
    rxCount: 0,
    lastRxAt: '',
    reconnectCount: 0,
    error: null,
    hasLiveData: false,
    ageMs: null,
  };

  constructor(listener?: Listener) {
    this.listener = listener || null;
  }

  setListener(listener: Listener | null) {
    this.listener = listener;
  }

  getSnapshot(): GST9700SyncSnapshot {
    return this.snapshot;
  }

  private emit(patch: Partial<GST9700SyncSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listener?.(this.snapshot);
  }

  private clearStaleTimer() {
    if (this.staleTimer) clearTimeout(this.staleTimer);
    this.staleTimer = null;
  }

  private armStaleTimer() {
    this.clearStaleTimer();
    const timeout = this.config.staleAfterMs ?? DEFAULT_CONFIG.staleAfterMs!;
    this.staleTimer = setTimeout(() => {
      if (!this.keepReading) return;
      const ageMs = this.snapshot.lastRxAt
        ? Math.max(0, Date.now() - Date.parse(this.snapshot.lastRxAt))
        : timeout;
      this.emit({
        state: 'STALE',
        hasLiveData: false,
        ageMs,
        stable: false,
      });
    }, timeout);
  }

  private parseNumber(raw: string, context: string): number | null {
    let s = raw.replace(/\s+/g, '').replace(/\.$/, '');
    if (!s) return null;

    if (/^[+-]?\d{1,3}[.,]\d{3}$/.test(s)) {
      s = s.replace(/[.,]/g, '');
    } else {
      s = s.replace(',', '.');
    }

    const n = Number.parseFloat(s);
    if (!Number.isFinite(n) || n < 0) return null;

    if (/\b(?:t|ton|tons|tonne)\b/i.test(context)) return Math.round(n * 1000);
    if (n > 0 && n < 200 && /\./.test(s) && !/kg/i.test(context)) return Math.round(n * 1000);
    return Math.round(n);
  }

  private extract(frame: string) {
    const clean = frame.replace(/[^\x20-\x7E]/g, ' ').trim();
    const empty = { weight: null, stable: false, zero: false, gross: false, net: false };
    if (!clean) return empty;

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
      const match = clean.match(re);
      if (!match?.[1]) continue;
      const value = this.parseNumber(match[1], `${clean} ${match[2] || ''}`);
      if (value !== null) {
        return {
          weight: value,
          stable,
          zero: zero || value === 0,
          gross,
          net,
        };
      }
    }

    const reverse = clean.match(/\b(\d{4,7})[+=-]/);
    if (reverse?.[1]) {
      const value = this.parseNumber(reverse[1].split('').reverse().join(''), clean);
      if (value !== null) return { weight: value, stable, zero: value === 0, gross, net };
    }

    return empty;
  }

  private processFrame(frame: string) {
    const parsed = this.extract(frame);
    if (parsed.weight === null) return;

    const now = new Date();
    this.recentWeights.push(parsed.weight);
    const windowSize = this.config.stableWindowSize ?? 5;
    while (this.recentWeights.length > windowSize) this.recentWeights.shift();

    const min = Math.min(...this.recentWeights);
    const max = Math.max(...this.recentWeights);
    const tolerance = this.config.stableToleranceKg ?? 10;
    const stableByWindow = this.recentWeights.length >= Math.min(3, windowSize) && max - min <= tolerance;
    const stable = parsed.stable || stableByWindow;
    const iso = now.toISOString();

    this.emit({
      weight: parsed.weight,
      stable,
      zero: parsed.zero,
      gross: parsed.gross,
      net: parsed.net,
      rawFrame: frame,
      state: 'RECEIVING',
      rxCount: this.snapshot.rxCount + 1,
      lastRxAt: iso,
      error: null,
      hasLiveData: true,
      ageMs: 0,
    });

    this.armStaleTimer();
  }

  private consume(chunk: string) {
    if (!chunk) return;
    this.buffer += chunk;
    if (this.buffer.length > 8192) this.buffer = this.buffer.slice(-4096);

    // Never parse an unterminated chunk merely because a number happens to be present.
    // Serial frames can be split across multiple USB/serial reads, e.g.
    // "ST,GS,+01" + "1330kg\r". Keeping the partial frame avoids false readings.
    const parts = this.buffer.split(FRAME_BOUNDARY);
    const hasBoundary = FRAME_BOUNDARY.test(this.buffer);
    const complete = hasBoundary ? parts.slice(0, -1) : [];
    this.buffer = hasBoundary ? (parts[parts.length - 1] || '') : this.buffer;

    for (const frame of complete) {
      if (frame.trim()) this.processFrame(frame.trim());
    }

    // If a device sends a complete printable frame without CR/LF, accept only
    // an explicitly recognizable payload rather than a partial numeric prefix.
    if (!hasBoundary && this.buffer.length <= 128) {
      const candidate = this.buffer.trim();
      const completePayload = /(?:kg|\bST\b|\bUS\b|\bWN\b|\bGS\b|\bNT\b|\bG\.W\.|\bN\.W\.|[+=:#]\s*\d{3,})/i.test(candidate);
      if (completePayload && /(?:kg|[+=:#]\s*\d{3,})\s*$/i.test(candidate)) {
        this.processFrame(candidate);
        this.buffer = '';
      }
    }
  }

  private async releaseReader() {
    try { await this.reader?.cancel?.(); } catch (_) {}
    try { this.reader?.releaseLock?.(); } catch (_) {}
    this.reader = null;
  }

  async start(port: any, config: GST9700SerialConfig = DEFAULT_CONFIG) {
    await this.stop();
    this.port = port;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.buffer = '';
    this.recentWeights = [];
    this.runId += 1;
    const currentRun = this.runId;

    if (!this.port) throw new Error('Port GST-9700 tidak tersedia.');
    if (!this.port.readable) throw new Error('Port GST-9700 tidak readable. Pastikan port sudah dibuka.');

    this.keepReading = true;
    this.emit({
      state: 'CONNECTING',
      error: null,
      hasLiveData: false,
      ageMs: null,
      stable: false,
    });

    try {
      try {
        await this.port.setSignals({ dataTerminalReady: true, requestToSend: true });
      } catch (_) {}

      while (this.keepReading && currentRun === this.runId && this.port?.readable) {
        try {
          this.reader = this.port.readable.getReader();
          const decoder = new TextDecoder('ascii', { fatal: false });
          this.emit({ state: 'CONNECTED', error: null });

          while (this.keepReading && currentRun === this.runId) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (!value?.length) continue;
            const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
            this.consume(decoder.decode(bytes, { stream: true }));
          }
        } catch (err: any) {
          if (!this.keepReading || currentRun !== this.runId) break;
          const msg = err?.message || String(err);
          this.emit({
            state: 'RECONNECTING',
            error: msg,
            hasLiveData: false,
            stable: false,
            reconnectCount: this.snapshot.reconnectCount + 1,
          });
          await new Promise(resolve => setTimeout(resolve, this.config.reconnectDelayMs ?? 700));
        } finally {
          await this.releaseReader();
        }
      }
    } catch (err: any) {
      const message = err?.message || String(err);
      this.emit({ state: 'ERROR', error: message, hasLiveData: false, stable: false });
      throw err;
    } finally {
      await this.releaseReader();
      if (!this.keepReading && currentRun === this.runId) {
        this.clearStaleTimer();
        this.emit({ state: 'DISCONNECTED', hasLiveData: false, stable: false, ageMs: null });
      }
    }
  }

  flush() {
    this.buffer = '';
    this.recentWeights = [];
    this.clearStaleTimer();
    this.emit({ error: null, stable: false });
  }

  async stop() {
    this.keepReading = false;
    this.runId += 1;
    await this.releaseReader();
    this.clearStaleTimer();
    this.buffer = '';
    this.recentWeights = [];
    this.emit({ state: 'DISCONNECTED', hasLiveData: false, stable: false, ageMs: null });
  }
}
