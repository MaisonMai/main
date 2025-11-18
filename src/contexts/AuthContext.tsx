import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userCountry: string | null;
  userCurrency: string | null;
  profileComplete: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  completeProfile: (fullName: string, country: string, city: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existingProfile) {
          try {
            await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || null,
                },
              ]);
          } catch (error) {
            console.error('Error creating profile on session load:', error);
          }
        }
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingProfile) {
            try {
              await supabase
                .from('profiles')
                .insert([
                  {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || null,
                  },
                ]);
            } catch (error) {
              console.error('Error creating profile:', error);
            }
          }
          loadUserProfile(session.user.id);
        } else {
          setUserCountry(null);
          setUserCurrency(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('country, currency, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setUserCountry(data.country);
      setUserCurrency(data.currency);
      setProfileComplete(!!(data.full_name && data.country));
    } else {
      setProfileComplete(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
          },
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
      setProfileComplete(false);
    }

    return { error };
  };

  const completeProfile = async (fullName: string, country: string, city: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      const currency = getCurrencyForCountry(country);
      const locale = getLocaleForCountry(country);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          country: country,
          city: city,
          currency: currency,
          locale: locale,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserCountry(country);
      setUserCurrency(currency);
      setProfileComplete(true);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    userCountry,
    userCurrency,
    profileComplete,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    completeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getCurrencyForCountry(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    NZ: 'NZD',
    JP: 'JPY',
    KR: 'KRW',
    IN: 'INR',
    SG: 'SGD',
    BR: 'BRL',
    MX: 'MXN',
    AR: 'ARS',
    CL: 'CLP',
    ZA: 'ZAR',
    AE: 'AED',
    SA: 'SAR',
    CH: 'CHF',
    NO: 'NOK',
    SE: 'SEK',
    DK: 'DKK',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
  };
  return currencyMap[countryCode] || 'USD';
}

function getLocaleForCountry(countryCode: string): string {
  const localeMap: Record<string, string> = {
    US: 'en-US',
    GB: 'en-GB',
    CA: 'en-CA',
    AU: 'en-AU',
    NZ: 'en-NZ',
    IE: 'en-IE',
    SG: 'en-SG',
    ZA: 'en-ZA',
    IN: 'en-IN',
    DE: 'de-DE',
    FR: 'fr-FR',
    IT: 'it-IT',
    ES: 'es-ES',
    NL: 'nl-NL',
    BE: 'nl-BE',
    SE: 'sv-SE',
    NO: 'nb-NO',
    DK: 'da-DK',
    FI: 'fi-FI',
    CH: 'de-CH',
    AT: 'de-AT',
    JP: 'ja-JP',
    KR: 'ko-KR',
    BR: 'pt-BR',
    MX: 'es-MX',
    AR: 'es-AR',
    CL: 'es-CL',
    AE: 'ar-AE',
    SA: 'ar-SA',
  };
  return localeMap[countryCode] || 'en-US';
}
