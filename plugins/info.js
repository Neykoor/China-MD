export default [
  {
    command: ["info", "infogrupo"],
    description: "Muestra información del grupo.",
    async execute({ groupMeta, reply }) {
      if (!groupMeta) return reply("No se pudo obtener la información del grupo.");
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
