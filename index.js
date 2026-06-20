import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  UNAUTHORIZED_CODES,
  Browsers,
} from "wabaileys";
import { pluginLid } from "lidsync";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { loadPlugins } from "./src/loader.js";
import { createHandler } from "./src/handler.js";
import { registerWelcome } from "./src/welcome.js";
import { adminManager } from "./src/adminManager.js";

const logger = pino({ level: "silent" });
let plugins = [];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: Browsers.macOS("Chrome"),
    printQRInTerminal: false,
  });

  pluginLid(sock);

  if (plugins.length === 0) {
    plugins = await loadPlugins();
  }

  const handler = createHandler(sock, plugins);

  registerWelcome(sock);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log("📱 Escanea el código QR:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = !UNAUTHORIZED_CODES.includes(statusCode);
      console.log(`[Bot] Conexión cerrada (${statusCode}). Reconectar: ${shouldReconnect}`);
      adminManager.invalidateAll();
      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("[Bot] ✅ Conectado como", sock.user?.id);
    }
  });

  sock.ev.on("messages.upsert", handler);
}

startBot();
