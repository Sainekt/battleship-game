import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sign in',
    description: 'Sign in to your account',
};

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div>{children}</div>;
}
