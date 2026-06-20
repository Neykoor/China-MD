export default [
  {
    command: ["open", "abrir"],
    description: "Abre el grupo para que cualquiera pueda enviar mensajes.",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, remoteJid, reply }) {
      await sock.groupSettingUpdate(remoteJid, "not_announcement");
      await reply("🔓 Grupo abierto.");
    },
  },
];
