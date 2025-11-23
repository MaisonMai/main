import { useState, useEffect } from 'react';
import { Store, Mail, Phone, Building2, Calendar, MessageSquare } from 'lucide-react';
import { supabase, PartnershipEnquiry } from '../lib/supabase';

export function PartnershipEnquiries() {
  const [enquiries, setEnquiries] = useState<PartnershipEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (err) {
      console.error('Error loading partnership enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: PartnershipEnquiry['status']) => {
    try {
      const { error } = await supabase
        .from('partnership_enquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await loadEnquiries();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const saveNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('partnership_enquiries')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
      setEditingNotes(null);
      await loadEnquiries();
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const filteredEnquiries = selectedStatus === 'all'
    ? enquiries
    : enquiries.filter(e => e.status === selectedStatus);

  const statusColors = {
    new: 'bg-primary-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    new: 'New',
    contacted: 'Contacted',
    in_progress: 'In Progress',
    closed: 'Closed',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-gray-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Partnership Enquiries</h2>
            <p className="text-sm text-gray-500">{filteredEnquiries.length} total</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['all', 'new', 'contacted', 'in_progress', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status as keyof typeof statusLabels]}
            </button>
          ))}
        </div>
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enquiries</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all'
              ? 'No partnership enquiries yet.'
              : `No ${statusLabels[selectedStatus as keyof typeof statusLabels].toLowerCase()} enquiries.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{enquiry.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[enquiry.status]}`}>
                      {statusLabels[enquiry.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>{enquiry.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(enquiry.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>

                <select
                  value={enquiry.status}
                  onChange={(e) => updateStatus(enquiry.id, e.target.value as PartnershipEnquiry['status'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${enquiry.email}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    {enquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${enquiry.phone_number}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    {enquiry.phone_number}
                  </a>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Admin Notes</span>
                </div>
                {editingNotes === enquiry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      rows={3}
                      placeholder="Add notes about this enquiry..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveNotes(enquiry.id, notesText)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {enquiry.admin_notes || 'No notes yet'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingNotes(enquiry.id);
                        setNotesText(enquiry.admin_notes);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
