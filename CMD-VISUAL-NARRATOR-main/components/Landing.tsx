import React from 'react';
import { BookOpen, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-white flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="p-6 md:px-12 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-pink-500" />
          </div>
          <span className="font-sans font-bold text-slate-800 tracking-wide text-sm md:text-base uppercase">
            The Visual Narrator
          </span>
        </div>
        {/* Login button removed as requested */}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 -mt-20">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Decorative sub-heading */}
          <div className="flex items-center gap-3 mb-6 text-slate-500 font-serif italic text-lg">
            <Star className="w-5 h-5 text-pink-400 fill-pink-400" />
            <span>Bring photos to life</span>
            <Star className="w-5 h-5 text-pink-400 fill-pink-400" />
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-6xl md:text-8xl text-slate-900 mb-6 tracking-tight">
            WELCOME
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base tracking-[0.2em] uppercase font-bold mb-12">
            Create your own storybook!!
          </p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative px-8 py-4 bg-pink-400 hover:bg-pink-500 text-white rounded-full text-lg font-bold shadow-lg shadow-pink-300/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </main>

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-100 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4 pointer-events-none" />
    </div>
  );
};

export default Landing;