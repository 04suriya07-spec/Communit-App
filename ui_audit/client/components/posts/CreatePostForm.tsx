import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { postsApi } from '@/api/posts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send } from 'lucide-react';

interface CreatePostFormProps {
    onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
    const { currentPersona } = useAuth();
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const MAX_LENGTH = 1000;
    const remainingChars = MAX_LENGTH - body.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!body.trim()) {
            setError('Post cannot be empty');
            return;
        }

        if (!currentPersona) {
            setError('Please select a persona');
            return;
        }

        if (body.length > MAX_LENGTH) {
            setError(`Post is too long (max ${MAX_LENGTH} characters)`);
            return;
        }

        try {
            setIsSubmitting(true);
            await postsApi.create({
                personaId: currentPersona.id,
                body: body.trim(),
            });

            setBody('');
            onPostCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Textarea
                            placeholder="Share your thoughts..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                            maxLength={MAX_LENGTH}
                            className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <span className={`text-xs ${remainingChars < 100 ? 'text-orange-600' : 'text-gray-500'}`}>
                                {remainingChars} characters remaining
                            </span>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !body.trim() || !currentPersona}
                                size="sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Post
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreatePostForm;
