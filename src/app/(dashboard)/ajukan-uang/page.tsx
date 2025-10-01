'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function AjukanUangPage() {
  const supabase = createClient();
  
  // State baru untuk form, termasuk nomor rekening dan atas nama
  const [namaBank, setNamaBank] = useState('BCA');
  const [bankLainnya, setBankLainnya] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [jumlahUang, setJumlahUang] = useState('');
  const [keperluan, setKeperluan] = useState('');
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sesi Anda berakhir, silakan login kembali.");
      router.push('/login');
      return;
    }
    
    const finalBankName = namaBank === 'Lainnya' ? bankLainnya : namaBank;
    
    if (namaBank === 'Lainnya' && !bankLainnya) {
        setMessage('Harap isi nama bank lainnya.');
        setIsSuccess(false);
        return;
    }

    const { error } = await supabase.from('pengajuan_uang').insert({
      jumlah_uang: parseInt(jumlahUang),
      keperluan: keperluan,
      nama_bank: finalBankName,
      nomor_rekening: nomorRekening, // Menyimpan field baru
      atas_nama: atasNama,         // Menyimpan field baru
      user_id: user.id
    });

    if (error) {
      setMessage('Gagal mengajukan: ' + error.message);
      setIsSuccess(false);
    } else {
      setMessage('Pengajuan uang berhasil dikirim!');
      setIsSuccess(true);
      // Reset semua field form
      setNamaBank('BCA');
      setBankLainnya('');
      setNomorRekening('');
      setAtasNama('');
      setJumlahUang('');
      setKeperluan('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Formulir Pengajuan Uang</h1>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
            &larr; Kembali
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Rekening Tujuan</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Nama Bank</label>
                    <select value={namaBank} onChange={(e) => setNamaBank(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>BCA</option>
                        <option>Mandiri</option>
                        <option>BNI</option>
                        <option>BRI</option>
                        <option>Lainnya</option>
                    </select>
                </div>
                {namaBank === 'Lainnya' && (
                    <div>
                        <label className="text-sm font-medium text-gray-700">Ketik Nama Bank</label>
                        <input type="text" value={bankLainnya} onChange={(e) => setBankLainnya(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Bank Jago" required />
                    </div>
                )}
                <div>
                    <label className="text-sm font-medium text-gray-700">Nomor Rekening</label>
                    <input type="text" value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: 1234567890" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Atas Nama (Sesuai Buku Tabungan)</label>
                    <input type="text" value={atasNama} onChange={(e) => setAtasNama(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Budi Setiawan" required />
                </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Detail Pengajuan</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Nominal Pengajuan (Rp)</label>
                    <input type="number" value={jumlahUang} onChange={(e) => setJumlahUang(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: 500000" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Keperluan</label>
                    <textarea value={keperluan} onChange={(e) => setKeperluan(e.target.value)} className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4" placeholder="Contoh: Pembelian ATK untuk kebutuhan kantor bulan Oktober" required></textarea>
                </div>
            </div>
          </div>
          
          <button type="submit" className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors !mt-8">
            Kirim Pengajuan
          </button>
        </form>
        
        {message && (
          <div className={`p-4 mt-4 text-sm rounded-lg ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}