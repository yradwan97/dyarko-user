"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Property } from "@/lib/services/api/properties";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronUp, ChevronDown, Play } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PropertySliderProps {
  property: Property;
}

export default function PropertySlider({ property }: PropertySliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const mainImage = property.image || "/no-apartment.png";
  const carouselImages = property.images || [];
  const hasCarouselImages = carouselImages.length > 0;
  const hasVideo = !!property.video;

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    if (!hasCarouselImages) return;

    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasCarouselImages, carouselImages.length]);

  const openOverlay = (image: string) => {
    setActiveImage(image);
    setIsOpen(true);
  };

  const goToPrevious = () => {
    setCurrentCarouselIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentCarouselIndex((prev) =>
      (prev + 1) % carouselImages.length
    );
  };

  return (
    <>
      {/* Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>Property Image</DialogTitle>
          </VisuallyHidden>
          <div className="relative h-[80vh] w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
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

      {/* Video Modal */}
      {hasVideo && (
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-4xl p-0">
            <VisuallyHidden>
              <DialogTitle>Property Video</DialogTitle>
            </VisuallyHidden>
            <div className="relative aspect-video w-full bg-black">
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
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

      {/* Image Gallery */}
      <div className="mt-10 flex gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        {/* Main Image - Left Half (Fixed) */}
        <div className="h-[500px] w-1/2 rounded-lg overflow-hidden relative">
          <Image
            src={mainImage}
            height={600}
            width={800}
            alt={property.title}
            className="h-full w-full cursor-pointer object-cover rounded-lg"
            onClick={() => openOverlay(mainImage)}
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

        {/* Vertical Carousel - Right Half */}
        {hasCarouselImages && (
          <div className="h-[500px] w-1/2 flex flex-col gap-2">
            {/* Scroll Up Button */}
            <button
              onClick={goToPrevious}
              className="flex h-10 items-center justify-center rounded bg-gray-200 hover:bg-primary hover:text-white transition-colors dark:bg-gray-700 dark:hover:bg-primary"
            >
              <ChevronUp className="h-5 w-5" />
            </button>

            {/* Current Carousel Image */}
            <div className="flex-1 rounded-lg overflow-hidden">
              <Image
                src={carouselImages[currentCarouselIndex]}
                height={600}
                width={800}
                alt={`Gallery ${currentCarouselIndex + 1}`}
                className="h-full w-full cursor-pointer object-cover rounded-lg"
                onClick={() => openOverlay(carouselImages[currentCarouselIndex])}
              />
            </div>

            {/* Scroll Down Button */}
            <button
              onClick={goToNext}
              className="flex h-10 items-center justify-center rounded bg-gray-200 hover:bg-primary hover:text-white transition-colors dark:bg-gray-700 dark:hover:bg-primary"
            >
              <ChevronDown className="h-5 w-5" />
            </button>

            {/* Carousel Indicator */}
            <div className="flex justify-center gap-1.5 mt-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCarouselIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCarouselIndex
                      ? "w-6 bg-main-600"
                      : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
