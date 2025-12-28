import querystring from 'querystring';
import { NextResponse } from 'next/server';

export async function GET() {
  const scope = 'user-top-read user-read-private';
  
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
}