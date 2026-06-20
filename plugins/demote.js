export default [
  {
    command: ["demote", "degradar"],
    description: "Quita admin a un participante. Uso: !demote @mención o !demote número",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, msg, remoteJid, args, reply }) {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const fromArg = args[0] ? args[0].replace(/\D/g, "") : null;
      const target = mentioned || (fromArg ? fromArg + "@s.whatsapp.net" : null);
      if (!target) return reply("Menciona o indica el número a degradar.");
      await sock.groupParticipantsUpdate(remoteJid, [target], "demote").catch(() => {});
      await reply("✅ Admin removido del participante.");
    },
  },
];
