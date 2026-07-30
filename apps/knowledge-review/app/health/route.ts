import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'knowledge-review', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
