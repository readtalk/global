import { NextResponse } from "next/server";

const APP_ID = process.env.CLOUDFLARE_REALTIME_APP_ID!;
const APP_SECRET = process.env.CLOUDFLARE_REALTIME_APP_SECRET!;
const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;

export async function POST(req: Request) {
  const { action, sessionId, sdp, tracks } = await req.json();

  let url = "";
  let body: any = {};
  let method = "POST";

  if (action === "newSession") {
    url = `${BASE}/sessions/new`;
    body = { sessionDescription: { type: "offer", sdp } };
  }
  if (action === "newTracks") {
    url = `${BASE}/sessions/${sessionId}/tracks/new`;
    body = { tracks };
    if (sdp) body.sessionDescription = { type: "offer", sdp };
  }
  if (action === "renegotiate") {
    url = `${BASE}/sessions/${sessionId}/renegotiate`;
    body = { sessionDescription: { type: "answer", sdp } };
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", Authorization: `Bearer ${APP_SECRET}` },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  return NextResponse.json(result);
}
