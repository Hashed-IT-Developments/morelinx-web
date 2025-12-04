import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md drop-shadow-2xl hover:opacity-50">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="hover:opacity-50">
                <img src="/morelinx-white-logo.svg" alt="MoreLinX" className="h-6" />
            </div>
        </>
    );
}
