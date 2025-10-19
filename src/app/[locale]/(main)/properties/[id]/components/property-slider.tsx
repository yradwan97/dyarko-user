"use client";

import { useState } from "react";
import Image from "next/image";
import { Property } from "@/lib/services/api/properties";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertySliderProps {
  property: Property;
}

export default function PropertySlider({ property }: PropertySliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const mainImage = property.image || "/no-apartment.png";
  const images = property.images || [];
  const allImages = [mainImage, ...images];
  const hasMultipleImages = images.length > 0;
  const maxVisibleThumbnails = 4;

  const openOverlay = (image: string) => {
    setActiveImage(image);
    setIsOpen(true);
  };

  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const scrollUp = () => {
    if (scrollPosition > 0) {
      setScrollPosition(scrollPosition - 1);
    }
  };

  const scrollDown = () => {
    if (scrollPosition < allImages.length - maxVisibleThumbnails) {
      setScrollPosition(scrollPosition + 1);
    }
  };

  return (
    <>
      {/* Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
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

      {/* Image Gallery */}
      <div className="mt-10 flex gap-3">
        {/* Vertical Carousel (only show if there are multiple images) */}
        {hasMultipleImages && (
          <div className="flex flex-col gap-2">
            {/* Scroll Up Button */}
            {scrollPosition > 0 && (
              <button
                onClick={scrollUp}
                className="flex h-8 items-center justify-center rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}

            {/* Thumbnails */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {allImages
                .slice(scrollPosition, scrollPosition + maxVisibleThumbnails)
                .map((img, index) => {
                  const actualIndex = index + scrollPosition;
                  return (
                    <div
                      key={actualIndex}
                      className={cn(
                        "h-20 w-20 cursor-pointer rounded border-2 p-1 transition-all",
                        selectedImageIndex === actualIndex
                          ? "border-primary"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                      )}
                      onClick={() => selectImage(actualIndex)}
                    >
                      <Image
                        src={img}
                        height={80}
                        width={80}
                        alt={`Thumbnail ${actualIndex + 1}`}
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                  );
                })}
            </div>

            {/* Scroll Down Button */}
            {scrollPosition < allImages.length - maxVisibleThumbnails && (
              <button
                onClick={scrollDown}
                className="flex h-8 items-center justify-center rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Main Image */}
        <div className="h-[450px] flex-1 rounded border border-primary p-3">
          <Image
            src={allImages[selectedImageIndex]}
            height={450}
            width={800}
            alt={property.title}
            className="h-full w-full cursor-pointer object-cover rounded"
            onClick={() => openOverlay(allImages[selectedImageIndex])}
          />
        </div>
      </div>
    </>
  );
}
