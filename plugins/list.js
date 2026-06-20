export default [
  {
    command: ["list", "lista"],
    description: "Lista los participantes del grupo.",
    async execute({ sock, remoteJid, reply }) {
      let groupMeta = null;
      try {
        groupMeta = await sock.groupMetadata(remoteJid);
      } catch {
        return reply("❌ No se pudo obtener la lista.");
      }

      const participants = groupMeta.participants;

      const resolvedMap = await sock.lid
        .resolveParticipants(participants)
        .catch(() => new Map());

      const lines = participants.map((p, i) => {
        const tag = p.admin === "superadmin" ? "👑" : p.admin === "admin" ? "🛡️" : "👤";
        const jid = resolvedMap.get(p.id) || p.id;
        const numero = jid.split("@")[0];
        return `${tag} ${i + 1}. ${numero}`;
      });

      await reply(`*Participantes (${lines.length}):*\n\n${lines.join("\n")}`);
    },
  },
];
