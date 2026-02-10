
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { ArrowRight, User as UserIcon, Calendar, Mail, Phone } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: Pick<User, 'name' | 'age' | 'phoneNumber'>) => void;
  email?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, email }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age) {
      onComplete({ name, age, phoneNumber });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-10">
          <h2 className="font-serif text-3xl text-slate-800 mb-2 text-center">Tell us about yourself</h2>
          <p className="text-slate-500 text-center mb-8">Help us personalize your storytelling experience.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Read-only Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  value={email || ''}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="e.g. Alice Wonderland"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="number"
                    required
                    placeholder="25"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-pink-400 hover:bg-pink-500 text-white rounded-full font-medium shadow-lg shadow-pink-300/50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;