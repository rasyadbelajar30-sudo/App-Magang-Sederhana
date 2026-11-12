import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({
  session: null,
  loading: true,
  isSupabaseConfigured: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

function translateSupabaseError(message = '') {
  const m = String(message);
  if (m.includes('Invalid login credentials')) {
    return 'Email atau password salah';
  }
  if (m.includes('User already registered')) {
    return 'Email sudah terdaftar, silakan masuk';
  }
  if (m.includes('Password should be at least')) {
    return 'Password minimal harus terdiri dari 8 karakter';
  }
  if (m.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi. Matikan "Confirm email" di Supabase Authentication.';
  }
  return m || 'Terjadi kesalahan autentikasi.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data?.session || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, full_name, education_level }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          education_level,
        },
      },
    });
    if (error) {
      throw new Error(translateSupabaseError(error.message));
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(translateSupabaseError(error.message));
    }
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
