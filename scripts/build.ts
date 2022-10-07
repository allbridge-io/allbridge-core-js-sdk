import path from "path";
import { build as esbuild, BuildOptions } from "esbuild";

const baseConfig: BuildOptions = {
  nodePaths: [path.join(__dirname, "../src")],
  sourcemap: true,
  external: [],
  bundle: true,
};

async function main() {
  await esbuild({
    ...baseConfig,
    platform: "node",
    target: "esnext",
    format: "cjs",
    outdir: path.join(__dirname, "../build/cjs"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  await esbuild({
    ...baseConfig,
    platform: "node",
    target: "esnext",
    format: "esm",
    outdir: path.join(__dirname, "../build/esm"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  // browser
  await esbuild({
    ...baseConfig,
    format: "esm",
    outdir: path.join(__dirname, "../build/browser"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });
}

if (require.main === module) {
  main();
}
