import AppLayout from "@/components/AppLayout";
import { Search, Plus, Phone, Video, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages?: Message[];
}

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const chats: Chat[] = [
    {
      id: "1",
      name: "Tech Enthusiast",
      avatar: "TE",
      lastMessage: "That sounds amazing! Let's collaborate",
      timestamp: "2m",
      unread: true,
      messages: [
        {
          id: "1",
          text: "Hey! How are you?",
          timestamp: "10:30 AM",
          isSent: false,
        },
        {
          id: "2",
          text: "I'm doing great! How about you?",
          timestamp: "10:31 AM",
          isSent: true,
        },
        {
          id: "3",
          text: "That sounds amazing! Let's collaborate",
          timestamp: "10:32 AM",
          isSent: false,
        },
      ],
    },
    {
      id: "2",
      name: "Art Creator",
      avatar: "AC",
      lastMessage: "Thanks for the feedback!",
      timestamp: "1h",
      unread: false,
    },
    {
      id: "3",
      name: "Gaming Squad",
      avatar: "GS",
      lastMessage: "You: Let's play tonight!",
      timestamp: "3h",
      unread: false,
    },
    {
      id: "4",
      name: "Code Master",
      avatar: "CM",
      lastMessage: "Check out my latest project",
      timestamp: "5h",
      unread: false,
    },
  ];

  const currentChat = chats.find((c) => c.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sent:", messageText);
      setMessageText("");
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="flex h-screen bg-background text-foreground">
        {/* Chats List */}
        <div className="w-full md:w-96 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Messages</h2>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "w-full p-4 border-b border-border transition-colors text-left hover:bg-muted/50",
                  selectedChat === chat.id && "bg-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold">{chat.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {currentChat ? (
          <div className="hidden md:flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {currentChat.avatar}
                </div>
                <div>
                  <div className="font-semibold">{currentChat.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Active now
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.isSent ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs px-4 py-2 rounded-lg",
                      msg.isSent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 bg-muted rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all",
                    messageText.trim()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Select a conversation</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
