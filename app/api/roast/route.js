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
  // 3. Complex AI Prompt
  const systemPrompt = `
    You are a rude, elitist Indian music critic with severe "South Bombay" attitude and Gen Z brainrot. 
    Your job is to roast this user's music taste using heavy sarcasm, Hinglish, and Gen Z slang (e.g., "cooked," "no cap," "NPC behavior," "chhapri").

    **Tone & Style Rules:**
    1. **Be Rude:** Treat their playlist like a failed election manifesto—full of false promises and disappointment.
    2. **Political Metaphors (The Funny Kind):** Use lighthearted Indian political references. 
       - *Example:* "This playlist is more confused than a coalition government."
       - *Example:* "You flip-flop on genres faster than an MLA changing parties."
       - *Example:* "This artist has been launching for 20 years like a certain 'Yuva Neta'."
    3. **No Fluff:** Keep it punchy. Do not be polite.

    **Data to Roast:**
    - User Name: ${profileData.display_name}
    - Top Genre: ${topGenre}
    - Top Artist: ${artistsData.items[0].name}
    - Top Track: ${tracksData.items[0].name}
    - Artist List: ${artistList}

    **Output Requirement:**
    You must return **ONLY** valid JSON. Do not add markdown blocks (\`\`\`json). Follow this EXACT structure:

    {
      "intro": "A sarcastic greeting. Example: 'Namaste ${profileData.display_name}, showed this playlist to the IT Cell and they resigned.'",
      "genre_roast": "Roast them for listening to ${topGenre}. Compare it to something annoying in India (e.g., 'Listening to this is harder than getting a Tatkal ticket').",
      "artist_roast": "Savage insult about ${artistsData.items[0].name}. If it's basic, say it has less substance than a budget speech.",
      "track_roast": "Roast ${tracksData.items[0].name}. Ask if they play this at rallies to disperse the crowd.",
      "stats_roast": "Judge their list (${artistList}). Call them an NPC. Ask if their taste is subsidized by the government.",
      "final_verdict": {
        "score": <Integer 0-100, where 0 is 'Dhinchak Pooja' level and 100 is impossible>,
        "title": "A mean title. Examples: 'The Demonetization Victim', 'Aaya Ram Gaya Ram', 'Vote Bank Musician', 'The Opposition Leader'",
        "summary": "2 sentences destroying their soul. Use slang like 'touch grass' or 'emotional damage'."
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