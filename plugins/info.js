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

      const participants = groupMeta.participants;

      const resolvedMap = await sock.lid
        .resolveParticipants(participants)
        .catch(() => new Map());

      const admins = participants.filter((p) => p.admin).length;

      const adminList = participants
        .filter((p) => p.admin)
        .map((p) => {
          const jid = resolvedMap.get(p.id) || p.id;
          const numero = jid.split("@")[0];
          const tag = p.admin === "superadmin" ? "👑" : "🛡️";
          return `  ${tag} +${numero}`;
        })
        .join("\n");

      const text =
        `📋 *${groupMeta.subject}*\n` +
        `👥 Participantes: ${participants.length}\n` +
        `🛡️ Admins: ${admins}\n` +
        (adminList ? `${adminList}\n` : "") +
        `📝 Descripción: ${groupMeta.desc || "Sin descripción"}`;

      await reply(text);
    },
  },
];
