// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side redirect to the /sign-in page
  redirect('/sign-in');
}
