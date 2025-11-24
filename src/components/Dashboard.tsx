import { useState } from 'react';
import { Person } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from './Navigation';
import { DashboardView } from './DashboardView';
import { PeopleView } from './PeopleView';
import { GiftsView } from './GiftsView';
import { SettingsView } from './SettingsView';
import { GiftPartnersView } from './GiftPartnersView';
import { GiftPartnerDetail } from './GiftPartnerDetail';
import { PartnerChat } from './PartnerChat';
import { PersonDetail } from './PersonDetail';
import { ProfileCompletion } from './ProfileCompletion';
import { AdBanner } from './AdBanner';
import { Gift, Shield } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

type DashboardProps = {
  onNavigate: (view: 'privacy' | 'terms') => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profileComplete, user } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'people' | 'gifts' | 'partners' | 'settings'>('people');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleBackFromPerson = () => {
    setSelectedPerson(null);
  };

  const handlePersonUpdated = () => {
    setSelectedPerson(null);
  };

  const handlePersonDeleted = () => {
    setSelectedPerson(null);
  };

  if (!profileComplete) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 h-16">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedPerson(null);
                setSelectedPartnerId(null);
                setChatPartnerId(null);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gray-900 p-2 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Maison Mai</span>
            </button>
          </div>
        </div>
      </header>

      {!selectedPerson && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPerson ? (
          <PersonDetail
            person={selectedPerson}
            onBack={handleBackFromPerson}
            onPersonUpdated={handlePersonUpdated}
            onPersonDeleted={handlePersonDeleted}
          />
        ) : selectedPartnerId ? (
          <GiftPartnerDetail
            partnerId={selectedPartnerId}
            onBack={() => setSelectedPartnerId(null)}
            onStartChat={(partnerId) => {
              setChatPartnerId(partnerId);
              setSelectedPartnerId(null);
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardView onViewPerson={handleSelectPerson} />}
            {activeTab === 'people' && <PeopleView onSelectPerson={handleSelectPerson} />}
            {activeTab === 'gifts' && <GiftsView />}
            {activeTab === 'partners' && (
              <GiftPartnersView
                onViewPartner={setSelectedPartnerId}
                onStartChat={(partnerId) => {
                  if (!user) {
                    alert('Please sign in to message partners');
                    return;
                  }
                  setChatPartnerId(partnerId);
                }}
              />
            )}
            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {chatPartnerId && user && (
        <PartnerChat
          partnerId={chatPartnerId}
          onClose={() => setChatPartnerId(null)}
        />
      )}

      <AdBanner />

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('privacy')}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onNavigate('terms')}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Terms of Service
              </button>
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </a>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Maison Mai by Virtual Speed Date Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
