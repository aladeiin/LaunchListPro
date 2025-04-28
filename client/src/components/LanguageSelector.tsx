import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Globe } from "lucide-react";

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
};

// Supported Indian languages
const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
  onLanguageChange?: (languageCode: string) => void;
}

export default function LanguageSelector({ 
  variant = 'default',
  className = '',
  onLanguageChange
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  useEffect(() => {
    // Get language from localStorage if available
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value);
    localStorage.setItem('preferredLanguage', value);
    
    // Call the callback if provided
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };
  
  // Find the current language object
  const language = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];

  if (variant === 'compact') {
    return (
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-[70px] ${className}`}>
          <SelectValue>
            <span className="flex items-center">
              <span className="mr-1">{language.flag}</span>
              <span>{language.code.toUpperCase()}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <SelectValue>
          <span className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            <span>{language.nativeName}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center justify-between w-full">
              <span>{lang.nativeName}</span>
              <span className="text-muted-foreground text-xs">
                {lang.name !== lang.nativeName ? lang.name : ''}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}