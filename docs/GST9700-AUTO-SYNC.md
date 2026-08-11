# GST-9700 Auto Sync

## Architecture

`GSC GST-9700 -> RS-232/USB serial bridge -> Web Serial API -> GST9700AutoSyncEngine -> WeighbridgeModule -> Firebase/application state`

The browser connection is intentionally separated from transaction logic. The serial engine owns buffering, parsing, reconnect and stale-data state; the weighbridge module remains responsible for weighing workflow and ticket persistence.

## Default serial profile

- Baud rate: **9600**
- Data bits: **8**
- Parity: **None**
- Stop bits: **1**
- Flow control: **None**
- Stale timeout: **3 seconds**
- Stability window: **5 samples**
- Stability tolerance: **10 kg**
- Maximum accepted weight: **100,000 kg**

If the physical indicator is configured differently, change the serial settings in the UI before connecting.

## Realtime state contract

The engine now distinguishes port/stream state from actual valid weight data:

- `CONNECTING`: port/read loop is active, but no valid weight frame has been parsed yet.
- `RECEIVING`: a valid weight frame has been parsed recently.
- `STALE`: no serial data has arrived within the stale timeout.
- `RECONNECTING`: the serial stream was interrupted and the engine is retrying.
- `ERROR`: unrecoverable serial error.
- `DISCONNECTED`: reader stopped.

`rxCount` counts received serial read chunks and `rxBytes` counts received bytes. `parsedCount` counts valid weight frames. Therefore:

- `RX = 0`: the browser has received no bytes from the physical serial device.
- `RX > 0` and `parsedCount = 0`: bytes are arriving, but the current parser has not recognized a valid weight frame.
- `parsedCount > 0` and `hasLiveData = true`: a physical serial frame has been parsed and the displayed weight is live.
- `STALE`: the application must not silently treat the last value as current.

## Supported frame families

The parser accepts common GST/GSC/industrial indicator patterns including:

- `ST,GS,+011330kg`
- `US,GS,005420`
- `ST,NT,+011330`
- `G.W.: +011330kg`
- `=005420`
- `#005420`
- `11330kg`
- reversed numeric payloads such as `033110+`

Thousands separators such as `14.860` and `14,860` are interpreted as kilograms when they match the bounded weight format.

The parser deliberately avoids treating an arbitrarily long concatenated digit stream as one weight. This prevents a split/continuous serial stream from becoming a false multi-million-kilogram reading.

## Important data rule

`0 kg` must not be interpreted as proof that the physical indicator is connected.

Likewise, opening the COM/serial port is not sufficient to claim live synchronization. The UI should only treat the reading as live after a valid frame has been parsed.

The engine exposes:

- `state`: serial lifecycle state
- `hasLiveData`: whether a valid weight frame was received recently
- `ageMs`: age of the latest valid frame
- `stable`: stability result from the indicator and sample window
- `rawFrame`: latest parsed raw ASCII frame
- `rawHex`: latest received byte chunk in hexadecimal
- `rxBytes`: total received bytes
- `parsedCount`: total successfully parsed weight frames
- `invalidFrameCount`: frames received but rejected by the parser
- `protocol`: parser family used for the latest valid frame

When the stream becomes stale or disconnected, live-data status is cleared so the application cannot silently reuse an old physical weight.

## Browser / hosting requirements

The application is served over HTTPS and uses the browser Web Serial API. Web Serial is a browser capability and is not universally available in every browser.

The browser must also receive a user activation for `requestPort()`. The normal flow is:

1. Open the weighbridge module.
2. Select `9600 / 8 / None / 1` unless the indicator is configured differently.
3. Press **HUBUNGKAN TIMBANGAN FISIK GST-9700**.
4. Select the serial device in the browser permission dialog.
5. Confirm that RX bytes increase and a valid raw frame is being parsed.
6. Only then use the live weight for the weighing workflow.

## Physical verification boundary

Software cannot prove the physical scale is accurate merely from code. Final acceptance requires comparing the application's parsed value against the actual GST-9700 display while the indicator is transmitting.

For the site test, use several known display conditions: zero, a stable loaded reading, and a changing reading. The application should follow the display and the diagnostic counters should continue increasing. If RX remains zero, the remaining fault is outside the parser and must be investigated in the serial device/driver/cabling/indicator transmission configuration.

## Troubleshooting

### Port opens but RX stays at 0

The browser has opened a serial port but no bytes are arriving. Check the selected COM device, RS-232/USB bridge, indicator output configuration, and physical connection.

### RX increases but parsedCount stays at 0

The serial link is active but the frame format does not match the current parser. Preserve the displayed `RAW FRAME`/hex diagnostics and use an actual sample frame from the GST-9700 to add a device-specific parser rather than guessing.

### Data appears briefly then becomes stale

Check cable/bridge stability and the indicator's continuous-output mode. A stale state means no recent valid frame has been received.

### Wrong weight

Verify the indicator's output format and serial settings. Do not use simulator values as physical readings. A parser change should be made only after observing an actual GST-9700 frame.

## Deployment

Changes committed to `main` can be deployed by the connected Vercel project. After deployment, hard-refresh the application before testing serial permissions again.
