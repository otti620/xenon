import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const NotificationAlert: React.FC = () => {
  const { notification, clearNotification } = useApp();

  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-100 text-center relative overflow-hidden transform animate-scaleUp">
        {/* Top gradient decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-500" />

        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          {notification.type === 'deposit' ? (
            <ArrowUpRight className="w-8 h-8" />
          ) : (
            <ArrowDownLeft className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-2">{notification.title}</h3>
        <p className="text-sm font-medium text-gray-600 leading-relaxed mb-6">{notification.message}</p>

        <button
          onClick={clearNotification}
          className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm cursor-pointer"
        >
          Awesome, Thanks!
        </button>
      </div>
    </div>
  );
};
