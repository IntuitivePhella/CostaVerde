'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface BoatGalleryProps {
  images: string[];
  title: string;
}

export const BoatGallery = ({ images, title }: BoatGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Imagem ${currentImageIndex + 1}`}
            fill
            className="object-cover cursor-pointer"
            onClick={() => setShowLightbox(true)}
            sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 896px, (min-width: 768px) 672px, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg ${
                index === currentImageIndex
                  ? 'ring-2 ring-[#00adef]'
                  : 'hover:opacity-80'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={image}
                alt={`${title} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 256px, (min-width: 1024px) 224px, (min-width: 768px) 168px, 25vw"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-screen-lg">
          <div className="relative aspect-[16/9]">
            <Image
              src={images[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 896px, (min-width: 768px) 672px, 100vw"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={() => setShowLightbox(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 