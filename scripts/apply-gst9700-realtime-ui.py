from pathlib import Path

path = Path('src/components/WeighbridgeModule.tsx')
s = path.read_text(encoding='utf-8')

needle = "  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);\n"
insert = needle + """  const [hasLiveData, setHasLiveData] = useState<boolean>(false);
  const [syncAgeMs, setSyncAgeMs] = useState<number | null>(null);
  const [parsedFrameCount, setParsedFrameCount] = useState<number>(0);
  const [invalidFrameCount, setInvalidFrameCount] = useState<number>(0);
  const [rxBytes, setRxBytes] = useState<number>(0);
  const [syncProtocol, setSyncProtocol] = useState<string>('AUTO / ASCII');
"""
if needle not in s:
    raise SystemExit('state insertion marker not found')
s = s.replace(needle, insert, 1)

needle = "      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n"
insert = needle + """      setHasLiveData(snapshot.hasLiveData);
      setSyncAgeMs(snapshot.ageMs);
      setParsedFrameCount(snapshot.parsedCount);
      setInvalidFrameCount(snapshot.invalidFrameCount);
      setRxBytes(snapshot.rxBytes);
      setSyncProtocol(snapshot.protocol);
"""
if needle not in s:
    raise SystemExit('snapshot marker not found')
s = s.replace(needle, insert, 1)

replacements = [
    (
        "{isSerialConnected ? 'RS-232 ACTIVE' : 'LIVE SYNC ACTIVE'}",
        "{hasLiveData ? 'LIVE SYNC ACTIVE' : isSerialConnected ? 'CONNECTED / WAITING RX' : 'AUTO SYNC READY'}",
    ),
    (
        "{isSerialConnected ? 'REAL-TIME SERIAL (GST-9700)' : 'REAL-TIME LIVE SYNC ACTIVE'}",
        "{hasLiveData ? 'REAL-TIME SERIAL (GST-9700)' : isSerialConnected ? 'CONNECTED • WAITING DATA' : 'AUTO SYNC STANDBY'}",
    ),
]
for old, new in replacements:
    if old not in s:
        raise SystemExit(f'UI marker not found: {old}')
    s = s.replace(old, new, 1)

old = '<span className="text-emerald-400 font-bold text-xs">&lt; 10ms (Sangat Rendah)</span>'
new = """<span className={`font-bold text-xs ${hasLiveData && (syncAgeMs ?? 999999) < 1000 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {hasLiveData ? `${syncAgeMs ?? 0} ms (RX age)` : 'Menunggu frame RX'}
            </span>"""
if old not in s:
    raise SystemExit('latency marker not found')
s = s.replace(old, new, 1)

old = "<span className=\"text-blue-300 font-bold text-xs\">{lastRxTime || 'Kontinu Streaming'}</span>"
new = """<span className={`font-bold text-xs ${hasLiveData ? 'text-blue-300' : 'text-neutral-500'}`}>
            {hasLiveData && lastRxTime ? lastRxTime : 'Belum ada RX frame'}
          </span>"""
if old not in s:
    raise SystemExit('last RX marker not found')
s = s.replace(old, new, 1)

anchor = "      {/* ASCII Raw Stream Preview */}\n"
addition = """      <div className="grid grid-cols-2 gap-2 mb-2.5 font-mono">
        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">Parsed Weight</span>
          <span className="text-cyan-300 font-bold text-xs">{parsedFrameCount} frame valid • {syncProtocol}</span>
        </div>
        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">RX Diagnostics</span>
          <span className="text-neutral-200 font-bold text-xs">{rxBytes} bytes • {invalidFrameCount} invalid</span>
        </div>
      </div>

"""
if anchor not in s:
    raise SystemExit('diagnostic anchor not found')
s = s.replace(anchor, addition + anchor, 1)

path.write_text(s, encoding='utf-8')
print('GST-9700 realtime UI patch applied')
