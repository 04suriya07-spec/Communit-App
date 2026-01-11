import { useState } from 'react';
import { usePersona } from '@/contexts/PersonaContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
    targetId: string;
    targetType: 'POST' | 'PERSONA';
    targetPreview?: string; // For displaying context
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const REPORT_CATEGORIES = [
    { value: 'SPAM', label: 'Spam or Misleading' },
    { value: 'HARASSMENT', label: 'Harassment or Bullying' },
    { value: 'HATE_SPEECH', label: 'Hate Speech' },
    { value: 'VIOLENCE', label: 'Violence or Threats' },
    { value: 'SEXUAL_CONTENT', label: 'Sexual or Inappropriate Content' },
    { value: 'MISINFORMATION', label: 'Misinformation' },
    { value: 'OTHER', label: 'Other' },
];

export default function ReportDialog({
    targetId,
    targetType,
    targetPreview,
    open,
    onOpenChange,
}: ReportDialogProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { activePersona } = usePersona();
    const { toast } = useToast();

    const handleSubmit = async () => {
        // SAFETY CHECK 1: Block if no active persona
        if (!activePersona) {
            toast({
                title: 'No Active Persona',
                description: 'Please select a persona before reporting',
                variant: 'destructive',
            });
            return;
        }

        // SAFETY CHECK 2: Require category selection
        if (!selectedCategory) {
            toast({
                title: 'Category Required',
                description: 'Please select a report category',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // PRIVACY ENFORCEMENT: Only send activePersona.id, never accountabilityProfileId
            const response = await api.submitReport({
                targetId,
                targetType,
                category: selectedCategory,
                reporterPersonaId: activePersona.id, // CRITICAL: Use activePersona.id
            });

            // Handle duplicate report gracefully
            if (!response.submitted) {
                toast({
                    title: 'Already Reported',
                    description: response.message,
                    variant: 'default',
                });
            } else {
                toast({
                    title: 'Report Submitted',
                    description: 'Thank you for helping keep the community safe',
                });
            }

            // Close dialog and reset
            onOpenChange(false);
            setSelectedCategory('');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit report',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report {targetType === 'POST' ? 'Post' : 'User'}</DialogTitle>
                    <DialogDescription>
                        Your report will be reviewed by our moderation team. Reporter identity remains private.
                    </DialogDescription>
                </DialogHeader>

                {/* Target Preview */}
                {targetPreview && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground mb-4">
                        <p className="line-clamp-2">{targetPreview}</p>
                    </div>
                )}

                {/* Category Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Report Reason</label>
                    <div className="space-y-2">
                        {REPORT_CATEGORIES.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={cn(
                                    'w-full text-left px-4 py-3 rounded-lg border transition-all',
                                    selectedCategory === category.value
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border hover:border-primary/50 hover:bg-muted'
                                )}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded p-3">
                    🔒 Your identity is protected. The reported content author will not see who reported them.
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setSelectedCategory('');
                        }}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedCategory || isSubmitting || !activePersona}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </div>

                {/* No Persona Warning */}
                {!activePersona && (
                    <div className="text-xs text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                        ⚠️ You must have an active persona to submit reports
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
