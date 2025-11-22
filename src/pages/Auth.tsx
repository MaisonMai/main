import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { useEffect } from 'react';
import { Gift } from 'lucide-react';

export function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
        >
          <div className="bg-gray-900 p-2 rounded-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MaisonMai</span>
        </button>
        <AuthForm />
      </div>
    </div>
  );
}
