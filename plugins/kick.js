export default [
  {
    command: ["kick", "remove", "expulsar"],
    description: "Expulsa a un participante. Uso: !kick @mención o !kick número",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, msg, remoteJid, args, reply }) {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const fromArg = args[0] ? args[0].replace(/\D/g, "") : null;
      const target = mentioned || (fromArg ? fromArg + "@s.whatsapp.net" : null);
      if (!target) return reply("Menciona o indica el número a expulsar.");
      await sock.groupParticipantsUpdate(remoteJid, [target], "remove").catch(() => {});
      await reply("✅ Participante expulsado.");
    },
  },
];
