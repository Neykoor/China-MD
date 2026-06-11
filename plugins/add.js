export default [
  {
    command: ["add", "agregar"],
    description: "Agrega un número al grupo. Uso: !add número",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, remoteJid, args, reply }) {
      const fromArg = args[0] ? args[0].replace(/\D/g, "") : null;
      if (!fromArg) return reply("Uso: !add <número>");
      const jid = fromArg + "@s.whatsapp.net";
      const result = await sock.groupParticipantsUpdate(remoteJid, [jid], "add").catch(() => null);
      const status = result?.[0]?.status;
      await reply(status === "200" ? `✅ ${fromArg} agregado.` : `⚠️ No se pudo agregar (código ${status ?? "?"}).`);
    },
  },
];
