import { useState, useEffect } from 'react';
import { Star, User, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SellerReview {
  id: string;
  seller_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface SellerReviewsProps {
  sellerId: string;
  sellerName: string;
}

export function SellerReviews({ sellerId, sellerName }: SellerReviewsProps) {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<SellerReview | null>(null);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
  const { user } = useAuth();

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('seller_reviews')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for all reviewers
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const reviewsWithProfiles = data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null
      })) as SellerReview[];

      setReviews(reviewsWithProfiles);
      
      // Calculate stats
      const total = data.length;
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      const distribution = [0, 0, 0, 0, 0];
      data.forEach(r => distribution[r.rating - 1]++);
      
      setStats({
        average: total > 0 ? sum / total : 0,
        total,
        distribution
      });

      // Check if user has already reviewed
      if (user) {
        const existing = reviewsWithProfiles.find(r => r.user_id === user.id);
        if (existing) setUserReview(existing);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId, user]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    setSubmitting(true);
    
    // Check if user has purchased from this seller
    const { data: orders } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(user_id, status)')
      .eq('seller_id', sellerId)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'delivered')
      .limit(1);

    const orderId = orders?.[0]?.order_id || null;
    const isVerified = !!orderId;

    const { error } = await supabase
      .from('seller_reviews')
      .upsert({
        seller_id: sellerId,
        user_id: user.id,
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
        is_verified: isVerified
      }, { onConflict: 'seller_id,user_id,order_id' });

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted successfully');
      setShowForm(false);
      setComment('');
      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;
    
    const { error } = await supabase
      .from('seller_reviews')
      .delete()
      .eq('id', userReview.id);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      setUserReview(null);
      fetchReviews();
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-primary">{stats.average.toFixed(1)}</div>
            <div className="flex justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(stats.average) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{stats.total} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: stats.total > 0 ? `${(stats.distribution[star - 1] / stats.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{stats.distribution[star - 1]}</span>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <div className="flex flex-col justify-center">
            {user ? (
              userReview ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">You've reviewed this seller</p>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    Delete Review
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowForm(!showForm)}>
                  Write a Review
                </Button>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center">Login to write a review</p>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-semibold">Rate your experience with {sellerName}</h3>
          
          {/* Star Rating */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground hover:text-amber-400'}`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Share your experience with this seller (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ThumbsUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this seller!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {review.profile?.avatar_url ? (
                    <img src={review.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.profile?.full_name || 'Anonymous'}</span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
