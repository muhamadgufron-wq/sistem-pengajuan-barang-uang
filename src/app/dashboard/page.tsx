'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

// Komponen Card tidak berubah, tetap kita gunakan
const DashboardCard = ({ href, icon, title, description, isAdminCard = false }) => (
    <Link href={href} className={`group block p-8 bg-white border rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 ${isAdminCard ? 'border-red-500 hover:border-red-600' : ''}`}>
        <div className="flex items-center">
            {icon}
            <h2 className="ml-4 text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <p className="mt-4 text-gray-600">{description}</p>
    </Link>
);

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(''); // State untuk role

    useEffect(() => {
        // Logika untuk memeriksa user dan role tidak berubah, sudah benar
        const checkUserAndRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setUserRole(profile.role);
                }
            }
        };

        checkUserAndRole();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Kita tambahkan kondisi loading untuk role agar UI tidak "loncat"
    if (!user || !userRole) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Memuat...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-500">Selamat datang, {user.email} (Peran: {userRole})</p>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* INI BAGIAN UTAMA PERUBAHANNYA */}
                {userRole === 'admin' ? (
                    // TAMPILAN UNTUK ADMIN
                    <div className="flex justify-center items-center">
                        <div className="w-full md:w-2/3 lg:w-1/2">
                             <DashboardCard 
                                href="/admin"
                                title="Panel Admin"
                                description="Kelola semua pengajuan dari karyawan dan ubah status."
                                isAdminCard={true}
                                icon={<svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            />
                        </div>
                    </div>
                ) : (
                    // TAMPILAN UNTUK KARYAWAN
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DashboardCard 
                            href="/ajukan-barang"
                            title="Ajukan Barang"
                            description="Buat permintaan pengadaan untuk barang atau aset baru."
                            icon={<svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        />
                        <DashboardCard 
                            href="/ajukan-uang"
                            title="Ajukan Uang"
                            description="Buat permintaan untuk pencairan dana keperluan operasional."
                            icon={<svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <DashboardCard 
                            href="/status-pengajuan"
                            title="Riwayat & Status"
                            description="Lihat status dan riwayat semua pengajuan yang telah Anda buat."
                            icon={<svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}