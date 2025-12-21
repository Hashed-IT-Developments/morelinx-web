import AuthLayoutTemplate from '@/layouts/auth/auth-main-layout';
import Snowfall from 'react-snowfall';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    const isDecember = new Date().getMonth() === 11;

    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            <>
                {isDecember && <Snowfall />}
                {children}
            </>
        </AuthLayoutTemplate>
    );
}
