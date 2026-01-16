import { Star, Quote, Users } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahim Ahmed',
    avatar: '👨',
    rating: 5,
    comment: 'Excellent service! Received my order within 24 hours. The product quality exceeded my expectations. Highly recommended!',
    location: 'Dhaka',
    verified: true,
  },
  {
    id: 2,
    name: 'Fatima Begum',
    avatar: '👩',
    rating: 5,
    comment: 'Great prices and authentic products. Customer support was very helpful when I had questions. Will definitely shop again!',
    location: 'Chittagong',
    verified: true,
  },
  {
    id: 3,
    name: 'Karim Hossain',
    avatar: '👨‍💼',
    rating: 5,
    comment: 'Best online shopping experience in Bangladesh. Wide variety of products and fast delivery. Premium quality guaranteed!',
    location: 'Sylhet',
    verified: true,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
            <Users className="h-4 w-4 text-primary" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join over 500,000+ satisfied customers who trust us for quality products
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group glass-card rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors duration-500" />
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? 'rating-star' : 'text-muted'
                    }`}
                  />
                ))}
                {testimonial.verified && (
                  <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>
              
              {/* Comment */}
              <p className="text-foreground text-lg leading-relaxed mb-8">
                "{testimonial.comment}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-3xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    📍 {testimonial.location}
                  </p>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(239, 68, 68, 0.1)' }} />
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '50K+', label: 'Reviews' },
            { value: '99%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-6">
              <p className="text-3xl font-bold text-gradient">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}