import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-Demand Revalidation API
 * Backend sẽ gọi API này khi có data mới
 * 
 * POST /api/revalidate
 * Body: { secret: "...", paths: ["/", "/products"] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, paths, tags } = body;

    // Verify secret token để bảo mật
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'your-secret-token';
    if (secret !== revalidateSecret) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid secret' 
        },
        { status: 401 }
      );
    }

    // Revalidate paths nếu được cung cấp
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path, 'page');
      }
    }

    // Tags support (for future use)
    // Next.js 16 có thể không support revalidateTag trong App Router

    return NextResponse.json({
      success: true,
      message: 'Revalidated successfully',
      revalidated: {
        paths: paths || [],
        tags: tags || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Revalidation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method để check health
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'On-demand revalidation endpoint is ready',
    usage: 'POST with { secret, paths: ["/"], tags: ["menu"] }',
  });
}
