import { readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadPlugins() {
  const pluginsDir = resolve(__dirname, "../plugins");
  const files = readdirSync(pluginsDir).filter((f) => f.endsWith(".js"));

  const plugins = [];

  for (const file of files) {
    const mod = await import(pathToFileURL(resolve(pluginsDir, file)).href);
    if (mod.default && Array.isArray(mod.default)) {
      plugins.push(...mod.default);
    }
  }

  console.log(`[Loader] ${plugins.length} comando(s) cargados desde ${files.length} plugin(s).`);
  return plugins;
}
