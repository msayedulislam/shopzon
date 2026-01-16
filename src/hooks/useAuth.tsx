import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'seller' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isSeller: boolean;
  signUp: (phone: string, password: string, fullName: string, email?: string) => Promise<{ error: Error | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch roles with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      setRoles(data?.map(r => r.role as AppRole) || ['customer']);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles(['customer']);
    }
  };

  const signUp = async (phone: string, password: string, fullName: string, email?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Use provided email or generate one from phone number
    const authEmail = email && email.trim() ? email.trim() : `${phone}@bdmart.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          email: email || null,
        },
      },
    });

    // If signup successful, create/update profile with phone number
    if (!error && data.user) {
      setTimeout(async () => {
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', data.user!.id)
            .single();

          if (existingProfile) {
            // Update existing profile
            await supabase
              .from('profiles')
              .update({
                full_name: fullName,
                phone: phone,
                email: email || null,
              })
              .eq('user_id', data.user!.id);
          } else {
            // Create new profile
            await supabase
              .from('profiles')
              .insert({
                user_id: data.user!.id,
                full_name: fullName,
                phone: phone,
                email: email || null,
              });
          }
        } catch (profileError) {
          console.error('Error creating/updating profile:', profileError);
        }
      }, 0);
    }

    return { error: error as Error | null };
  };

  const signIn = async (phone: string, password: string) => {
    // Try to sign in with phone-based email
    const authEmail = `${phone}@bdmart.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const isAdmin = roles.includes('admin');
  const isSeller = roles.includes('seller');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        isAdmin,
        isSeller,
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
