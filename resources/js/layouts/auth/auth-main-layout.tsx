import Image from '@/components/composables/image';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthMainLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background lg:flex-row">
            <div className="relative hidden h-screen items-start justify-center pt-20 lg:flex lg:w-1/2">
                <div className="absolute inset-0 w-full">
                    <Image src="/morepower.png" height={1000} width={1000} alt="Background" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4 px-4">
                    <Image width={100} src="/morepower-logo.svg" alt="More Power Logo" />
                    <Image width={500} src="/bringingmorepowertolife.svg" alt="Bringing More Power to Life" />
                </div>
            </div>

            <div className="flex w-full items-start justify-center p-6 lg:w-1/2 lg:items-center lg:p-16">
                <div className="flex w-full max-w-sm flex-col gap-8 lg:max-w-lg lg:gap-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="mb-4 flex w-full items-center justify-center gap-4 lg:mb-6">
                            <Image src="/more-power-auth-logo.svg" alt="More Power" width={300} />
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
