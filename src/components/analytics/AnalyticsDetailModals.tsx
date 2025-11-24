import { useState } from 'react';
import { X, Search, Download, Eye, Calendar, User, Gift, ExternalLink, Bell, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/analyticsHelpers';

type ModalProps = {
  onClose: () => void;
};

export function TotalUsersModal({ onClose }: ModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useState(() => {
    loadUsers();
  });

  const loadUsers = async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (data) {
      const usersWithStats = await Promise.all(
        data.map(async (user) => {
          const [peopleCount, questionnairesCount, giftsCount, remindersCount] = await Promise.all([
            supabase.from('people').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('questionnaire_responses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('gifts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          ]);

          return {
            ...user,
            profilesCreated: peopleCount.count || 0,
            questionnairesCompleted: questionnairesCount.count || 0,
            giftsGenerated: giftsCount.count || 0,
            remindersCreated: remindersCount.count || 0,
          };
        })
      );

      setUsers(usersWithStats);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCsv('users.csv', filteredUsers, ['email', 'full_name', 'created_at', 'profilesCreated', 'questionnairesCompleted', 'giftsGenerated', 'remindersCreated']);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Total Users</h2>
            <p className="text-sm text-gray-600 mt-1">{totalCount} users registered</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading users...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profiles</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Questionnaires</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gift Ideas</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Reminders</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.full_name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{user.profilesCreated}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{user.questionnairesCompleted}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{user.giftsGenerated}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{user.remindersCreated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= totalCount}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageViewsModal({ onClose }: ModalProps) {
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    loadPageViews();
  });

  const loadPageViews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analytics_events')
      .select('metadata')
      .eq('event_type', 'page_view')
      .order('created_at', { ascending: false });

    if (data) {
      const pageMap = new Map<string, number>();
      data.forEach((event: any) => {
        const page = event.metadata?.page || '/';
        pageMap.set(page, (pageMap.get(page) || 0) + 1);
      });

      const pages = Array.from(pageMap.entries()).map(([page, views]) => ({
        page,
        views,
        percentage: 0,
      }));

      const total = pages.reduce((sum, p) => sum + p.views, 0);
      pages.forEach(p => p.percentage = (p.views / total) * 100);

      pages.sort((a, b) => b.views - a.views);
      setPageViews(pages);
    }
    setLoading(false);
  };

  const handleExport = () => {
    exportToCsv('page_views.csv', pageViews, ['page', 'views', 'percentage']);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Page Views</h2>
            <p className="text-sm text-gray-600 mt-1">All tracked page views</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading page views...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Page</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Views</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.map((pv, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono">{pv.page}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{pv.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{pv.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuestionnairesModal({ onClose }: ModalProps) {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);

  useState(() => {
    loadQuestionnaires();
  });

  const loadQuestionnaires = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questionnaire_responses')
      .select(`
        *,
        user:profiles!user_id(email, full_name),
        person:people!person_id(name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setQuestionnaires(data);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const exportData = questionnaires.map(q => ({
      user: q.user?.email || '-',
      person: q.person?.name || '-',
      completion_date: q.created_at,
      age_range: q.age_range,
      interests: q.interests?.join(', ') || '-',
      price_range: q.price_range,
    }));
    exportToCsv('questionnaires.csv', exportData, Object.keys(exportData[0] || {}));
  };

  if (selectedQuestionnaire) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Questionnaire Details</h2>
            <button onClick={() => setSelectedQuestionnaire(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">User</label>
              <p className="text-gray-900">{selectedQuestionnaire.user?.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Person Profile</label>
              <p className="text-gray-900">{selectedQuestionnaire.person?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Age Range</label>
              <p className="text-gray-900">{selectedQuestionnaire.age_range || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              <p className="text-gray-900">{selectedQuestionnaire.gender || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Occupation</label>
              <p className="text-gray-900">{selectedQuestionnaire.occupation || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <p className="text-gray-900">{selectedQuestionnaire.location || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Interests</label>
              <p className="text-gray-900">{selectedQuestionnaire.interests?.join(', ') || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Favorite Brands</label>
              <p className="text-gray-900">{selectedQuestionnaire.favorite_brands?.join(', ') || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Price Range</label>
              <p className="text-gray-900">{selectedQuestionnaire.price_range || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Occasion</label>
              <p className="text-gray-900">{selectedQuestionnaire.occasion || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Personality Traits</label>
              <p className="text-gray-900">{selectedQuestionnaire.personality_traits?.join(', ') || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Experience vs Physical</label>
              <p className="text-gray-900">{selectedQuestionnaire.experience_vs_physical || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Surprise vs Practical</label>
              <p className="text-gray-900">{selectedQuestionnaire.surprise_vs_practical || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Restrictions / Notes</label>
              <p className="text-gray-900">{selectedQuestionnaire.restrictions_notes || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Questionnaires Completed</h2>
            <p className="text-sm text-gray-600 mt-1">{questionnaires.length} submissions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading questionnaires...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completion Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Summary</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {questionnaires.map((q) => (
                  <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{q.user?.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{q.person?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {q.age_range}, {q.interests?.slice(0, 2).join(', ')}...
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => setSelectedQuestionnaire(q)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function GiftIdeasModal({ onClose }: ModalProps) {
  const [giftIdeas, setGiftIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useState(() => {
    loadGiftIdeas();
  });

  const loadGiftIdeas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'gift_ideas_generated')
      .order('created_at', { ascending: false });

    if (data) {
      const ideasWithDetails = await Promise.all(
        data.map(async (event) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', event.user_id)
            .maybeSingle();

          const { data: person } = await supabase
            .from('people')
            .select('name')
            .eq('id', event.metadata?.person_id)
            .maybeSingle();

          return {
            ...event,
            userEmail: user?.email || '-',
            personName: person?.name || '-',
          };
        })
      );

      setGiftIdeas(ideasWithDetails);
    }
    setLoading(false);
  };

  const handleExport = () => {
    exportToCsv('gift_ideas.csv', giftIdeas, ['userEmail', 'personName', 'created_at']);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gift Ideas Generated</h2>
            <p className="text-sm text-gray-600 mt-1">{giftIdeas.length} gift ideas generated</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Ideas</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 ml-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading gift ideas...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {giftIdeas.map((idea) => (
                  <tr key={idea.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{idea.userEmail}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{idea.personName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(idea.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function GiftSavesModal({ onClose }: ModalProps) {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    loadSaves();
  });

  const loadSaves = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gifts')
      .select(`
        *,
        user:profiles!user_id(email, full_name),
        person:people!person_id(name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setSaves(data);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const exportData = saves.map(s => ({
      gift_idea: s.name,
      user: s.user?.email || '-',
      profile: s.person?.name || '-',
      time_saved: s.created_at,
    }));
    exportToCsv('gift_saves.csv', exportData, Object.keys(exportData[0] || {}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gift Idea Saves</h2>
            <p className="text-sm text-gray-600 mt-1">{saves.length} saved gift ideas</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading saved gifts...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Gift Idea</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Saved</th>
                </tr>
              </thead>
              <tbody>
                {saves.map((save) => (
                  <tr key={save.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{save.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{save.user?.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{save.person?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(save.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function OutboundClicksModal({ onClose }: ModalProps) {
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    loadClicks();
  });

  const loadClicks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'outbound_link_clicked')
      .order('created_at', { ascending: false });

    if (data) {
      const clickMap = new Map<string, any>();

      data.forEach((event) => {
        const url = event.metadata?.url || 'Unknown';
        if (clickMap.has(url)) {
          clickMap.get(url).clicks++;
        } else {
          clickMap.set(url, {
            url,
            clicks: 1,
            giftIdea: event.metadata?.gift_name || '-',
          });
        }
      });

      const clicksArray = Array.from(clickMap.values());
      clicksArray.sort((a, b) => b.clicks - a.clicks);
      setClicks(clicksArray);
    }
    setLoading(false);
  };

  const handleExport = () => {
    exportToCsv('outbound_clicks.csv', clicks, ['url', 'clicks', 'giftIdea']);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Outbound Link Clicks</h2>
            <p className="text-sm text-gray-600 mt-1">{clicks.length} unique links clicked</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading outbound clicks...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Destination Link</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Clicks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Gift Idea</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((click, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono break-all max-w-md">
                      {click.url}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{click.clicks}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{click.giftIdea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function RemindersModal({ onClose }: ModalProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  useState(() => {
    loadReminders();
  });

  const loadReminders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reminders')
      .select(`
        *,
        user:profiles!user_id(email, full_name),
        person:people!person_id(name)
      `)
      .order('reminder_date', { ascending: true });

    if (data) {
      const remindersWithStatus = data.map(r => {
        const reminderDate = new Date(r.reminder_date);
        const now = new Date();
        let status = 'upcoming';
        if (reminderDate < now) {
          status = 'missed';
        }
        return { ...r, status };
      });
      setReminders(remindersWithStatus);
    }
    setLoading(false);
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime();
    } else {
      return a.status.localeCompare(b.status);
    }
  });

  const handleExport = () => {
    const exportData = reminders.map(r => ({
      user: r.user?.email || '-',
      title: r.title,
      reminder_date: r.reminder_date,
      profile: r.person?.name || '-',
      status: r.status,
    }));
    exportToCsv('reminders.csv', exportData, Object.keys(exportData[0] || {}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reminders Created</h2>
            <p className="text-sm text-gray-600 mt-1">{reminders.length} reminders</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 ml-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading reminders...</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedReminders.map((reminder) => (
                  <tr key={reminder.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{reminder.user?.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reminder.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(reminder.reminder_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reminder.person?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.status === 'upcoming'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {reminder.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
