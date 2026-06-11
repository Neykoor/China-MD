export default [
  {
    command: ["info", "infogrupo"],
    description: "Muestra información del grupo.",
    async execute({ sock, remoteJid, reply }) {
      let groupMeta = null;
      try {
        groupMeta = await sock.groupMetadata(remoteJid);
      } catch {
        return reply("❌ No se pudo obtener la información del grupo.");
      }

      const admins = groupMeta.participants.filter((p) => p.admin).length;
      const text =
        `📋 *${groupMeta.subject}*\n` +
        `👥 Participantes: ${groupMeta.participants.length}\n` +
        `🛡️ Admins: ${admins}\n` +
        `📝 Descripción: ${groupMeta.desc || "Sin descripción"}`;

      await reply(text);
    },
  },
];
