import { NextRequest } from "next/server";

const AUTH_BASE = "https://auth.readtalk.workers.dev";

async function proxy(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const body = await req.text();
  const res = await fetch(`${AUTH_BASE}/call/${path}`, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("Authorization") || "",
    },
    body: req.method === "GET" ? undefined : body,
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
