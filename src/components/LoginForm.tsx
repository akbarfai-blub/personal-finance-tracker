import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Process login to supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light dark:bg-gray-900 font-sans p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm w-full max-w-md border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-bold text-brand-dark dark:text-gray-100 mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-brand-dark dark:focus:ring-gray-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-brand-dark dark:focus:ring-gray-500 focus:outline-none transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-brand-dark dark:bg-brand-light text-white dark:text-brand-dark font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
