import path from "node:path";
import ts from "typescript";

const DEPRECATION_REASON = "Do not use.";

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function getDeprecationReason(checker: ts.TypeChecker, symbol: ts.Symbol): string | undefined {
  const tag = resolveAlias(checker, symbol)
    .getJsDocTags(checker)
    .find(({ name }) => name.toLowerCase() === "deprecated");
  return tag?.text ? ts.displayPartsToString(tag.text) : undefined;
}

describe("deprecated public API", () => {
  const configPath = path.resolve(process.cwd(), "tsconfig.json");
  const poolFilterConsumerPath = path.resolve(
    process.cwd(),
    "src/__tests__/fixtures/deprecated-pool-filter-consumer.ts"
  );
  const activeMessengerConsumerPath = path.resolve(
    process.cwd(),
    "src/__tests__/fixtures/active-messenger-consumer.ts"
  );
  const requiredMessengerConsumerPath = path.resolve(
    process.cwd(),
    "src/__tests__/fixtures/required-messenger-consumer.ts"
  );
  const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  const program = ts.createProgram(
    [...parsedConfig.fileNames, poolFilterConsumerPath, activeMessengerConsumerPath, requiredMessengerConsumerPath],
    parsedConfig.options
  );
  const checker = program.getTypeChecker();
  const entrypoint = program.getSourceFile(path.resolve(process.cwd(), "src/index.ts"));

  if (!entrypoint) {
    throw new Error("Cannot load src/index.ts");
  }

  const moduleSymbol = checker.getSymbolAtLocation(entrypoint);
  if (!moduleSymbol) {
    throw new Error("Cannot resolve src/index.ts module");
  }

  const entrypointExports = new Map(
    checker.getExportsOfModule(moduleSymbol).map((symbol) => [symbol.getName(), symbol] as const)
  );

  function getExport(name: string): ts.Symbol {
    const symbol = entrypointExports.get(name);
    if (!symbol) {
      throw new Error(`Cannot resolve public export ${name}`);
    }
    return resolveAlias(checker, symbol);
  }

  function getMember(typeName: string, memberName: string): ts.Symbol {
    const type = checker.getDeclaredTypeOfSymbol(getExport(typeName));
    const member = type.getProperty(memberName);
    if (!member) {
      throw new Error(`Cannot resolve public member ${typeName}.${memberName}`);
    }
    return member;
  }

  it.each([
    "LiquidityPoolService",
    "RawPoolTransactionBuilder",
    "SwapParams",
    "UserBalanceInfo",
    "UserBalanceInfoDTO",
    "LiquidityPoolsParams",
    "LiquidityPoolsParamsWithAmount",
    "LiquidityPoolsApproveParams",
    "LiquidityPoolsCheckAllowanceParams",
    "LiquidityPoolsGetAllowanceParams",
    "PoolInfo",
    "PendingStatusInfoResponse",
    "SendAmountDetails",
    "AmountImpact",
    "SwapAndBridgeCalculationData",
    "SwapToVUsdCalcResult",
    "SwapFromVUsdCalcResult",
    "InsufficientPoolLiquidityError",
  ])("%s exposes the unsupported-feature deprecation reason", (exportName) => {
    expect(getDeprecationReason(checker, getExport(exportName))).toBe(DEPRECATION_REASON);
  });

  it.each([
    ["AllbridgeCoreSdkOptions", "wormholeMessengerProgramId"],
    ["AllbridgeCoreSdkOptions", "tronJsonRpc"],
    ["AllbridgeCoreSdkOptions", "cachePoolInfoChainSec"],
    ["AllbridgeCoreSdk", "pool"],
    ["AllbridgeCoreSdk", "getPendingStatusInfo"],
    ["AllbridgeCoreSdk", "getPoolInfoByToken"],
    ["AllbridgeCoreSdk", "refreshPoolInfo"],
    ["AllbridgeCoreSdk", "aprInPercents"],
    ["AllbridgeCoreSdk", "getVUsdFromAmount"],
    ["AllbridgeCoreSdk", "getAmountFromVUsd"],
    ["AllbridgeCoreSdk", "getSendAmountDetails"],
    ["TokenWithChainDetails", "bridgeAddress"],
    ["TokenWithChainDetails", "poolAddress"],
    ["TokenWithChainDetails", "feeShare"],
    ["TokenWithChainDetails", "apr7d"],
    ["TokenWithChainDetails", "apr30d"],
    ["TokenWithChainDetails", "lpRate"],
    ["SuiAddresses", "bridgeAddress"],
    ["SuiAddresses", "bridgeAddressOrigin"],
    ["SuiAddresses", "bridgeObjectAddress"],
    ["SuiAddresses", "allbridgeMessengerAddress"],
    ["SuiAddresses", "allbridgeMessengerAddressOrigin"],
    ["SuiAddresses", "allbridgeMessengerObjectAddress"],
    ["SuiAddresses", "wormholeMessengerAddress"],
    ["SuiAddresses", "wormholeMessengerAddressOrigin"],
    ["SuiAddresses", "wormholeMessengerObjectAddress"],
    ["SuiAddresses", "wormholeStateObjectAddress"],
  ])("%s.%s exposes the unsupported-feature deprecation reason", (typeName, memberName) => {
    expect(getDeprecationReason(checker, getMember(typeName, memberName))).toBe(DEPRECATION_REASON);
  });

  it.each(["ALLBRIDGE", "WORMHOLE"])(
    "Messenger.%s exposes the unsupported-feature deprecation reason",
    (memberName) => {
      const member = checker
        .getExportsOfModule(getExport("Messenger"))
        .find((symbol) => symbol.getName() === memberName);
      if (!member) {
        throw new Error(`Cannot resolve public member Messenger.${memberName}`);
      }
      expect(getDeprecationReason(checker, member)).toBe(DEPRECATION_REASON);
    }
  );

  function getCallDeprecationReasons(consumerPath: string): Array<string | undefined> {
    const consumer = program.getSourceFile(consumerPath);
    if (!consumer) {
      throw new Error(`Cannot load consumer ${consumerPath}`);
    }

    const callExpressions: ts.CallExpression[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        callExpressions.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(consumer);

    return callExpressions.map((callExpression) => {
      const signature = checker.getResolvedSignature(callExpression);
      const tag = signature?.getJsDocTags().find(({ name }) => name.toLowerCase() === "deprecated");
      return tag?.text ? ts.displayPartsToString(tag.text) : undefined;
    });
  }

  it("marks pool filters and explicit legacy messenger overloads as deprecated", () => {
    expect(getCallDeprecationReasons(poolFilterConsumerPath)).toEqual(Array(12).fill(DEPRECATION_REASON));
  });

  it("keeps active messenger overloads non-deprecated", () => {
    expect(getCallDeprecationReasons(activeMessengerConsumerPath)).toEqual([
      undefined,
      DEPRECATION_REASON,
      DEPRECATION_REASON,
      undefined,
      DEPRECATION_REASON,
      DEPRECATION_REASON,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("requires messenger for route-dependent public API", () => {
    const consumer = program.getSourceFile(requiredMessengerConsumerPath);
    if (!consumer) {
      throw new Error(`Cannot load consumer ${requiredMessengerConsumerPath}`);
    }

    const callExpressions: ts.CallExpression[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        callExpressions.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(consumer);

    expect(
      callExpressions.map((callExpression) => {
        const signature = checker.getResolvedSignature(callExpression);
        if (!signature) {
          throw new Error(`Cannot resolve signature for ${callExpression.getText()}`);
        }
        return callExpression.arguments.length < signature.minArgumentCount;
      })
    ).toEqual(Array(8).fill(true));
  });

  it.each(["BridgeApproveParams", "GetAllowanceParams", "CheckAllowanceParams"])(
    "%s requires messenger",
    (typeName) => {
      const messenger = getMember(typeName, "messenger");
      expect(messenger.flags & ts.SymbolFlags.Optional).toBe(0);
    }
  );

  it.each(["wormholeMessengerProgramId", "cachePoolInfoChainSec"])(
    "AllbridgeCoreSdkOptions.%s is optional",
    (memberName) => {
      const member = getMember("AllbridgeCoreSdkOptions", memberName);
      expect(member.flags & ts.SymbolFlags.Optional).not.toBe(0);
    }
  );
});
