import React, { ReactNode, useEffect, useState } from 'react';

interface MobileLayoutProps {
    children?: ReactNode;
}

const KEYPAD_BUTTONS = [
    ['1', '', ''],
    ['2', 'ABC', ''],
    ['3', 'DEF', ''],
    ['4', 'GHI', ''],
    ['5', 'JKL', ''],
    ['6', 'MNO', ''],
    ['7', 'PQRS', ''],
    ['8', 'TUV', ''],
    ['9', 'WXYZ', ''],
    ['*', '', ''],
    ['0', '+', ''],
    ['#', '', ''],
];

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

            <div className="flex max-h-[50vh] flex-1 items-center justify-center overflow-y-auto bg-[#f9f9f9]">{children}</div>

            <div className="grid grid-cols-3 gap-2 bg-[#eaeaea] p-4">
                {KEYPAD_BUTTONS.map(([num, letters], idx) => (
                    <button
                        key={idx}
                        className="flex h-16 flex-col items-center justify-center rounded-lg border border-[#ccc] bg-white text-lg font-bold shadow active:bg-[#ddd]"
                        tabIndex={0}
                    >
                        <span>{num}</span>
                        {letters && <span className="text-xs text-[#888]">{letters}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileLayout;
