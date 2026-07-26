BÜLENT TÜRK CAN VIEWER — PCAN LOCAL BRIDGE v1.0.0
==================================================

This small bridge connects the CAN Viewer on bulentturk.com to the PEAK
PCAN-Basic Windows driver. It runs only on your local computer.

SETUP
1. Install the official PEAK-System Windows driver:
   https://www.peak-system.com/quick/DL-Driver-E
2. Connect PCAN-USB to the computer and the CAN bus.
3. Extract this ZIP file completely into a folder.
4. Double-click Start-PCAN-Bridge.cmd.
5. Keep the black console window open.
6. Open this address in Chrome or Edge:
   https://bulentturk.com/can-viewer/
7. Choose the PCAN channel and CAN bit rate, then select “Connect to CAN”.

SECURITY AND PRIVACY
- The bridge listens only on 127.0.0.1:8765, on your own computer.
- It accepts browser requests only from bulentturk.com and local development
  addresses.
- It contains no CAN transmit function.
- The connection is opened in listen-only mode. If listen-only cannot be
  enabled, the CAN connection is rejected.
- Your DBC file and CAN data are never uploaded to a server.
- Press Ctrl+C in the console or close its window to stop the bridge.

NOTES
- The target platform is Windows 10/11 with 64-bit Windows PowerShell.
- If PCAN-View or another PCAN-Basic application is using the same channel,
  you may need to close it first.
- Verify the correct CAN bit rate and 120-ohm termination at both bus ends.
- The PEAK driver and PCANBasic.dll are not included in this ZIP file.

PCAN is a trademark of PEAK-System Technik GmbH.
This helper is not developed or endorsed by PEAK-System.
