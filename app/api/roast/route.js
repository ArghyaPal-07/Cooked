import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  const { code } = await request.json();

  // --- SPOTIFY AUTH & DATA FETCHING (Same as before) ---
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) return NextResponse.json({ error: 'Spotify Auth Failed' }, { status: 400 });
  const accessToken = tokenData.access_token;

  const [artistsRes, tracksRes, profileRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5', { headers: { Authorization: `Bearer ${accessToken}` } }),
    fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5', { headers: { Authorization: `Bearer ${accessToken}` } }),
    fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } })
  ]);

  const artistsData = await artistsRes.json();
  const tracksData = await tracksRes.json();
  const profileData = await profileRes.json();

  // Safety Check
  if (!artistsData.items || artistsData.items.length === 0) {
     return NextResponse.json({ error: "Not enough data" }, { status: 400 });
  }

  // Process Data
  const allGenres = artistsData.items.flatMap(a => a.genres);
  const topGenre = allGenres.sort((a,b) => allGenres.filter(v => v===a).length - allGenres.filter(v => v===b).length).pop() || "Pop";
  const artistList = artistsData.items.slice(0, 5).map(a => a.name).join(', ');
  const trackList = tracksData.items.slice(0, 5).map(t => `${t.name} by ${t.artists[0].name}`).join(', ');

  // --- GEMINI SPECIFIC CODE STARTS HERE ---
  
  // 2. Configure the Model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Fast and cheap (free tier)
    systemInstruction: `
      You are a rude, elitist music critic. 
      Analyze this user's music taste and break it down into stages.
      
      You MUST return valid JSON with this EXACT structure:
      {
        "intro": "<A short, sarcastic greeting using their name: ${profileData.display_name}>",
        "genre_roast": "<Roast them specifically for listening to ${topGenre}>",
        "artist_roast": "<Roast their top artist: ${artistsData.items[0].name}>",
        "track_roast": "<Roast their top track: ${tracksData.items[0].name}>",
        "final_verdict": {
          "score": <number 0-100>,
          "title": "<Mean Title>",
          "summary": "<2 sentence final destruction>"
        }
      }
    `,
    generationConfig: {
      responseMimeType: "application/json", // Forces JSON output
    }
  });

  const prompt = `User's Top Artists: ${artistList}. User's Top Tracks: ${trackList}. Top Genre: ${topGenre}. Roast them.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const aiContent = JSON.parse(text);

    return NextResponse.json({
      content: aiContent,
      data: {
        user: profileData,
        topGenre: topGenre,
        topArtist: artistsData.items[0],
        topTracks: tracksData.items.slice(0, 5),
      }
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "AI Failed" }, { status: 500 });
  }
}