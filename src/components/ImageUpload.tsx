"use client"

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onChange([...value, event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 transition-colors hover:border-primary"
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">
            Solte as imagens aqui...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Arraste e solte imagens aqui, ou clique para selecionar
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          PNG, JPG ou WEBP (máx. 5 MB cada)
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 