'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

// Komponen Badge Status (tidak berubah)
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    let statusClasses = "";
    switch (status?.toLowerCase()) {
        case 'disetujui': statusClasses = "bg-green-100 text-green-800"; break;
        case 'ditolak': statusClasses = "bg-red-100 text-red-800"; break;
        default: statusClasses = "bg-yellow-100 text-yellow-800"; break;
    }
    return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function AdminPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [pengajuanBarang, setPengajuanBarang] = useState([]);
    const [pengajuanUang, setPengajuanUang] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('barang');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkAdminAndFetchData = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (!profile || profile.role !== 'admin') { router.push('/dashboard'); return; }

            // PANGGIL FUNGSI RPC, BUKAN .select() LAGI
            const { data: barangData, error: barangError } = await supabase.rpc('get_all_barang_submissions');
            const { data: uangData, error: uangError } = await supabase.rpc('get_all_uang_submissions');
            
            if(barangError || uangError) console.error(barangError || uangError);

            setPengajuanBarang(barangData || []);
            setPengajuanUang(uangData || []);
            setIsLoading(false);
        };

        checkAdminAndFetchData();
    }, [supabase, router]);
    
    const handleStatusChange = async (table, id, newStatus) => {
        const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);

        if (error) {
            setMessage(`Gagal mengubah status: ${error.message}`);
        } else {
            setMessage('Status berhasil diperbarui!');
            if (table === 'pengajuan_barang') {
                setPengajuanBarang(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            } else {
                setPengajuanUang(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            }
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Panel - Semua Pengajuan</h1>
                    <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">&larr; Kembali</Link>
                </div>
                
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('barang')} className={`${activeTab === 'barang' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Pengajuan Barang
                        </button>
                        <button onClick={() => setActiveTab('uang')} className={`${activeTab === 'uang' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Pengajuan Uang
                        </button>
                    </nav>
                </div>
                
                <div className="mt-6">
                    {isLoading ? <p>Memuat data...</p> : (
                        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemohon</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Pengajuan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(activeTab === 'barang' ? pengajuanBarang : pengajuanUang).map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.full_name || 'Tanpa Nama'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {activeTab === 'barang' 
                                                    ? `${item.nama_barang} (${item.jumlah} unit)` 
                                                    : `Rp ${Number(item.jumlah_uang).toLocaleString('id-ID')} - ${item.nama_bank}`
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select value={item.status} onChange={(e) => handleStatusChange(activeTab === 'barang' ? 'pengajuan_barang' : 'pengajuan_uang', item.id, e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                                    <option>pending</option>
                                                    <option>disetujui</option>
                                                    <option>ditolak</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {((activeTab === 'barang' && pengajuanBarang.length === 0) || (activeTab === 'uang' && pengajuanUang.length === 0)) && (
                                <p className="text-center py-4 text-gray-500">Tidak ada data pengajuan.</p>
                            )}
                        </div>
                    )}
                </div>
                {message && <div className="fixed bottom-5 right-5 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg">{message}</div>}
            </div>
        </div>
    );
}