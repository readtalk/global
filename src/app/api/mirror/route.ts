import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  const { env } = getCloudflareContext();
  // FIX DI SINI: cast ke any, soalnya req.json() = unknown di Next 16
  const { action, sessionId, sdp, tracks } = (await req.json()) as {
    action: string;
    sessionId?: string;
    sdp?: string;
    tracks?: any[];
  };

  const APP_ID = (env as any).CALL_APP_ID as string;
  const APP_SECRET = (env as any).CALL_APP_SECRET as string;
  const TURN_KEY_ID = (env as any).CALL_TURN_KEY_ID as string;
  const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;

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
  if (action === "turn") {
    const turnRes = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${APP_SECRET}`, "content-type": "application/json" },
        body: JSON.stringify({ ttl: 86400 }),
      }
    );
    return NextResponse.json(await turnRes.json());
  }

  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", Authorization: `Bearer ${APP_SECRET}` },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}
