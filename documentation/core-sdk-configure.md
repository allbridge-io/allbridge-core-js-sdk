# Allbridge Core SDK: Install

### Initialize SDK instance

```ts
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
const sdk = new AllbridgeCoreSdk();
```

### Configure headers for requests to Core API 

If needed, SDK can be configured to always add headers when making requests to Core API:  
```ts
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
const sdk = new AllbridgeCoreSdk({
  ...mainnet,
  apiHeaders: { "secret-waf-header": "value" },
});
```


---
#### Next: [SDK methods](core-sdk-api.md)
