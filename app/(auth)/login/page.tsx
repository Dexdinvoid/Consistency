'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            router.push('/');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid login credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = (provider: string) => {
        // For MVP, social auth requires backend config
        alert(`Please configure ${provider} auth in your Supabase dashboard to enable this.`);
    };

    return (
        <div className={styles.container}>
            {/* Animated Background */}
            <div className={styles.background}>
                <div className={styles.gradientOrb1} />
                <div className={styles.gradientOrb2} />
                <div className={styles.gradientOrb3} />
            </div>

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo */}
                <div className={styles.header}>
                    <motion.div
                        className={styles.logo}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    >
                        ✦
                    </motion.div>
                    <h1 className={styles.title}>Consistency</h1>
                    <p className={styles.subtitle}>Welcome back, warrior</p>
                </div>

                {error && (
                    <div style={{
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className={styles.oauthButtons}>
                    <button
                        className={styles.oauthButton}
                        onClick={() => handleOAuthLogin('Google')}
                        disabled={isLoading}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                    <button
                        className={styles.oauthButton}
                        onClick={() => handleOAuthLogin('Apple')}
                        disabled={isLoading}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.09-.52-2.08-.54-3.23 0-1.44.69-2.2.5-3.08-.38C3.17 15.57 3.75 8.75 8.77 8.48c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.56-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.24 3.92zM12.03 8.41c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="warrior@consistency.gg"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <span className={styles.loadingSpinner} />
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Don't have an account?{' '}
                        <Link href="/signup" className={styles.link}>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
