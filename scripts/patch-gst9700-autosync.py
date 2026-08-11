from pathlib import Path

p = Path('src/components/WeighbridgeModule.tsx')
s = p.read_text(encoding='utf-8')

if "GST9700AutoSyncEngine" not in s:
    marker = "import { buildWeighbridgeWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';\n"
    s = s.replace(marker, marker + "import { GST9700AutoSyncEngine } from '../utils/GST9700AutoSyncEngine';\n", 1)

if "const autoSyncEngineRef" not in s:
    marker = "  const serialReaderRef = useRef<any>(null);\n  const keepReadingRef = useRef<boolean>(false);\n"
    s = s.replace(marker, marker + "  const autoSyncEngineRef = useRef<GST9700AutoSyncEngine | null>(null);\n", 1)

if "autoSyncEngineRef.current = new GST9700AutoSyncEngine" not in s:
    marker = "  useEffect(() => {\n    setIsSerialSupported('serial' in navigator);\n"
    insert = "  useEffect(() => {\n    autoSyncEngineRef.current = new GST9700AutoSyncEngine((snapshot) => {\n      if (snapshot.weight !== null) {\n        setSimulatorWeight(snapshot.weight);\n        setCustomSimulatorInput(String(snapshot.weight));\n      }\n      setLastRawSerialData(snapshot.rawFrame || '');\n      setRxPacketCount(snapshot.rxCount);\n      setLastRxTime(snapshot.lastRxAt);\n      if (snapshot.error) setSerialError(snapshot.error);\n      if (snapshot.state === 'RECEIVING' || snapshot.state === 'CONNECTED') setSerialError(null);\n      setIsSerialConnected(snapshot.state === 'CONNECTED' || snapshot.state === 'RECEIVING' || snapshot.state === 'STALE' || snapshot.state === 'RECONNECTING');\n    });\n\n    setIsSerialSupported('serial' in navigator);\n"
    s = s.replace(marker, insert, 1)
    s = s.replace("      keepReadingRef.current = false;\n", "      keepReadingRef.current = false;\n      autoSyncEngineRef.current?.stop();\n", 1)

old = '''  const handleForceSync = () => {\n    const timeStr = new Date().toLocaleTimeString('id-ID');\n    setLastRxTime(timeStr);\n    setRxPacketCount(prev => prev + 1);\n    (window as any).__showToast?.("⚡ SINKRONISASI BERHASIL: Buffer data serial dibersihkan & frame timbangan GST-9700 tersinkronkan instan!", "success");\n  };'''
new = '''  const handleForceSync = () => {\n    autoSyncEngineRef.current?.flush();\n    const timeStr = new Date().toLocaleTimeString('id-ID');\n    setLastRxTime(timeStr);\n    setSerialError(null);\n    (window as any).__showToast?.("⚡ GST-9700 AUTO SYNC: buffer parser di-flush dan menunggu frame timbangan terbaru.", "success");\n  };'''
if old in s:
    s = s.replace(old, new, 1)

s = s.replace("      readSerialData(port);", "      autoSyncEngineRef.current?.start(port, { baudRate: serialBaudRate, dataBits: serialDataBits, parity: serialParity, stopBits: 1 });")
s = s.replace("        readSerialData(serialPortRef.current);", "        autoSyncEngineRef.current?.start(serialPortRef.current, { baudRate: baud, dataBits: bits, parity: parityVal, stopBits: 1 });")

needle = "  const disconnectSerial = async () => {\n    keepReadingRef.current = false;\n"
if needle in s and "    await autoSyncEngineRef.current?.stop();" not in s[s.index(needle):s.index(needle)+300]:
    s = s.replace(needle, needle + "    await autoSyncEngineRef.current?.stop();\n", 1)

if "getPorts()" not in s:
    marker = "  /**\n   * Helper function to robustly parse weight packets from physical GST-700 / GST-9700 / GSC / Toledo / Yaohua indicators\n   */\n"
    effect = '''  useEffect(() => {\n    let cancelled = false;\n    const autoReconnectAuthorizedPort = async () => {\n      try {\n        if (!(navigator as any).serial?.getPorts) return;\n        const ports = await (navigator as any).serial.getPorts();\n        if (cancelled || !ports?.length || serialPortRef.current || !isAutoSyncEnabled) return;\n        const port = ports[0];\n        serialPortRef.current = port;\n        try {\n          await port.open({ baudRate: serialBaudRate, dataBits: serialDataBits, stopBits: 1, parity: serialParity, flowControl: 'none', bufferSize: 2048 });\n        } catch (e: any) {\n          if (!/already open/i.test(e?.message || '')) throw e;\n        }\n        try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }); } catch (_) {}\n        setIsSerialConnected(true);\n        setIsSimulatedStreamActive(false);\n        keepReadingRef.current = true;\n        autoSyncEngineRef.current?.start(port, { baudRate: serialBaudRate, dataBits: serialDataBits, parity: serialParity, stopBits: 1 });\n        (window as any).__showToast?.('🔄 GST-9700 AUTO SYNC: port yang sudah diberi izin tersambung kembali otomatis.', 'success');\n      } catch (e) {\n        console.info('GST-9700 auto reconnect skipped:', e);\n      }\n    };\n    autoReconnectAuthorizedPort();\n    return () => { cancelled = true; };\n  }, [isAutoSyncEnabled]);\n\n'''
    s = s.replace(marker, effect + marker, 1)

p.write_text(s, encoding='utf-8')
print('GST-9700 Auto Sync integration patch applied')
