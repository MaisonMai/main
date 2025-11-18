import { useState, useEffect } from 'react';
import { X, Search, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserToPartnerConverterProps {
  onClose: () => void;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  has_partner: boolean;
}

export function UserToPartnerConverter({ onClose }: UserToPartnerConverterProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [converting, setConverting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: partners, error: partnersError } = await supabase
        .from('gift_partners')
        .select('user_id');

      if (partnersError) throw partnersError;

      const partnerUserIds = new Set(partners?.map(p => p.user_id) || []);

      const usersWithPartnerStatus = profiles?.map(profile => ({
        ...profile,
        has_partner: partnerUserIds.has(profile.id),
      })) || [];

      setUsers(usersWithPartnerStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const convertToPartner = async (userId: string, email: string, fullName: string | null) => {
    setConverting(userId);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('gift_partners')
        .insert([
          {
            user_id: userId,
            name: fullName || email.split('@')[0],
            description: 'Partner account created by admin',
            is_active: true,
            approval_status: 'approved',
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(`Successfully converted ${email} to a partner account!`);
      await loadUsers();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to convert user to partner');
    } finally {
      setConverting(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Convert User to Partner</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.full_name || 'No name set'}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        {user.has_partner ? (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Partner Account</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => convertToPartner(user.id, user.email, user.full_name)}
                            disabled={converting === user.id}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {converting === user.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Converting...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Make Partner</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
