from pathlib import Path
import re

path = Path('src/components/WeighbridgeModule.tsx')
s = path.read_text(encoding='utf-8')

# 1) Add authoritative diagnostic state.
needle = "  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);\n"
insert = needle + "  const [hasLiveData, setHasLiveData] = useState<boolean>(false);\n  const [syncAgeMs, setSyncAgeMs] = useState<number | null>(null);\n  const [parsedFrameCount, setParsedFrameCount] = useState<number>(0);\n  const [invalidFrameCount, setInvalidFrameCount] = useState<number>(0);\n  const [rxBytes, setRxBytes] = useState<number>(0);\n  const [syncProtocol, setSyncProtocol] = useState<string>('AUTO / ASCII');\n"
if needle not in s:
    raise SystemExit('state insertion marker not found')
s = s.replace(needle, insert, 1)

# 2) Make the engine snapshot authoritative for UI live state.
needle = "      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n"
insert = "      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n      setHasLiveData(snapshot.hasLiveData);\n      setSyncAgeMs(snapshot.ageMs);\n      setParsedFrameCount(snapshot.parsedCount);\n      setInvalidFrameCount(snapshot.invalidFrameCount);\n      setRxBytes(snapshot.rxBytes);\n      setSyncProtocol(snapshot.protocol);\n"
if needle not in s:
    raise SystemExit('snapshot marker not found')
s = s.replace(needle, insert, 1)

# 3) Prevent stale/disconnected data from being presented as live.
s = s.replace("{isSerialConnected ? 'RS-232 ACTIVE' : 'LIVE SYNC ACTIVE'}", "{hasLiveData ? 'LIVE SYNC ACTIVE' : isSerialConnected ? 'CONNECTED / WAITING RX' : 'AUTO SYNC READY'}", 1)
s = s.replace("{isSerialConnected ? 'REAL-TIME SERIAL (GST-9700)' : 'REAL-TIME LIVE SYNC ACTIVE'}", "{hasLiveData ? 'REAL-TIME SERIAL (GST-9700)' : isSerialConnected ? 'CONNECTED • WAITING DATA' : 'AUTO SYNC STANDBY'}", 1)

# 4) Replace fake diagnostic latency with measured RX age.
old = '<span className=\\"text-emerald-400 font-bold text-xs\\">&lt; 10ms (Sangat Rendah)</span>'
new = '<span className={`font-bold text-xs ${hasLiveData && (syncAgeMs ?? 999999) &lt; 1000 ? \\'text-emerald-400\\' : \\'text-yellow-400\\'}`}>{hasLiveData ? `${syncAgeMs ?? 0} ms (RX age)` : \\'Menunggu frame RX\\'}</span>'
if old not in s:
    raise SystemExit('latency marker not found')
s = s.replace(old, new, 1)

# 5) Replace the misleading "continuous streaming" fallback.
old = '<span className=\\"text-blue-300 font-bold text-xs\\">{lastRxTime || \'Kontinu Streaming\'}</span>'
new = '<span className={`font-bold text-xs ${hasLiveData ? \\'text-blue-300\\' : \\'text-neutral-500\\'}`}>{hasLiveData && lastRxTime ? lastRxTime : \\'Belum ada RX frame\\'}</span>'
if old not in s:
    raise SystemExit('last RX marker not found')
s = s.replace(old, new, 1)

# 6) Add parsed/invalid/frame-byte diagnostics next to the existing metrics.
anchor = "      {/* ASCII Raw Stream Preview */}\n"
addition = "      <div className=\\\"grid grid-cols-2 gap-2 mb-2.5 font-mono\\\">\n        <div className=\\\"bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5\\\">\n          <span className=\\\"text-[9px] text-neutral-400 font-sans\\\">Parsed Weight</span>\n          <span className=\\\"text-cyan-300 font-bold text-xs\\\">{parsedFrameCount} frame valid • {syncProtocol}</span>\n        </div>\n        <div className=\\\"bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5\\\">\n          <span className=\\\"text-[9px] text-neutral-400 font-sans\\\">RX Diagnostics</span>\n          <span className=\\\"text-neutral-200 font-bold text-xs\\\">{rxBytes} bytes • {invalidFrameCount} invalid</span>\n        </div>\n      </div>\n\n"
if anchor not in s:
    raise SystemExit('diagnostic anchor not found')
s = s.replace(anchor, addition + anchor, 1)

# 7) Ensure manual/demo stream cannot claim physical live RX.
# The simulator is explicitly labelled demo; do not alter hasLiveData from it.

path.write_text(s, encoding='utf-8')
print('GST-9700 realtime UI patch applied')
