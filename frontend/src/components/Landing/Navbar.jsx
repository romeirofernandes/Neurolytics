import { useState } from "react";
import { ArrowRight, Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FaBrain } from "react-icons/fa";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      {/* Navigation */}
      <nav className="container mx-auto max-w-6xl flex items-center justify-between py-4 mt-6">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {/* Use react icon instead of image */}
            <FaBrain className="h-8 w-8" />
          </div>
          <span className="ml-2 text-xl font-bold text-foreground">Neurolytics</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="h-12 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Login
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu with animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col p-4 bg-background/95 backdrop-blur-sm md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {/* Use react icon instead of image */}
                  <FaBrain className="h-6 w-6" />
                </div>
                <span className="ml-2 text-xl font-bold text-foreground">
                  Neurolytics
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-foreground" />
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-col space-y-6">

              <div className="pt-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full justify-start border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Log in
                </button>
              </div>
              <button 
                onClick={() => navigate('/register')}
                className="h-12 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started For Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function NavItem({ label, hasDropdown }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function MobileNavItem({ label }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-lg text-foreground">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export default Navbar;
