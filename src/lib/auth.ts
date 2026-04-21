import { supabase } from './supabase'

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

/**
 * Google OAuth – Leitet den User zu Google weiter.
 * Nach Erfolg landet er auf /auth/callback, wo der Guest State in Supabase gespeichert wird.
 *
 * Voraussetzung: In Supabase Dashboard → Authentication → Providers → Google muss
 * Client ID + Secret aus der Google Cloud Console eingetragen sein.
 * Redirect URI: https://zmstmhiyfgdrxrqrqzrt.supabase.co/auth/v1/callback
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

/**
 * Apple OAuth – Leitet den User zu Apple weiter.
 * Nach Erfolg landet er auf /auth/callback.
 *
 * Voraussetzung: Apple Developer Account, Services ID konfiguriert und in
 * Supabase Dashboard → Authentication → Providers → Apple eingetragen.
 */
export async function signInWithApple(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

/**
 * Magic Link per E-Mail senden.
 * Redirect nach Klick auf Link: /auth/callback
 */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}
