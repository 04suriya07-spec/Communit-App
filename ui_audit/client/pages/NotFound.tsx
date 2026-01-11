import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <p className="text-2xl font-semibold mb-2">Page not found</p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. Ask me
            to help build this page if you have specific content in mind!
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
