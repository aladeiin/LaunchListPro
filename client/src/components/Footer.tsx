import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-6 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-2 text-xl font-bold font-sans">PharmAssist</span>
            </div>
            <p className="text-slate-400 mb-4">
              Making medication more affordable and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-400 hover:text-white transition">Home</Link></li>
              <li><Link href="/#how-it-works" className="text-slate-400 hover:text-white transition">How It Works</Link></li>
              <li><Link href="/#features" className="text-slate-400 hover:text-white transition">Features</Link></li>
              <li><Link href="/#join-waitlist" className="text-slate-400 hover:text-white transition">Join Waitlist</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition">Cookie Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition">Disclaimer</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="text-slate-400 mr-2" size={16} />
                <a href="mailto:info@pharmassist.com" className="text-slate-400 hover:text-white transition">info@pharmassist.com</a>
              </li>
              <li className="flex items-center">
                <Phone className="text-slate-400 mr-2" size={16} />
                <a href="tel:+11234567890" className="text-slate-400 hover:text-white transition">+1 (123) 456-7890</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} PharmAssist. All rights reserved.</p>
          <p className="mt-2">
            <strong>Disclaimer:</strong> PharmAssist provides information about medication alternatives and pricing for educational purposes only. 
            This service is not intended to provide medical advice. Always consult with a qualified healthcare provider regarding medical decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
