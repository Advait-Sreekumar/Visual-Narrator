import React, { useState, useRef } from 'react';
import { StoryImage, User } from '../types';
import { Plus, GripVertical, Wand2, Image as ImageIcon, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface SequencerProps {
  images: StoryImage[];
  setImages: React.Dispatch<React.SetStateAction<StoryImage[]>>;
  onGenerate: () => void;
  user?: User;
  onBack: () => void;
  isGenerating: boolean;
}

const Sequencer: React.FC<SequencerProps> = ({ images, setImages, onGenerate, user, onBack, isGenerating }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the last added image or the first one
  React.useEffect(() => {
    if (images.length > 0 && !selectedId) {
      setSelectedId(images[0].id);
    }
  }, [images, selectedId]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: StoryImage[] = Array.from(files).map((file) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      note: '',
    }));
    setImages((prev) => {
      const updated = [...prev, ...newImages];
      setSelectedId(newImages[0].id); // Select the first new image
      return updated;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newImages = images.filter((img) => img.id !== id);
    setImages(newImages);
    if (selectedId === id) {
      setSelectedId(newImages.length > 0 ? newImages[0].id : null);
    }
  };

  const updateNote = (id: string, note: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, note } : img)));
  };

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Back to Dashboard"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800">
              Story Workspace
            </h2>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              {user && <span className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">Author: {user.name}</span>}
              Organize your memories
            </p>
          </div>
        </div>

        <div className="flex gap-4">
           <button
            onClick={onGenerate}
            disabled={images.length === 0 || isGenerating}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white transition-all shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed
              ${images.length > 0 
                ? 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 shadow-pink-200' 
                : 'bg-slate-300'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Weaving Story...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> 
                Generate Storybook
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Sequencer (Filmstrip) */}
        <div className="w-1/3 min-w-[320px] max-w-md border-r border-slate-100 bg-white/60 backdrop-blur-sm flex flex-col h-full">
           {/* Upload Zone */}
           <div className="p-6 border-b border-slate-50">
              <div 
                onClick={() => !isGenerating && fileInputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); !isGenerating && setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={!isGenerating ? handleDrop : (e) => e.preventDefault()}
                className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group
                  ${isGenerating ? 'opacity-50 cursor-not-allowed border-slate-100' : ''}
                  ${dragActive ? 'border-pink-400 bg-pink-50' : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'}`}
              >
                <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Drop photos or Click to Upload</p>
              </div>
           </div>

           {/* Sequence List */}
           <div className="flex-1 overflow-y-auto p-6">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Sequence ({images.length})</h3>
             
             <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-3">
                {images.map((image, index) => (
                  <Reorder.Item 
                    key={image.id} 
                    value={image}
                    onClick={() => setSelectedId(image.id)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all flex items-center p-2 gap-3 group
                      ${selectedId === image.id ? 'border-pink-400 ring-1 ring-pink-100 bg-pink-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}
                      ${isGenerating ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    <div className="text-slate-300 cursor-grab active:cursor-grabbing p-1">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      <img src={image.previewUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">Scene {index + 1}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {image.note || "No context added..."}
                      </p>
                    </div>
                  </Reorder.Item>
                ))}
             </Reorder.Group>
             
             {images.length === 0 && (
               <div className="text-center py-10 opacity-50">
                 <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                 <p className="text-sm text-slate-400">No images yet.</p>
               </div>
             )}
           </div>
        </div>

        {/* Right Panel: Inspector / Empty State */}
        <div className="flex-1 bg-slate-50/30 p-8 md:p-12 overflow-y-auto flex flex-col items-center justify-center relative">
          
          <AnimatePresence mode="wait">
            {selectedImage ? (
              <motion.div 
                key={selectedImage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`w-full max-w-2xl z-10 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Image Preview Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-3 mb-6">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 relative group">
                    <img 
                      src={selectedImage.previewUrl} 
                      alt="Selected scene" 
                      className="w-full h-full object-contain"
                    />
                    <button 
                      onClick={(e) => removeImage(selectedImage.id, e)}
                      className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Context Editor */}
                <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8">
                  <h3 className="font-serif text-xl text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-sm font-bold">
                      {images.findIndex(i => i.id === selectedImage.id) + 1}
                    </span>
                    Add Context
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Tell the AI what is happening in this specific scene to help weave the story.
                  </p>
                  
                  <textarea
                    value={selectedImage.note}
                    onChange={(e) => updateNote(selectedImage.id, e.target.value)}
                    placeholder="e.g., 'We finally arrived at the beach house,' or 'He looked surprised to see the cake.'"
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 transition-all resize-none text-slate-700"
                  />
                </div>

              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center z-10"
              >
                <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-pink-100 flex items-center justify-center mb-6 mx-auto">
                  <Wand2 className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="font-serif text-4xl text-slate-800 mb-4">Ready to tell your story?</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Upload photos in the sequencer on the left, add some context, and let our AI weave them into a beautiful book.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="image/*" 
        onChange={(e) => handleFiles(e.target.files)} 
      />
    </div>
  );
};

export default Sequencer;