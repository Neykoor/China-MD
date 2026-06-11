export function createHandler(sock, plugins) {
  return async function handler({ messages, type }) {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      const isGroup = remoteJid?.endsWith("@g.us");
      if (!isGroup) continue;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      if (!body.startsWith("!")) continue;

      const [rawCmd, ...args] = body.trim().slice(1).split(/\s+/);
      const command = rawCmd.toLowerCase();

      const senderRaw = msg.key.participant || msg.key.remoteJid;
      const sender = await sock.lid.resolve(senderRaw).catch(() => senderRaw) || senderRaw;

      let groupMeta = null;
      try {
        groupMeta = await sock.groupMetadata(remoteJid);
      } catch {}

      const isSenderAdmin = groupMeta?.participants?.some(
        (p) => (p.id === sender || p.id === senderRaw) && (p.admin === "admin" || p.admin === "superadmin")
      ) ?? false;

      const isBotAdmin = groupMeta?.participants?.some(
        (p) => p.id === sock.user.id && (p.admin === "admin" || p.admin === "superadmin")
      ) ?? false;

      const ctx = {
        sock,
        msg,
        remoteJid,
        sender,
        senderRaw,
        args,
        isGroup,
        isSenderAdmin,
        isBotAdmin,
        groupMeta,
        reply: (text) =>
          sock.sendMessage(remoteJid, { text }, { quoted: msg }),
      };

      for (const plugin of plugins) {
        const match = plugin.command === command ||
          (Array.isArray(plugin.command) && plugin.command.includes(command));

        if (!match) continue;

        if (plugin.adminOnly && !isSenderAdmin) {
          await ctx.reply("⚠️ Solo administradores pueden usar este comando.");
          break;
        }

        if (plugin.botAdmin && !isBotAdmin) {
          await ctx.reply("⚠️ El bot necesita ser administrador para ejecutar esto.");
          break;
        }

        try {
          await plugin.execute(ctx);
        } catch (err) {
          console.error(`[Handler] Error en comando "${command}":`, err);
          await ctx.reply("❌ Ocurrió un error al ejecutar el comando.");
        }

        break;
      }
    }
  };
}
