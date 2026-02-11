import { Project, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to simulate network delay for local fallback
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API Service
 * Designed to connect to a Flask + Neon Backend.
 * Includes a fallback to LocalStorage for demonstration purposes if the backend is not running.
 */

export const api = {

  async loginWithGoogle(idToken: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Backend login failed');
      return await response.json();
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  },

  async registerUser(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Registration failed');
      }
      return await response.json();
    } catch (error) {
      console.error("Register failed", error);
      throw error;
    }
  },

  async loginUser(email: string, password?: string): Promise<User> {
    try {
      // Attempt to hit the backend
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Login failed'); // Propagate specific error
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message.includes('unavailable')) {
        console.warn("API unavailable, using local storage fallback for Login");
        await delay(500);

        // Local Fallback: Find or create user
        const storedUsers = JSON.parse(localStorage.getItem('vn_users') || '[]');
        let user = storedUsers.find((u: User) => u.email === email);

        if (!user) {
          // Note: In real app, we shouldn't auto-create on login failure if backend is down, 
          // but for "Guest" continuity in demo, we can.
          user = { id: uuidv4(), email, name: '', age: '' };
          storedUsers.push(user);
          localStorage.setItem('vn_users', JSON.stringify(storedUsers));
        }
        return user;
      }
      throw error; // Rethrow auth errors (invalid password etc)
    }
  },

  async updateUser(user: User): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Backend unavailable');
      return await response.json();
    } catch (error) {
      console.warn("API unavailable, using local storage fallback for Update User");
      // Local Fallback
      const storedUsers = JSON.parse(localStorage.getItem('vn_users') || '[]');
      const updatedUsers = storedUsers.map((u: User) => u.id === user.id ? user : u);
      localStorage.setItem('vn_users', JSON.stringify(updatedUsers));
      return user;
    }
  },

  async getProjects(userId: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`);
      if (!response.ok) throw new Error('Backend unavailable');
      return await response.json();
    } catch (error) {
      // Local Fallback
      await delay(500);
      const allProjects = JSON.parse(localStorage.getItem('vn_projects') || '[]');
      return allProjects.filter((p: Project) => p.userId === userId);
    }
  },

  async saveProject(project: Project): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error('Backend unavailable');
      return await response.json();
    } catch (error) {
      console.warn("API unavailable, using local storage fallback for Save Project");
      await delay(800);

      // Local Fallback
      const allProjects = JSON.parse(localStorage.getItem('vn_projects') || '[]');
      const existingIndex = allProjects.findIndex((p: Project) => p.id === project.id);

      if (existingIndex >= 0) {
        allProjects[existingIndex] = project;
      } else {
        allProjects.push(project);
      }

      localStorage.setItem('vn_projects', JSON.stringify(allProjects));
      return project;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Backend unavailable');
    } catch (error) {
      console.warn("API unavailable, using local storage fallback for Delete Project");
      // Local Fallback
      const allProjects = JSON.parse(localStorage.getItem('vn_projects') || '[]');
      const filteredProjects = allProjects.filter((p: Project) => p.id !== projectId);
      localStorage.setItem('vn_projects', JSON.stringify(filteredProjects));
    }
  }
};