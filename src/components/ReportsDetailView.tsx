import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Report, REPORT_REASON_LABELS } from '@/types';
import { Flag, User, Clock, MessageSquare } from 'lucide-react';

interface ReportsDetailViewProps {
  reports: Report[];
  title?: string;
}

export function ReportsDetailView({ reports, title = "Report Details" }: ReportsDetailViewProps) {
  if (reports.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Flag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No reports yet</p>
        </CardContent>
      </Card>
    );
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'fake_spam': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'abusive_content': return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'duplicate_issue': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'misleading_info': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Group reports by reason for summary
  const reportsByReason = reports.reduce((acc, report) => {
    acc[report.reason] = (acc[report.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-destructive" />
          {title} ({reports.length})
        </CardTitle>
        
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(reportsByReason).map(([reason, count]) => (
            <Badge key={reason} variant="outline" className={getReasonColor(reason)}>
              {REPORT_REASON_LABELS[reason as keyof typeof REPORT_REASON_LABELS] || reason}: {count}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={report.id}>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge className={getReasonColor(report.reason)}>
                      {REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] || report.reason}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(
                        report.createdAt instanceof Date 
                          ? report.createdAt 
                          : new Date(report.createdAt),
                        'MMM d, yyyy h:mm a'
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Reporter ID: {report.reporterId.slice(0, 8)}...
                  </div>
                  
                  {report.customReason && (
                    <div className="mt-2 p-2 rounded bg-background/50">
                      <div className="flex items-start gap-1 text-sm">
                        <MessageSquare className="h-3 w-3 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{report.customReason}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {index < reports.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
