import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated Music Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-primary/40 rounded-full animate-ping"></div>
            <div className="absolute inset-8 bg-primary rounded-full flex items-center justify-center">
              <Music className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Sound waves */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-1">
              <div
                className="w-1 h-8 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1 h-12 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1 h-6 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>

          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-1">
              <div
                className="w-1 h-6 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "100ms" }}
              ></div>
              <div
                className="w-1 h-12 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "250ms" }}
              ></div>
              <div
                className="w-1 h-8 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "400ms" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Oops! This track is out of reach
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Looks like the beat dropped and this page went missing. Let's get
            you back to the music!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="group">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Return to Home
            </Link>
          </Button>
        </div>

        {/* Footer Message */}
        <p className="text-sm text-muted-foreground">
          Lost in the rhythm? Our support team is here to help you find your way
          back to the music.
        </p>
      </div>
    </div>
  );
}
