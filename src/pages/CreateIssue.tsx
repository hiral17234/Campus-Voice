import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CATEGORY_LABELS, IssueCategory } from '@/types';
import { uploadToCloudinary, getMediaType } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Image, Video, AlertTriangle, FileText, X, Loader2 } from 'lucide-react';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';

interface UploadedMedia {
  url: string;
  type: 'image' | 'video' | 'audio' | 'pdf';
  name: string;
}

export default function CreateIssue() {
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [location, setLocation] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'pdf') => {
    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 20MB');
      return;
    }

    // Validate file type
    const validTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      pdf: ['application/pdf'],
    };

    if (!validTypes[type].includes(file.type)) {
      toast.error(`Invalid file type for ${type}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      const mediaType = getMediaType(result.resource_type, result.format);
      
      setUploadedMedia(prev => [...prev, {
        url: result.secure_url,
        type: mediaType,
        name: file.name,
      }]);

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleImageClick = () => imageInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();
  const handlePdfClick = () => pdfInputRef.current?.click();

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;

    setIsSubmitting(true);

    try {
      addIssue({
        title,
        description,
        category,
        location,
        authorNickname: user.nickname!,
        authorId: user.id,
        mediaUrls: uploadedMedia.map(m => m.url),
        mediaTypes: uploadedMedia.map(m => m.type),
        isUrgent,
      });

      toast.success('Issue reported successfully!');
      navigate('/feed');
    } catch (error) {
      toast.error('Failed to create issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Report Issue</h1>
                <p className="text-xs text-muted-foreground">Your voice matters</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Create New Issue</CardTitle>
              <CardDescription>
                Describe the problem you've encountered. Your identity will remain anonymous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Building, Block, Area"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload Buttons */}
                <div className="space-y-3">
                  <Label>Attachments (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleImageClick}
                      disabled={isUploading}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePdfClick}
                      disabled={isUploading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Add PDF
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleVideoClick}
                      disabled={isUploading}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video (&lt;20MB)
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && uploadProgress !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading... {uploadProgress}%
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Uploaded Files Preview */}
                  {uploadedMedia.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Uploaded files:</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedMedia.map((media, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                          >
                            {media.type === 'image' && <Image className="h-4 w-4" />}
                            {media.type === 'video' && <Video className="h-4 w-4" />}
                            {media.type === 'pdf' && <FileText className="h-4 w-4" />}
                            <span className="max-w-[150px] truncate">{media.name}</span>
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Urgent Toggle */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-sm">Mark as Urgent</p>
                      <p className="text-xs text-muted-foreground">
                        Mark if this issue needs immediate attention
                      </p>
                    </div>
                  </div>
                  <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
                </motion.div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/feed')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary"
                    disabled={isSubmitting || isUploading || !title || !description || !category || !location}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
