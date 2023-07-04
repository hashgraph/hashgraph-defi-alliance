import BdlLogo from '../assets/bdl-white-logo.png';

const Footer = () => {
    return <div className="flex flex-col justify-center items-center gap-2 p-10">
        <span className="text-sm text-white/40">powered by</span>
        <img className="max-w-[10rem]" src={BdlLogo} alt="BuidlerLabs Logo" />
    </div>
}

export default Footer;