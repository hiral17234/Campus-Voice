import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIssues } from '@/context/IssuesContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CATEGORY_LABELS, IssueStatus } from '@/types';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  MapPin,
  Timer,
  XCircle
} from 'lucide-react';
import campusAssistLogo from '@/assets/campus-assist-logo.png';

export default function PublicStats() {
  const { stats, issues } = useIssues();
  const navigate = useNavigate();

  const resolutionRate = stats.totalIssues > 0 
    ? Math.round((stats.resolved / stats.totalIssues) * 100) 
    : 0;

  const statCards = [
    { label: 'Total Issues Raised', value: stats.totalIssues, icon: BarChart3, color: 'bg-primary/10 text-primary' },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Reported', value: stats.reported, icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusAssistLogo} alt="CampusVoice" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Transparency Dashboard</h1>
                <p className="text-xs text-muted-foreground">Public Statistics</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resolution Rate */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Resolution Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-green-500">{resolutionRate}%</span>
                  <p className="text-sm text-muted-foreground mt-2">of issues have been resolved</p>
                </div>
                <Progress value={resolutionRate} className="h-3" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Avg Response Time */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  Average Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="text-5xl font-bold text-primary">{stats.avgResponseTime}</span>
                  <span className="text-2xl text-muted-foreground ml-2">days</span>
                  <p className="text-sm text-muted-foreground mt-2">from report to first response</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Top Complaint Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topCategories.map((cat, index) => (
                    <div key={cat.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{CATEGORY_LABELS[cat.category]}</span>
                        <span className="text-sm text-muted-foreground">{cat.count} issues</span>
                      </div>
                      <Progress 
                        value={(cat.count / stats.totalIssues) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hotspot Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Problem Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.hotspotLocations.map((loc, index) => (
                    <div key={loc.location} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-red-500/20 text-red-500' :
                        index === 1 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{loc.location}</p>
                        <p className="text-xs text-muted-foreground">{loc.count} issues reported</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transparency Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            This dashboard is publicly accessible to promote transparency and accountability.
            <br />
            Data is updated in real-time as issues are reported and resolved.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
