import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0 justify-between w-full md:w-auto">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd"></path>
            </svg>
            <span className="ml-2 text-2xl font-bold text-primary font-sans">PharmAssist</span>
          </div>
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:space-x-6 w-full md:w-auto`}>
          <Link href="/" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Home
          </Link>
          <Link href="/search" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Search
          </Link>
          <Link href="/products" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Products
          </Link>
          <Link href="/dashboard" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Dashboard
          </Link>
          <Link href="/doctor-consultation" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Doctor Consultation
          </Link>
          <Link href="/blog" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Blog
          </Link>
          <Link href="/#how-it-works" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            How It Works
          </Link>
          <Link href="/#features" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Features
          </Link>
        </nav>
        
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex items-center space-x-4 mt-4 md:mt-0`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-slate-700" />}
          </Button>
          <Button 
            onClick={() => document.getElementById('join-waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full md:w-auto"
          >
            Join Waitlist
          </Button>
        </div>
      </div>
    </header>
  );
}
