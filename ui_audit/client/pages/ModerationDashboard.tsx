import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, Flag, CheckCircle, XCircle, AlertTriangle, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReportGroup {
    targetId: string;
    targetType: 'POST' | 'PERSONA';
    reportCount: number;
    categories: string[];
    firstReportedAt: string;
    latestReportAt: string;
    status: 'PENDING' | 'REVIEWED' | 'ACTIONED';
    targetPreview?: string;
}

interface ReportDetail {
    target: {
        id: string;
        type: string;
        content?: string;
    };
    reports: Array<{
        id: string;
        category: string;
        createdAt: string;
    }>;
    totalReportCount: number;
}

export default function ModerationDashboard() {
    const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadModerationQueue();
    }, []);

    const loadModerationQueue = async () => {
        try {
            setIsLoading(true);
            const { reports } = await api.getModerationQueue();
            setReportGroups(reports);
        } catch (error) {
            toast({
                title: 'Access Denied',
                description: error instanceof Error ? error.message : 'You do not have permission to access this page',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadReportDetails = async (targetId: string) => {
        try {
            const details = await api.getReportDetails(targetId);
            setSelectedReport(details);
            setIsDetailOpen(true);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load report details',
                variant: 'destructive',
            });
        }
    };

    const handleModerateAction = async (
        targetId: string,
        targetType: 'POST' | 'PERSONA',
        action: 'APPROVE' | 'REJECT' | 'WARN' | 'SHADOW_HIDE',
        reason: string
    ) => {
        try {
            setIsActionLoading(true);
            await api.moderateContent({ targetId, targetType, action, reason });
            toast({
                title: 'Action Completed',
                description: `Content has been ${action.toLowerCase()}`,
            });
            setIsDetailOpen(false);
            await loadModerationQueue();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to execute moderation action',
                variant: 'destructive',
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMarkReviewed = async (targetId: string) => {
        try {
            await api.markReportReviewed(targetId);
            toast({
                title: 'Marked as Reviewed',
                description: 'Report has been marked as reviewed',
            });
            setIsDetailOpen(false);
            await loadModerationQueue();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark as reviewed',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Header */}
            <div className="bg-card border-b border-border p-4">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Moderation Dashboard</h1>
                    <span className="ml-auto text-sm text-muted-foreground">Admin Only</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Pending Reports</div>
                        <div className="text-2xl font-bold">
                            {reportGroups.filter((r) => r.status === 'PENDING').length}
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Reviewed</div>
                        <div className="text-2xl font-bold">
                            {reportGroups.filter((r) => r.status === 'REVIEWED').length}
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Reports</div>
                        <div className="text-2xl font-bold">{reportGroups.length}</div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-card border border-border rounded-lg">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-semibold">Reported Content</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
                    ) : reportGroups.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Flag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No reports to review</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {reportGroups.map((report) => (
                                <div
                                    key={report.targetId}
                                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => loadReportDetails(report.targetId)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium">
                                                    {report.targetType === 'POST' ? '📝 Post' : '👤 User'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">ID: {report.targetId.substring(0, 8)}...</span>
                                                <span
                                                    className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        report.status === 'PENDING'
                                                            ? 'bg-yellow-500/10 text-yellow-600'
                                                            : report.status === 'REVIEWED'
                                                                ? 'bg-blue-500/10 text-blue-600'
                                                                : 'bg-green-500/10 text-green-600'
                                                    )}
                                                >
                                                    {report.status}
                                                </span>
                                            </div>
                                            {report.targetPreview && (
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{report.targetPreview}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>
                                                    <Flag className="w-3 h-3 inline mr-1" />
                                                    {report.reportCount} {report.reportCount === 1 ? 'report' : 'reports'}
                                                </span>
                                                <span>Categories: {report.categories.join(', ')}</span>
                                                <span>Latest: {new Date(report.latestReportAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Detail Dialog */}
            {selectedReport && (
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                        </DialogHeader>

                        {/* Content Preview */}
                        <div className="bg-muted p-4 rounded-lg mb-4">
                            <div className="text-sm font-medium mb-2">Reported Content</div>
                            <p className="text-sm">{selectedReport.target.content || 'Content preview unavailable'}</p>
                        </div>

                        {/* Report Statistics */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Total Reports</div>
                                <div className="font-semibold">{selectedReport.totalReportCount}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Target Type</div>
                                <div className="font-semibold">{selectedReport.target.type}</div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-2">Report Categories</div>
                            <div className="flex flex-wrap gap-2">
                                {[...new Set(selectedReport.reports.map((r) => r.category))].map((category) => (
                                    <span key={category} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mb-4 text-xs text-blue-600">
                            🔒 Reporter identities are protected and not shown to moderators or content authors.
                        </div>

                        {/* Moderation Actions */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium mb-2">Moderation Actions</div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleMarkReviewed(selectedReport.target.id)}
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Reviewed
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        handleModerateAction(selectedReport.target.id, selectedReport.target.type as any, 'REJECT', 'Content violated community guidelines')
                                    }
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Remove Content
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        handleModerateAction(selectedReport.target.id, selectedReport.target.type as any, 'WARN', 'Warning issued for policy violation')
                                    }
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Warn User
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        handleModerateAction(selectedReport.target.id, selectedReport.target.type as any, 'SHADOW_HIDE', 'Content shadow-hidden')
                                    }
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2"
                                >
                                    <EyeOff className="w-4 h-4" />
                                    Shadow Hide
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
