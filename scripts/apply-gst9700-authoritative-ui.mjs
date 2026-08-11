import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/components/WeighbridgeModule.tsx';
let s = readFileSync(path, 'utf8');

const must = (needle, message) => {
  if (!s.includes(needle)) throw new Error(message);
};

const addOnce = (needle, insertion, message) => {
  must(needle, message);
  if (!s.includes(insertion.trim())) s = s.replace(needle, insertion, 1);
};

// Physical RX is the only authority for LIVE SYNC. Never let demo/manual state claim physical live data.
addOnce(
  "  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);\n",
  `  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);\n  const [hasLiveData, setHasLiveData] = useState<boolean>(false);\n  const [syncAgeMs, setSyncAgeMs] = useState<number | null>(null);\n  const [lastRxIso, setLastRxIso] = useState<string>('');\n  const [parsedFrameCount, setParsedFrameCount] = useState<number>(0);\n  const [invalidFrameCount, setInvalidFrameCount] = useState<number>(0);\n  const [rxBytes, setRxBytes] = useState<number>(0);\n  const [syncProtocol, setSyncProtocol] = useState<string>('AUTO / ASCII');\n`,
  'GST-9700 state anchor not found'
);

const snapshotNeedle = `      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n`;
const snapshotInsert = `      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n      setLastRxIso(snapshot.lastRxAt || '');\n      setHasLiveData(snapshot.hasLiveData === true);\n      setSyncAgeMs(snapshot.ageMs);\n      setParsedFrameCount(snapshot.parsedCount);\n      setInvalidFrameCount(snapshot.invalidFrameCount);\n      setRxBytes(snapshot.rxBytes);\n      setSyncProtocol(snapshot.protocol);\n`;
if (s.includes(snapshotNeedle) && !s.includes('setLastRxIso(snapshot.lastRxAt')) {
  s = s.replace(snapshotNeedle, snapshotInsert, 1);
}

// Update RX age every 100 ms so the UI reflects the actual age of the last received frame.
const engineEffectMarker = `  useEffect(() => {\n    autoSyncEngineRef.current = new GST9700AutoSyncEngine`;
const ageEffect = `  useEffect(() => {\n    const timer = window.setInterval(() => {\n      if (!lastRxIso) {\n        setSyncAgeMs(null);\n        return;\n      }\n      const parsed = Date.parse(lastRxIso);\n      if (!Number.isFinite(parsed)) {\n        setSyncAgeMs(null);\n        return;\n      }\n      const age = Math.max(0, Date.now() - parsed);\n      setSyncAgeMs(age);\n      if (age > 3000) setHasLiveData(false);\n    }, 100);\n    return () => window.clearInterval(timer);\n  }, [lastRxIso]);\n\n`;
if (!s.includes('window.setInterval(() => {\n      if (!lastRxIso')) {
  must(engineEffectMarker, 'GST-9700 engine effect anchor not found');
  s = s.replace(engineEffectMarker, ageEffect + engineEffectMarker, 1);
}

// Truthful status labels.
s = s.replace(
  /isSerialConnected \? 'RS-232 ACTIVE' : 'LIVE SYNC ACTIVE'/,
  "hasLiveData ? 'LIVE SYNC ACTIVE' : isSerialConnected ? 'CONNECTED / WAITING RX' : 'AUTO SYNC READY'"
);
s = s.replace(
  /isSerialConnected \? 'REAL-TIME SERIAL \(GST-9700\)' : 'REAL-TIME LIVE SYNC ACTIVE'/,
  "hasLiveData ? 'REAL-TIME SERIAL (GST-9700)' : isSerialConnected ? 'CONNECTED • WAITING DATA' : 'AUTO SYNC STANDBY'"
);

// Remove the old hard-coded latency claim and show measured RX age instead.
s = s.replace(
  /<span className="text-emerald-400 font-bold text-xs">&lt; 10ms \(Sangat Rendah\)<\/span>/,
  `<span className={\`font-bold text-xs \${hasLiveData && (syncAgeMs ?? 999999) < 1000 ? 'text-emerald-400' : 'text-yellow-400'}\`}>\n              {hasLiveData ? \`\${syncAgeMs ?? 0} ms (RX age)\` : 'Menunggu frame RX'}\n            </span>`
);

// Do not show "Kontinu Streaming" when no physical frame has arrived.
s = s.replace(
  /<span className="text-blue-300 font-bold text-xs">\{lastRxTime \|\| 'Kontinu Streaming'\}<\/span>/,
  `<span className={\`font-bold text-xs \${hasLiveData ? 'text-blue-300' : 'text-neutral-500'}\`}>\n            {hasLiveData && lastRxTime ? lastRxTime : 'Belum ada RX frame'}\n          </span>`
);

// Connection button reflects the actual physical state.
s = s.replace(
  /\{isSerialConnected \? 'TERPUTUSKAN TIMBANGAN FISIK GST-9700' : 'HUBUNGKAN TIMBANGAN FISIK GST-9700'\}/,
  `{hasLiveData ? 'AUTO SYNC AKTIF • GST-9700' : isSerialConnected ? 'GST-9700 TERHUBUNG • MENUNGGU RX' : 'HUBUNGKAN TIMBANGAN FISIK GST-9700'}`
);

// Add explicit diagnostics once.
const anchor = `      {/* ASCII Raw Stream Preview */}`;
const panel = `      {/* Authoritative GST-9700 realtime diagnostics */}\n      <div className="grid grid-cols-2 gap-2 mb-2.5 font-mono">\n        <div className={\`bg-neutral-950/80 p-2 rounded border \${hasLiveData ? 'border-emerald-800' : 'border-neutral-800'} flex flex-col gap-0.5\`}>\n          <span className="text-[9px] text-neutral-400 font-sans">STATUS AUTO SYNC</span>\n          <span className={\`font-bold text-xs \${hasLiveData ? 'text-emerald-400' : 'text-yellow-400'}\`}>\n            {hasLiveData ? 'LIVE • RX VALID' : isSerialConnected ? 'CONNECTED • WAITING RX' : 'STANDBY'}\n          </span>\n        </div>\n        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">\n          <span className="text-[9px] text-neutral-400 font-sans">FRAME VALID</span>\n          <span className="text-cyan-300 font-bold text-xs">{parsedFrameCount}</span>\n        </div>\n        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">\n          <span className="text-[9px] text-neutral-400 font-sans">RX BYTES</span>\n          <span className="text-neutral-200 font-bold text-xs">{rxBytes}</span>\n        </div>\n        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">\n          <span className="text-[9px] text-neutral-400 font-sans">INVALID FRAME</span>\n          <span className={\`font-bold text-xs \${invalidFrameCount ? 'text-red-400' : 'text-emerald-400'}\`}>{invalidFrameCount}</span>\n        </div>\n      </div>\n\n`;
if (!s.includes('Authoritative GST-9700 realtime diagnostics')) {
  must(anchor, 'GST-9700 diagnostics anchor not found');
  s = s.replace(anchor, panel + anchor, 1);
}

writeFileSync(path, s, 'utf8');
console.log('GST-9700 authoritative realtime UI patch applied.');
