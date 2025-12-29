import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" 
});

export async function POST(request) {
  const { code } = await request.json();

  // 1. Spotify Auth (Same as before)
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
  const accessToken = tokenData.access_token;
  if (!accessToken) return NextResponse.json({ error: 'Auth Failed' }, { status: 400 });

  // 2. Fetch Extended Data
  const [artistsRes, tracksRes, profileRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', { headers: { Authorization: `Bearer ${accessToken}` } }),
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', { headers: { Authorization: `Bearer ${accessToken}` } }),
    fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } })
  ]);

  const artistsData = await artistsRes.json();
  const tracksData = await tracksRes.json();
  const profileData = await profileRes.json();

  // Process Genre (Spotify doesn't give "Top Genre" directly, we infer it from artists)
  const allGenres = artistsData.items.flatMap(a => a.genres);
  const topGenre = allGenres.sort((a,b) =>
    allGenres.filter(v => v===a).length - allGenres.filter(v => v===b).length
  ).pop() || "Pop";

  // --- SAFETY CHECK START ---
  // If the user has no listening history, give them default values to prevent crashing
  if (!artistsData.items || artistsData.items.length === 0) {
     return NextResponse.json({ 
       error: "Not enough data",
       // Optional: You could return a custom "boring" roast here instead of an error
     }, { status: 400 });
  }
  // --- SAFETY CHECK END ---

  // Data for AI
  const artistList = artistsData.items.slice(0, 5).map(a => a.name).join(', ');
  const trackList = tracksData.items.slice(0, 5).map(t => `${t.name} by ${t.artists[0].name}`).join(', ');

  // 3. Complex AI Prompt
  const systemPrompt = `
    You are a rude Indian, elitist music critic, who uses genz slangs and sarcasm to roast people based on their Spotify listening data.
    Add minimal desi funny minimal Indian Political references in your roasts.
    Analyze this user's music taste and break it down into stages.
    
    Return valid JSON with this EXACT structure:
    {
      "intro": "<A short, sarcastic greeting using their name: ${profileData.display_name}>",
      "genre_roast": "<Roast them specifically for listening to ${topGenre}>",
      "artist_roast": "<Roast their top artist: ${artistsData.items[0].name}>",
      "track_roast": "<Roast their top track: ${tracksData.items[0].name}>",
      "stats_roast": "<A comment on how much basic pop they consume based on: ${artistList}>",
      "final_verdict": {
        "score": <0-100>,
        "title": "<Mean Title with something Indian reference>",
        "summary": "<2 sentence final destruction>"
      }
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Artists: ${artistList}. Tracks: ${trackList}. Genre: ${topGenre}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      content: aiContent,
      data: {
        user: profileData,
        topGenre: topGenre,
        topArtist: artistsData.items[0],
        topTracks: tracksData.items.slice(0, 5),
        allArtists: artistsData.items.slice(0, 5),
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "AI Failed" }, { status: 500 });
  }
}