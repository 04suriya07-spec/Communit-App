import AppLayout from "@/components/AppLayout";
import Post from "@/components/Post";
import { Flame, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("trending");

  const trendingPosts = [
    {
      id: "1",
      author: "Tech Innovator",
      avatar: "TI",
      community: "r/Tech",
      timestamp: "3 hours ago",
      content:
        "AI is changing everything. Here's what nobody talks about - the infrastructure challenges are insane. 🤖",
      image:
        "https://images.unsplash.com/photo-1677442d019cecf8ea1da41efb11d8ecfc27ceb87?w=600&h=400&fit=crop",
      likes: 8934,
      comments: 1023,
      liked: false,
    },
    {
      id: "2",
      author: "Artist Hub",
      avatar: "AH",
      community: "r/Art",
      timestamp: "5 hours ago",
      content:
        "Just finished this digital painting after 40 hours of work. The lighting took forever but I'm finally happy with it!",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
      likes: 12456,
      comments: 2341,
      liked: true,
    },
    {
      id: "3",
      author: "Gaming Legend",
      avatar: "GL",
      community: "r/Gaming",
      timestamp: "6 hours ago",
      content:
        "The new game just dropped and wow... the graphics are absolutely insane. Running on my rig and getting 240fps. Worth every penny.",
      image:
        "https://images.unsplash.com/photo-1538481143235-405ba18e34f0?w=600&h=400&fit=crop",
      likes: 15789,
      comments: 3456,
      liked: false,
    },
    {
      id: "4",
      author: "Creator Pro",
      avatar: "CP",
      community: "r/General",
      timestamp: "8 hours ago",
      content:
        "Being an online creator is harder than it looks. The consistency required is insane. But the community support makes it worth it.",
      likes: 5623,
      comments: 987,
      liked: false,
    },
  ];

  const topCommunities = [
    { icon: "🌍", name: "World News", members: 234567, trend: "+15%" },
    { icon: "💪", name: "Fitness", members: 189234, trend: "+22%" },
    { icon: "🍔", name: "Cooking", members: 156789, trend: "+12%" },
    { icon: "✈️", name: "Travel", members: 198765, trend: "+18%" },
    { icon: "💼", name: "Careers", members: 234123, trend: "+25%" },
    { icon: "🎓", name: "Education", members: 178954, trend: "+13%" },
  ];

  return (
    <AppLayout>
      <div className="w-full p-4 md:p-6">
        {/* Header */}
        <h2 className="text-3xl font-bold mb-6">Discover</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("trending")}
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition-colors",
              activeTab === "trending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Trending
            </div>
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition-colors",
              activeTab === "communities"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Communities
            </div>
          </button>
        </div>

        {/* Trending Posts */}
        {activeTab === "trending" && (
          <div className="space-y-4 pb-20">
            {trendingPosts.map((post) => (
              <Post key={post.id} {...post} />
            ))}
          </div>
        )}

        {/* Top Communities */}
        {activeTab === "communities" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            {topCommunities.map((comm, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{comm.icon}</div>
                  <div className="text-sm font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                    {comm.trend}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{comm.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {(comm.members / 1000).toFixed(0)}k members
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
