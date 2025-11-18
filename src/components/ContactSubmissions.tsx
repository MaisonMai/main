import { useState, useEffect } from 'react';
import { X, Mail, Calendar, MessageSquare, User } from 'lucide-react';
import { supabase, ContactSubmission } from '../lib/supabase';

type ContactSubmissionsProps = {
  onClose: () => void;
};

export function ContactSubmissions({ onClose }: ContactSubmissionsProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {submission.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{submission.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{submission.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(submission.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : submission.status === 'read'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{submission.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Subject</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedSubmission.subject}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{selectedSubmission.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Submitted</label>
                  <p className="text-gray-900">{formatDate(selectedSubmission.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedSubmission.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedSubmission.status === 'read'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
