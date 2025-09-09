'use client';

import type { ChangeEvent, DragEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '@/app/actions/uploadActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ImageUploadFormProps = {
  locale: string;
};

export function ImageUploadForm({ locale }: ImageUploadFormProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      return;
    }

    if (!isSignedIn) {
      router.push(`${locale}/sign-in`);
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      await uploadImage(formData);
      handleRemoveFile();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              selectedFile ? 'border-green-500 bg-green-50' : '',
            )}
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {previewUrl
              ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-lg shadow-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedFile?.name}
                      {' '}
                      (
                      {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)}
                      {' '}
                      MB)
                    </p>
                  </div>
                )
              : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Drop your image here
                      </h3>
                      <p className="text-gray-600">
                        or click to browse files
                      </p>
                      <p className="text-sm text-gray-500">
                        Support for JPG, PNG, GIF, and WebP files
                      </p>
                    </div>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isUploading}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isUploading
              ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                )
              : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
          </Button>
        </div>
      )}
    </form>
  );
}
