import { AccountId, TransferTransaction } from "@hashgraph/sdk";
import { HWBridgeConnector, useAccountId, useWallet } from "@buidlerlabs/hashgraph-react-wallets"
import { useState } from "react";
import { IconCheck } from "../assets/Icons";
import Button from "./Button";

const TX_STATUS_RESET_DELAY = 5000;

interface IProps {
    connector?: HWBridgeConnector
}

interface IState {
    recipient: string
    amount: string
    loading: boolean
    isSent: boolean
    txResponse: string
    txError: string
}

const TransactionDemo = ({ connector }: IProps) => {
    const { signer } = useWallet(connector);
    const { accountId } = useAccountId(connector);

    const [state, setState] = useState<IState>({
        recipient: '',
        amount: '',
        loading: false,
        isSent: false,
        txResponse: '',
        txError: ''
    });

    const onSuccessfulSend = (txResponse: string) => {
        setState(prevState => ({
            ...prevState,
            loading: false,
            isSent: true,
            txResponse,
            recipient: '',
            amount: '',
            txError: ''
        }));

        setTimeout(() => {
            setState(prevState => ({ ...prevState, isSent: false }))
        }, TX_STATUS_RESET_DELAY);
    }

    const onError = (error: string) => {
        setState(prevState => ({
            ...prevState,
            loading: false,
            txResponse: '',
            recipient: '',
            amount: '',
            txError: error
        }));

        setTimeout(() => {
            setState(prevState => ({ ...prevState, txError: '' }))
        }, TX_STATUS_RESET_DELAY);
    }

    const handleChangeInputs = (e: { target: { name: string; value: number | string; }; }) => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }))
    }

    const handleSendCurrency = async () => {
        try {
            if (!signer) return;

            setState(prevState => ({ ...prevState, loading: true }));

            const tx = await new TransferTransaction()
                .addHbarTransfer(accountId || '', -state.amount)
                .addHbarTransfer(AccountId.fromString(state.recipient), state.amount)
                .freezeWithSigner(signer)

            const txResponse = await tx.executeWithSigner(signer);
            onSuccessfulSend(JSON.stringify(txResponse, null, 2));
            return JSON.stringify(txResponse, null, 2);
        } catch (error: any) {
            console.error(error)
            onError(error.message);
        }

    }

    return <div className="flex flex-col gap-2 items-center mt-4 mb-6">
        <span className="text-sm">Send currency</span>
        <div className="flex flex-col w-full items-center gap-2 mt-4">
            <input
                className="rounded-md p-2 text-slate-100 bg-white/10 border border-white/20 focus:outline-none"
                type="number"
                name="amount"
                placeholder="Amount"
                onChange={handleChangeInputs}
                value={state.amount}
            />
            <input
                className="rounded-md p-2 text-slate-100 bg-white/10 border border-white/20 focus:outline-none"
                type="text"
                name="recipient"
                placeholder="0.0.xxxxxx"
                onChange={handleChangeInputs}
                value={state.recipient}
            />
            {
                state.txError && <div className="text-red-500 text-center text-xs max-w-[10rem] break-words">{state.txError}</div>
            }
            <Button onClick={handleSendCurrency} disabled={state.loading || state.isSent || !state.recipient || !state.amount || state.amount === '0'}>
                {
                    state.loading
                        ? 'Loading...'
                        : <>
                            {
                                state.isSent
                                    ? <div className="flex items-center gap-2"> Sent <IconCheck fill={'#65A30D'} /></div>
                                    : 'Send 💸'
                            }
                        </>
                }
            </Button>
        </div>
    </div>
}

export default TransactionDemo;