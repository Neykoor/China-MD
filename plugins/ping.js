export default [
  {
    command: ["ping"],
    description: "Comprueba que el bot está activo.",
    async execute({ reply }) {
      await reply("🏓 pong");
    },
  },
];
