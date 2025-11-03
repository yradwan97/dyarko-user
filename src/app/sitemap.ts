import { MetadataRoute } from 'next'

const API_URI = process.env.NEXT_PUBLIC_API_URI
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com'

// Cache the sitemap for 1 hour
export const revalidate = 3600

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['en', 'ar']

  // Static pages that should be in the sitemap
  const staticPages = [
    { path: '', priority: 1, changeFrequency: 'daily' as ChangeFrequency },
    { path: '/property-search', priority: 0.9, changeFrequency: 'hourly' as ChangeFrequency },
    { path: '/companies', priority: 0.8, changeFrequency: 'weekly' as ChangeFrequency },
    { path: '/categories', priority: 0.8, changeFrequency: 'weekly' as ChangeFrequency },
    { path: '/videos', priority: 0.7, changeFrequency: 'daily' as ChangeFrequency },
    { path: '/map', priority: 0.7, changeFrequency: 'daily' as ChangeFrequency },
  ]

  // Generate static page URLs for both locales
  const staticUrls: MetadataRoute.Sitemap = locales.flatMap(locale =>
    staticPages.map(page => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${BASE_URL}/en${page.path}`,
          ar: `${BASE_URL}/ar${page.path}`,
        }
      }
    }))
  )

  try {
    // Fetch dynamic properties
    const propertiesUrls = await fetchPropertyUrls(locales)

    // Fetch dynamic companies/owners
    const companiesUrls = await fetchCompanyUrls(locales)

    // Fetch dynamic videos/reels
    const videosUrls = await fetchVideoUrls(locales)

    return [
      ...staticUrls,
      ...propertiesUrls,
      ...companiesUrls,
      ...videosUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static URLs if dynamic fetching fails
    return staticUrls
  }
}

async function fetchPropertyUrls(locales: string[]): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all properties with pagination
    let allProperties: any[] = []
    let page = 1
    let hasMore = true
    const pageSize = 100 // Fetch 100 per page

    while (hasMore) {
      const response = await fetch(
        `${API_URI}/properties/?page=${page}&size=${pageSize}`,
        { next: { revalidate: 3600 } }
      )

      if (!response.ok) {
        console.error(`Failed to fetch properties page ${page}`)
        break
      }

      const data = await response.json()
      const properties = data.data?.data || []

      if (properties.length === 0) {
        hasMore = false
      } else {
        allProperties = [...allProperties, ...properties]
        page++

        // Limit to 1000 properties to avoid timeout
        if (allProperties.length >= 1000) {
          hasMore = false
        }
      }
    }

    // Generate URLs for each property in both locales
    return locales.flatMap(locale =>
      allProperties.map((property) => {
        // Safely parse the date
        const dateString = property.updatedAt || property.createdAt
        const lastModified = dateString && !isNaN(Date.parse(dateString))
          ? new Date(dateString)
          : new Date()

        return {
          url: `${BASE_URL}/${locale}/properties/${property._id}`,
          lastModified,
          changeFrequency: 'daily' as ChangeFrequency,
          priority: 0.9,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/properties/${property._id}`,
              ar: `${BASE_URL}/ar/properties/${property._id}`,
            }
          }
        }
      })
    )
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error)
    return []
  }
}

async function fetchCompanyUrls(locales: string[]): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all companies/owners with pagination
    let allCompanies: any[] = []
    let page = 1
    let hasMore = true
    const pageSize = 100

    while (hasMore) {
      const response = await fetch(
        `${API_URI}/owners?page=${page}&size=${pageSize}&type=owner`,
        { next: { revalidate: 3600 } }
      )

      if (!response.ok) {
        console.error(`Failed to fetch companies page ${page}`)
        break
      }

      const data = await response.json()
      const companies = data.data?.data || []

      if (companies.length === 0) {
        hasMore = false
      } else {
        allCompanies = [...allCompanies, ...companies]
        page++

        // Limit to 500 companies
        if (allCompanies.length >= 500) {
          hasMore = false
        }
      }
    }

    // Generate URLs for each company in both locales
    return locales.flatMap(locale =>
      allCompanies.map((company) => ({
        url: `${BASE_URL}/${locale}/companies/${company._id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as ChangeFrequency,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/companies/${company._id}`,
            ar: `${BASE_URL}/ar/companies/${company._id}`,
          }
        }
      }))
    )
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error)
    return []
  }
}

async function fetchVideoUrls(locales: string[]): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all videos/reels with pagination
    let allVideos: any[] = []
    let page = 1
    let hasMore = true
    const pageSize = 100

    while (hasMore) {
      const response = await fetch(
        `${API_URI}/reels?page=${page}&size=${pageSize}`,
        { next: { revalidate: 3600 } }
      )

      if (!response.ok) {
        console.error(`Failed to fetch videos page ${page}`)
        break
      }

      const data = await response.json()
      const videos = data.data?.data || []

      if (videos.length === 0) {
        hasMore = false
      } else {
        allVideos = [...allVideos, ...videos]
        page++

        // Limit to 500 videos
        if (allVideos.length >= 500) {
          hasMore = false
        }
      }
    }

    // Generate URLs for each video in both locales
    return locales.flatMap(locale =>
      allVideos.map((video) => {
        // Safely parse the date
        const dateString = video.updatedAt || video.createdAt
        const lastModified = dateString && !isNaN(Date.parse(dateString))
          ? new Date(dateString)
          : new Date()

        return {
          url: `${BASE_URL}/${locale}/videos/${video._id}`,
          lastModified,
          changeFrequency: 'monthly' as ChangeFrequency,
          priority: 0.6,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/videos/${video._id}`,
              ar: `${BASE_URL}/ar/videos/${video._id}`,
            }
          }
        }
      })
    )
  } catch (error) {
    console.error('Error fetching videos for sitemap:', error)
    return []
  }
}
