import path from "node:path";
import ts from "typescript";

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function getDeprecationReason(tags: readonly ts.JSDocTagInfo[]): string | undefined {
  const tag = tags.find(({ name }) => name.toLowerCase() === "deprecated");
  if (!tag) {
    return undefined;
  }
  return tag.text ? ts.displayPartsToString(tag.text) : "";
}

describe("examples public API usage", () => {
  it("does not use deprecated SDK API outside liquidity withdrawal examples", () => {
    const projectRoot = process.cwd();
    const configPath = path.resolve(projectRoot, "tsconfig.json");
    const examplesRoot = path.resolve(projectRoot, "examples/src");
    const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
    const exampleFiles = ts.sys.readDirectory(examplesRoot, [".ts"]);
    const program = ts.createProgram([...parsedConfig.fileNames, ...exampleFiles], {
      ...parsedConfig.options,
      baseUrl: projectRoot,
      paths: {
        "@allbridge/bridge-core-sdk": ["src/index.ts"],
      },
      noEmit: true,
    });
    const checker = program.getTypeChecker();
    const deprecatedUsages = new Set<string>();
    const sdkRoot = path.resolve(projectRoot, "src");
    const liquidityWithdrawalTransactionExamples = new Set([
      "examples/src/examples/liquidity-pool/alg/alg-build-withdraw-tx.ts",
      "examples/src/examples/liquidity-pool/evm/evm-build-withdraw-tx.ts",
      "examples/src/examples/liquidity-pool/solana/sol-build-withdraw-tx.ts",
      "examples/src/examples/liquidity-pool/stx/stx-build-withdraw-tx.ts",
      "examples/src/examples/liquidity-pool/sui/sui-build-withdraw-tx.ts",
      "examples/src/examples/liquidity-pool/trx/trx-build-withdraw-tx.ts",
    ]);
    const liquidityWithdrawalTransactionApi = new Set(["sdk.pool.rawTxBuilder.withdraw", "pool", "rawTxBuilder"]);
    const liquidityWithdrawalAmountExamples = new Set([
      "examples/src/examples/liquidity-pool/alg/get-amount-to-be-withdrawn.ts",
      "examples/src/examples/liquidity-pool/evm/get-amount-to-be-withdrawn.ts",
      "examples/src/examples/liquidity-pool/solana/get-amount-to-be-withdrawn.ts",
      "examples/src/examples/liquidity-pool/stx/get-amount-to-be-withdrawn.ts",
      "examples/src/examples/liquidity-pool/sui/get-amount-to-be-withdrawn.ts",
      "examples/src/examples/liquidity-pool/trx/get-amount-to-be-withdrawn.ts",
    ]);
    const liquidityWithdrawalAmountApi = new Set(["sdk.pool.getAmountToBeWithdrawn", "pool"]);

    function isSdkDeclaration(declaration: ts.Declaration | undefined): boolean {
      if (!declaration) {
        return false;
      }
      const declarationPath = path.resolve(declaration.getSourceFile().fileName);
      return declarationPath === sdkRoot || declarationPath.startsWith(`${sdkRoot}${path.sep}`);
    }

    function isCallTarget(node: ts.Identifier): boolean {
      const expression = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node ? node.parent : node;
      return ts.isCallExpression(expression.parent) && expression.parent.expression === expression;
    }

    function record(node: ts.Node, reason: string | undefined): void {
      if (reason === undefined) {
        return;
      }
      const sourceFile = node.getSourceFile();
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const file = path.relative(projectRoot, sourceFile.fileName);
      if (
        (liquidityWithdrawalTransactionExamples.has(file) && liquidityWithdrawalTransactionApi.has(node.getText())) ||
        (liquidityWithdrawalAmountExamples.has(file) && liquidityWithdrawalAmountApi.has(node.getText()))
      ) {
        return;
      }
      deprecatedUsages.add(
        `${file}:${position.line + 1}:${position.character + 1} ${node.getText()} (${reason || "no reason"})`
      );
    }

    function visit(node: ts.Node): void {
      if (ts.isCallExpression(node)) {
        const signature = checker.getResolvedSignature(node);
        if (signature && isSdkDeclaration(signature.getDeclaration())) {
          record(node.expression, getDeprecationReason(signature.getJsDocTags()));
        }
      }

      if (ts.isIdentifier(node) && !isCallTarget(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        if (symbol) {
          const resolvedSymbol = resolveAlias(checker, symbol);
          if (resolvedSymbol.declarations?.some(isSdkDeclaration)) {
            record(node, getDeprecationReason(resolvedSymbol.getJsDocTags(checker)));
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    for (const exampleFile of exampleFiles) {
      const sourceFile = program.getSourceFile(exampleFile);
      if (!sourceFile) {
        throw new Error(`Cannot load ${exampleFile}`);
      }
      visit(sourceFile);
    }

    expect([...deprecatedUsages].sort()).toEqual([]);
  });
});
