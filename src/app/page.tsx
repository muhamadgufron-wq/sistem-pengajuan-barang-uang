import { redirect } from 'next/navigation';

export default function HomePage() {
  // Langsung arahkan pengguna ke halaman login saat mereka mengunjungi halaman utama.
  redirect('/login');

  // Anda bisa return null atau biarkan kosong karena redirect akan terjadi sebelum render.
  return null;
}