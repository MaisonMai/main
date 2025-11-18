import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type AdminContextType = {
  isAdmin: boolean;
  adminRole: string | null;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.is_active) {
        setIsAdmin(true);
        setAdminRole(data.role);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, adminRole, loading, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
