import { useState } from 'react';
import { Star, ThumbsUp, User, CheckCircle, Camera, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  is_verified: boolean | null;
  helpful_count: number | null;
  created_at: string | null;
  user_id: string | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function ProductReviews({ productId, productRating, reviewCount }: ProductReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews for this product
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch profiles for review users
      const userIds = reviewsData?.map(r => r.user_id).filter(Boolean) as string[];
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
            return acc;
          }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
        }
      }

      // Combine reviews with profiles
      return (reviewsData || []).map(review => ({
        ...review,
        profile: review.user_id ? profilesMap[review.user_id] || null : null
      })) as Review[];
    }
  });

  // Check if user has already reviewed this product
  const { data: userReview } = useQuery({
    queryKey: ['user-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Check if user has purchased this product
  const { data: hasPurchased } = useQuery({
    queryKey: ['has-purchased', productId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order:orders!inner(user_id, status)
        `)
        .eq('product_id', productId)
        .eq('order.user_id', user.id)
        .eq('order.status', 'delivered')
        .limit(1);

      if (error) return false;
      return data && data.length > 0;
    },
    enabled: !!user
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please login to submit a review');
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          is_verified: hasPurchased || false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId] });
      setIsDialogOpen(false);
      setRating(5);
      setComment('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    }
  });

  // Mark review as helpful
  const markHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: (review.helpful_count || 0) + 1 })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    }
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : productRating;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    setIsSubmitting(true);
    await submitReview.mutateAsync();
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-b-2xl rounded-tr-2xl p-8 border border-border/50 shadow-sm"
    >
      {/* Rating Summary */}
      <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl min-w-[180px]">
          <p className="text-5xl font-bold text-primary mb-2">{averageRating.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} 
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{reviews.length} reviews</p>
        </div>

        {/* Rating Bars */}
        <div className="flex-1 w-full">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 mb-2">
              <span className="text-sm w-4 font-semibold">{star}</span>
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: star * 0.1 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                />
              </div>
              <span className="text-sm text-muted-foreground w-16">{count} ({Math.round(percentage)}%)</span>
            </div>
          ))}
        </div>

        {/* Write Review Button */}
        <div className="w-full lg:w-auto">
          {user ? (
            userReview ? (
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">You've reviewed this product</p>
              </div>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full lg:w-auto h-12 font-semibold bg-primary hover:bg-primary/90">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Write Your Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Rating Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`h-8 w-8 transition-colors ${
                                star <= (hoverRating || rating) 
                                  ? 'fill-amber-500 text-amber-500' 
                                  : 'text-muted hover:text-amber-300'
                              }`} 
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {rating === 1 && 'Poor'}
                          {rating === 2 && 'Fair'}
                          {rating === 3 && 'Good'}
                          {rating === 4 && 'Very Good'}
                          {rating === 5 && 'Excellent'}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Review (Optional)</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Verified Badge Notice */}
                    {hasPurchased && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Your review will be marked as "Verified Purchase"</span>
                      </div>
                    )}

                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full h-12 font-semibold"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )
          ) : (
            <Button 
              variant="outline" 
              className="w-full lg:w-auto h-12 font-semibold"
              onClick={() => toast.info('Please login to write a review')}
            >
              Login to Review
            </Button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Reviews ({reviews.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {review.profile?.avatar_url ? (
                      <img 
                        src={review.profile.avatar_url} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.profile?.full_name || 'Anonymous'}
                      </span>
                      {review.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Rating & Date */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {review.created_at && format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-muted-foreground mb-4">{review.comment}</p>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto">
                        {review.images.map((img, i) => (
                          <img 
                            key={i}
                            src={img}
                            alt=""
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {/* Helpful */}
                    <button
                      onClick={() => markHelpful.mutate(review.id)}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful_count || 0})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
