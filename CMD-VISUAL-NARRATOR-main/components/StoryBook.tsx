
import React, { useState } from 'react';
import { StoryImage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Save, Book, Check, Download, Loader2, Layout } from 'lucide-react';
import { jsPDF } from "jspdf";

interface StoryBookProps {
  images: StoryImage[];
  title: string;
  onReset: () => void;
  onSave: (title: string, images: StoryImage[]) => Promise<void>;
}

const StoryBook: React.FC<StoryBookProps> = ({ images, title, onReset, onSave }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [localImages, setLocalImages] = useState(images);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentImage = localImages[currentIndex];

  const nextParams = currentIndex < localImages.length - 1 ? { onClick: () => setCurrentIndex(c => c + 1), disabled: false } : { disabled: true };
  const prevParams = currentIndex > 0 ? { onClick: () => setCurrentIndex(c => c - 1), disabled: false } : { disabled: true };

  const handleTextChange = (text: string) => {
    const newImages = [...localImages];
    newImages[currentIndex] = { ...newImages[currentIndex], storySegment: text };
    setLocalImages(newImages);
    setHasSaved(false); // Mark as dirty
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(title, localImages);
    setIsSaving(false);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Initialize jsPDF in landscape mode, A4 size
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < localImages.length; i++) {
        const imgData = localImages[i];

        if (i > 0) {
          doc.addPage();
        }

        // Add background color (optional, light gray for book feel)
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // -- Left Side: Image --
        // Load image from blob URL
        const imgElement = new Image();
        imgElement.src = imgData.previewUrl;
        await new Promise((resolve) => {
          imgElement.onload = resolve;
        });

        // Calculate aspect ratio to fit left half
        // Left half area: x=10, y=10, w=(pageWidth/2)-20, h=pageHeight-20
        const margin = 15;
        const halfWidth = pageWidth / 2;
        const maxImgW = halfWidth - (margin * 2);
        const maxImgH = pageHeight - (margin * 2);

        const imgRatio = imgElement.width / imgElement.height;
        let finalImgW = maxImgW;
        let finalImgH = finalImgW / imgRatio;

        if (finalImgH > maxImgH) {
          finalImgH = maxImgH;
          finalImgW = finalImgH * imgRatio;
        }

        // Center image in left half
        const imgX = margin + (maxImgW - finalImgW) / 2;
        const imgY = pageHeight / 2 - finalImgH / 2;

        doc.addImage(imgElement, "JPEG", imgX, imgY, finalImgW, finalImgH);

        // -- Right Side: Text --
        // Text area: x=halfWidth+margin, y=margin, w=maxImgW, h=maxImgH
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);

        const textX = halfWidth + margin;
        const textY = pageHeight / 2; // Start centering vertically roughly
        const textMaxWidth = halfWidth - (margin * 2);

        const textLines = doc.splitTextToSize(imgData.storySegment || "", textMaxWidth);

        // Adjust textY to center the block of text
        const lineHeight = 7;
        const blockHeight = textLines.length * lineHeight;
        const startTextY = textY - (blockHeight / 2);

        // Decorative Page Number
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`${i + 1}`, pageWidth - margin, pageHeight - margin);

        // Title on first page
        if (i === 0) {
          doc.setFont("times", "bold");
          doc.setFontSize(24);
          doc.setTextColor(0, 0, 0);
          doc.text(title, textX, startTextY - 20);

          doc.setFont("times", "normal");
          doc.setFontSize(16);
          doc.setTextColor(60, 60, 60);
        }

        doc.text(textLines, textX, startTextY);
      }

      doc.save(`${title || "my-story"}.pdf`);

    } catch (e) {
      console.error("PDF Generation failed", e);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/30 flex flex-col items-center justify-center py-10 px-4 md:px-10 overflow-hidden">

      {/* Top Controls */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-slate-500 hover:text-pink-500 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Start Over
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-500 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
          >
            <Layout className="w-4 h-4" /> Home Page
          </button>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="font-serif text-2xl md:text-3xl text-slate-900 font-bold tracking-tight">
            {title || "Untitled Story"}
          </h1>
          <div className="h-1 w-12 bg-pink-400 rounded-full mt-2" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-sm transition-all bg-white text-slate-700 hover:text-blue-600 hover:shadow-md disabled:opacity-50"
            title="Download as PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-sm transition-all
              ${hasSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-white text-slate-500 hover:text-pink-500 hover:shadow-md'}`}
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : hasSaved ? (
              <> <Check className="w-4 h-4" /> Saved </>
            ) : (
              <> <Save className="w-4 h-4" /> Save Story </>
            )}
          </button>

          <div className="w-24 text-center text-sm font-medium text-slate-400 bg-white px-3 py-2 rounded-full shadow-sm">
            {currentIndex + 1} / {localImages.length}
          </div>
        </div>
      </div>

      {/* The Book Container */}
      <div className="relative w-full max-w-6xl aspect-[16/9] md:aspect-[2.2/1] bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row z-20 ring-1 ring-slate-900/5">

        {/* Center Crease / Binding */}
        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-slate-200 z-30" style={{ transform: 'translateX(-50%)' }}></div>

        <AnimatePresence mode="wait">
          {/* Left Page: Image */}
          <motion.div
            key={`img-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-100 relative overflow-hidden group"
          >
            <img
              src={currentImage.previewUrl}
              alt="Story scene"
              className="w-full h-full object-cover"
            />
            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] pointer-events-none" />
          </motion.div>

          {/* Right Page: Text */}
          <motion.div
            key={`txt-${currentIndex}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full md:w-1/2 h-1/2 md:h-full bg-white p-8 md:p-20 flex flex-col justify-center relative"
          >
            <div className="relative z-10">
              {currentIndex === 0 && (
                <span className="block font-serif text-6xl text-pink-200 float-left mr-4 leading-[0.8]">O</span>
              )}

              <textarea
                value={currentImage.storySegment}
                onChange={(e) => handleTextChange(e.target.value)}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                className={`w-full h-72 bg-transparent resize-none font-serif text-xl leading-relaxed text-slate-700 outline-none transition-all
                   ${isEditing ? 'border-b border-pink-200' : 'border-b border-transparent'}`}
              />

              {isEditing && (
                <div className="absolute -bottom-6 right-0 text-xs text-pink-400 flex items-center gap-1">
                  <Save className="w-3 h-3" /> Editing...
                </div>
              )}
            </div>

            {/* Decorative Page Number */}
            <div className="absolute bottom-8 right-8 text-slate-300 font-serif italic">
              {currentIndex + 1}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-6 mt-10 z-20">
        <button
          {...prevParams}
          className="w-14 h-14 rounded-full bg-white text-slate-700 shadow-lg hover:shadow-xl hover:scale-110 hover:text-pink-500 disabled:opacity-30 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          {...nextParams}
          className="w-14 h-14 rounded-full bg-white text-slate-700 shadow-lg hover:shadow-xl hover:scale-110 hover:text-pink-500 disabled:opacity-30 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Background Decor */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default StoryBook;