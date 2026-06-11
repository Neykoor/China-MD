export default [
  {
    command: ["demote", "degradar"],
    description: "Quita admin a un participante. Uso: !demote @mención",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, msg, remoteJid, args, reply }) {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const target = mentioned || (args[0]?.replace(/\D/g, "") + "@s.whatsapp.net");
      if (!target || target === "@s.whatsapp.net") return reply("Menciona o indica el número a degradar.");
      await sock.groupParticipantsUpdate(remoteJid, [target], "demote");
      await reply(`✅ Admin removido del participante.`);
    },
  },
];
