import { useState } from 'react';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { CATEGORY_LABELS, IssueCategory } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Image, Mic, Video, AlertTriangle, FileText } from 'lucide-react';
import campusAssistLogo from '@/assets/campus-assist-logo.png';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;

    setIsSubmitting(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));

    addIssue({
      title,
      description,
      category,
      location,
      authorNickname: user.nickname!,
      authorId: user.id,
      mediaUrls: [],
      mediaTypes: [],
      isUrgent,
    });

    toast.success('Issue reported successfully!');
    navigate('/feed');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusAssistLogo} alt="CampusVoice" className="w-full h-full object-cover" />
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
                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Image className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Add PDF
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Video className="h-4 w-4 mr-2" />
                      Video (&lt;20MB)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Media uploads require backend integration
                  </p>
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
                    disabled={isSubmitting || !title || !description || !category || !location}
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
