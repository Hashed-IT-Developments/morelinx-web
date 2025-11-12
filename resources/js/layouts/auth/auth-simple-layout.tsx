import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background lg:flex-row">
            {/* Left side - Logo (hidden on mobile/tablet, visible on desktop) */}
            <div className="relative hidden h-screen items-start justify-center pt-20 lg:flex lg:w-1/2">
                <img src="/morepower.png" alt="More Power" className="absolute inset-0 h-full w-full object-cover" />
                <div className="relative z-10 flex flex-col items-center gap-4 px-4">
                    <img src="/morepower-logo.svg" alt="More Power Logo" className="h-auto w-34" />
                    <img src="/bringingmorepowertolife.svg" alt="Bringing More Power to Life" className="mt-4 h-auto w-[700px]" />
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex w-full items-start justify-center p-6 lg:w-1/2 lg:items-center lg:p-16">
                <div className="flex w-full max-w-sm flex-col gap-8 lg:max-w-lg lg:gap-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="mb-4 flex w-full items-center justify-between gap-4 lg:mb-6">
                            <img src="/usaid.svg" alt="USAID" className="h-12 w-auto lg:h-14" />
                            <img src="/more-power-auth-logo.svg" alt="More Power" className="h-12 w-auto lg:h-14" />
                        </div>

                        <div className="w-full space-y-2 text-left" style={{ fontFamily: 'Circular Std, sans-serif' }}>
                            <h1 className="text-4xl font-extrabold lg:text-5xl">{title}</h1>
                            <p className="text-lg font-medium" style={{ color: '#898b90' }}>
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
