import React from "react";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const Button = ({ className, children, ...rest }: IProps) => {
    return <button className={`text-white bg-slate-200/20 enabled:hover:bg-slate-200/30 focus:ring-4 enabled:focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:text-[#aeaeae] disabled:bg-slate-200/10 ${className ?? ''}`} {...rest}>
        {children}
    </button>
}

export default Button;