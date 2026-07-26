# Bülent Türk — Personal Website

Personal engineering portfolio for Bülent Türk.

## DBC Editor

The site includes a fully client-side CAN/CAN FD DBC editor at `/dbc-editor/`.
Files are parsed, edited, validated, and exported in the browser without a
backend upload.

## CAN Viewer

`/can-viewer/` monitors classic CAN traffic from a PEAK PCAN-USB interface and
decodes live signals with a user-supplied DBC file. Browser-to-driver access is
provided by the receive-only Windows bridge in `companion/pcan-bridge/`.

The bridge binds only to `127.0.0.1`, exposes no transmit endpoint, and rejects
the PCAN connection when listen-only mode cannot be enabled. Browser requests
are restricted to the live site and local development origins. The official
PEAK driver is required separately and is not distributed in this repository.

## Development

```bash
cd source
npm install
npm run build
npx tsc --noEmit
```

The production files are generated in `dist/`.
