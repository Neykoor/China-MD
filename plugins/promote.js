export default [
  {
    command: ["promote", "promover"],
    description: "Promueve a admin a un participante. Uso: !promote @mención",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, msg, remoteJid, args, reply }) {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const target = mentioned || (args[0]?.replace(/\D/g, "") + "@s.whatsapp.net");
      if (!target || target === "@s.whatsapp.net") return reply("Menciona o indica el número a promover.");
      await sock.groupParticipantsUpdate(remoteJid, [target], "promote");
      await reply(`✅ Participante promovido a admin.`);
    },
  },
];
