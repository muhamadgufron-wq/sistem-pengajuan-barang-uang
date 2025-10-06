'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

// Import komponen UI dari shadcn
import { Button } from '@/components/ui/button';

// Komponen Card untuk Dashboard
const DashboardCard = ({ href, icon, title, description, isAdminCard = false }: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    isAdminCard?: boolean;
}) => (
    <Link href={href} className={`group block p-6 bg-card border rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 ${isAdminCard ? 'border-destructive/50 hover:border-destructive' : 'hover:border-primary'}`}>
        <div className="flex items-center">
            {icon}
            <h2 className="ml-4 text-xl font-bold text-card-foreground">{title}</h2>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </Link>
);

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState('');
    const [fullName, setFullName] = useState(''); // State untuk menyimpan nama

    useEffect(() => {
        const checkUserAndRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                // Ambil data 'role' DAN 'full_name'
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name') // Minta data full_name juga
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setUserRole(profile.role);
                    setFullName(profile.full_name); // Simpan nama ke state
                }
            }
        };
        checkUserAndRole();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user || !userRole) {
        return <div className="min-h-screen flex items-center justify-center bg-secondary/40">Memuat...</div>;
    }

    return (
        <div className="min-h-screen bg-secondary/40">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                        {/* Menampilkan nama, atau email jika nama kosong */}
                        <p className="text-sm text-muted-foreground">Selamat datang, {fullName || user.email}</p>
                    </div>
                    <Button onClick={handleLogout} variant="destructive">
                        Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Logika Tampilan Berdasarkan Peran */}
                {userRole === 'superadmin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DashboardCard 
                            href="/admin"
                            title="Panel Pengajuan"
                            description="Lihat dan kelola semua pengajuan dari karyawan."
                            icon={<svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3V7h2a4 4 0 004-4v-2m4 6h.01M16 21h2a2 2 0 002-2v-3h-4v5zM16 3h2a2 2 0 012 2v3h-4V3z"></path></svg>}
                        />
                        <DashboardCard 
                            href="/manage-users"
                            title="Manajemen User"
                            description="Tambah, hapus, dan ubah peran user di sistem."
                            isAdminCard={true}
                            icon={<svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                        />
                    </div>
                )}

                {userRole === 'admin' && (
                    <div className="flex justify-center items-center">
                        <div className="w-full md:w-2/3 lg:w-1/2">
                            <DashboardCard 
                                href="/admin"
                                title="Panel Admin"
                                description="Kelola semua pengajuan dari karyawan dan ubah status."
                                isAdminCard={true}
                                icon={<svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            />
                        </div>
                    </div>
                )}

                {userRole === 'karyawan' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DashboardCard 
                            href="/ajukan-barang"
                            title="Ajukan Barang"
                            description="Buat permintaan pengadaan untuk barang atau aset baru."
                            icon={<svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        />
                        <DashboardCard 
                            href="/ajukan-uang"
                            title="Ajukan Uang"
                            description="Buat permintaan untuk pencairan dana keperluan operasional."
                            icon={<svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <DashboardCard 
                            href="/status-pengajuan"
                            title="Riwayat & Status"
                            description="Lihat status dan riwayat semua pengajuan yang telah Anda buat."
                            icon={<svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}