export type GST9700ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECEIVING' | 'STALE' | 'ERROR' | 'RECONNECTING';

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
  frameGapMs?: number;
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
  frameGapMs: 80,
};

const FRAME_BOUNDARY = new RegExp('[' + String.fromCharCode(13, 10, 2, 3, 4, 27) + ']+');

export class GST9700AutoSyncEngine {
  private port: any = null;
  private reader: any = null;
  private keepReading = false;
  private buffer = '';
  private listener: Listener | null = null;
  private config: GST9700SerialConfig = { ...DEFAULT_CONFIG };
  private staleTimer: ReturnType<typeof setTimeout> | null = null;
  private frameGapTimer: ReturnType<typeof setTimeout> | null = null;
  private recentWeights: number[] = [];
  private runId = 0;

  private snapshot: GST9700SyncSnapshot = {
    weight: null, stable: false, zero: false, gross: true, net: false,
    rawFrame: '', state: 'DISCONNECTED', rxCount: 0, lastRxAt: '',
    reconnectCount: 0, error: null, hasLiveData: false, ageMs: null,
  };

  constructor(listener?: Listener) { this.listener = listener || null; }
  setListener(listener: Listener | null) { this.listener = listener; }
  getSnapshot() { return this.snapshot; }

  private emit(patch: Partial<GST9700SyncSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listener?.(this.snapshot);
  }

  private clearStaleTimer() {
    if (this.staleTimer) clearTimeout(this.staleTimer);
    this.staleTimer = null;
  }

  private clearFrameGapTimer() {
    if (this.frameGapTimer) clearTimeout(this.frameGapTimer);
    this.frameGapTimer = null;
  }

  private armStaleTimer() {
    this.clearStaleTimer();
    const timeout = this.config.staleAfterMs ?? 3000;
    this.staleTimer = setTimeout(() => {
      if (!this.keepReading) return;
      const ageMs = this.snapshot.lastRxAt ? Math.max(0, Date.now() - Date.parse(this.snapshot.lastRxAt)) : timeout;
      this.emit({ state: 'STALE', hasLiveData: false, ageMs, stable: false });
    }, timeout);
  }

  private parseNumber(raw: string, context: string): number | null {
    let s = raw.replace(/[ \t]/g, '');
    if (s.endsWith('.')) s = s.slice(0, -1);
    if (!s) return null;

    if (/^[+-]?[0-9]{1,3}[.,][0-9]{3}$/.test(s)) s = s.replace(/[.,]/g, '');
    else s = s.replace(',', '.');

    const n = Number.parseFloat(s);
    if (!Number.isFinite(n) || n < 0) return null;
    if (/(^|[^A-Za-z])(t|ton|tons|tonne)($|[^A-Za-z])/i.test(context)) return Math.round(n * 1000);
    if (n > 0 && n < 200 && s.includes('.') && !/kg/i.test(context)) return Math.round(n * 1000);
    return Math.round(n);
  }

  private extract(frame: string) {
    const clean = frame.replace(new RegExp('[^' + String.fromCharCode(32) + '-' + String.fromCharCode(126) + ']', 'g'), ' ').replace(/[ \t]+/g, ' ').trim();
    const empty = { weight: null as number | null, stable: false, zero: false, gross: false, net: false };
    if (!clean) return empty;

    const stable = /STABLE|^ST[, ]|,ST[, ]/i.test(clean);
    const net = /(^|[, ])NT([, ]|$)|NET|N[.]W[.]/i.test(clean);
    const gross = /(^|[, ])GS([, ]|$)|GROSS|G[.]W[.]/i.test(clean) || !net;
    const zero = /ZERO|(^|[, ])ZR([, ]|$)/i.test(clean);

    const patterns = [
      /(?:ST|US|WN|WW|OL|QT|TR|GR)?[ ]*,?[ ]*(?:GS|NT|G[.]W[.]|N[.]W[.]|Gross|Net)?[, :=]*([+-]?[ ]*[0-9]+(?:[ .,-][0-9]+)?)[ ]*(kg|t|g)?/gi,
      /[+=:#][ ]*([0-9]+(?:[ .,-][0-9]+)?)/g,
      /([0-9]+(?:[ .,-][0-9]+)?)[ ]*(kg|t|g)(?:$|[^A-Za-z])/gi,
    ];

    const candidates: RegExpMatchArray[] = [];
    for (const re of patterns) for (const match of clean.matchAll(re)) candidates.push(match);

    for (let i = candidates.length - 1; i >= 0; i--) {
      const match = candidates[i];
      const value = this.parseNumber(match[1], clean + ' ' + (match[2] || ''));
      if (value !== null) return { weight: value, stable, zero: zero || value === 0, gross, net };
    }

    const reverseMatches = Array.from(clean.matchAll(/(^|[^0-9])([0-9]{4,7})[+=-]/g));
    for (let i = reverseMatches.length - 1; i >= 0; i--) {
      const value = this.parseNumber(reverseMatches[i][2].split('').reverse().join(''), clean);
      if (value !== null) return { weight: value, stable, zero: zero || value === 0, gross, net };
    }

    if (clean.length <= 24 && /^[+-]?[0-9]{1,7}$/.test(clean)) {
      const value = this.parseNumber(clean, clean);
      if (value !== null) return { weight: value, stable, zero: zero || value === 0, gross, net };
    }

    return empty;
  }

  private processFrame(frame: string) {
    const parsed = this.extract(frame);
    if (parsed.weight === null) return;

    this.recentWeights.push(parsed.weight);
    const windowSize = this.config.stableWindowSize ?? 5;
    while (this.recentWeights.length > windowSize) this.recentWeights.shift();
    const min = Math.min(...this.recentWeights);
    const max = Math.max(...this.recentWeights);
    const tolerance = this.config.stableToleranceKg ?? 10;
    const stableByWindow = this.recentWeights.length >= Math.min(3, windowSize) && max - min <= tolerance;

    this.emit({
      weight: parsed.weight,
      stable: parsed.stable || stableByWindow,
      zero: parsed.zero,
      gross: parsed.gross,
      net: parsed.net,
      rawFrame: frame,
      state: 'RECEIVING',
      rxCount: this.snapshot.rxCount + 1,
      lastRxAt: new Date().toISOString(),
      error: null,
      hasLiveData: true,
      ageMs: 0,
    });
    this.armStaleTimer();
  }

  private flushUndelimitedBuffer() {
    this.frameGapTimer = null;
    if (!this.keepReading || !this.buffer.trim()) return;
    const candidate = this.buffer.replace(new RegExp('[^' + String.fromCharCode(32) + '-' + String.fromCharCode(126) + ']', 'g'), ' ').replace(/[ \t]+/g, ' ').trim();
    this.buffer = '';
    if (candidate && this.extract(candidate).weight !== null) this.processFrame(candidate);
  }

  private scheduleUndelimitedFlush() {
    this.clearFrameGapTimer();
    this.frameGapTimer = setTimeout(() => this.flushUndelimitedBuffer(), this.config.frameGapMs ?? 80);
  }

  private consumeBytes(value: Uint8Array) {
    if (!value?.length) return;

    // RS-232 payload from GST-9700 is ASCII. Strip the high/parity bit so USB-serial
    // adapters configured for 7-bit payloads do not turn digits into undecodable bytes.
    const sanitized = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i++) sanitized[i] = value[i] & 0x7f;

    let chunk = '';
    for (let i = 0; i < sanitized.length; i++) chunk += String.fromCharCode(sanitized[i]);
    if (!chunk) return;

    this.buffer += chunk;
    if (this.buffer.length > 8192) this.buffer = this.buffer.slice(-4096);

    const parts = this.buffer.split(FRAME_BOUNDARY);
    const hasBoundary = FRAME_BOUNDARY.test(this.buffer);

    if (hasBoundary) {
      const complete = parts.slice(0, -1);
      this.buffer = parts[parts.length - 1] || '';
      for (const frame of complete) if (frame.trim()) this.processFrame(frame.trim());
      if (this.buffer.trim()) this.scheduleUndelimitedFlush();
      return;
    }

    // Important: do not parse an incomplete USB read such as "+01" as 1 kg.
    // Wait for a short idle gap so a frame split across reads is reassembled first.
    this.scheduleUndelimitedFlush();
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
    this.emit({ state: 'CONNECTING', error: null, hasLiveData: false, ageMs: null, stable: false });

    try {
      try { await this.port.setSignals({ dataTerminalReady: true, requestToSend: true }); } catch (_) {}

      while (this.keepReading && currentRun === this.runId) {
        if (!this.port?.readable) throw new Error('Port GST-9700 terputus atau tidak lagi readable.');

        try {
          this.reader = this.port.readable.getReader();
          this.emit({ state: 'CONNECTED', error: null });

          while (this.keepReading && currentRun === this.runId) {
            const { value, done } = await this.reader.read();
            if (done) {
              if (this.keepReading) throw new Error('Stream serial selesai. Port mungkin terputus.');
              break;
            }
            if (!value?.length) continue;
            const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
            this.consumeBytes(bytes);
          }
        } catch (err: any) {
          if (!this.keepReading || currentRun !== this.runId) break;
          const message = err?.message || String(err);
          this.emit({ state: 'RECONNECTING', error: message, hasLiveData: false, stable: false, reconnectCount: this.snapshot.reconnectCount + 1 });
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
      this.clearFrameGapTimer();
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
    this.clearFrameGapTimer();
    this.emit({ error: null, stable: false });
  }

  async stop() {
    this.keepReading = false;
    this.runId += 1;
    await this.releaseReader();
    this.clearStaleTimer();
    this.clearFrameGapTimer();
    this.buffer = '';
    this.recentWeights = [];
    this.emit({ state: 'DISCONNECTED', hasLiveData: false, stable: false, ageMs: null });
  }
}
