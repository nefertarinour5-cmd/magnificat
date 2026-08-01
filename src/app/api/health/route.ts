import { NextResponse } from "next/server";

/**
 * Lightweight health check used by Railway (and any reverse proxy).
 *
 * IMPORTANT: this route MUST NOT touch the database. Railway considers the
 * container healthy only if this route returns 200 within the configured
 * healthcheckTimeout. If we queried the DB here, a slow DB connection or a
 * pending migration would cause Railway to mark the container as unhealthy
 * and restart it in a loop.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "teachhire-rdc",
      time: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
