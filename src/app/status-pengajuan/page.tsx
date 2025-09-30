'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

// Komponen untuk Badge Status
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    let statusClasses = "";

    switch (status.toLowerCase()) {
        case 'disetujui':
            statusClasses = "bg-green-100 text-green-800";
            break;
        case 'ditolak':
            statusClasses = "bg-red-100 text-red-800";
            break;
        default: // 'pending'
            statusClasses = "bg-yellow-100 text-yellow-800";
            break;
    }

    return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function StatusPengajuanPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [pengajuanBarang, setPengajuanBarang] = useState([]);
    const [pengajuanUang, setPengajuanUang] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('barang'); // 'barang' atau 'uang'

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Ambil data pengajuan barang dan uang secara bersamaan
            const { data: barangData, error: barangError } = await supabase
                .from('pengajuan_barang')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const { data: uangData, error: uangError } = await supabase
                .from('pengajuan_uang')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (barangError || uangError) {
                console.error("Error fetching data:", barangError || uangError);
            } else {
                setPengajuanBarang(barangData);
                setPengajuanUang(uangData);
            }
            
            setIsLoading(false);
        };

        fetchData();
    }, [supabase, router]);
    
    // Fungsi untuk format tanggal
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat & Status Pengajuan</h1>
                        <p className="mt-1 text-gray-600">Lacak semua pengajuan yang pernah Anda buat.</p>
                    </div>
                    <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
                        &larr; Kembali ke Dashboard
                    </Link>
                </div>
                
                {/* Navigasi Tab */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('barang')}
                            className={`${activeTab === 'barang' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pengajuan Barang
                        </button>
                        <button
                            onClick={() => setActiveTab('uang')}
                            className={`${activeTab === 'uang' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pengajuan Uang
                        </button>
                    </nav>
                </div>

                {/* Konten Tab */}
                <div className="mt-6">
                    {isLoading ? (
                        <p>Memuat data...</p>
                    ) : (
                        <>
                            {activeTab === 'barang' && (
                                <div className="space-y-4">
                                    {pengajuanBarang.length > 0 ? pengajuanBarang.map(item => (
                                        <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-800">{item.nama_barang} ({item.jumlah} unit)</p>
                                                    <p className="text-sm text-gray-600 mt-1">{item.alasan}</p>
                                                </div>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3 text-right">Diajukan pada: {formatDate(item.created_at)}</p>
                                        </div>
                                    )) : <p>Belum ada riwayat pengajuan barang.</p>}
                                </div>
                            )}
                            
                            {activeTab === 'uang' && (
                                <div className="space-y-4">
                                    {pengajuanUang.length > 0 ? pengajuanUang.map(item => (
                                        <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-800">Rp {Number(item.jumlah_uang).toLocaleString('id-ID')}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{item.keperluan}</p>
                                                    <p className="text-sm text-gray-500 mt-2">{item.nama_bank} - {item.nomor_rekening} (a.n {item.atas_nama})</p>
                                                </div>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3 text-right">Diajukan pada: {formatDate(item.created_at)}</p>
                                        </div>
                                    )) : <p>Belum ada riwayat pengajuan uang.</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}