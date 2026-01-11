import Layout from "@/components/Layout";

export default function Signup() {
  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Get Started</h1>
          <p className="text-muted-foreground text-center mb-8">
            Join the privacy-first community platform.
          </p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <p className="text-muted-foreground mb-4 text-center">
              This page is coming soon. Ask me to help you build out the signup
              flow and onboarding experience!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
