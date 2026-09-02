# Start Homes

Start Homes is a modern real estate platform that enables users to browse, search, and view properties, as well as submit viewing inquiries and property listing requests. It features a secure administrative dashboard for managing listings and customer interactions.

## Architecture

This project is built as a static web application that interfaces directly with a Supabase PostgreSQL database. It utilizes Supabase Row Level Security (RLS) to ensure that all database operations are secure. The architecture eliminates the need for a dedicated backend server, making it ideal for high-performance deployment on Edge networks like Cloudflare Pages.

- Frontend: HTML5, CSS3, Vanilla JavaScript, Tailwind CSS.
- Backend/Database: Supabase (PostgreSQL), REST API, Row Level Security (RLS).
- Authentication: Supabase Auth (JWT).

## Features

- Public Property Listings: Browse properties with dynamic filtering by city, type, and price.
- Dynamic Property Details: View comprehensive information and image galleries for individual properties.
- Lead Generation: Securely submit viewing requests and property sale requests.
- Secure Admin Dashboard: Token-gated dashboard for managing properties and viewing client inquiries.

## Security Implementation

The application employs a Zero-Trust data model:
- The Supabase Anon Key is used purely for identification and routing.
- All data access is strictly governed by PostgreSQL Row Level Security (RLS).
- Public users are restricted to read-only access for properties and insert-only access for their own inquiries.
- Administrative capabilities (Insert, Update, Delete) require a valid JWT session obtained via Supabase Auth.

## Deployment

The application is designed to be hosted on any static hosting provider.

1. Cloudflare Pages (Recommended): Connect this repository to Cloudflare Pages and deploy. No build step is required.
2. GitHub Pages / Vercel / Netlify: Serve the root directory as a static site.

All API routes and authentication mechanisms will automatically utilize the configured Supabase endpoints.

## Database Schema setup

To replicate the required database architecture, execute the following SQL in your Supabase SQL Editor:

```sql
alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.seller_requests enable row level security;

create policy "Anyone can view properties" on public.properties for select using (true);
create policy "Admins can insert properties" on public.properties for insert to authenticated with check (true);
create policy "Admins can update properties" on public.properties for update to authenticated using (true) with check (true);
create policy "Admins can delete properties" on public.properties for delete to authenticated using (true);

create policy "Public can submit viewing inquiries" on public.inquiries for insert with check (true);
create policy "Only Admins can read inquiries" on public.inquiries for select to authenticated using (true);
create policy "Only Admins can update inquiries" on public.inquiries for update to authenticated using (true);

create policy "Public can submit property to sell" on public.seller_requests for insert with check (true);
create policy "Only Admins can read seller requests" on public.seller_requests for select to authenticated using (true);
create policy "Only Admins can update seller requests" on public.seller_requests for update to authenticated using (true);
```
