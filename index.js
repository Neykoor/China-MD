import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { pluginLid } from "lidsync";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { loadPlugins } from "./src/loader.js";
import { createHandler } from "./src/handler.js";

const logger = pino({ level: "silent" });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  let sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ["LidSync Bot", "Chrome", "1.0.0"],
  });

  pluginLid(sock);

  const plugins = await loadPlugins();
  const handler = createHandler(sock, plugins);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log("📱 Escanea el código QR:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`[Bot] Conexión cerrada (${code}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("[Bot] ✅ Conectado como", sock.user?.id);
    }
  });

  sock.ev.on("messages.upsert", handler);
}

startBot();
