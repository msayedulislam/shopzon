import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronUp, ChevronDown, Scale, Star, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductComparison } from '@/hooks/useProductComparison';
import { formatPrice } from '@/data/mockData';

export function ProductComparisonBar() {
  const { products, removeProduct, clearAll } = useProductComparison();
  const [isExpanded, setIsExpanded] = useState(false);

  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-2xl"
      >
        {/* Expanded Comparison View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="container py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="relative bg-secondary rounded-xl p-4">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-background hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-muted-foreground line-through text-xs">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 4 - products.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="border-2 border-dashed rounded-xl p-4 flex items-center justify-center text-muted-foreground"
                    >
                      <span className="text-sm">Add product</span>
                    </div>
                  ))}
                </div>

                {/* Comparison Table */}
                {products.length >= 2 && (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Feature</th>
                          {products.map((p) => (
                            <th key={p.id} className="text-center p-2 font-medium max-w-32 truncate">
                              {p.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Price</td>
                          {products.map((p) => (
                            <td key={p.id} className="text-center p-2 font-bold text-primary">
                              {formatPrice(p.price)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Discount</td>
                          {products.map((p) => (
                            <td key={p.id} className="text-center p-2">
                              {p.originalPrice ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                                </Badge>
                              ) : (
                                <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Rating</td>
                          {products.map((p) => (
                            <td key={p.id} className="text-center p-2">
                              {p.rating ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{p.rating.toFixed(1)}</span>
                                </div>
                              ) : (
                                <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Category</td>
                          {products.map((p) => (
                            <td key={p.id} className="text-center p-2">
                              {p.category || <Minus className="h-4 w-4 mx-auto text-muted-foreground" />}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Bar */}
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span className="font-medium">Compare</span>
                <Badge>{products.length}/4</Badge>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {products.map((product) => (
                  <div key={product.id} className="relative group">
                    <img
                      src={product.images[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover border-2 border-background"
                    />
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Compare Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
