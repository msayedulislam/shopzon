import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'seller' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  sellerStatus: 'pending' | 'active' | 'suspended' | null;
  isAdmin: boolean;
  isSeller: boolean;
  isApprovedSeller: boolean;
  signUp: (phone: string, password: string, fullName: string, email?: string) => Promise<{ error: Error | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [sellerStatus, setSellerStatus] = useState<'pending' | 'active' | 'suspended' | null>(null);

  // Subscribe to realtime seller status changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`seller-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sellers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as 'pending' | 'active' | 'suspended' | null;
          if (newStatus) {
            setSellerStatus(newStatus);
            // If approved, ensure seller role is present
            if (newStatus === 'active') {
              setRoles((prev) => (prev.includes('seller') ? prev : [...prev, 'seller']));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserRolesAndStatus = async (userId: string): Promise<void> => {
    setRolesLoading(true);
    try {
      // Fetch roles and seller status in parallel
      const [rolesResult, sellerResult] = await Promise.all([
        fetchUserRolesInternal(userId),
        fetchSellerStatusInternal(userId),
      ]);
      
      setRoles(rolesResult);
      setSellerStatus(sellerResult);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setRoles(['customer']);
      setSellerStatus(null);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchUserRolesInternal = async (userId: string, retryCount = 0): Promise<AppRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;

      const fetchedRoles = data?.map(r => r.role as AppRole) || [];

      // If no roles found, retry briefly (handles eventual consistency)
      if (fetchedRoles.length === 0 && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return fetchUserRolesInternal(userId, retryCount + 1);
      }

      return fetchedRoles.length > 0 ? fetchedRoles : ['customer'];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return ['customer'];
    }
  };

  const fetchSellerStatusInternal = async (userId: string, retryCount = 0): Promise<'pending' | 'active' | 'suspended' | null> => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      const status = (data?.status as 'pending' | 'active' | 'suspended' | null) ?? null;

      // If row not visible yet, retry once
      if (!data && retryCount < 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return fetchSellerStatusInternal(userId, retryCount + 1);
      }

      return status;
    } catch (error) {
      console.error('Error fetching seller status:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch roles + seller status - wait for completion
          await fetchUserRolesAndStatus(session.user.id);
        } else {
          setRoles([]);
          setSellerStatus(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRolesAndStatus(session.user.id);
      } else {
        setSellerStatus(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Legacy functions kept for refreshRoles
  const fetchUserRoles = async (userId: string): Promise<void> => {
    const fetchedRoles = await fetchUserRolesInternal(userId);
    setRoles(fetchedRoles);
  };

  const fetchSellerStatus = async (userId: string): Promise<void> => {
    const status = await fetchSellerStatusInternal(userId);
    setSellerStatus(status);
    
    // If seller is approved but missing seller role, ensure the role exists
    if (status === 'active' && !roles.includes('seller')) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'seller' });

      if (roleError) {
        const msg = String((roleError as any).message || '').toLowerCase();
        if (!msg.includes('duplicate') && !msg.includes('unique')) {
          console.error('Error ensuring seller role:', roleError);
        }
      } else {
        setRoles((prev) => (prev.includes('seller') ? prev : [...prev, 'seller']));
      }
    }
  };

  const signUp = async (phone: string, password: string, fullName: string, email?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Use provided email or generate one from phone number
    const authEmail = email && email.trim() ? email.trim() : `${phone}@jhuri.local`;
    
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

  const signIn = async (phoneOrEmail: string, password: string) => {
    // Check if input is an email (contains @) or phone number
    const isEmail = phoneOrEmail.includes('@') && !phoneOrEmail.endsWith('@jhuri.local');
    const authEmail = isEmail ? phoneOrEmail : `${phoneOrEmail}@jhuri.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setSellerStatus(null);
  };

  const refreshRoles = async () => {
    if (user) {
      await fetchUserRoles(user.id);
      await fetchSellerStatus(user.id);
    }
  };

  // Combined loading state: auth loading OR roles loading
  const isLoading = loading || rolesLoading;
  
  const isAdmin = roles.includes('admin');
  const isSeller = roles.includes('seller');
  const isApprovedSeller = sellerStatus === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: isLoading,
        roles,
        sellerStatus,
        isAdmin,
        isSeller,
        isApprovedSeller,
        signUp,
        signIn,
        signOut,
        refreshRoles,
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
