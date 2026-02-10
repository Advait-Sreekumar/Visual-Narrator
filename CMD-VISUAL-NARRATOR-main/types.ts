
export interface StoryImage {
  id: string;
  file: File;
  previewUrl: string;
  note: string; // User context injection
  storySegment?: string; // The generated text for this page
}

export interface StoryResponse {
  pages: {
    imageIndex: number;
    storySegment: string;
  }[];
  title: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: string;
  phoneNumber?: string;
}

export interface SavedPage {
  image: string; // Base64 data URL or Image URL
  text: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  date: string;
  coverImage: string; // Base64 or URL
  pages: SavedPage[];
}

export enum AppState {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SEQUENCE = 'SEQUENCE',
  GENERATING = 'GENERATING',
  READING = 'READING',
}