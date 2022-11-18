import path from "path";
import { build as esbuild, BuildOptions } from "esbuild";
import {wasmPlugin} from "./wasmPlugin";
import copy from "esbuild-plugin-copy";
import polyfill from "@esbuild-plugins/node-modules-polyfill";

const baseConfig: BuildOptions = {
  nodePaths: [path.join(__dirname, "../src")],
  sourcemap: true,
  external: [],
  bundle: true,
  plugins: [wasmPlugin],
};

async function main() {
  await esbuild({
    ...baseConfig,
    // @ts-ignore
    plugins:[...baseConfig.plugins, copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      // resolveFrom: 'cwd',
      assets: {
        from: ['./node_modules/@certusone/wormhole-sdk-wasm/lib/cjs/core-node/bridge_bg.wasm'],
        to: ['./'],
        keepStructure: true,
      },
    })],
    platform: "node",
    target: "esnext",
    format: "cjs",
    outdir: path.join(__dirname, "../dist/cjs"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  await esbuild({
    ...baseConfig,
    platform: "node",
    target: "esnext",
    format: "esm",
    outdir: path.join(__dirname, "../dist/esm"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  // browser
  await esbuild({
    ...baseConfig,
    format: "esm",
    outdir: path.join(__dirname, "../dist/browser"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
    plugins: [...baseConfig.plugins, polyfill()]
  });
}

if (require.main === module) {
  main();
}
