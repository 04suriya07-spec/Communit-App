import apiClient from './client';
import type {
    ListPersonasResponse,
    CreatePersonaRequest,
    CreatePersonaResponse,
    RotatePersonaRequest,
    RotatePersonaResponse,
} from '@/types/api';

/**
 * Personas API
 * 
 * All endpoints require authentication (session cookie)
 */

export const personasApi = {
    /**
     * List all personas for current user
     * Also used for session detection - 401 means not logged in
     */
    list: async (): Promise<ListPersonasResponse> => {
        const response = await apiClient.get<ListPersonasResponse>('/personas');
        return response.data;
    },

    /**
     * Create new persona
     */
    create: async (data: CreatePersonaRequest): Promise<CreatePersonaResponse> => {
        const response = await apiClient.post<CreatePersonaResponse>('/personas', data);
        return response.data;
    },

    /**
     * Rotate persona (mark old as inactive, create new)
     */
    rotate: async (personaId: string, data: RotatePersonaRequest): Promise<RotatePersonaResponse> => {
        const response = await apiClient.post<RotatePersonaResponse>(
            `/personas/${personaId}/rotate`,
            data
        );
        return response.data;
    },
};

export default personasApi;
