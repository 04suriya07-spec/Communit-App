import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Persona } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface PersonaContextType {
    personas: Persona[];
    activePersona: Persona | null;
    setActivePersona: (persona: Persona) => void;
    createPersona: (displayName: string) => Promise<void>;
    refreshPersonas: () => Promise<void>;
    isLoading: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [activePersona, setActivePersona] = useState<Persona | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const refreshPersonas = async () => {
        try {
            setIsLoading(true);
            const fetchedPersonas = await api.getPersonas();
            setPersonas(fetchedPersonas);

            // Auto-select first active persona if none selected
            if (!activePersona && fetchedPersonas.length > 0) {
                const firstActive = fetchedPersonas.find(p => p.isActive);
                if (firstActive) {
                    setActivePersona(firstActive);
                }
            }
        } catch (error) {
            // If on auth page, don't redirect/toast
            if (location.pathname === '/auth') return;

            if (error instanceof Error && (error.message === 'Unauthorized' || error.message.includes('401'))) {
                navigate('/auth');
                return;
            }

            toast({
                title: 'Error',
                description: 'Failed to load personas',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const createPersona = async (displayName: string) => {
        try {
            const newPersona = await api.createPersona(displayName);
            setPersonas([...personas, newPersona]);
            setActivePersona(newPersona);
            toast({
                title: 'Success',
                description: 'Persona created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create persona',
                variant: 'destructive',
            });
            throw error;
        }
    };

    useEffect(() => {
        refreshPersonas();
    }, []);

    return (
        <PersonaContext.Provider
            value={{
                personas,
                activePersona,
                setActivePersona,
                createPersona,
                refreshPersonas,
                isLoading,
            }}
        >
            {children}
        </PersonaContext.Provider>
    );
}

export function usePersona() {
    const context = useContext(PersonaContext);
    if (!context) {
        throw new Error('usePersona must be used within PersonaProvider');
    }
    return context;
}
