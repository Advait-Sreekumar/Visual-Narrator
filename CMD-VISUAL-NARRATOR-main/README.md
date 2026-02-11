# The Visual Narrator 📖✨

An immersive AI-powered storybook creator that weaves your photos into magical narratives. Create, save, and share your cherished memories as beautiful digital storybooks.

## 🚀 Prerequisite

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js & npm** (for the frontend website) - [Download Here](https://nodejs.org/)
2.  **Python 3.8+** (for the backend server) - [Download Here](https://www.python.org/)

---

## 🛠️ Installation Instructions

Follow these steps to set up the project on your local machine.

### 1. Set up the Backend (Python)
The backend handles the database, authentication, and AI story generation logic.

1.  Open your terminal/command prompt.
2.  Navigate to the `services` folder:
    ```bash
    cd services
    ```
3.  Install the required Python libraries:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: If `pip` doesn't work, try `python -m pip install -r requirements.txt`)*

4.  Start the backend server:
    ```bash
    python app.py
    ```
    You should see a message saying `Running on http://127.0.0.1:5000`. Keep this terminal window open!

---

### 2. Set up the Frontend (React Application)
The frontend is the visual website you interact with.

1.  Open a **new** terminal window (do not close the Python one).
2.  Navigate to the project root folder (where `package.json` is located).
3.  Install the website dependencies:
    ```bash
    npm install
    ```
4.  Start the website:
    ```bash
    npm run dev
    ```
5.  You should see a local URL (e.g., `http://localhost:5173` or `http://localhost:3000`). Ctrl+Click it to open the app!

---

## 🌟 How to Use

1.  **Login/Register**:
    *   **Manual**: Sign up with any email and a password (min 8 chars).
    *   **Guest**: Click "Continue as Guest" to try it out immediately.
    *   **Google**: Sign in with your Google account.

2.  **Create a Story**:
    *   Click **"Make Your Own Project"**.
    *   Upload images from your computer.
    *   Add small notes/context for each image (e.g., "Grandpa telling a joke").
    *   Click **"Weave My Story"** and watch the AI generate a narrative!

3.  **Read & Save**:
    *   Flip through your storybook.
    *   Edit any text if you want to make changes.
    *   Click **"Save Story"** to keep it in your library.
    *   Click **"PDF"** to download a printable version.

4.  **Manage Library**:
    *   Go to the **Dashboard** to see your saved projects.
    *   Click a project to read it again.
    *   Hover over a project and click the **Trash Icon** to delete it.

---

## 🔧 Troubleshooting

*   **Backend not connecting?**
    *   Make sure the Python window says `Running on http://127.0.0.1:5000`.
    *   Ensure you didn't close the terminal window.

*   **Images not saving?**
    *   The app uses a local database (`visual_narrator.db`) inside the `services` folder. Do not delete this file if you want to keep your data.

*   **"Pip" not recognized?**
    *   Make sure Python is added to your system PATH during installation. Try using `py` or `python3` instead of `python`.
