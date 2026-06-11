export default [
  {
    command: ["revokelink", "revocarlink"],
    description: "Revoca el link de invitación del grupo.",
    adminOnly: true,
    botAdmin: true,
    async execute({ sock, remoteJid, reply }) {
      await sock.groupRevokeInvite(remoteJid);
      await reply("♻️ Link de invitación revocado.");
    },
  },
];
