import AppLayout from "@/components/AppLayout";
import Post from "@/components/Post";

export default function Likes() {
  const likedPosts = [
    {
      id: "1",
      author: "Tech Wizard",
      avatar: "TW",
      community: "r/Tech",
      timestamp: "12 hours ago",
      content:
        "Just discovered this amazing framework that has simplified my entire workflow. Can't believe I didn't know about this earlier!",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
      likes: 2341,
      comments: 456,
      liked: true,
    },
    {
      id: "2",
      author: "Art Designer",
      avatar: "AD",
      community: "r/Art",
      timestamp: "1 day ago",
      content:
        "Spent the day experimenting with colors and found this beautiful palette. The contrast is just perfect for this design.",
      likes: 5678,
      comments: 789,
      liked: true,
    },
    {
      id: "3",
      author: "Music Fan",
      avatar: "MF",
      community: "r/Music",
      timestamp: "1 day ago",
      content:
        "Found this underrated artist and their music is absolutely incredible. How is this not getting more recognition?",
      likes: 3456,
      comments: 567,
      liked: true,
    },
  ];

  return (
    <AppLayout>
      <div className="w-full p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-6">Liked Posts</h2>

        {likedPosts.length > 0 ? (
          <div className="space-y-4 pb-20">
            {likedPosts.map((post) => (
              <Post key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No liked posts yet. Like some posts to see them here!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
