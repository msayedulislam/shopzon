import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahim Ahmed',
    avatar: '👨',
    rating: 5,
    comment: 'Excellent service! Received my order within 24 hours. The product quality exceeded my expectations.',
    location: 'Dhaka',
  },
  {
    id: 2,
    name: 'Fatima Begum',
    avatar: '👩',
    rating: 5,
    comment: 'Great prices and authentic products. Customer support was very helpful when I had questions.',
    location: 'Chittagong',
  },
  {
    id: 3,
    name: 'Karim Hossain',
    avatar: '👨‍💼',
    rating: 4,
    comment: 'Best online shopping experience in Bangladesh. Wide variety of products and fast delivery.',
    location: 'Sylhet',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground mt-2">
            Join thousands of satisfied customers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-6 shadow-sm animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? 'rating-star' : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-foreground mb-4">"{testimonial.comment}"</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{testimonial.avatar}</span>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
