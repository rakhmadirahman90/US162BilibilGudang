# GST-9700 Auto Sync

## Architecture

`GSC GST-9700 -> RS-232/USB or Bluetooth serial bridge -> Web Serial API -> GST9700AutoSyncEngine -> WeighbridgeModule -> Firebase/application state`

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

If the physical indicator is configured differently, change the serial settings in the UI before connecting.

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

Thousands separators such as `14.860` and `14,860` are interpreted as kilograms.

## Important data rule

`0 kg` must not be interpreted as proof that the physical indicator is connected.

The engine exposes:

- `state`: serial lifecycle state
- `hasLiveData`: whether a valid weight frame was received recently
- `ageMs`: age of the latest frame
- `stable`: stability result from the indicator and sample window
- `rawFrame`: latest raw frame

When the stream becomes stale or disconnected, live-data status is cleared so the application cannot silently reuse an old physical weight.

## Browser / hosting requirements

The application is served over HTTPS and includes a Vercel `Permissions-Policy` header allowing `serial` for the same origin.

Web Serial is a browser capability and is not universally available in every browser. Use a current Chromium-based browser with Web Serial support. On Android, current Chrome releases support Web Serial over Bluetooth RFCOMM; wired USB-serial support depends on the Android/browser/device support available on the target device.

The browser must also receive a user activation for `requestPort()`. The normal flow is:

1. Open the weighbridge module.
2. Select `9600 / 8 / None / 1` unless the indicator is configured differently.
3. Press **HUBUNGKAN TIMBANGAN FISIK GST-9700**.
4. Select the serial device in the browser permission dialog.
5. Confirm that `RX` increases and a recent `RAW FRAME` is shown.
6. Only then use the live weight for the weighing workflow.

## Troubleshooting

### Connected but weight stays at 0

Check that the indicator is actually transmitting continuously and that the serial bridge exposes a supported serial port. Check the raw frame/packet counter rather than relying on the display alone.

### No serial device appears

Check browser support, HTTPS, device permission and the physical serial bridge. The application cannot create a serial device that the operating system does not expose.

### Data appears briefly then becomes stale

Check cable/bridge stability and indicator transmission mode. A stale state means no valid weight frame has been received within the configured timeout.

### Wrong weight

Verify the indicator's output format and serial settings. Do not use the simulator value as a physical reading.

## Deployment

Changes committed to `main` can be deployed by the connected Vercel project. After deployment, hard-refresh the application before testing the serial permission again.
