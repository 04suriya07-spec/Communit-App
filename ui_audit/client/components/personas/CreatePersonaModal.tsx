import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { personasApi } from '@/api/personas';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CreatePersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({ isOpen, onClose }) => {
    const { refreshPersonas, setCurrentPersona } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!displayName.trim()) {
            setError('Please enter a display name');
            return;
        }

        if (displayName.trim().length < 2) {
            setError('Display name must be at least 2 characters');
            return;
        }

        if (displayName.trim().length > 50) {
            setError('Display name must be less than 50 characters');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await personasApi.create({
                displayName: displayName.trim(),
            });

            await refreshPersonas();
            setCurrentPersona(response.persona);

            setDisplayName('');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create persona. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setDisplayName('');
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Persona</DialogTitle>
                    <DialogDescription>
                        Choose a display name for your new persona. You can switch between personas anytime.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                placeholder="Enter persona name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={isSubmitting}
                                maxLength={50}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                2-50 characters
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Persona'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePersonaModal;
