export function registerWelcome(sock) {
  sock.ev.on("group-participants.update", async ({ id: groupJid, participants, action }) => {
    if (action !== "add") return;

    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {
      return;
    }

    for (const participantRaw of participants) {
      const resolved = await sock.lid.resolve(participantRaw).catch(() => null);
      const jid = resolved || participantRaw;
      const numero = jid.split("@")[0];

      const texto =
        `👋 Bienvenido/a al grupo *${groupMeta.subject}*\n` +
        `📱 +${numero}`;

      await sock.sendMessage(groupJid, { text: texto }).catch(() => {});
    }
  });
}
