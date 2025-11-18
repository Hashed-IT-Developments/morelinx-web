import React, { ReactNode, useEffect, useState } from 'react';

interface MobileLayoutProps {
    children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative mx-auto my-10 flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[40px] border-[12px] border-[#333] bg-white shadow-lg">
            <div className="flex h-6 items-center border-b border-[#eee] bg-[#f5f5f5] px-3 text-xs text-[#888]">{time}</div>

            <div className="flex-1 overflow-y-auto">{children}</div>

            <div className="flex h-6 items-center justify-center bg-transparent">
                <div className="h-[5px] w-[120px] rounded bg-[#ccc]" />
            </div>
        </div>
    );
};

export default MobileLayout;
