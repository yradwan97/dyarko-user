import { Suspense } from "react";
import { Metadata } from "next";
import VideoDetails from "./video-details";
import { getVideoById } from "@/lib/services/api/reels";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';

  try {
    const videoData = await getVideoById(id);
    const video = videoData.reel;

    // Localized text
    const text = {
      watch: isArabic ? 'شاهد' : 'Watch',
      on: isArabic ? 'على' : 'on',
      views: isArabic ? 'مشاهدة' : 'views',
      videos: isArabic ? 'فيديوهات' : 'Videos',
      realEstateVideo: isArabic ? 'فيديو عقاري' : 'real estate video',
      propertyVideo: isArabic ? 'فيديو عقارات' : 'property video',
      realEstate: isArabic ? 'عقارات' : 'real estate',
      videoTitle: isArabic ? 'فيديو' : 'Video',
      watchPropertyVideos: isArabic ? 'شاهد فيديوهات العقارات على ديركو' : 'Watch property videos on Dyarko',
    };

    // Create description
    const description = video.description
      ? video.description.substring(0, 160)
      : `${text.watch} ${video.title} ${text.on} ${isArabic ? 'ديركو' : 'Dyarko'}. ${video.views} ${text.views}.`;

    const title = isArabic
      ? `${video.title} | ${text.videos} ديركو`
      : `${video.title} | Dyarko ${text.videos}`;

    const imageUrl = video.thumbnail;

    return {
      title,
      description,
      keywords: [
        video.title,
        text.realEstateVideo,
        text.propertyVideo,
        'dyarko',
        'ديركو',
        text.realEstate,
      ],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/${locale}/videos/${id}`,
        siteName: isArabic ? 'ديركو' : 'Dyarko',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: video.title,
          },
        ],
        locale: isArabic ? 'ar_AR' : 'en_US',
        type: 'video.other',
        videos: [
          {
            url: video.path,
          },
        ],
      },
      twitter: {
        card: 'player',
        title,
        description,
        images: [imageUrl],
        players: [
          {
            playerUrl: `${BASE_URL}/${locale}/videos/${id}`,
            streamUrl: video.path,
            width: 1280,
            height: 720,
          },
        ],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/videos/${id}`,
        languages: {
          en: `${BASE_URL}/en/videos/${id}`,
          ar: `${BASE_URL}/ar/videos/${id}`,
        },
      },
      other: {
        'video:duration': video.expirationDate || '',
        'video:views': video.views.toString(),
      },
    };
  } catch (error) {
    console.error('Error generating video metadata:', error);
    return {
      title: isArabic ? 'فيديو | ديركو' : 'Video | Dyarko',
      description: isArabic ? 'شاهد فيديوهات العقارات على ديركو' : 'Watch property videos on Dyarko',
    };
  }
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <VideoDetails videoId={id} />
    </Suspense>
  );
}
