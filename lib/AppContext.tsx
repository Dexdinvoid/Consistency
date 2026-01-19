'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserStats, Habit, HabitWithStats, FeedPost, Friend, Challenge, ChallengeProgress, HABIT_ICONS, HABIT_COLORS } from '@/lib/types';
import { mockUser, mockUserStats, mockHabits, mockFeedPosts, mockFriends, mockChallenges } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface AppState {
    user: User | null;
    userStats: UserStats | null;
    habits: HabitWithStats[];
    feedPosts: FeedPost[];
    friends: Friend[];
    challenges: Challenge[];
    challengeProgress: Map<string, ChallengeProgress>;
    isLoading: boolean;
}

interface AppContextType extends AppState {
    // User actions
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;

    // Habit actions
    addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => void;
    completeHabit: (habitId: string, proofImageUrl: string) => void;
    deleteHabit: (habitId: string) => void;

    // Social actions
    likePost: (postId: string) => void;
    addComment: (postId: string, content: string) => void;
    addFriend: (friendId: string) => void;

    // Points
    addPoints: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, setState] = useState<AppState>({
        user: null,
        userStats: null,
        habits: [],
        feedPosts: [],
        friends: [],
        challenges: [],
        challengeProgress: new Map(),
        isLoading: true,
    });

    // Check active session and listen for auth changes
    useEffect(() => {
        const initializeAuth = async () => {
            // Check current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Map Supabase user to app User type
                // In a real app we would fetch profile from 'profiles' table here
                const user: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'nomad',
                    displayName: session.user.user_metadata?.full_name || 'Nomad User',
                    avatar: session.user.user_metadata?.avatar_url,
                    theme: 'cyberpunk', // Default or from db
                    createdAt: new Date(session.user.created_at),
                    updatedAt: new Date(),
                };

                // For MVP, we still use mock data for stats/habits if real DB is empty
                // But we use the REAL user object
                setState({
                    user,
                    userStats: mockUserStats,
                    habits: mockHabits,
                    feedPosts: mockFeedPosts,
                    friends: mockFriends,
                    challenges: mockChallenges,
                    challengeProgress: new Map(),
                    isLoading: false,
                });
            } else {
                setState(prev => ({ ...prev, user: null, isLoading: false }));
            }
        };

        initializeAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const user: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'nomad',
                    displayName: session.user.user_metadata?.full_name || 'Nomad User',
                    avatar: session.user.user_metadata?.avatar_url,
                    theme: 'cyberpunk',
                    createdAt: new Date(session.user.created_at),
                    updatedAt: new Date(),
                };

                setState(prev => ({
                    ...prev,
                    user,
                    // Restore data if logging in
                    userStats: prev.userStats || mockUserStats,
                    habits: prev.habits.length ? prev.habits : mockHabits,
                    feedPosts: prev.feedPosts.length ? prev.feedPosts : mockFeedPosts,
                    isLoading: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    user: null,
                    userStats: null,
                    habits: [],
                    isLoading: false
                }));
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // User actions
    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const updateUser = (updates: Partial<User>) => {
        setState(prev => ({
            ...prev,
            user: prev.user ? { ...prev.user, ...updates } : null,
        }));
    };

    // Habit actions (Kept same for now, just operating on local state)
    const addHabit = (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
        const newHabit: HabitWithStats = {
            ...habitData,
            id: `habit-${Date.now()}`,
            userId: state.user?.id || '',
            createdAt: new Date(),
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            completedToday: false,
            completions: [],
        };

        setState(prev => ({
            ...prev,
            habits: [...prev.habits, newHabit],
        }));
    };

    const completeHabit = (habitId: string, proofImageUrl: string) => {
        setState(prev => {
            const habits = prev.habits.map(habit => {
                if (habit.id === habitId && !habit.completedToday) {
                    const completion = {
                        id: `completion-${Date.now()}`,
                        habitId,
                        userId: prev.user?.id || '',
                        completedAt: new Date(),
                        proofImageUrl,
                        pointsEarned: 10,
                        streakCount: habit.currentStreak + 1,
                    };

                    return {
                        ...habit,
                        completedToday: true,
                        currentStreak: habit.currentStreak + 1,
                        longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1),
                        totalCompletions: habit.totalCompletions + 1,
                        completions: [...habit.completions, completion],
                    };
                }
                return habit;
            });

            const userStats = prev.userStats ? {
                ...prev.userStats,
                totalPoints: prev.userStats.totalPoints + 10,
                habitsCompleted: prev.userStats.habitsCompleted + 1,
            } : null;

            return { ...prev, habits, userStats };
        });
    };

    const deleteHabit = (habitId: string) => {
        setState(prev => ({
            ...prev,
            habits: prev.habits.filter(h => h.id !== habitId),
        }));
    };

    // Social actions
    const likePost = (postId: string) => {
        setState(prev => ({
            ...prev,
            feedPosts: prev.feedPosts.map(post =>
                post.id === postId
                    ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
                    : post
            ),
        }));
    };

    const addComment = (postId: string, content: string) => {
        setState(prev => ({
            ...prev,
            feedPosts: prev.feedPosts.map(post =>
                post.id === postId
                    ? { ...post, comments: post.comments + 1 }
                    : post
            ),
        }));
    };

    const addFriend = (friendId: string) => {
        console.log('Friend request sent to:', friendId);
    };

    // Points
    const addPoints = (amount: number) => {
        setState(prev => ({
            ...prev,
            userStats: prev.userStats ? {
                ...prev.userStats,
                totalPoints: prev.userStats.totalPoints + amount,
                weeklyPoints: prev.userStats.weeklyPoints + amount,
            } : null,
        }));
    };

    return (
        <AppContext.Provider value={{
            ...state,
            login,
            logout,
            updateUser,
            addHabit,
            completeHabit,
            deleteHabit,
            likePost,
            addComment,
            addFriend,
            addPoints,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
