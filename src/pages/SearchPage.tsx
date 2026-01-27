import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSearchPage } from '@/components/mobile/MobileSearchPage';
import ProductsPage from './ProductsPage';

export default function SearchPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSearchPage />;
  }

  // Desktop uses ProductsPage with search functionality
  return <ProductsPage />;
}
