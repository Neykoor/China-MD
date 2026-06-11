export default [
  {
    command: ["add", "agregar"],
    description: "Agrega un número al grupo. Uso: !add 521234567890",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, remoteJid, args, reply }) {
      if (!args[0]) return reply("Uso: !add <número>");
      const jid = args[0].replace(/\D/g, "") + "@s.whatsapp.net";
      const result = await sock.groupParticipantsUpdate(remoteJid, [jid], "add");
      const status = result?.[0]?.status;
      await reply(status === "200" ? `✅ ${args[0]} agregado.` : `⚠️ No se pudo agregar (código ${status}).`);
    },
  },
];
