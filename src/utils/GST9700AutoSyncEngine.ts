export type GST9700ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'WAITING_RX' | 'RECEIVING' | 'STALE' | 'ERROR' | 'RECONNECTING';

export interface GST9700SyncSnapshot {
  weight: number | null;
  stable: boolean;
  zero: boolean;
  gross: boolean;
  net: boolean;
  rawFrame: string;
  rawHex: string;
  state: GST9700ConnectionState;
  rxCount: number;
  rxBytes: number;
  parsedCount: number;
  invalidFrameCount: number;
  lastRxAt: string;
  lastParsedAt: string;
  lastWeightChangeAt: string;
  reconnectCount: number;
  error: string | null;
  hasLiveData: boolean;
  ageMs: number | null;
  protocol: string;
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
  maxWeightKg?: number;
}

const DEFAULT_CONFIG: GST9700SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: 'none',
  bufferSize: 4096,
  staleAfterMs: 3000,
  stableWindowSize: 5,
  stableToleranceKg: 10,
  reconnectDelayMs: 700,
  frameGapMs: 60,
  maxWeightKg: 100000,
};

const FRAME_BOUNDARY = /[\r\n\x02\x03\x04\x1b]+/;
const PRINTABLE = /[^\x20-\x7e]/g;

function cleanAscii(value: string): string {
  return value.replace(PRINTABLE, ' ').replace(/[ \t]+/g, ' ').trim();
}

function bytesToAscii(bytes: Uint8Array): string {
  return Array.from(bytes, byte => {
    if (byte >= 0x20 && byte <= 0x7e) return String.fromCharCode(byte);
    if (byte === 0x09) return ' ';
    return ' ';
  }).join('');
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

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
  private lastParsedWeight: number | null = null;

  private snapshot: GST9700SyncSnapshot = {
    weight: null,
    stable: false,
    zero: false,
    gross: true,
    net: false,
    rawFrame: '',
    rawHex: '',
    state: 'DISCONNECTED',
    rxCount: 0,
    rxBytes: 0,
    parsedCount: 0,
    invalidFrameCount: 0,
    lastRxAt: '',
    lastParsedAt: '',
    lastWeightChangeAt: '',
    reconnectCount: 0,
    error: null,
    hasLiveData: false,
    ageMs: null,
    protocol: 'AUTO / ASCII',
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
    if (!s) return null;
    if (s.endsWith('.')) s = s.slice(0, -1);

    const unit = context.match(/(?:kg|kgs|t|ton|tons|tonne|tonnes|g)\b/i)?.[0]?.toLowerCase();
    if (/^[+-]?\d{1,3}[.,]\d{3}$/.test(s)) {
      s = s.replace(/[.,]/g, '');
    } else if (s.includes(',') && s.includes('.')) {
      s = s.lastIndexOf('.') > s.lastIndexOf(',') ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',') && !/\d{1,3},\d{3}$/.test(s)) {
      s = s.replace(',', '.');
    }

    const n = Number.parseFloat(s);
    if (!Number.isFinite(n) || n < 0) return null;
    const kg = unit && /^(t|ton|tons|tonne|tonnes)$/.test(unit) ? n * 1000 : unit === 'g' ? n / 1000 : n;
    const rounded = Math.round(kg);
    if (rounded > (this.config.maxWeightKg ?? 100000)) return null;
    return rounded;
  }

  private extract(frame: string): { weight: number | null; stable: boolean; zero: boolean; gross: boolean; net: boolean; protocol: string } {
    const clean = cleanAscii(frame);
    const empty = { weight: null, stable: false, zero: false, gross: false, net: false, protocol: 'UNKNOWN' };
    if (!clean) return empty;

    const stable = /\bSTABLE\b|^ST[, ]|[, ]ST[, ]/i.test(clean);
    const net = /(^|[, ]|\b)NT([, ]|$)|\bNET\b|N[.]W[.]/i.test(clean);
    const gross = /(^|[, ]|\b)GS([, ]|$)|\bGROSS\b|G[.]W[.]/i.test(clean) || !net;
    const zero = /\bZERO\b|(^|[, ]|\b)ZR([, ]|$)/i.test(clean);

    const labeledPatterns: RegExp[] = [
      /(?:ST|US|WN|WW|OL|QT|TR|GR)\s*,?\s*(?:GS|NT)\s*[,=: ]+([+-]?\s*\d+(?:[.,]\d+)?)\s*(kg|kgs|t|ton|tons|tonne|tonnes|g)?/gi,
      /(?:G[.]W[.]|N[.]W[.]|GROSS|NET)\s*[:= ]+([+-]?\s*\d+(?:[.,]\d+)?)\s*(kg|kgs|t|ton|tons|tonne|tonnes|g)?/gi,
    ];

    for (const re of labeledPatterns) {
      const matches = Array.from(clean.matchAll(re));
      for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        const weight = this.parseNumber(m[1], `${clean} ${m[2] || ''}`);
        if (weight !== null) return { weight, stable, zero: zero || weight === 0, gross, net, protocol: 'GST/GSC LABELED ASCII' };
      }
    }

    const signed = Array.from(clean.matchAll(/[+=:#]\s*([+-]?\d{1,7}(?:[.,]\d+)?)\s*(kg|kgs|t|ton|tons|tonne|tonnes|g)?/gi));
    for (let i = signed.length - 1; i >= 0; i--) {
      const m = signed[i];
      const weight = this.parseNumber(m[1], `${clean} ${m[2] || ''}`);
      if (weight !== null) return { weight, stable, zero: zero || weight === 0, gross, net, protocol: 'SIGNED ASCII' };
    }

    const reverse = Array.from(clean.matchAll(/(?:^|[^0-9])([0-9]{4,7})[+=-]/g));
    for (let i = reverse.length - 1; i >= 0; i--) {
      const digits = reverse[i][1].split('').reverse().join('');
      const weight = this.parseNumber(digits, clean);
      if (weight !== null) return { weight, stable, zero: zero || weight === 0, gross, net, protocol: 'REVERSE ASCII' };
    }

    const unitMatches = Array.from(clean.matchAll(/([+-]?\d{1,7}(?:[.,]\d+)?)\s*(kg|kgs|t|ton|tons|tonne|tonnes|g)\b/gi));
    for (let i = unitMatches.length - 1; i >= 0; i--) {
      const m = unitMatches[i];
      const weight = this.parseNumber(m[1], `${m[1]} ${m[2]}`);
      if (weight !== null) return { weight, stable, zero: zero || weight === 0, gross, net, protocol: 'UNIT ASCII' };
    }

    // Some indicators transmit a fixed-width numeric frame without CR/LF.
    // Prefer the newest 4-7 digit token; never parse a long concatenated number as one weight.
    const fixedWidth = Array.from(clean.matchAll(/(?:^|[^0-9])(\d{4,7})(?=$|[^0-9])/g));
    for (let i = fixedWidth.length - 1; i >= 0; i--) {
      const weight = this.parseNumber(fixedWidth[i][1], clean);
      if (weight !== null) return { weight, stable, zero: zero || weight === 0, gross, net, protocol: 'FIXED-WIDTH ASCII' };
    }

    return empty;
  }

  private processFrame(frame: string, rawHex = '') {
    const clean = cleanAscii(frame);
    if (!clean) return;
    const parsed = this.extract(clean);
    if (parsed.weight === null) {
      this.emit({ invalidFrameCount: this.snapshot.invalidFrameCount + 1, rawFrame: clean, rawHex });
      return;
    }

    this.recentWeights.push(parsed.weight);
    const windowSize = this.config.stableWindowSize ?? 5;
    while (this.recentWeights.length > windowSize) this.recentWeights.shift();
    const min = Math.min(...this.recentWeights);
    const max = Math.max(...this.recentWeights);
    const tolerance = this.config.stableToleranceKg ?? 10;
    const stableByWindow = this.recentWeights.length >= Math.min(3, windowSize) && max - min <= tolerance;
    const now = new Date().toISOString();
    const changed = this.lastParsedWeight === null || this.lastParsedWeight !== parsed.weight;
    this.lastParsedWeight = parsed.weight;

    this.emit({
      weight: parsed.weight,
      stable: parsed.stable || stableByWindow,
      zero: parsed.zero,
      gross: parsed.gross,
      net: parsed.net,
      rawFrame: clean,
      rawHex,
      state: 'RECEIVING',
      parsedCount: this.snapshot.parsedCount + 1,
      lastParsedAt: now,
      lastWeightChangeAt: changed ? now : this.snapshot.lastWeightChangeAt,
      error: null,
      hasLiveData: true,
      ageMs: 0,
      protocol: parsed.protocol,
    });
    this.armStaleTimer();
  }

  private tryExtractUndelimitedStream(raw: string, rawHex: string) {
    const clean = cleanAscii(raw);
    if (!clean) return false;

    // Handle streams like +014280+014290 or repeated 6-digit fixed-width values.
    const signedMatches = Array.from(clean.matchAll(/[+=:#]\s*([0-9]{4,7})(?:\s*(?:kg|kgs))?/gi));
    if (signedMatches.length) {
      const latest = signedMatches[signedMatches.length - 1];
      const candidate = latest[0];
      if (this.extract(candidate).weight !== null) {
        this.processFrame(candidate, rawHex);
        return true;
      }
    }

    const unitMatches = Array.from(clean.matchAll(/([0-9]{4,7}(?:[.,][0-9]+)?)\s*(?:kg|kgs|t|ton|tons|tonne|tonnes)\b/gi));
    if (unitMatches.length) {
      const latest = unitMatches[unitMatches.length - 1][0];
      if (this.extract(latest).weight !== null) {
        this.processFrame(latest, rawHex);
        return true;
      }
    }

    return false;
  }

  private flushUndelimitedBuffer() {
    this.frameGapTimer = null;
    if (!this.keepReading || !this.buffer.trim()) return;
    const candidate = this.buffer;
    this.buffer = '';
    if (!this.tryExtractUndelimitedStream(candidate, this.snapshot.rawHex)) {
      if (this.extract(candidate).weight !== null) this.processFrame(candidate, this.snapshot.rawHex);
      else this.emit({ invalidFrameCount: this.snapshot.invalidFrameCount + 1, rawFrame: cleanAscii(candidate) });
    }
  }

  private scheduleUndelimitedFlush() {
    this.clearFrameGapTimer();
    this.frameGapTimer = setTimeout(() => this.flushUndelimitedBuffer(), this.config.frameGapMs ?? 60);
  }

  private consumeBytes(value: Uint8Array) {
    if (!value?.length) return;
    const now = new Date().toISOString();
    const ascii = bytesToAscii(value);
    const hex = bytesToHex(value);
    this.emit({ rxCount: this.snapshot.rxCount + 1, rxBytes: this.snapshot.rxBytes + value.length, lastRxAt: now, ageMs: 0, rawHex: hex, state: this.snapshot.hasLiveData ? this.snapshot.state : 'WAITING_RX' });

    this.buffer += ascii;
    if (this.buffer.length > 16384) this.buffer = this.buffer.slice(-8192);

    const parts = this.buffer.split(FRAME_BOUNDARY);
    if (parts.length > 1) {
      this.buffer = parts.pop() || '';
      for (const frame of parts) {
        if (frame.trim()) this.processFrame(frame, hex);
      }
      if (this.buffer.trim()) this.scheduleUndelimitedFlush();
    } else {
      // Parse immediately when a complete signed/unit frame is already present;
      // otherwise keep a short gap buffer for indicators that omit CR/LF.
      if (!this.tryExtractUndelimitedStream(this.buffer, hex)) this.scheduleUndelimitedFlush();
      else this.buffer = '';
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
    this.lastParsedWeight = null;
    this.runId += 1;
    const currentRun = this.runId;

    if (!this.port) throw new Error('Port GST-9700 tidak tersedia.');
    if (!this.port.readable) throw new Error('Port GST-9700 tidak readable. Pastikan port sudah dibuka.');

    this.keepReading = true;
    this.clearStaleTimer();
    this.emit({ state: 'WAITING_RX', error: null, hasLiveData: false, ageMs: null, stable: false, protocol: 'AUTO / ASCII' });

    try {
      try { await this.port.setSignals({ dataTerminalReady: true, requestToSend: true }); } catch (_) {}

      while (this.keepReading && currentRun === this.runId) {
        if (!this.port?.readable) throw new Error('Port GST-9700 terputus atau tidak lagi readable.');
        try {
          this.reader = this.port.readable.getReader();
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
    this.emit({ error: null, stable: false, hasLiveData: false, ageMs: null, rawFrame: '', rawHex: '', state: this.keepReading ? 'WAITING_RX' : this.snapshot.state });
  }

  async stop() {
    this.keepReading = false;
    this.runId += 1;
    await this.releaseReader();
    this.clearStaleTimer();
    this.clearFrameGapTimer();
    this.buffer = '';
    this.recentWeights = [];
    this.lastParsedWeight = null;
    this.emit({ state: 'DISCONNECTED', hasLiveData: false, stable: false, ageMs: null });
  }
}
