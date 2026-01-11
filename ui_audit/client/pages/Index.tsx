import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Shield,
  Lock,
  Users,
  MessageCircle,
  Zap,
  Eye,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />

        <div className="container max-w-5xl mx-auto px-4">
          <div className="space-y-8 text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                The future of community communication
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Express Yourself
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Without Exposing Your Identity
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join communities, share thoughts, and connect with others—all
                while staying completely anonymous. Privacy-first, moderated,
                and built for real conversations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                to="/signup"
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/communities"
                className="px-8 py-3 rounded-lg border border-border bg-card text-foreground font-semibold transition-all hover:bg-muted flex items-center justify-center gap-2"
              >
                Explore Communities
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Anonymous</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">E2EE</div>
                <div className="text-sm text-muted-foreground">
                  Encrypted Chats
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">
                  AI Moderation
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Ads Ever</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card/50 border-y border-border">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Freedom Meets Safety
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three spaces, three different privacy models. Choose what works
              for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Public Spaces */}
            <div className="rounded-2xl border border-border bg-background p-8 transition-all hover:shadow-lg hover:border-primary/50 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Public Communities</h3>
              <p className="text-muted-foreground mb-4">
                Post anonymously in moderated communities. Share ideas, discuss
                topics, and find your people without revealing who you are.
              </p>
              <div className="flex items-center text-primary font-semibold gap-2">
                Server-side moderation
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 2: Group Spaces */}
            <div className="rounded-2xl border border-border bg-background p-8 transition-all hover:shadow-lg hover:border-secondary/50 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Group Chats</h3>
              <p className="text-muted-foreground mb-4">
                Form trusted groups with end-to-end encryption. Once a group
                meets eligibility criteria, communications become completely
                encrypted.
              </p>
              <div className="flex items-center text-secondary font-semibold gap-2">
                Optional E2EE
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 3: Personal Chats */}
            <div className="rounded-2xl border border-border bg-background p-8 transition-all hover:shadow-lg hover:border-accent/50 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Private Messages</h3>
              <p className="text-muted-foreground mb-4">
                One-on-one conversations with verified identities and full
                end-to-end encryption. Your secrets stay between you two.
              </p>
              <div className="flex items-center text-accent font-semibold gap-2">
                Full E2EE
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why We're Different
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">Privacy by Design</h3>
                    <p className="text-muted-foreground">
                      Anonymity is built into the core architecture, not bolted
                      on later. No user data is sold or exploited.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Eye className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">Transparent Moderation</h3>
                    <p className="text-muted-foreground">
                      Advanced AI combined with human review keeps communities
                      safe without censoring legitimate expression.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">No Ads, No Tracking</h3>
                    <p className="text-muted-foreground">
                      Subscription-based model means we don't need to harvest
                      your data. Your privacy is our business model.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative hidden md:block h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl" />
              <div className="absolute inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20" />
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">Privacy Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 md:py-32 bg-card/50 border-y border-border">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free public communities. Premium features for those who want more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-border bg-background p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold text-primary mb-6">$0</p>
              <ul className="space-y-4 mb-8">
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
              </ul>
              <Link
                to="/signup"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-semibold transition-all hover:bg-muted"
              >
                Get Started
              </Link>
            </div>

            {/* Creator */}
            <div className="rounded-2xl border border-primary/50 bg-background p-8 relative">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Creator</h3>
              <p className="text-3xl font-bold text-primary mb-6">$4.99</p>
              <ul className="space-y-4 mb-8">
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
              </ul>
              <Link
                to="/signup"
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-border bg-background p-8">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-primary mb-6">Custom</p>
              <ul className="space-y-4 mb-8">
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
                  <span className="text-sm">24/7 support</span>
                </li>
              </ul>
              <Link
                to="/pricing"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-semibold transition-all hover:bg-muted"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Express Yourself?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who value their privacy and want to be part
            of real conversations without the surveillance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              Create Account Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 rounded-lg border border-border bg-card text-foreground font-semibold transition-all hover:bg-muted flex items-center justify-center"
            >
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
