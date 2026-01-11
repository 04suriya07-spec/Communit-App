import AppLayout from "@/components/AppLayout";
import Post from "@/components/Post";
import { Plus, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePersona } from "@/contexts/PersonaContext";
import { api, Post as ApiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Feed() {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { activePersona } = usePersona();
  const { toast } = useToast();

  // Load feed on mount
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const { posts: fetchedPosts } = await api.getPublicFeed(20);
      setPosts(fetchedPosts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;

    // SAFETY CHECK: Block posting without active persona
    if (!activePersona) {
      toast({
        title: "No Active Persona",
        description: "Please select or create a persona before posting",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPosting(true);
      await api.createPost(activePersona.id, postContent.trim());
      setPostContent("");
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      // Reload feed to show new post
      await loadFeed();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full">
        {/* Create Post Section */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 sticky top-0 z-10">
          {/* Active Persona Display */}
          <div className="flex items-center gap-3 mb-4">
            {activePersona ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {activePersona.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-muted rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                    maxLength={5000}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                <p className="text-yellow-600 font-medium mb-1">⚠️ No Active Persona</p>
                <p className="text-yellow-600/80">Create or select a persona from the sidebar to start posting.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end">
            <button
              onClick={handlePost}
              disabled={!postContent.trim() || !activePersona || isPosting}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2",
                postContent.trim() && activePersona && !isPosting
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              <Plus className="w-5 h-5" />
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading feed...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                author={post.author.displayName}
                avatar={post.author.displayName.substring(0, 2).toUpperCase()}
                community="Public"
                timestamp={new Date(post.createdAt).toLocaleDateString()}
                content={post.body}
                likes={0}
                comments={0}
                liked={false}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
