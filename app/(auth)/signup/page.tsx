'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../login/page.module.css'; // Reusing login styles

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // Ideally show "Check email" message, but for MVP assuming auto-confirm or just redirect
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Ambience */}
            <div className={styles.background}>
                <div className={styles.orb1} />
                <div className={styles.orb2} />
            </div>

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.header}>
                    <h1 className={styles.title}>Join Consistency</h1>
                    <p className={styles.subtitle}>Start your gamified habit journey today</p>
                </div>

                {error && (
                    <motion.div
                        className={styles.error}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className={styles.spinner} /> : 'Create Account'}
                    </motion.button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
