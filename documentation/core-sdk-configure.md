# Allbridge Core SDK: Install

### Initialize SDK instance

```js
const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const sdk = new AllbridgeCoreSdk();
```

### Configure headers for requests to Core API 

If needed, SDK can be configured to always add headers when making requests to Core API:  
```js
const { AllbridgeCoreSdk, mainnet } = require("@allbridge/bridge-core-sdk");
const sdk = new AllbridgeCoreSdk({
  ...mainnet,
  apiHeaders: { "secret-waf-header": "value" },
});
```


---
#### Next: [SDK methods](core-sdk-api.md)
