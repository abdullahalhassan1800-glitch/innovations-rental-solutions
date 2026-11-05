import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");

export const jiti = createJiti(path.join(root, "package.json"), {
  alias: { "@": root },
});

export function lib(relativePath) {
  return jiti.import(path.join(root, "lib", relativePath));
}
