import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
      <div className="relative w-32 h-32 mb-8">
        <motion.div 
          className="absolute inset-0 border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-yellow-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-4 border-4 border-t-purple-500 border-r-pink-500 border-b-yellow-500 border-l-indigo-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-serif text-4xl">
          ✨
        </div>
      </div>
      
      <h2 className="text-2xl font-serif font-bold mb-2">Weaving your Story</h2>
      <p className="text-slate-400 max-w-md text-center">
        Analyzing visual details, constructing narrative arcs, and consulting the digital muse...
      </p>
    </div>
  );
};

export default Loading;