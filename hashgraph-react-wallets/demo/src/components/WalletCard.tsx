import { HWBridgeConnector, useAccountId, useBalance, useWallet } from "@buidlerlabs/hashgraph-react-wallets"
import { useCallback, useState } from "react"
import Button from "./Button"
import { IconRefresh } from "../assets/Icons"
import WalletCardStatus from "./WalletCardStatus"
import TransactionDemo from "./TransactionDemo"

interface IProps {
    name: string
    iconSrc: string
    connector: HWBridgeConnector
}

const WalletCard = ({ name, iconSrc, connector }: IProps) => {
    const [loading, setLoading] = useState(false);
    const { extensionReady, isConnected, connect, disconnect } = useWallet(connector);
    const { accountId, loading: loadingAccountId } = useAccountId(connector);
    const { balance, loading: loadingBalance, updateBalance } = useBalance(connector);

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

    const connectButton = isConnected
        ? <Button className="enabled:bg-red-500 enabled:hover:bg-red-600" onClick={handleDisconnect}>Disconnect</Button>
        : <Button onClick={handleConnect} disabled={!extensionReady}>{loading ? 'Loading...' : 'Connect'}</Button>

    return <div className="border rounded-md border-white/20 flex flex-col items-center gap-2 p-8 backdrop-blur-[10px] bg-white/10 min-w-[18rem]">
        <div className="max-w-[2rem]">
            <img src={iconSrc} alt={`${name} icon`} />
        </div>

        <span className="text-2xl">{name} wallet</span>

        {
            isConnected && <div className="mt-4 flex flex-col gap-2 items-center">
                <div className="bg-white/10 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {loadingAccountId ? 'Loading...' : accountId.toString()}
                </div>

                <span className="flex items-center gap-2 bg-white/10 text-white text-xs font-medium pl-2.5 pr-1 py-0.5 rounded-full">
                    {loadingBalance ? 'Loading...' : balance?.hbars.toString()}
                    <IconRefresh
                        className="text-[1.2rem] hover:border hover:rounded-full hover:cursor-pointer"
                        onClick={updateBalance}>
                        UPDATE BALANCE
                    </IconRefresh>
                </span>
            </div>
        }

        <div className="my-4 w-full flex flex-col gap-2">
            <WalletCardStatus
                status="Extension"
                isConnected={extensionReady}
                messages={{
                    loading: 'Loading',
                    success: 'Ready',
                    fail: 'Unavailable'
                }} />

            <WalletCardStatus
                status="Status"
                isConnected={isConnected}
                messages={{
                    loading: 'Loading',
                    success: 'Connected',
                    fail: 'Not connected'
                }} />
        </div>

        {
            isConnected && <TransactionDemo connector={connector} />
        }

        {connectButton}
    </div>
}

export default WalletCard;