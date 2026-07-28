using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace PcanLocalBridge
{
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    internal struct TPCANMsg
    {
        public UInt32 ID;
        public Byte MSGTYPE;
        public Byte LEN;

        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 8)]
        public Byte[] DATA;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    internal struct TPCANTimestamp
    {
        public UInt32 millis;
        public UInt16 millis_overflow;
        public UInt16 micros;
    }

    internal sealed class CanFrame
    {
        public long Sequence;
        public double TimestampMs;
        public UInt32 Id;
        public bool Extended;
        public bool Rtr;
        public bool Error;
        public string Direction;
        public byte[] Data;

        public string ToJson()
        {
            StringBuilder bytes = new StringBuilder();
            for (int index = 0; index < Data.Length; index++)
            {
                if (index > 0) bytes.Append(",");
                bytes.Append(Data[index].ToString(CultureInfo.InvariantCulture));
            }

            return string.Format(
                CultureInfo.InvariantCulture,
                "{{\"sequence\":{0},\"timestampMs\":{1:0.###},\"id\":{2},\"extended\":{3},\"rtr\":{4},\"error\":{5},\"direction\":\"{6}\",\"data\":[{7}]}}",
                Sequence,
                TimestampMs,
                Id,
                Extended ? "true" : "false",
                Rtr ? "true" : "false",
                Error ? "true" : "false",
                String.IsNullOrEmpty(Direction) ? "rx" : Direction,
                bytes.ToString()
            );
        }
    }

    internal static class Pcan
    {
        private const UInt32 PCAN_ERROR_OK = 0x00000;
        private const UInt32 PCAN_ERROR_QRCVEMPTY = 0x00020;
        private const Byte PCAN_MESSAGE_RTR = 0x01;
        private const Byte PCAN_MESSAGE_EXTENDED = 0x02;
        private const Byte PCAN_MESSAGE_STATUS = 0x80;
        private const Byte PCAN_LISTEN_ONLY = 0x08;
        private const UInt32 PCAN_PARAMETER_ON = 1;
        private const UInt32 PCAN_PARAMETER_OFF = 0;
        private const int MaximumQueuedFrames = 100000;

        private static readonly object Sync = new object();
        private static readonly ConcurrentQueue<CanFrame> Queue =
            new ConcurrentQueue<CanFrame>();
        private static readonly Dictionary<int, UInt16> Bitrates =
            new Dictionary<int, UInt16>
            {
                { 1000000, 0x0014 },
                { 800000, 0x0016 },
                { 500000, 0x001C },
                { 250000, 0x011C },
                { 125000, 0x031C },
                { 100000, 0x432F },
                { 95238, 0xC34E },
                { 83333, 0x852B },
                { 50000, 0x472F },
                { 47619, 0x1414 },
                { 33333, 0x8B2F },
                { 20000, 0x532F },
                { 10000, 0x672F },
                { 5000, 0x7F7F }
            };

        private static volatile bool _connected;
        private static UInt16 _channelHandle;
        private static int _channelIndex;
        private static int _bitrate;
        private static long _sequence;
        private static long _dropped;
        private static long _sent;
        private static int _queued;
        private static bool _listenOnly = true;
        private static string _lastError = "";
        private static Thread _readThread;

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_Initialize",
            CallingConvention = CallingConvention.StdCall
        )]
        private static extern UInt32 CAN_Initialize(
            UInt16 channel,
            UInt16 btr0Btr1,
            Byte hwType,
            UInt32 ioPort,
            UInt16 interrupt
        );

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_Uninitialize",
            CallingConvention = CallingConvention.StdCall
        )]
        private static extern UInt32 CAN_Uninitialize(UInt16 channel);

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_Read",
            CallingConvention = CallingConvention.StdCall
        )]
        private static extern UInt32 CAN_Read(
            UInt16 channel,
            ref TPCANMsg message,
            ref TPCANTimestamp timestamp
        );

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_Write",
            CallingConvention = CallingConvention.StdCall
        )]
        private static extern UInt32 CAN_Write(UInt16 channel, ref TPCANMsg message);

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_SetValue",
            CallingConvention = CallingConvention.StdCall
        )]
        private static extern UInt32 CAN_SetValue(
            UInt16 channel,
            Byte parameter,
            ref UInt32 buffer,
            UInt32 bufferLength
        );

        [DllImport(
            "PCANBasic.dll",
            EntryPoint = "CAN_GetErrorText",
            CallingConvention = CallingConvention.StdCall,
            CharSet = CharSet.Ansi
        )]
        private static extern UInt32 CAN_GetErrorText(
            UInt32 error,
            UInt16 language,
            StringBuilder buffer
        );

        public static string Connect(int channelIndex, int bitrate, bool listenOnly)
        {
            lock (Sync)
            {
                DisconnectInternal();
                ClearQueue();
                _lastError = "";

                if (channelIndex < 1 || channelIndex > 16)
                {
                    return ErrorStatus("PCAN USB channel must be between 1 and 16.");
                }

                UInt16 bitrateCode;
                if (!Bitrates.TryGetValue(bitrate, out bitrateCode))
                {
                    return ErrorStatus("Unsupported CAN bit rate.");
                }

                try
                {
                    UInt16 handle = UsbChannelHandle(channelIndex);
                    UInt32 listenOnlyValue =
                        listenOnly ? PCAN_PARAMETER_ON : PCAN_PARAMETER_OFF;
                    UInt32 result = CAN_SetValue(
                        handle,
                        PCAN_LISTEN_ONLY,
                        ref listenOnlyValue,
                        (UInt32)Marshal.SizeOf(typeof(UInt32))
                    );
                    if (result != PCAN_ERROR_OK)
                    {
                        return ErrorStatus(
                            "Requested CAN operating mode could not be enabled: " +
                            ErrorText(result)
                        );
                    }

                    result = CAN_Initialize(handle, bitrateCode, 0, 0, 0);
                    if (result != PCAN_ERROR_OK)
                    {
                        CAN_Uninitialize(handle);
                        return ErrorStatus(ErrorText(result));
                    }

                    _channelHandle = handle;
                    _channelIndex = channelIndex;
                    _bitrate = bitrate;
                    _listenOnly = listenOnly;
                    _connected = true;
                    _readThread = new Thread(ReadLoop);
                    _readThread.Name = "PCAN receive";
                    _readThread.IsBackground = true;
                    _readThread.Start();
                    return StatusJson(true);
                }
                catch (DllNotFoundException)
                {
                    return ErrorStatus(
                        "PCANBasic.dll was not found. Install the official PEAK-System driver first."
                    );
                }
                catch (BadImageFormatException)
                {
                    return ErrorStatus(
                        "PCANBasic.dll architecture does not match PowerShell. Start the 64-bit Windows PowerShell."
                    );
                }
                catch (Exception exception)
                {
                    return ErrorStatus(exception.Message);
                }
            }
        }

        private static UInt16 UsbChannelHandle(int channelIndex)
        {
            return channelIndex <= 8
                ? (UInt16)(0x50 + channelIndex)
                : (UInt16)(0x500 + channelIndex);
        }

        public static string Disconnect()
        {
            lock (Sync)
            {
                DisconnectInternal();
                return StatusJson(true);
            }
        }

        private static void DisconnectInternal()
        {
            bool wasConnected = _connected;
            _connected = false;
            _listenOnly = true;
            if (wasConnected)
            {
                try
                {
                    CAN_Uninitialize(_channelHandle);
                }
                catch
                {
                    // The process is shutting down or the driver is no longer available.
                }
            }
        }

        private static void ReadLoop()
        {
            while (_connected)
            {
                TPCANMsg message = new TPCANMsg();
                message.DATA = new byte[8];
                TPCANTimestamp timestamp = new TPCANTimestamp();
                UInt32 result;

                try
                {
                    result = CAN_Read(_channelHandle, ref message, ref timestamp);
                }
                catch (Exception exception)
                {
                    _lastError = exception.Message;
                    Thread.Sleep(25);
                    continue;
                }

                if (result == PCAN_ERROR_QRCVEMPTY)
                {
                    Thread.Sleep(1);
                    continue;
                }
                if (result != PCAN_ERROR_OK)
                {
                    _lastError = ErrorText(result);
                    Thread.Sleep(5);
                    continue;
                }

                int length = Math.Min((int)message.LEN, 8);
                byte[] data = new byte[length];
                if (length > 0 && message.DATA != null)
                {
                    Array.Copy(message.DATA, data, length);
                }

                UInt64 totalMillis =
                    ((UInt64)timestamp.millis_overflow << 32) + timestamp.millis;
                double timestampMs = totalMillis + (timestamp.micros / 1000.0);
                CanFrame frame = new CanFrame
                {
                    Sequence = Interlocked.Increment(ref _sequence),
                    TimestampMs = timestampMs,
                    Id = message.ID,
                    Extended = (message.MSGTYPE & PCAN_MESSAGE_EXTENDED) != 0,
                    Rtr = (message.MSGTYPE & PCAN_MESSAGE_RTR) != 0,
                    Error = (message.MSGTYPE & PCAN_MESSAGE_STATUS) != 0,
                    Direction = "rx",
                    Data = data
                };
                Queue.Enqueue(frame);
                int queued = Interlocked.Increment(ref _queued);
                while (queued > MaximumQueuedFrames)
                {
                    CanFrame discarded;
                    if (!Queue.TryDequeue(out discarded)) break;
                    queued = Interlocked.Decrement(ref _queued);
                    Interlocked.Increment(ref _dropped);
                }
            }
        }

        public static string FramesJson(int limit)
        {
            limit = Math.Max(1, Math.Min(limit, 10000));
            StringBuilder frames = new StringBuilder();
            CanFrame frame;
            int count = 0;
            while (count < limit && Queue.TryDequeue(out frame))
            {
                Interlocked.Decrement(ref _queued);
                if (count > 0) frames.Append(",");
                frames.Append(frame.ToJson());
                count++;
            }

            return string.Format(
                CultureInfo.InvariantCulture,
                "{{\"ok\":true,\"frames\":[{0}],\"dropped\":{1}}}",
                frames.ToString(),
                Interlocked.Read(ref _dropped)
            );
        }

        public static string Send(UInt32 id, bool extended, byte[] data)
        {
            lock (Sync)
            {
                if (!_connected)
                {
                    return ErrorStatus("Connect to the CAN bus before transmitting.");
                }
                if (_listenOnly)
                {
                    return ErrorStatus(
                        "Transmission is blocked while the connection is in listen-only mode."
                    );
                }
                if ((!extended && id > 0x7FF) || (extended && id > 0x1FFFFFFF))
                {
                    return ErrorStatus("CAN identifier is outside the selected frame range.");
                }
                if (data == null || data.Length > 8)
                {
                    return ErrorStatus("Classic CAN data length must be between 0 and 8 bytes.");
                }

                TPCANMsg message = new TPCANMsg();
                message.ID = id;
                message.MSGTYPE = extended ? PCAN_MESSAGE_EXTENDED : (Byte)0;
                message.LEN = (Byte)data.Length;
                message.DATA = new byte[8];
                if (data.Length > 0) Array.Copy(data, message.DATA, data.Length);

                UInt32 result;
                try
                {
                    result = CAN_Write(_channelHandle, ref message);
                }
                catch (Exception exception)
                {
                    return ErrorStatus(exception.Message);
                }

                if (result != PCAN_ERROR_OK)
                {
                    return ErrorStatus(ErrorText(result));
                }

                long sent = Interlocked.Increment(ref _sent);
                _lastError = "";
                return string.Format(
                    CultureInfo.InvariantCulture,
                    "{{\"ok\":true,\"sent\":{0}}}",
                    sent
                );
            }
        }

        public static string StatusJson(bool ok)
        {
            return string.Format(
                CultureInfo.InvariantCulture,
                "{{\"ok\":{0},\"version\":\"1.1.0\",\"connected\":{1},\"channel\":{2},\"bitrate\":{3},\"listenOnly\":{4},\"queued\":{5},\"dropped\":{6},\"sent\":{7},\"error\":\"{8}\"}}",
                ok ? "true" : "false",
                _connected ? "true" : "false",
                _channelIndex,
                _bitrate,
                _listenOnly ? "true" : "false",
                Math.Max(0, _queued),
                Interlocked.Read(ref _dropped),
                Interlocked.Read(ref _sent),
                JsonEscape(_lastError)
            );
        }

        private static string ErrorStatus(string message)
        {
            _lastError = message ?? "Unknown PCAN error.";
            return StatusJson(false);
        }

        private static string ErrorText(UInt32 status)
        {
            try
            {
                StringBuilder buffer = new StringBuilder(256);
                if (CAN_GetErrorText(status, 0, buffer) == PCAN_ERROR_OK)
                {
                    return buffer.ToString();
                }
            }
            catch
            {
                // Fall back to the numeric code below.
            }
            return "PCAN error 0x" + status.ToString("X", CultureInfo.InvariantCulture);
        }

        private static string JsonEscape(string value)
        {
            if (String.IsNullOrEmpty(value)) return "";
            return value
                .Replace("\\", "\\\\")
                .Replace("\"", "\\\"")
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }

        private static void ClearQueue()
        {
            CanFrame frame;
            while (Queue.TryDequeue(out frame))
            {
                Interlocked.Decrement(ref _queued);
            }
            _queued = 0;
            _dropped = 0;
            _sent = 0;
        }
    }

    public static class Server
    {
        private const int Port = 8765;
        private static readonly string[] AllowedOrigins =
        {
            "https://algo-team.com",
            "https://www.algo-team.com",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        };

        public static void Run()
        {
            Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs args)
            {
                Pcan.Disconnect();
                args.Cancel = false;
            };

            TcpListener listener = new TcpListener(IPAddress.Loopback, Port);
            listener.Start();
            Console.WriteLine("PCAN Local Bridge v1.2.0");
            Console.WriteLine("Local API: http://127.0.0.1:" + Port);
            Console.WriteLine("Open https://algo-team.com/can-viewer/ in Chrome or Edge.");
            Console.WriteLine("Press Ctrl+C to stop.");
            Console.WriteLine();

            while (true)
            {
                TcpClient client = listener.AcceptTcpClient();
                Thread worker = new Thread(delegate() { HandleClient(client); });
                worker.IsBackground = true;
                worker.Start();
            }
        }

        private static void HandleClient(TcpClient client)
        {
            using (client)
            {
                try
                {
                    client.ReceiveTimeout = 5000;
                    client.SendTimeout = 5000;
                    NetworkStream stream = client.GetStream();
                    StreamReader reader = new StreamReader(
                        stream,
                        new UTF8Encoding(false),
                        false,
                        2048,
                        true
                    );

                    string requestLine = reader.ReadLine();
                    if (String.IsNullOrEmpty(requestLine))
                    {
                        WriteResponse(stream, 400, "{\"ok\":false}", "");
                        return;
                    }

                    string[] requestParts = requestLine.Split(' ');
                    string method = requestParts.Length > 0 ? requestParts[0] : "GET";
                    string rawPath = requestParts.Length > 1 ? requestParts[1] : "/";
                    int contentLength = 0;
                    string origin = "";
                    string line;
                    while (!String.IsNullOrEmpty(line = reader.ReadLine()))
                    {
                        int separator = line.IndexOf(':');
                        if (separator < 0) continue;
                        string name = line.Substring(0, separator).Trim();
                        string value = line.Substring(separator + 1).Trim();
                        if (name.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
                        {
                            Int32.TryParse(value, out contentLength);
                        }
                        else if (name.Equals("Origin", StringComparison.OrdinalIgnoreCase))
                        {
                            origin = value;
                        }
                    }

                    if (!OriginAllowed(origin))
                    {
                        WriteResponse(
                            stream,
                            403,
                            "{\"ok\":false,\"error\":\"Origin not allowed\"}",
                            ""
                        );
                        return;
                    }

                    if (method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                    {
                        WriteResponse(stream, 204, "", origin);
                        return;
                    }

                    string body = "";
                    if (contentLength > 0)
                    {
                        char[] chars = new char[contentLength];
                        int total = 0;
                        while (total < chars.Length)
                        {
                            int read = reader.Read(chars, total, chars.Length - total);
                            if (read <= 0) break;
                            total += read;
                        }
                        body = new string(chars, 0, total);
                    }

                    Uri uri;
                    if (!Uri.TryCreate("http://127.0.0.1" + rawPath, UriKind.Absolute, out uri))
                    {
                        WriteResponse(stream, 400, "{\"ok\":false}", origin);
                        return;
                    }

                    string response;
                    if (uri.AbsolutePath == "/api/status" && method == "GET")
                    {
                        response = Pcan.StatusJson(true);
                    }
                    else if (uri.AbsolutePath == "/api/connect" && method == "POST")
                    {
                        int channel = JsonInteger(body, "channel", 1);
                        int bitrate = JsonInteger(body, "bitrate", 250000);
                        bool listenOnly = JsonBoolean(body, "listenOnly", true);
                        response = Pcan.Connect(channel, bitrate, listenOnly);
                    }
                    else if (uri.AbsolutePath == "/api/disconnect" && method == "POST")
                    {
                        response = Pcan.Disconnect();
                    }
                    else if (uri.AbsolutePath == "/api/frames" && method == "GET")
                    {
                        int limit = QueryInteger(uri.Query, "limit", 5000);
                        response = Pcan.FramesJson(limit);
                    }
                    else if (uri.AbsolutePath == "/api/send" && method == "POST")
                    {
                        UInt32 id = JsonUInt32(body, "id", 0);
                        bool extended = JsonBoolean(body, "extended", false);
                        byte[] data = JsonByteArray(body, "data");
                        response = Pcan.Send(id, extended, data);
                    }
                    else
                    {
                        WriteResponse(
                            stream,
                            404,
                            "{\"ok\":false,\"error\":\"Not found\"}",
                            origin
                        );
                        return;
                    }

                    WriteResponse(stream, 200, response, origin);
                }
                catch
                {
                    // A browser can close a polling connection before the response is written.
                }
            }
        }

        private static int JsonInteger(string json, string name, int fallback)
        {
            Match match = Regex.Match(
                json ?? "",
                "\"" + Regex.Escape(name) + "\"\\s*:\\s*(\\d+)",
                RegexOptions.IgnoreCase
            );
            int value;
            return match.Success && Int32.TryParse(match.Groups[1].Value, out value)
                ? value
                : fallback;
        }

        private static UInt32 JsonUInt32(string json, string name, UInt32 fallback)
        {
            Match match = Regex.Match(
                json ?? "",
                "\"" + Regex.Escape(name) + "\"\\s*:\\s*(\\d+)",
                RegexOptions.IgnoreCase
            );
            UInt32 value;
            return match.Success && UInt32.TryParse(match.Groups[1].Value, out value)
                ? value
                : fallback;
        }

        private static bool JsonBoolean(string json, string name, bool fallback)
        {
            Match match = Regex.Match(
                json ?? "",
                "\"" + Regex.Escape(name) + "\"\\s*:\\s*(true|false)",
                RegexOptions.IgnoreCase
            );
            bool value;
            return match.Success && Boolean.TryParse(match.Groups[1].Value, out value)
                ? value
                : fallback;
        }

        private static byte[] JsonByteArray(string json, string name)
        {
            Match match = Regex.Match(
                json ?? "",
                "\"" + Regex.Escape(name) + "\"\\s*:\\s*\\[([^\\]]*)\\]",
                RegexOptions.IgnoreCase
            );
            if (!match.Success || String.IsNullOrWhiteSpace(match.Groups[1].Value))
            {
                return new byte[0];
            }

            string[] tokens = match.Groups[1].Value.Split(',');
            if (tokens.Length > 8) return null;
            byte[] data = new byte[tokens.Length];
            for (int index = 0; index < tokens.Length; index++)
            {
                int value;
                if (!Int32.TryParse(tokens[index].Trim(), out value) || value < 0 || value > 255)
                {
                    return null;
                }
                data[index] = (byte)value;
            }
            return data;
        }

        private static int QueryInteger(string query, string name, int fallback)
        {
            Match match = Regex.Match(
                query ?? "",
                "(?:\\?|&)" + Regex.Escape(name) + "=(\\d+)",
                RegexOptions.IgnoreCase
            );
            int value;
            return match.Success && Int32.TryParse(match.Groups[1].Value, out value)
                ? value
                : fallback;
        }

        private static bool OriginAllowed(string origin)
        {
            if (String.IsNullOrEmpty(origin)) return false;
            foreach (string allowed in AllowedOrigins)
            {
                if (origin.Equals(allowed, StringComparison.OrdinalIgnoreCase)) return true;
            }
            return false;
        }

        private static void WriteResponse(
            NetworkStream stream,
            int statusCode,
            string body,
            string origin
        )
        {
            string statusText =
                statusCode == 200 ? "OK" :
                statusCode == 204 ? "No Content" :
                statusCode == 403 ? "Forbidden" :
                statusCode == 404 ? "Not Found" : "Bad Request";
            byte[] payload = Encoding.UTF8.GetBytes(body ?? "");
            StringBuilder headers = new StringBuilder();
            headers.AppendFormat(
                CultureInfo.InvariantCulture,
                "HTTP/1.1 {0} {1}\r\n",
                statusCode,
                statusText
            );
            headers.Append("Content-Type: application/json; charset=utf-8\r\n");
            headers.Append("Cache-Control: no-store\r\n");
            headers.Append("Connection: close\r\n");
            headers.Append("Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n");
            headers.Append("Access-Control-Allow-Headers: Content-Type\r\n");
            headers.Append("Access-Control-Allow-Private-Network: true\r\n");
            headers.Append("Vary: Origin\r\n");
            if (OriginAllowed(origin))
            {
                headers.Append("Access-Control-Allow-Origin: ");
                headers.Append(String.IsNullOrEmpty(origin) ? "*" : origin);
                headers.Append("\r\n");
            }
            headers.AppendFormat(
                CultureInfo.InvariantCulture,
                "Content-Length: {0}\r\n\r\n",
                payload.Length
            );

            byte[] headerBytes = Encoding.ASCII.GetBytes(headers.ToString());
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (payload.Length > 0) stream.Write(payload, 0, payload.Length);
            stream.Flush();
        }
    }
}
