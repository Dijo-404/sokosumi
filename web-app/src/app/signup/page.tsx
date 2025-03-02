'use client';
import { FormEventHandler, useState } from 'react';
import { signUp } from '@/lib/auth.client';
import Link from 'next/link';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onHandleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        const result = await signUp.email({
            name,
            email,
            password,
            callbackURL: '/login',
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
                <h1 className="text-center text-white">Sign Up</h1>
                <div className="m-4">
                    <label htmlFor="name" className="text-white">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
                <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-white text-black"
                >
                    {loading ? 'Loading' : 'Submit'}
                </button>
            </form>
            <div className="mt-4">
                <Link href="/login" className="text-white">
                    Log In
                </Link>
            </div>
        </div>
    );
}
