import AppLayout from "@/components/AppLayout";
import { Search, Users, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  posts: number;
  joined: boolean;
  color: string;
}

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: "1",
      name: "Tech Talk",
      icon: "💻",
      description: "All things technology, programming, and innovation",
      members: 15234,
      posts: 8943,
      joined: true,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "2",
      name: "Art Gallery",
      icon: "🎨",
      description: "Showcase your creative artwork and digital designs",
      members: 9876,
      posts: 5234,
      joined: false,
      color: "from-pink-500 to-pink-600",
    },
    {
      id: "3",
      name: "Gaming Zone",
      icon: "🎮",
      description: "Discuss games, strategies, and share gaming moments",
      members: 23456,
      posts: 12345,
      joined: true,
      color: "from-green-500 to-green-600",
    },
    {
      id: "4",
      name: "Music Lovers",
      icon: "🎵",
      description: "Share music, discuss artists, and discover new sounds",
      members: 7654,
      posts: 4321,
      joined: false,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "5",
      name: "Photography",
      icon: "📸",
      description: "Share photos and discuss photography techniques",
      members: 5432,
      posts: 3210,
      joined: true,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "6",
      name: "Books & Reading",
      icon: "📚",
      description: "Discuss books, authors, and reading recommendations",
      members: 4321,
      posts: 2345,
      joined: false,
      color: "from-amber-500 to-amber-600",
    },
  ]);

  const handleJoinToggle = (id: string) => {
    setCommunities(
      communities.map((comm) =>
        comm.id === id ? { ...comm, joined: !comm.joined } : comm,
      ),
    );
  };

  const filteredCommunities = communities.filter((comm) =>
    comm.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const joinedCommunities = filteredCommunities.filter((c) => c.joined);
  const suggestedCommunities = filteredCommunities.filter((c) => !c.joined);

  return (
    <AppLayout>
      <div className="w-full p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Communities</h2>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors hidden md:block">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Your Communities */}
        {joinedCommunities.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4">Your Communities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCommunities.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{comm.icon}</div>
                    <button
                      onClick={() => handleJoinToggle(comm.id)}
                      className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Joined
                    </button>
                  </div>
                  <h4 className="font-bold text-lg mb-1">r/{comm.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {comm.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{(comm.members / 1000).toFixed(1)}k</span>
                    </div>
                    <div>{comm.posts.toLocaleString()} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Communities */}
        {suggestedCommunities.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Suggested For You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedCommunities.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{comm.icon}</div>
                    <button
                      onClick={() => handleJoinToggle(comm.id)}
                      className="px-4 py-1.5 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Join
                    </button>
                  </div>
                  <h4 className="font-bold text-lg mb-1">r/{comm.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {comm.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{(comm.members / 1000).toFixed(1)}k</span>
                    </div>
                    <div>{comm.posts.toLocaleString()} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredCommunities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No communities found
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
