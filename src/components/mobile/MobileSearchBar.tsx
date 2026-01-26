import { useState } from 'react';
import { Search, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MobileSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-card">
      <form onSubmit={handleSearch}>
        <motion.div 
          className={`relative flex items-center rounded-xl transition-all duration-200 ${
            isFocused 
              ? 'bg-secondary ring-2 ring-primary/20' 
              : 'bg-secondary/60'
          }`}
          animate={{ scale: isFocused ? 1.01 : 1 }}
        >
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button 
            type="button" 
            className="absolute right-3 p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <Camera className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
        </motion.div>
      </form>
    </div>
  );
}
