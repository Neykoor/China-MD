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

      const lines = groupMeta.participants.map((p, i) => {
        const tag = p.admin === "superadmin" ? "👑" : p.admin === "admin" ? "🛡️" : "👤";
        return `${tag} ${i + 1}. ${p.id.split("@")[0]}`;
      });

      await reply(`*Participantes (${lines.length}):*\n\n${lines.join("\n")}`);
    },
  },
];
