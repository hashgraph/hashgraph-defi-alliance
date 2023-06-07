import { HWBridgeProvider } from "@buidlerlabs/hashgraph-react-wallets"
import { HashpackConnector, BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"
import Header from './components/Header';
import Hero from './components/Hero';
import { NETWORK, DAPP_METADATA } from "./constants";
import Docs from "./components/Docs";
import Footer from "./components/Footer";

function App() {
  return <HWBridgeProvider
    network={NETWORK}
    metadata={DAPP_METADATA}
    connectors={[HashpackConnector, BladeConnector]}
    defaultConnector={HashpackConnector}
    multiSession={true}
    debug={false}>
    <div className="pt-[4rem]"> 
      <Header />
      <Hero />
      <Docs />
      <Footer/>
    </div>
  </HWBridgeProvider>
}

export default App
