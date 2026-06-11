export default [
  {
    command: ["kick", "remove", "expulsar"],
    description: "Expulsa a un participante. Uso: !kick @mención",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, msg, remoteJid, args, reply }) {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const target = mentioned || (args[0]?.replace(/\D/g, "") + "@s.whatsapp.net");
      if (!target || target === "@s.whatsapp.net") return reply("Menciona o indica el número a expulsar.");
      await sock.groupParticipantsUpdate(remoteJid, [target], "remove");
      await reply(`✅ Participante expulsado.`);
    },
  },
];
