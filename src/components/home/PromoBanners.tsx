import { Link } from 'react-router-dom';

export function PromoBanners() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Electronics Banner */}
          <Link
            to="/category/electronics"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 min-h-[200px] group"
          >
            <div className="relative z-10">
              <span className="text-white/80 text-sm font-medium">Up to 40% Off</span>
              <h3 className="text-2xl font-display font-bold text-white mt-2 mb-4">
                Electronics Sale
              </h3>
              <span className="inline-flex items-center text-white font-medium text-sm group-hover:gap-2 transition-all">
                Shop Now →
              </span>
            </div>
            <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:scale-110 transition-transform">
              📱
            </div>
          </Link>

          {/* Fashion Banner */}
          <Link
            to="/category/fashion"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 min-h-[200px] group"
          >
            <div className="relative z-10">
              <span className="text-white/80 text-sm font-medium">New Collection</span>
              <h3 className="text-2xl font-display font-bold text-white mt-2 mb-4">
                Fashion Week
              </h3>
              <span className="inline-flex items-center text-white font-medium text-sm group-hover:gap-2 transition-all">
                Shop Now →
              </span>
            </div>
            <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:scale-110 transition-transform">
              👗
            </div>
          </Link>

          {/* Home & Living Banner */}
          <Link
            to="/category/home-living"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 min-h-[200px] group md:col-span-2 lg:col-span-1"
          >
            <div className="relative z-10">
              <span className="text-white/80 text-sm font-medium">Free Delivery</span>
              <h3 className="text-2xl font-display font-bold text-white mt-2 mb-4">
                Home Essentials
              </h3>
              <span className="inline-flex items-center text-white font-medium text-sm group-hover:gap-2 transition-all">
                Shop Now →
              </span>
            </div>
            <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:scale-110 transition-transform">
              🏠
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
