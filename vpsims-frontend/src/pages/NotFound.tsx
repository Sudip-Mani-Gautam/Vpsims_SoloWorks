import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
            <h1 className="text-9xl font-heading font-black text-primary/20">404</h1>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Oops! Page not found</h2>
            <p className="text-muted-foreground font-medium">
              The professional module you're looking for doesn't exist or has been moved to a different sector.
            </p>
        </div>
        <Button asChild className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" /> Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
