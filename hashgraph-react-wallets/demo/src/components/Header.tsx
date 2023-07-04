import { IconGithub, IconWallet } from "../assets/Icons";
import { REPOSITORY_URL } from "../constants";

const Header = () => {
    return <div className="fixed z-50 left-0 right-0 top-0 border-b border-white/10 backdrop-blur-md p-5 flex justify-between items-center">
        <div className="flex gap-4 items-center">
            <a className="flex gap-4 items-center text-white" href="/">
                <IconWallet />
                <span className="text-lg font-semibold">Hashgraph React Wallets</span>
            </a>
        </div>
        <div>
            <a className="flex gap-4 items-center text-white" href={REPOSITORY_URL} target="_blank">
                <IconGithub />
            </a>
        </div>
    </div>
}

export default Header;