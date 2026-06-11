import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  UNAUTHORIZED_CODES,
  Browsers,
} from "@itsliaaa/baileys";
import { pluginLid } from "lidsync";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { loadPlugins } from "./src/loader.js";
import { createHandler } from "./src/handler.js";
import { registerWelcome } from "./src/welcome.js";

const logger = pino({ level: "silent" });

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

  const plugins = await loadPlugins();
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
      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("[Bot] ✅ Conectado como", sock.user?.id);
    }
  });

  sock.ev.on("messages.upsert", handler);
}

startBot();
