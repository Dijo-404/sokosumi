'use client';
import { FormEventHandler, useState } from 'react';
import { signIn } from '@/lib/auth.client';
import Link from 'next/link';

export default function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const onHandleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        const result = await signIn.email({
            email,
            password,
            callbackURL: '/',
            rememberMe,
            fetchOptions: {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                },
                onError: (ctx) => {
                    console.error(ctx.error.message);
                },
            },
        });
        console.log(result);
    };

    return (
        <div className="p-6 text-black">
            <form onSubmit={onHandleSubmit}>
                <h1 className="text-center text-white">Log In</h1>
                <div className="m-4">
                    <label htmlFor="email" className="text-white">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="m-4">
                    <label htmlFor="password" className="text-white">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="m-4">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="text-white">
                        Remember Me
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-white text-black"
                >
                    {loading ? 'Loading' : 'Submit'}
                </button>
            </form>
            <div className="mt-4">
                <Link href="/signup" className="text-white">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
