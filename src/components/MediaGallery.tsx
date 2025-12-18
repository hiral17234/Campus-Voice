import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Image, Video, FileText, Play, X } from 'lucide-react';

interface MediaGalleryProps {
  mediaUrls: string[];
  mediaTypes: ('image' | 'video' | 'audio' | 'pdf')[];
  compact?: boolean;
}

export function MediaGallery({ mediaUrls, mediaTypes, compact = false }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const renderThumbnail = (url: string, type: string, index: number) => {
    if (type === 'image') {
      return (
        <div
          key={index}
          className={`relative cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors ${
            compact ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMedia({ url, type });
          }}
        >
          <img
            src={url}
            alt={`Attachment ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (type === 'video') {
      return (
        <div
          key={index}
          className={`relative cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted flex items-center justify-center ${
            compact ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMedia({ url, type });
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Play className="h-6 w-6 text-white" />
          </div>
          <Video className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }

    if (type === 'pdf') {
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted flex flex-col items-center justify-center gap-1 ${
            compact ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="h-6 w-6 text-red-500" />
          {!compact && <span className="text-xs text-muted-foreground">PDF</span>}
        </a>
      );
    }

    if (type === 'audio') {
      return (
        <div
          key={index}
          className={`relative cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted flex items-center justify-center ${
            compact ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMedia({ url, type });
          }}
        >
          <Play className="h-6 w-6 text-primary" />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
        {mediaUrls.map((url, index) => renderThumbnail(url, mediaTypes[index] || 'image', index))}
      </div>

      {/* Full-size Media Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {selectedMedia?.type === 'image' && (
            <img
              src={selectedMedia.url}
              alt="Full size"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          )}
          
          {selectedMedia?.type === 'video' && (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              className="w-full h-auto max-h-[85vh]"
            />
          )}
          
          {selectedMedia?.type === 'audio' && (
            <div className="p-8 flex items-center justify-center">
              <audio src={selectedMedia.url} controls autoPlay className="w-full max-w-md" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
