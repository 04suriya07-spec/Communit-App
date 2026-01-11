import { Heart, MessageCircle, Share2, Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReportDialog from "@/components/ReportDialog";

interface PostProps {
  id: string;
  author: string;
  avatar: string;
  community: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  liked?: boolean;
}

export default function Post({
  id,
  author,
  avatar,
  community,
  timestamp,
  content,
  image,
  likes,
  comments,
  liked = false,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 mb-4 hover:border-border/80 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
              {avatar}
            </div>
            <div>
              <div className="font-semibold">{author}</div>
              <div className="text-sm text-muted-foreground">
                <span>{community}</span>
                <span className="mx-2">•</span>
                <span>{timestamp}</span>
              </div>
            </div>
          </div>
          {/* Report Button */}
          <button
            onClick={() => setIsReportDialogOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="Report this post"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-foreground mb-4 leading-relaxed">{content}</p>

        {/* Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted h-64 md:h-96">
            <img
              src={image}
              alt="Post image"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-around text-muted-foreground pt-4 border-t border-border">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center",
              isLiked
                ? "text-red-500 bg-red-500/10"
                : "hover:bg-muted hover:text-foreground",
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-muted hover:text-foreground flex-1 justify-center">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{comments}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-muted hover:text-foreground flex-1 justify-center">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        targetId={id}
        targetType="POST"
        targetPreview={content}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </>
  );
}
