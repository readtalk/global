//
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const body = (await request.json()) as {
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
    let reqBody: any = {};
    let method = "POST";

    if (body.action === "newSession") {
      url = `${BASE}/sessions/new`;
      reqBody = { sessionDescription: { type: "offer", sdp: body.sdp } };
    }
    if (body.action === "newTracks") {
      url = `${BASE}/sessions/${body.sessionId}/tracks/new`;
      reqBody = { tracks: body.tracks };
      if (body.sdp) reqBody.sessionDescription = { type: "offer", sdp: body.sdp };
    }
    if (body.action === "renegotiate") {
      url = `${BASE}/sessions/${body.sessionId}/renegotiate`;
      reqBody = { sessionDescription: { type: "answer", sdp: body.sdp } };
      method = "PUT";
    }
    if (body.action === "turn") {
      const res = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${APP_SECRET}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ttl: 86400 }),
        }
      );
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APP_SECRET}`,
      },
      body: JSON.stringify(reqBody),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
