import { useState } from 'react';
import { usePersona } from '@/contexts/PersonaContext';
import { Check, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PersonaSwitcher() {
    const { personas, activePersona, setActivePersona, createPersona, isLoading } = usePersona();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!newDisplayName.trim()) return;

        setIsCreating(true);
        try {
            await createPersona(newDisplayName.trim());
            setNewDisplayName('');
            setIsCreateOpen(false);
        } catch (error) {
            // Error is handled by PersonaContext
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">Loading personas...</div>
            </div>
        );
    }

    return (
        <div className="p-4 border-t border-border">
            {/* Active Persona Display */}
            {activePersona ? (
                <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Active Persona</div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
                            {activePersona.displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{activePersona.displayName}</span>
                    </div>
                </div>
            ) : (
                <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
                    ⚠️ No active persona - create one to post
                </div>
            )}

            {/* Persona List */}
            {personas.length > 1 && (
                <div className="mb-3 space-y-1">
                    <div className="text-xs text-muted-foreground mb-1">Switch Persona</div>
                    {personas.map((persona) => (
                        <button
                            key={persona.id}
                            onClick={() => setActivePersona(persona)}
                            className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                                activePersona?.id === persona.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted'
                            )}
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                                {persona.displayName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="flex-1 text-left">{persona.displayName}</span>
                            {activePersona?.id === persona.id && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Create Persona Button */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Persona
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Persona</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Display Name</label>
                            <Input
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value)}
                                placeholder="Enter display name"
                                maxLength={50}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate();
                                }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            This name will be visible to other users. Choose wisely!
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={!newDisplayName.trim() || isCreating}
                            className="w-full"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
