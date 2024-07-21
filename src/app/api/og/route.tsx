import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Study Program Planner';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          fontSize: 60,
          fontWeight: 'bold',
        }}
      >
        <div style={{ marginBottom: 40 }}>📚</div>
        <div style={{ textAlign: 'center' }}>{title}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}