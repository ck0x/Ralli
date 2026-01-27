import { useNavigate, Link } from "react-router-dom";
import { SignInButton, useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

export const LandingPage = () => {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate("/kiosk");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Landing Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white border-neutral-200">
        <div className="flex items-center gap-3">
          <img src="/Ralli_Logo.png" alt="Ralli" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            {t("appName")}
          </span>
        </div>
        <div className="flex gap-4">
          <SignedIn>
            <Button
              variant="secondary"
              onClick={() => navigate("/kiosk")}
              className="text-sm"
            >
              Go to Dashboard
            </Button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="secondary" className="text-sm">
                Log In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="text-sm">Get Started</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white space-y-8">
        <img
          src="/Ralli_Logo.png"
          alt="Ralli logo"
          className="w-24 h-24 mx-auto"
        />
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900">
            Stringing management <br />
            <span className="text-indigo-600">reimagined.</span>
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Streamline your badminton shop operations with pending orders, SMS
            notifications, and customer history all in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {isLoaded && isSignedIn ? (
            <Button
              onClick={handleEnterApp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg transition-transform transform hover:-translate-y-1"
            >
              Launch App
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg transition-transform transform hover:-translate-y-1">
                Start for Free
              </Button>
            </SignInButton>
          )}
          <a
            href="mailto:support@ralli.app"
            className="flex items-center justify-center px-8 py-6 text-lg font-medium text-neutral-600 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
          >
            Contact Sales
          </a>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
          <FeatureCard
            icon="⚡"
            title="Fast Workflow"
            description="Optimized for touch screens and quick data entry in busy shops."
          />
          <FeatureCard
            icon="📱"
            title="Customer History"
            description="Instantly look up previous tensions, strings, and preferences."
          />
          <FeatureCard
            icon="🔔"
            title="Instant Updates"
            description="Notify customers via Email when their racket is ready for pickup."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-neutral-400 text-sm border-t border-neutral-100 bg-neutral-50">
        &copy; {new Date().getFullYear()} Ralli Stringing. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-2 text-neutral-900">{title}</h3>
    <p className="text-neutral-500">{description}</p>
  </div>
);
