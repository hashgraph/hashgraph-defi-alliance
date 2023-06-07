# Getting started
Welcome to the _Hashgraph React Wallets_ project, a lightweight library that aims to provide an easier way to interact with the [hedera network](https://hedera.com/) from a UI perspective.

**How? You might ask.** Easy ... by bundling the UI functionality of 2 of the most popular wallets on the hashgraph chain, [HashPack](https://www.hashpack.app/) and [Blade](https://www.bladewallet.io/), into a set of React components, ready for easy consumption. 

## Usage 
The following is a quick code snippet showing the simplicity of using our `HWBridgeProvider` React component. You just need to define your dApp `metadata` and choose your wallet-connectors and you're good to go.


```jsx
import { HWBridgeProvider } from "@buidlerlabs/hashgraph-react-wallets";
import { HashpackConnector, BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";
import DAppLogo from "./assets/dapp-logo.svg";

const metadata = {
    description: "Hashgraph React Wallets Demo",
    icons: [DAppLogo],
    name: "Hashgraph Wallets Demo",
    url: location.href
};

function App() {
  return <HWBridgeProvider 
    network="testnet"
    metadata={metadata}
    connectors={[HashpackConnector, BladeConnector]}
    multiSession={false}>
        {children}
  </HWBridgeProvider>
}

export default App
```

Following is the full list of props (along with their default values) available for `HWBridgeProvider`:

| prop             | description                                                                                                                 | required |
|------------------|-----------------------------------------------------------------------------------------------------------------------------|----------|
| network          | the targeted network which can be either `testnet` (default) or `mainnet`                                                   | Yes      |
| metadata         | an object describing the dApp to the user                                                                                   | Yes      |
| defaultConnector | default to use when no connector is specified when using the provided hooks. Can be either `HashpackConnector` or `BladeConnector` or, when left empty, it will pick the first one available | No      |
| connectors       | wallet connectors to use for session interactions. It's an array of `HashpackConnector`/ `BladeConnector`s. Default is `[]` | Yes      |
| multiSession     | `true` if you're planning to allow sessions to be created on both wallets and `false` (default)otherwise                    | No       |
| debug            | set this to `true` to get logs of various kinds (default: `false`)                                                          | No       |

### A note on polyfill-ing
To have HashPack working (even if you're using it or not!), you will have to polyfill its Buffer class and bind it to the `global` browser scope.

```tsx
import { Buffer } from 'buffer'
(window as any).global = window;
global.Buffer = global.Buffer || Buffer;
```

We're also doing this in [our demo-app code](https://github.com/buidler-labs/hashgraph-react-wallets/blob/ae2c457b63e5241061b23f28879b977b2324482b/demo/src/polyfills.ts) so you might take some inspiration from there.

## API
Next, we're gonna present some code snippets showing the usage of the UI component to do various things:

> ***Note***
>
> The wallet component must be rendered inside `HWBridgeProvider` in order to be able to use its context

### Connecting to a wallet

```jsx
import { useWallet, HWBridgeConnector } from "@buidlerlabs/hashgraph-react-wallets"
import { useCallback, useState } from "react"
import Button from "./Button"

interface IProps {
    connector: HWBridgeConnector
}

const Wallet = ({ connector }: IProps) => {
    const [loading, setLoading] = useState(false);
    const { isConnected, connect, disconnect } = useWallet(connector);

    const handleConnect = useCallback(async () => {
        setLoading(true);
        await connect();
        setLoading(false);
    }, [connect]);

    const handleDisconnect = useCallback(async () => {
        setLoading(true);
        await disconnect();
        setLoading(false);
    }, [connect]);

    return <div>
        {
            isConnected
                ? <Button onClick={handleDisconnect} disabled={loading}>Disconnect</Button>
                : <Button onClick={handleConnect}>{loading ? 'Loading...' : 'Connect'}</Button>
        }
    </div>
}

export default WalletCard;
```

### Signing a transaction

```jsx
import { AccountId, TransferTransaction } from "@hashgraph/sdk";
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets"
import { BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"

const App = () => {
    const {signer} = useWallet(BladeConnector);

    const handleSendFunds = async () => {
        try {
            const tx = await new TransferTransaction()
                .addHbarTransfer(accountId, -10)
                .addHbarTransfer(AccountId.fromString(state.recipient), 10)
                .freezeWithSigner(signer)

            const txResponse = await tx.executeWithSigner(signer);
            ...            

        } catch (e) {
            console.error(e);
        }
    }

    return <button onClick={handleSendFunds}>Send</button>
}
```

## The hooks
Various hooks have been coded and made available for usage. In the same fashion as the API section, following is a list of code snippets showing the capabilities of these React hooks.

> ***Note***
>
> When using any of the following hooks, they must be used inside `HWBridgeProvider` in order to be able to use its context.

### useWallet()

This hook can be used for accessing wallet data and connection status. It's available via 

```jsx
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets"
```
and you might normally use it like so:
```jsx
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets"
import { HashpackConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"

const App = () => {
    const {extensionReady, isConnected, signer, connect, disconnect} = useWallet(HashpackConnector);

    const handleOnConnect = async () => {
        await connect();
        // do something...
    }

    const handleOnDisconnect = async () => {
        await disconnect();
        // do something...
    }

    return <>
        <span>Extension status: {extensionReady ? 'Ready to connect': 'Not available'}</span>

        {
            isConnected
                ? <button onClick={handleOnDisconnect}>Disconnect</button>
                : <button onClick={handleOnConnect} disabled={!extensionReady}>Connect</button>
        }
    </>
}
```

If you have configured `HWBridgeProvider` with `multiSession` set to `false` or `defaultConnector` set (ie. _not empty_), the hook can be used without any arguments. <br/>
In which case, it will return the default specified wallet, or the unique connected wallet:
```jsx
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets"

const App = () => {
    const wallet = useWallet();

    return ...
}
```

The returned type has the following signature:
```tsx
{
    connect: async () => Promise<HWBridgeSession>
    disconnect: async () => Promise<boolean>
    connector: HWBridgeConnector
    extensionReady: boolean
    isConnected: boolean
    isInitialized: boolean
    signer: HWBridgeSigner
} as HWBridgeSession | {}
```
---

### useConnectedWallets()

This hook is used for accessing a list of connected wallets in case the `HWBridgeProvider` component has been configured with `multiSession` set to `true`.

You can gain access to it via
```jsx
import { useConnectedWallets } from "@buidlerlabs/hashgraph-react-wallets"
```
and use it like so:
```jsx
import { useConnectedWallets } from "@buidlerlabs/hashgraph-react-wallets"

const App = () => {
    const connectedWallets = useConnectedWallets();
    const hasMultipleWallets = connectedWallets.length > 0;

    const handleOnClick = () => {
        if(hasMultipleWallets) {
            // open wallet selector modal (add your custom impementation)
        } else {
            // sign transaction
        }
    }

    return <button onClick={handleOnClick}>Sign transaction</button>
}
```

In this case, the returned type has the following signature:
```tsx
HWBridgeSession[] | []
```
---

### useBalance()

You can use this hook to display account balance.

It's found here
```jsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets"
```
and this is a typical context where you might use it:
```jsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets"
import { BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"

const App = () => {
    const {balance, loading, updateBalance} = useBalance(BladeConnector);

    return <>
        {
            loading
                ? 'Fetching balance'
                : <span>Balance: {balance.toString()}</span>
        }
        <button onClick={() => updateBalance()}>Update balance</button>
    </>
}
```

Using the `HWBridgeProvider` component configured with `multiSession` set to `false` or `defaultConnector` set to an actual connector (ie. _not empty_), the hook can be used without any arguments. <br/>
In this case, it will return the default specified wallet balance, or the unique connected wallet balance:


```jsx
import { useBalance } from "@buidlerlabs/hashgraph-react-wallets"

const App = () => {
    const {balance, loading} = useBalance();

    return <>
        {
            loading
                ? 'Fetching balance'
                : <span>Balance: {balance.toString()}</span>
        }
    </>
}
```

The signature of the returned object looks as follows:
```tsx
{
    balance: AccountBalance
    loading: boolean
    updateBalance: () => void
}
```
---

### useAccountId()

Use this hook to display the hedera connected AccountId.

You gain access to it like so
```jsx
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets"
```
then you would normally use it in the following way:
```jsx
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets"
import { BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"

const App = () => {
    const {accountId, loading} = useAccountId(BladeConnector);

    return <>
        {
            loading
                ? 'Fetching account id...'
                : <span>AccountId: {accountId.toString()}</span>
        }
    </>
}
```

If `HWBridgeProvider` was configured with either `multiSession` set to `false` or `defaultConnector` set to a _non empty_ value, the hook can be used without any arguments. <br/>
In this case, it will return the default specified wallet account id, or the unique connected wallet account id:


```jsx
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets"

const App = () => {
    const {accountId, loading} = useAccountId();

    return ...
}
```

the returned object adheres to the following signature:
```tsx
{
    accountId: AccountId
    loading: boolean
}
```
