import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, ThumbsUp, ThumbsDown, MessageSquare, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserProfilePanel() {
  const { user, logout } = useAuth();
  const { getUserStats } = useIssues();
  const navigate = useNavigate();

  if (!user) return null;

  const stats = getUserStats(user.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{user.nickname}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Activity</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
              <ThumbsUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-lg font-semibold">{stats.upvotesGiven}</p>
                <p className="text-xs text-muted-foreground">Upvotes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
              <ThumbsDown className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-semibold">{stats.downvotesGiven}</p>
                <p className="text-xs text-muted-foreground">Downvotes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
              <MessageSquare className="h-4 w-4 text-accent-foreground" />
              <div>
                <p className="text-lg font-semibold">{stats.commentsPosted}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-semibold">{stats.issuesCreated}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
