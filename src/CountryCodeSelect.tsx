import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  name: string;
}

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  countries: CountryCode[];
  className?: string;
}

export default function CountryCodeSelect({ value, onChange, countries, className = '' }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find(c => c.code === value) || countries[0];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm) ||
    country.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all bg-white flex items-center justify-between"
      >
        <span className="truncate">
          {selectedCountry.flag} {selectedCountry.code}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 flex flex-col max-h-[80vh] md:inset-x-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md">
            <div className="p-4 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none text-base"
              />
            </div>
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {filteredCountries.length > 0 ? (
                <div className="py-1">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelect(country.code)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                        country.code === value ? 'bg-[#25D366]/10 font-semibold' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="flex-1 truncate text-base">{country.name}</span>
                      <span className="text-gray-600 text-sm font-medium">{country.code}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelect('custom')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-t border-gray-200 font-semibold text-[#25D366]"
                  >
                    Other (Custom)
                  </button>
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
