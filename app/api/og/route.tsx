import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const title = searchParams.get('title') || 'Thiên Kim Wine'
  const description = searchParams.get('description') || 'Rượu vang chính hãng'
  const type = searchParams.get('type') || 'default' // product, article, default

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
          backgroundColor: '#1C1C1C',
          backgroundImage: 'linear-gradient(135deg, #1C1C1C 0%, #2D1A1F 50%, #9B2C3B 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative wine glass icon */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '40px',
            left: '40px',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '32px', color: '#D4AF37' }}>🍷</span>
          <span style={{ fontSize: '24px', color: '#D4AF37', fontWeight: 'bold' }}>
            Thiên Kim Wine
          </span>
        </div>

        {/* Badge for type */}
        {type !== 'default' && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '40px',
              right: '40px',
              backgroundColor: '#9B2C3B',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '16px',
              textTransform: 'uppercase',
            }}
          >
            {type === 'product' ? 'Sản phẩm' : 'Bài viết'}
          </div>
        )}

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 60px',
            maxWidth: '1000px',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 50 ? '48px' : '64px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              margin: '0 0 20px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>
          
          {description && (
            <p
              style={{
                fontSize: '24px',
                color: '#E5E5E5',
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.9,
              }}
            >
              {description.length > 120 ? description.substring(0, 120) + '...' : description}
            </p>
          )}
        </div>

        {/* Bottom decoration */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            right: '40px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '16px', color: '#D4AF37' }}>
            winecellar.vn
          </span>
          <span style={{ fontSize: '14px', color: '#888888' }}>
            Rượu vang nhập khẩu chính hãng
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
