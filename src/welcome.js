export function registerWelcome(sock) {
  sock.ev.on("group-participants.update", async ({ id: groupJid, participants, action }) => {
    if (action !== "add") return;

    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {
      return;
    }

    for (const p of participants) {
      let numero = null;

      if (typeof p === "string") {
        const resolved = await sock.lid.resolve(p).catch(() => null);
        const jid = resolved || p;
        numero = jid.split("@")[0];
      } else {
        const pn = p.phoneNumber || p.pn;
        if (pn && typeof pn === "string") {
          const clean = pn.replace(/\D/g, "");
          if (clean.length >= 7) numero = clean;
        }

        if (!numero && p.lid) {
          const resolved = await sock.lid.resolve(p.lid).catch(() => null);
          if (resolved) numero = resolved.split("@")[0];
        }
      }

      if (!numero) continue;

      const texto =
        `👋 Bienvenido/a al grupo *${groupMeta.subject}*\n` +
        `📱 +${numero}`;

      await sock.sendMessage(groupJid, { text: texto }).catch(() => {});
    }
  });
}
