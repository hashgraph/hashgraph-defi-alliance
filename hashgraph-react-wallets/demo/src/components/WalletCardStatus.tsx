interface IProps {
    status: string,
    isConnected?: boolean,
    messages?: {
        loading: string,
        success: string,
        fail: string
    }
}

const WalletCardStatus = ({ status, isConnected, messages }: IProps) => {
    const loadingPill = <span className="bg-gray-600 text-slate-50 text-xs font-small mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
        {messages?.loading}
    </span>

    const statusPill = isConnected === true
        ? <span className="bg-lime-600 text-slate-50 text-xs font-small mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">{messages?.success}</span>
        : <span className="bg-red-600 text-slate-50 text-xs font-small mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">{messages?.fail}</span>

    return <div className="flex items-center justify-between gap-2 w-full">
        <span>{status}</span>
        {
            isConnected === undefined
                ? loadingPill
                : statusPill
        }
    </div>
}

export default WalletCardStatus;