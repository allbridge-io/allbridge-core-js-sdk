# Allbridge Core SDK

### Configure headers for requests to Core API 

If needed, SDK can be configured to always add headers when making requests to Core API:  
```ts
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, mainnet } from "@allbridge/bridge-core-sdk";
const sdk = new AllbridgeCoreSdk(
  nodeRpcUrlsDefault,
  {
    ...mainnet,
    coreApiHeaders: {
      "secret-waf-header": "value"
    }
  });
```
