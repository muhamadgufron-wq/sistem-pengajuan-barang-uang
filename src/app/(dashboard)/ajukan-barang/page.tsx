'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function AjukanBarangPage() {
  const supabase = createClient();
  const router = useRouter();
  
  // State utama: sekarang berupa array of objects
  const [items, setItems] = useState([{ nama_barang: '', jumlah: 1, alasan: '' }]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null);

  // Cek user saat komponen dimuat
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  // Fungsi untuk mengubah data item pada index tertentu
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Fungsi untuk menambah item baru ke dalam form
  const handleAddItem = () => {
    setItems([...items, { nama_barang: '', jumlah: 1, alasan: '' }]);
  };

  // Fungsi untuk menghapus item dari form
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return; // Jangan hapus jika hanya tersisa satu item
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Fungsi untuk submit semua data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Sesi Anda berakhir, silakan login kembali.");
      router.push('/login');
      return;
    }

    // Menambahkan user_id ke setiap item sebelum mengirim
    const itemsToInsert = items.map(item => ({
      ...item,
      user_id: user.id
    }));

    // Menggunakan insert dengan array untuk multiple insert
    const { error } = await supabase.from('pengajuan_barang').insert(itemsToInsert);

    if (error) {
      setMessage('Gagal mengajukan: ' + error.message);
      setIsSuccess(false);
    } else {
      setMessage('Semua pengajuan barang berhasil dikirim!');
      setIsSuccess(true);
      // Reset form ke kondisi awal
      setItems([{ nama_barang: '', jumlah: 1, alasan: '' }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengajuan Barang</h1>
              <p className="mt-1 text-gray-600">Tambah satu atau beberapa barang sekaligus.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline whitespace-nowrap">
              &larr; Kembali
            </Link>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mapping setiap item menjadi satu card form */}
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 relative transition-all hover:border-indigo-400">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">Pengajuan ke {index + 1}</h3>
                    {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-700">Nama Barang</label>
                    <input type="text" value={item.nama_barang} onChange={(e) => handleItemChange(index, 'nama_barang', e.target.value)} className="w-full px-4 py-2 mt-1 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-700">Jumlah</label>
                    <input type="number" value={item.jumlah} onChange={(e) => handleItemChange(index, 'jumlah', parseInt(e.target.value))} className="w-full px-4 py-2 mt-1 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" min="1" required />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Alasan Pengajuan</label>
                  <textarea value={item.alasan} onChange={(e) => handleItemChange(index, 'alasan', e.target.value)} className="w-full px-4 py-2 mt-1 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" required></textarea>
                </div>
              </div>
            ))}

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="button" onClick={handleAddItem} className="w-full sm:w-auto px-6 py-3 font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-colors">
                Tambah Barang Lain
              </button>
              <button type="submit" className="w-full sm:w-auto flex-grow px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-colors">
                Kirim Semua Pengajuan
              </button>
            </div>
          </form>
          
          {message && (
            <div className={`p-4 mt-6 text-sm rounded-lg ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}