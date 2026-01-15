import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import type { CreateCommunityDto } from '../api/communities';

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { createCommunity, error } = useCommunities();
    const [formData, setFormData] = useState<CreateCommunityDto>({
        name: '',
        description: '',
        type: 'public_open',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }
        if (formData.name && formData.name.length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await createCommunity(formData);
            onSuccess?.();
            onClose();
            // Reset form
            setFormData({ name: '', description: '', type: 'public_open' });
            setErrors({});
        } catch (err) {
            // Error is handled by useCommunities hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setErrors({});
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create Community
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Community Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`
                                w-full px-3 py-2 rounded-lg border
                                ${errors.name
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-700 focus:ring-purple-500'
                                }
                                bg-white dark:bg-gray-800
                                text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2
                            `}
                            placeholder="My Awesome Community"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className={`
                                w-full px-3 py-2 rounded-lg border
                                ${errors.description
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-700 focus:ring-purple-500'
                                }
                                bg-white dark:bg-gray-800
                                text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2
                                resize-none
                            `}
                            placeholder="Tell people what this community is about..."
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? 'description-error' : undefined}
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p id="description-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Community Type *
                        </label>
                        <div className="space-y-2">
                            {[
                                {
                                    value: 'public_open' as const,
                                    label: 'Public Open',
                                    description: 'Anyone can see and join freely',
                                },
                                {
                                    value: 'public_restricted' as const,
                                    label: 'Public Restricted',
                                    description: 'Anyone can see, joining requires approval',
                                },
                                {
                                    value: 'private' as const,
                                    label: 'Private',
                                    description: 'Only invited members can see and join',
                                },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`
                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                                        ${formData.type === option.value
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                        transition-colors
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={formData.type === option.value}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="mt-1 text-purple-600 focus:ring-purple-500"
                                        disabled={isSubmitting}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {option.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Community'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
