-- Create table for static pages that can be edited from admin panel
CREATE TABLE public.static_pages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    content text,
    meta_title text,
    meta_description text,
    hero_image text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active pages
CREATE POLICY "Active pages are viewable by everyone"
ON public.static_pages
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage pages
CREATE POLICY "Admins can manage pages"
ON public.static_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_static_pages_updated_at
BEFORE UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pages with content
INSERT INTO public.static_pages (slug, title, content, meta_title, meta_description) VALUES
('about-us', 'About Us', 
'# Welcome to BDMart

BDMart is Bangladesh''s leading online marketplace, connecting millions of customers with thousands of trusted sellers across the nation.

## Our Story

Founded in 2020, BDMart emerged from a simple vision: to make quality products accessible to every Bangladeshi household. What started as a small team with big dreams has grown into a thriving ecosystem of sellers, buyers, and partners.

## Our Mission

To democratize e-commerce in Bangladesh by providing a secure, affordable, and user-friendly platform that empowers both buyers and sellers.

## Our Values

**Trust & Transparency**: We believe in honest dealings and clear communication.

**Customer First**: Every decision we make prioritizes our customers'' needs.

**Innovation**: We constantly evolve to serve you better.

**Community**: We support local businesses and artisans across Bangladesh.

## Our Impact

- **50,000+** Products Available
- **10,000+** Verified Sellers
- **1 Million+** Happy Customers
- **64 Districts** Covered', 
'About BDMart - Bangladesh''s Premier Online Marketplace', 
'Learn about BDMart, Bangladesh''s leading online marketplace. Discover our story, mission, and commitment to quality e-commerce.'),

('contact-us', 'Contact Us', 
'# Get in Touch

We''re here to help! Reach out to us through any of the following channels.

## Customer Support

**Phone**: +880 1234-567890
**Email**: support@bdmart.com
**Hours**: Saturday - Thursday, 9:00 AM - 10:00 PM

## Head Office

BDMart Technologies Ltd.
House 45, Road 12, Block D
Banani, Dhaka 1213
Bangladesh

## Business Inquiries

For partnerships and business opportunities:
**Email**: business@bdmart.com

## Seller Support

Want to sell on BDMart?
**Email**: sellers@bdmart.com
**Phone**: +880 1234-567891

## Social Media

Follow us for updates and offers:
- Facebook: @bdmart
- Instagram: @bdmart_bd
- Twitter: @bdmart_official',
'Contact BDMart - Customer Support & Business Inquiries',
'Contact BDMart customer support. Find our phone numbers, email addresses, office location, and social media links.'),

('careers', 'Careers', 
'# Join Our Team

Be part of Bangladesh''s fastest-growing e-commerce company!

## Why Work at BDMart?

**Growth Opportunities**: Fast-track your career in a dynamic environment.

**Learning Culture**: Continuous learning and development programs.

**Great Benefits**: Competitive salary, health insurance, and more.

**Impactful Work**: Shape the future of e-commerce in Bangladesh.

## Current Openings

### Technology
- Senior Software Engineer
- Frontend Developer (React)
- DevOps Engineer
- Data Analyst

### Operations
- Supply Chain Manager
- Warehouse Supervisor
- Delivery Operations Lead

### Marketing
- Digital Marketing Manager
- Content Creator
- SEO Specialist

### Customer Service
- Customer Support Lead
- Quality Assurance Specialist

## How to Apply

Send your resume to careers@bdmart.com with the job title as the subject line.

We look forward to hearing from you!',
'Careers at BDMart - Join Our Growing Team',
'Explore career opportunities at BDMart. Join Bangladesh''s leading e-commerce platform and grow with us.'),

('blog', 'Blog', 
'# BDMart Blog

Stay updated with the latest news, tips, and trends.

## Featured Articles

### Shopping Tips
- How to Get the Best Deals on BDMart
- Guide to Using Coupons and Promo Codes
- Tips for Safe Online Shopping

### Seller Success Stories
- From Home Business to BDMart Star Seller
- How Local Artisans Are Finding Global Customers

### Product Guides
- Top 10 Electronics Under ৳10,000
- Best Fashion Picks for This Season
- Home Decor Ideas on a Budget

### Industry News
- E-commerce Trends in Bangladesh 2024
- The Rise of Mobile Shopping
- Sustainable Shopping: Making Conscious Choices

## Subscribe to Our Newsletter

Get the latest articles delivered to your inbox!',
'BDMart Blog - Shopping Tips, News & Updates',
'Read the BDMart blog for shopping tips, seller stories, product guides, and e-commerce news from Bangladesh.'),

('faqs', 'FAQs', 
'# Frequently Asked Questions

Find answers to common questions about shopping on BDMart.

## Ordering

**Q: How do I place an order?**
A: Browse products, add items to your cart, proceed to checkout, enter your delivery address, and confirm your order.

**Q: Can I modify my order after placing it?**
A: You can modify or cancel your order within 1 hour of placing it. Contact customer support for assistance.

**Q: What payment methods are accepted?**
A: We accept bKash, Nagad, Cash on Delivery, Visa, and MasterCard.

## Delivery

**Q: What are the delivery charges?**
A: Delivery charges vary by location. Dhaka: ৳60, Other cities: ৳120. Free delivery on orders above ৳2000.

**Q: How long does delivery take?**
A: Dhaka: 1-3 days, Other areas: 3-7 days.

**Q: Can I track my order?**
A: Yes! Use your order number to track your delivery on our Track Order page.

## Returns & Refunds

**Q: What is the return policy?**
A: Most items can be returned within 7 days of delivery if unused and in original packaging.

**Q: How do I request a refund?**
A: Submit a return request through your account or contact customer support.

**Q: How long do refunds take?**
A: Refunds are processed within 5-7 business days after we receive the returned item.

## Account

**Q: How do I create an account?**
A: Click ''Sign Up'' and enter your email, phone number, and create a password.

**Q: I forgot my password. How do I reset it?**
A: Click ''Forgot Password'' on the login page and follow the instructions sent to your email.',
'BDMart FAQs - Frequently Asked Questions',
'Find answers to frequently asked questions about ordering, delivery, returns, and more on BDMart.'),

('privacy-policy', 'Privacy Policy', 
'# Privacy Policy

Last updated: January 2024

BDMart Technologies Ltd. ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.

## Information We Collect

**Personal Information**: Name, email, phone number, delivery address, payment information.

**Usage Data**: IP address, browser type, pages visited, time spent on pages.

**Device Information**: Device type, operating system, unique device identifiers.

## How We Use Your Information

- Process and fulfill your orders
- Send order confirmations and updates
- Provide customer support
- Improve our services and user experience
- Send promotional communications (with your consent)
- Detect and prevent fraud

## Data Sharing

We may share your information with:
- Delivery partners to fulfill orders
- Payment processors to complete transactions
- Service providers who assist our operations
- Legal authorities when required by law

## Data Security

We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Opt-out of marketing communications

## Contact Us

For privacy-related inquiries:
Email: privacy@bdmart.com',
'Privacy Policy - BDMart',
'Read BDMart''s privacy policy to understand how we collect, use, and protect your personal information.'),

('terms-conditions', 'Terms & Conditions', 
'# Terms & Conditions

Last updated: January 2024

Welcome to BDMart. By using our website and services, you agree to these terms.

## Account Terms

- You must be at least 18 years old to create an account
- You are responsible for maintaining account security
- One account per person; multiple accounts may be terminated
- Provide accurate and complete information

## Ordering & Payments

- All prices are in Bangladeshi Taka (৳)
- Prices may change without notice
- We reserve the right to cancel orders
- Payment must be made through approved methods

## Delivery

- Delivery times are estimates, not guarantees
- You must provide accurate delivery information
- Someone must be available to receive the delivery
- Delivery charges apply based on location

## Returns & Refunds

- Items must be returned within 7 days
- Products must be unused and in original packaging
- Some items are non-returnable (see Return Policy)
- Refunds processed within 5-7 business days

## Prohibited Activities

- Fraudulent transactions
- Reselling without authorization
- Misuse of promotional offers
- Harassment of staff or sellers

## Limitation of Liability

BDMart is not liable for:
- Indirect or consequential damages
- Loss of profits or data
- Third-party actions

## Changes to Terms

We may update these terms at any time. Continued use constitutes acceptance.

## Contact

For questions: legal@bdmart.com',
'Terms & Conditions - BDMart',
'Read the terms and conditions for using BDMart, including account terms, ordering, delivery, and return policies.'),

('track-order', 'Track Order', 
'# Track Your Order

Enter your order details to see the current status of your delivery.

## How to Track

1. Enter your Order Number (e.g., BDM-20240115-12345)
2. Enter your Phone Number used during checkout
3. Click "Track Order"

## Order Statuses

**Pending**: Your order has been placed and is being processed.

**Confirmed**: Your order has been confirmed and is being prepared.

**Processing**: Your order is being packed at our warehouse.

**Shipped**: Your order is on its way to the delivery hub.

**Out for Delivery**: Your order is with our delivery partner and will arrive today.

**Delivered**: Your order has been successfully delivered.

## Need Help?

Can''t find your order? Contact our support team:
- Phone: +880 1234-567890
- Email: support@bdmart.com

## Delivery Partners

We work with trusted delivery partners across Bangladesh to ensure your packages arrive safely and on time.',
'Track Your Order - BDMart',
'Track your BDMart order status in real-time. Enter your order number to see delivery updates.'),

('returns-exchanges', 'Returns & Exchanges', 
'# Returns & Exchanges

We want you to be completely satisfied with your purchase.

## Return Policy

**Return Window**: 7 days from delivery date

**Eligible Items**: Most products in unused condition with original packaging

**Non-Returnable Items**:
- Perishable goods
- Intimate apparel
- Customized products
- Digital downloads
- Items marked "Final Sale"

## How to Return

1. Log in to your account
2. Go to "My Orders"
3. Select the order and click "Return Item"
4. Choose return reason
5. Schedule pickup or drop at collection point

## Exchange Policy

Want a different size or color? Request an exchange instead of a return:

1. Initiate return request
2. Select "Exchange" option
3. Choose new variant
4. We''ll ship the replacement when we receive your return

## Refund Process

**Timeline**: 5-7 business days after return approval

**Refund Methods**:
- Original payment method (bKash, Nagad, Card)
- BDMart Wallet (instant)

## Return Shipping

- Free for defective/damaged items
- Customer pays for change of mind returns
- Pickup available in select cities

## Quality Check

All returns are inspected before refund approval. Items must be:
- Unused and unworn
- With all tags attached
- In original packaging',
'Returns & Exchanges Policy - BDMart',
'Learn about BDMart''s return and exchange policy. Easy returns within 7 days of delivery.'),

('refund-policy', 'Refund Policy', 
'# Refund Policy

Understanding how refunds work at BDMart.

## When Are You Eligible?

**Full Refund**:
- Item not delivered
- Wrong item received
- Defective or damaged product
- Order cancelled before shipping

**Partial Refund**:
- Item partially used/damaged by customer
- Missing components (refund for missing parts)

## Refund Methods

**bKash/Nagad**: 3-5 business days
**Credit/Debit Card**: 5-7 business days
**BDMart Wallet**: Instant credit

## Refund Process

1. **Request Submitted**: You initiate return/refund
2. **Pickup Scheduled**: We arrange item collection
3. **Quality Check**: Item inspected at warehouse
4. **Refund Approved**: Amount credited to original payment method
5. **Confirmation**: SMS/Email notification sent

## Non-Refundable Items

- Gift cards
- Downloadable products
- Services rendered
- Items returned after 7 days
- Used or damaged items (customer fault)

## Promo & Coupon Refunds

- Coupon value is non-refundable
- Only actual paid amount is refunded
- Promotional items follow specific rules

## Dispute Resolution

Not satisfied with refund decision?

1. Email: refunds@bdmart.com
2. Include order number and issue description
3. Our team will review within 48 hours',
'Refund Policy - BDMart',
'Understand BDMart''s refund policy including eligibility, process, and timeline for getting your money back.'),

('shipping-info', 'Shipping Info', 
'# Shipping Information

Everything you need to know about BDMart deliveries.

## Delivery Coverage

We deliver to all 64 districts of Bangladesh!

### Delivery Times

**Dhaka City**: 1-2 business days
**Dhaka Suburbs**: 2-3 business days
**Divisional Cities**: 3-5 business days
**Other Areas**: 5-7 business days

*Note: Times may vary during peak seasons and holidays.*

## Shipping Charges

| Order Value | Dhaka | Outside Dhaka |
|-------------|-------|---------------|
| Below ৳1,000 | ৳60 | ৳120 |
| ৳1,000 - ৳1,999 | ৳40 | ৳80 |
| ৳2,000+ | FREE | FREE |

## Express Delivery

Need it faster? Select Express Delivery at checkout:
- **Dhaka**: Same day / Next day (additional ৳100)
- **Major Cities**: 1-2 days (additional ৳150)

## Tracking Your Order

Track your shipment in real-time:
1. Go to Track Order page
2. Enter your order number
3. View live status updates

## Delivery Partners

We work with trusted partners:
- Pathao
- Steadfast
- RedX
- Sundarban Courier

## Delivery Instructions

Add special instructions during checkout:
- Gate code
- Landmark details
- Preferred time window
- Call before delivery',
'Shipping Information - BDMart',
'Find BDMart shipping rates, delivery times, and coverage areas. We deliver to all 64 districts of Bangladesh.'),

('seller-policy', 'Seller Policy', 
'# Seller Policy

Guidelines for selling on BDMart.

## Becoming a Seller

**Requirements**:
- Valid NID or Trade License
- Active mobile number
- Bank account or bKash/Nagad
- Product photos and descriptions

## Commission Structure

| Seller Level | Commission Rate |
|--------------|-----------------|
| Bronze (New) | 10% |
| Silver | 8% |
| Gold | 6% |

*Commission is deducted from each sale.*

## Product Guidelines

**Allowed**:
- Electronics & Accessories
- Fashion & Apparel
- Home & Living
- Health & Beauty
- Sports & Outdoors
- Books & Stationery

**Prohibited**:
- Counterfeit products
- Illegal items
- Weapons
- Adult content
- Hazardous materials

## Order Fulfillment

- Process orders within 24 hours
- Ship within 2 business days
- Provide tracking information
- Package items securely

## Quality Standards

- Accurate product descriptions
- High-quality images
- Genuine products only
- Responsive customer service

## Payment Settlement

- Weekly settlements
- Minimum withdrawal: ৳500
- Bank transfer or mobile wallet

## Policy Violations

Violations may result in:
- Warning
- Listing removal
- Account suspension
- Permanent ban',
'Seller Policy - BDMart',
'Read the seller policy for BDMart marketplace. Learn about commission rates, product guidelines, and seller requirements.'),

('payment-methods', 'Payment Methods', 
'# Payment Methods

Choose from multiple secure payment options.

## Mobile Wallets

### bKash
Bangladesh''s most popular mobile payment service.
- Instant payment confirmation
- No additional charges
- Available 24/7

### Nagad
Fast and secure mobile financial service.
- Quick checkout
- Wide accessibility
- Real-time processing

## Cards

### Visa & MasterCard
Credit and debit cards accepted.
- 3D Secure authentication
- Encrypted transactions
- EMI available on select cards

## Cash on Delivery (COD)

Pay when you receive your order.
- Available nationwide
- No advance payment needed
- Inspect before paying
- COD charge: ৳10

## BDMart Wallet

Use your BDMart Wallet balance.
- Instant checkout
- Earn cashback
- Store refunds
- Gift card redemption

## Payment Security

Your payments are protected by:
- SSL Encryption
- PCI DSS Compliance
- Fraud Detection Systems
- Secure Payment Gateways

## Payment Issues?

**Payment Failed?**
- Check internet connection
- Verify card/account balance
- Try different payment method

**Overcharged?**
- Contact support immediately
- Provide transaction details
- Refund within 48 hours',
'Payment Methods - BDMart',
'Explore payment options at BDMart including bKash, Nagad, cards, and cash on delivery.'),

('help-center', 'Help Center', 
'# Help Center

Welcome to BDMart Help Center. How can we assist you today?

## Popular Topics

### 🛒 Orders & Checkout
- How to place an order
- Applying coupon codes
- Order cancellation
- Bulk ordering

### 📦 Delivery & Shipping
- Delivery times
- Shipping charges
- Track my order
- Change delivery address

### 🔄 Returns & Refunds
- Return policy
- How to return items
- Refund status
- Exchange process

### 👤 Account & Profile
- Create an account
- Update profile
- Reset password
- Delete account

### 💳 Payments
- Payment methods
- Payment failed
- Refund timeline
- Gift cards

### 🏪 For Sellers
- Become a seller
- Seller dashboard
- Product listing
- Payment settlement

## Contact Support

### Live Chat
Available 9 AM - 10 PM (Sat-Thu)
Click the chat icon at bottom right

### Phone
+880 1234-567890
9 AM - 10 PM (Sat-Thu)

### Email
support@bdmart.com
Response within 24 hours

### Social Media
- Facebook: @bdmart
- Instagram: @bdmart_bd

## Self-Service Tools

- Track Order
- Return Request
- Download Invoice
- Update Address',
'Help Center - BDMart Customer Support',
'Get help with your BDMart orders, delivery, returns, payments, and account. Contact our support team.');