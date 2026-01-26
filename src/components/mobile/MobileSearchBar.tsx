import { useState } from 'react';
import { Search, Camera, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export function MobileSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-card">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search Product"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
          <Camera className="h-5 w-5 text-muted-foreground" />
        </button>
      </form>
      <button className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );
}
