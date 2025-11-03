import { ImageResponse } from 'next/og'
import { getPropertyById } from '@/lib/services/api/properties'

// Image metadata
export const alt = 'Property Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function Image({ params }: Props) {
  const { id, locale } = await params
  const isArabic = locale === 'ar'

  try {
    const property = await getPropertyById(id)

    // Localized text
    const text = {
      from: isArabic ? 'من' : 'From',
      perDay: isArabic ? '/يوم' : '/day',
      perWeek: isArabic ? '/أسبوع' : '/week',
      perMonth: isArabic ? '/شهر' : '/month',
    }

    // Get pricing info
    let priceText = ''
    if (property.dailyPrice) {
      priceText = `${text.from} ${property.dailyPrice}${text.perDay}`
    } else if (property.weeklyPrice) {
      priceText = `${text.from} ${property.weeklyPrice}${text.perWeek}`
    } else if (property.monthlyPrice) {
      priceText = `${text.from} ${property.monthlyPrice}${text.perMonth}`
    } else if (property.price) {
      priceText = `${property.price}`
    }

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #1e40af, #3b82f6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '60px',
            direction: isArabic ? 'rtl' : 'ltr',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {property.title}
            </div>
            <div
              style={{
                fontSize: 36,
                opacity: 0.9,
                marginBottom: '30px',
              }}
            >
              {property.city}, {property.country}
            </div>
            {priceText && (
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '15px 40px',
                  borderRadius: '12px',
                  marginBottom: '30px',
                }}
              >
                {priceText}
              </div>
            )}
            <div
              style={{
                fontSize: 32,
                opacity: 0.8,
              }}
            >
              {property.category} • {property.offerType}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: isArabic ? undefined : 60,
              left: isArabic ? 60 : undefined,
              fontSize: 28,
              opacity: 0.8,
            }}
          >
            {isArabic ? 'ديركو' : 'Dyarko'}
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #1e40af, #3b82f6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold' }}>
            {isArabic ? 'ديركو' : 'Dyarko'}
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}
