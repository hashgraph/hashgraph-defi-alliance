import { HashpackConnector, BladeConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors"
import WalletCard from './WalletCard';
import { IconStars } from "../assets/Icons";
import HPIcon from "../assets/hashpack-icon.png";
import BladeIcon from "../assets/blade-icon.png"

function Hero() {
  return <div>
    <div className='flex flex-col items-center gap-10 my-[4rem]'>
      <div className="flex items-center gap-2 border rounded-md py-3 px-4 border-white/30">
        <IconStars />
        The easiest way to interact with Hedera Network
      </div>
      <h1 className="text-[3rem] font-semibold max-w-xl text-center">Fast development using Hashgraph React Wallets</h1>
    </div>

    <div className="absolute z-[-1] left-[2rem] top-[50%] w-[40%] aspect-square rounded-full blur-[100px] bg-[#5d5668]" />
    <div className="absolute z-[-1] left-[50%] top-[45%] w-[10%] aspect-square rounded-full blur-[80px] bg-[#e7a2bc]" />

    <div className="app-shell flex flex-col md:flex-row justify-center sm:items-center md:items-start gap-5">
      <WalletCard name="Hashpack" iconSrc={HPIcon} connector={HashpackConnector} />
      <WalletCard name="Blade" iconSrc={BladeIcon} connector={BladeConnector} />
    </div>
  </div>
}

export default Hero
