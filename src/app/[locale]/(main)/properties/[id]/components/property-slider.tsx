"use client";

import { useState } from "react";
import Image from "next/image";
import { type Property } from "@/lib/services/api/properties";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Images } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface PropertySliderProps {
  property: Property;
}

export default function PropertySlider({ property }: PropertySliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [allImagesOpen, setAllImagesOpen] = useState(false);

  // Validate image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Use property.image if valid, otherwise fallback to "/no-apartment.png"
  const mainImage = isValidImageUrl(property.image) ? property.image : "/no-apartment.png";

  // Filter out invalid URLs from images
  const galleryImages = (property.images || []).filter((img) => isValidImageUrl(img));
  const hasGalleryImages = galleryImages.length > 0;
  const hasVideo = !!property.video;

  // Show only first 3 thumbnails
  const thumbnailImages = galleryImages.slice(0, 3);

  const openOverlay = (image: string) => {
    setActiveImage(image);
    setIsOpen(true);
  };

  return (
    <>
      {/* Single Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl sm:max-w-7xl w-[95vw] p-0">
          <VisuallyHidden>
            <DialogTitle>Property Image</DialogTitle>
          </VisuallyHidden>
          <div className="relative h-[90vh] w-full">
            {activeImage && (
              <Image
                src={activeImage}
                alt="Property"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Images Gallery Modal */}
      <Dialog open={allImagesOpen} onOpenChange={setAllImagesOpen}>
        <DialogContent className="max-w-7xl sm:max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-4">
            <DialogTitle className="text-xl font-semibold">
              Property Images ({galleryImages.length})
            </DialogTitle>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setAllImagesOpen(false);
                  openOverlay(img);
                }}
              >
                <Image
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {hasVideo && (
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-4xl p-0">
            <VisuallyHidden>
              <DialogTitle>Property Video</DialogTitle>
            </VisuallyHidden>
            <div className="relative aspect-video w-full bg-black">
              <video
                src={property.video}
                controls
                autoPlay
                className="h-full w-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Gallery - Main Image + Thumbnails */}
      <div className="mt-6 flex gap-3">
        {/* Main Image - Left Side */}
        <div className={cn(
          "h-100 md:h-125 rounded-xl overflow-hidden relative",
          hasGalleryImages ? "w-full md:w-[70%]" : "w-full"
        )}>
          <Image
            src={mainImage!}
            height={1000}
            width={1400}
            alt={property.title}
            quality={90}
            priority
            sizes="(max-width: 768px) 100vw, 70vw"
            className="h-full w-full cursor-pointer object-cover"
            onClick={() => openOverlay(mainImage!)}
          />
          {/* Play Video Button */}
          {hasVideo && (
            <button
              onClick={() => setIsVideoOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm group-hover:bg-white transition-colors shadow-xl">
                <Play className="h-10 w-10 text-main-600 ml-1" fill="currentColor" />
              </div>
            </button>
          )}
        </div>

        {/* Thumbnails - Right Side (only if images exist) */}
        {hasGalleryImages && (
          <div className="hidden md:flex h-125 w-[30%] flex-row gap-2">
            {thumbnailImages.map((img, index) => (
              <div
                key={index}
                className="relative flex-1 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openOverlay(img)}
              >
                <Image
                  src={img}
                  height={500}
                  width={200}
                  alt={`Gallery ${index + 1}`}
                  className="h-full w-full object-cover grayscale"
                />
                {/* Gallery Icon on last thumbnail */}
                {index === thumbnailImages.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAllImagesOpen(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <Images className="h-8 w-8 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
