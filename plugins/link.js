export default [
  {
    command: ["link", "enlace"],
    description: "Obtiene el link de invitación del grupo.",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, remoteJid, reply }) {
      const code = await sock.groupInviteCode(remoteJid);
      await reply(`🔗 Link del grupo:\nhttps://chat.whatsapp.com/${code}`);
    },
  },
];
