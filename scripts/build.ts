import path from "path";
import { build as esbuild, BuildOptions } from "esbuild";
import {polyfillNode} from "esbuild-plugin-polyfill-node";
import externalizeAllPackagesExcept from 'esbuild-plugin-noexternal';

const baseConfig: BuildOptions = {
  nodePaths: [path.join(__dirname, "../src")],
  sourcemap: true,
  bundle: true,
  minify: true,
};

async function main() {
  await esbuild({
    ...baseConfig,
    platform: "node",
    target: "esnext",
    format: "cjs",
    plugins: [externalizeAllPackagesExcept(['timed-cache'])],
    outdir: path.join(__dirname, "../dist/cjs"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  await esbuild({
    ...baseConfig,
    platform: "node",
    target: "esnext",
    format: "esm",
    packages: 'external',
    outdir: path.join(__dirname, "../dist/esm"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  // browser
  await esbuild({
    ...baseConfig,
    format: "esm",
    outdir: path.join(__dirname, "../dist/browser"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
    packages: 'external',
    plugins: [
      polyfillNode({
        // Options (optional)
      }),
    ],
  });
}

if (require.main === module) {
  main();
}
