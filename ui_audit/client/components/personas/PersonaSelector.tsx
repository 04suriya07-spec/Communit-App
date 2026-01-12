import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import CreatePersonaModal from './CreatePersonaModal';

const PersonaSelector: React.FC = () => {
    const { personas, currentPersona, setCurrentPersona } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handlePersonaChange = (personaId: string) => {
        const persona = personas.find((p) => p.id === personaId);
        if (persona) {
            setCurrentPersona(persona);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Select
                value={currentPersona?.id || ''}
                onValueChange={handlePersonaChange}
            >
                <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                    {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                            <div className="flex items-center justify-between w-full">
                                <span>{persona.displayName}</span>
                                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {persona.trustLevel}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(true)}
            >
                <Plus className="h-4 w-4 mr-1" />
                New Persona
            </Button>

            <CreatePersonaModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};

export default PersonaSelector;
