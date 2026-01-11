import Layout from "@/components/Layout";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const features = [
    { name: "Anonymous Posting", tiers: ["Free", "Creator", "Enterprise"] },
    {
      name: "Public Communities",
      tiers: ["Free", "Creator", "Enterprise"],
    },
    { name: "AI Moderation", tiers: ["Free", "Creator", "Enterprise"] },
    { name: "Verified Identity Chats", tiers: ["Creator", "Enterprise"] },
    { name: "E2EE Private Messages", tiers: ["Creator", "Enterprise"] },
    { name: "Analytics Dashboard", tiers: ["Creator", "Enterprise"] },
    { name: "Custom Communities", tiers: ["Enterprise"] },
    { name: "Advanced Moderation Tools", tiers: ["Enterprise"] },
    { name: "24/7 Support", tiers: ["Enterprise"] },
    { name: "API Access", tiers: ["Enterprise"] },
  ];

  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs. No hidden fees, no
              surprises.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Free */}
            <div className="rounded-2xl border border-border bg-background p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-4xl font-bold text-primary mb-6">$0</p>
              <p className="text-muted-foreground mb-8">
                Join communities and share anonymously.
              </p>
              <Link
                to="/signup"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-semibold transition-all hover:bg-muted text-center block mb-8"
              >
                Get Started
              </Link>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Anonymous posting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Public communities</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">AI moderation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Group chats</span>
                </li>
              </ul>
            </div>

            {/* Creator */}
            <div className="rounded-2xl border-2 border-primary bg-background p-8 relative md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Creator</h3>
              <p className="text-4xl font-bold text-primary mb-6">$4.99</p>
              <p className="text-muted-foreground mb-8">
                Unlock verified identity chats and encryption.
              </p>
              <Link
                to="/signup"
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 text-center block mb-8"
              >
                Start Free Trial
              </Link>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Everything in Free</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Verified identity chats</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">E2EE private messages</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Group encryption options</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-border bg-background p-8">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-4xl font-bold text-primary mb-6">Custom</p>
              <p className="text-muted-foreground mb-8">
                For organizations and teams with custom needs.
              </p>
              <button className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-semibold transition-all hover:bg-muted text-center block mb-8">
                Contact Sales
              </button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Everything in Creator</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Custom communities</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Advanced moderation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 font-semibold">
                      Feature
                    </th>
                    <th className="text-center px-6 py-4 font-semibold">
                      Free
                    </th>
                    <th className="text-center px-6 py-4 font-semibold">
                      Creator
                    </th>
                    <th className="text-center px-6 py-4 font-semibold">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {feature.tiers.includes("Free") ? (
                          <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.tiers.includes("Creator") ? (
                          <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.tiers.includes("Enterprise") ? (
                          <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
