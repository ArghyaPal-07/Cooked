# COOKED 🍳 | AI Music Roaster

> **"Tell me what you listen to, and I'll tell you why you're wrong."**

**Cooked** is a Next.js application that analyzes your Spotify listening history (top artists, tracks, and genres) and uses a rude AI persona to mercilessly roast your music taste. It features a "Spotify Wrapped" style slideshow with glassmorphism UI and interactive animations.

## 🚀 Features

* **Spotify Integration:** Secure OAuth login to fetch your top artists and tracks.
* **AI Analysis:** Uses **Groq (Llama 3.3 70B)** to generate unique, context-aware insults based on your specific listening habits.
* **Visual Storytelling:** Interactive slideshow format revealing your "Vibe," "Main Culprit" (Top Artist), and "On Repeat" tracks.
* **Glassmorphism UI:** Modern, aesthetic design with neon accents and `backdrop-blur` effects.
* **Responsive Design:** Optimized for both mobile and desktop experiences.
* **Scoring System:** Assigns a "Taste Score" (0-100) to quantify how bad your taste actually is.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **AI Provider:** [Groq API](https://groq.com/) (running Llama 3.3-70b-versatile)
* **Data Source:** [Spotify Web API](https://developer.spotify.com/documentation/web-api)

## 📦 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Spotify Developer Account
* A Groq API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/cooked.git](https://github.com/your-username/cooked.git)
    cd cooked
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    SPOTIFY_REDIRECT_URI=[http://127.0.0.1:3000/callback](http://127.0.0.1:3000/callback)
    GROQ_API_KEY=your_groq_api_key
    ```

    > **Note:** Spotify requires using `127.0.0.1` instead of `localhost` for redirect URIs as of 2025.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open the app**
    Visit `http://127.0.0.1:3000` in your browser.

## ⚠️ Important Note on Spotify Quotas

This app currently runs in **Spotify Development Mode**.

Due to Spotify's [policy updates in May 2025](https://developer.spotify.com/blog/2025-05-15-quota-extensions), access to the "Extended Quota" (public use) is restricted to Organizations only.

**If you want to try this app:**
* You must be manually added to the Allowlist in the Spotify Developer Dashboard.
* Please contact me to add your email if you wish to test the live deployment.

## 🚀 Deployment

The app is optimized for deployment on **Netlify** or **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Netlify/Vercel.
3.  Add your Environment Variables in the hosting dashboard.
4.  **Crucial:** Update the `SPOTIFY_REDIRECT_URI` in both your Hosting Dashboard and your Spotify Developer Dashboard to match your live URL (e.g., `https://your-site.netlify