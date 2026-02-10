
import React, { useState } from 'react';
import Sequencer from './components/Sequencer';
import StoryBook from './components/StoryBook';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { StoryImage, AppState, StoryResponse, User, Project } from './types';
import { generateStoryFromImages } from './services/geminiService';
import { api } from './services/api';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [images, setImages] = useState<StoryImage[]>([]);
  const [storyTitle, setStoryTitle] = useState<string>("");
  const [user, setUser] = useState<User | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // --- Navigation Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // If user has a name, they are already onboarded
    if (loggedInUser.name) {
      setAppState(AppState.DASHBOARD);
    } else {
      setAppState(AppState.ONBOARDING);
    }
  };

  const handleOnboardingComplete = async (userInfo: Pick<User, 'name' | 'age' | 'phoneNumber'>) => {
    // Merge new info with existing user ID/Email
    const updatedUser = { ...user!, ...userInfo };

    try {
      // Save updated user details to DB
      await api.updateUser(updatedUser);
      setUser(updatedUser);
      setAppState(AppState.DASHBOARD);
    } catch (e) {
      console.error("Failed to update user", e);
      setError("Failed to save your profile. Please try again.");
    }
  };

  const handleCreateProject = () => {
    setAppState(AppState.SEQUENCE);
  };

  const handleBackToDashboard = () => {
    setAppState(AppState.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(undefined);
    setAppState(AppState.AUTH);
  };

  const handleGenerateStory = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const storyResponse: StoryResponse = await generateStoryFromImages(images, user);

      // Merge generated text back into image objects
      const updatedImages = images.map((img, idx) => {
        // Find the page matching the index. Note: Response might map loosely, so we fallback to index.
        const page = storyResponse.pages.find(p => p.imageIndex === idx) || storyResponse.pages[idx];
        return {
          ...img,
          storySegment: page ? page.storySegment : "The magical ink seems to have faded on this page..."
        };
      });

      setImages(updatedImages);
      setStoryTitle(storyResponse.title);
      setAppState(AppState.READING);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to weave the story. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveProject = async (title: string, currentImages: StoryImage[]) => {
    if (!user) return;

    try {
      // Convert all images to Base64 before saving
      const processedPages = await Promise.all(currentImages.map(async (img) => {
        let base64Image = img.previewUrl;

        // If we have a real file (newly uploaded), convert it. 
        // If it's a restored project, previewUrl is already the base64/url, and file is a placeholder (size 0).
        if (img.file && img.file.size > 0) {
          try {
            base64Image = await fileToBase64(img.file);
          } catch (err) {
            console.warn("Failed to convert image", err);
          }
        }

        return {
          image: base64Image,
          text: img.storySegment || ''
        };
      }));

      const project: Project = {
        id: uuidv4(),
        userId: user.id,
        title: title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        coverImage: processedPages[0]?.image || '',
        pages: processedPages
      };

      await api.saveProject(project);
    } catch (e) {
      console.error("Failed to save project", e);
      setError("Could not save your story to the library.");
    }
  };

  const handleOpenProject = (project: Project) => {
    // Convert SavedPage[] back to StoryImage[] for the reader
    const restoredImages: StoryImage[] = project.pages.map((page, index) => ({
      id: `restored_${index}`,
      file: new File([], "placeholder"), // Placeholder as we don't need the original file for reading
      previewUrl: page.image,
      note: "",
      storySegment: page.text
    }));

    setImages(restoredImages);
    setStoryTitle(project.title);
    setAppState(AppState.READING);
  };

  const handleReset = () => {
    setImages([]);
    setStoryTitle("");
    setAppState(AppState.DASHBOARD); // Go back to dashboard
  };

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm" role="alert">
          <strong className="font-bold">Magical Mishap! </strong>
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Application States Routing */}
      {appState === AppState.AUTH && (
        <Auth
          onLogin={handleLogin}
        />
      )}

      {appState === AppState.ONBOARDING && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          email={user?.email}
        />
      )}

      {appState === AppState.DASHBOARD && (
        <Dashboard
          user={user}
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          onBack={handleLogout}
        />
      )}

      {appState === AppState.SEQUENCE && (
        <Sequencer
          images={images}
          setImages={setImages}
          onGenerate={handleGenerateStory}
          user={user}
          onBack={handleBackToDashboard}
          isGenerating={isGenerating}
        />
      )}

      {appState === AppState.READING && (
        <StoryBook
          images={images}
          title={storyTitle}
          onReset={handleReset}
          onSave={handleSaveProject}
        />
      )}
    </>
  );
};

export default App;