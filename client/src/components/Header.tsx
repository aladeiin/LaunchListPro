import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, Moon, Sun, X, Globe, AlertTriangle, Users } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0 justify-between w-full md:w-auto">
          <div className="flex items-center">
            <Logo size={38} />
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
          <Link href="/generics" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Generics
          </Link>
          <Link href="/community" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0 flex items-center">
            <Users className="h-3.5 w-3.5 mr-1" />
            Community
          </Link>
          <Link href="/adverse-event-reporting" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0 flex items-center">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Report Issue
          </Link>
          <Link href="/doctor-consultation" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Doctor Consultation
          </Link>
          <Link href="/blog" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            Blog
          </Link>
          <Link href="/merchant-signup" className="text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition py-2 md:py-0">
            For Sellers
          </Link>
        </nav>
        
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex items-center space-x-4 mt-4 md:mt-0`}>
          <LanguageSelector variant="compact" />
          
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
