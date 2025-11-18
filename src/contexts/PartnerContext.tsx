import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type PartnerContextType = {
  isPartner: boolean;
  partnerId: string | null;
  loading: boolean;
};

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export function PartnerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPartner, setIsPartner] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPartnerStatus();
  }, [user]);

  const checkPartnerStatus = async () => {
    if (!user) {
      setIsPartner(false);
      setPartnerId(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gift_partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setIsPartner(!!data);
      setPartnerId(data?.id || null);
    } catch (error) {
      console.error('Error checking partner status:', error);
      setIsPartner(false);
      setPartnerId(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isPartner,
    partnerId,
    loading,
  };

  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
}

export function usePartner() {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
}
