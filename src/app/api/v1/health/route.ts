import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number };

    return NextResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: result?.healthy === 1 ? 'CONNECTED' : 'DEGRADED',
      version: '1.0.0',
      uptime: process.uptime()
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        database: 'UNREACHABLE',
        error: err.message
      },
      { status: 503 }
    );
  }
}
