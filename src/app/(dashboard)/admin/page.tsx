'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { toast } from "sonner";

// Import semua komponen shadcn yang kita butuhkan
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, SearchIcon, FilterIcon, RefreshCcwIcon } from 'lucide-react'; // Import ikon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Untuk Date Picker
import { Calendar } from '@/components/ui/calendar'; // Untuk Date Picker
import { format } from 'date-fns'; // Untuk format tanggal

// Komponen Badge Status
const StatusBadge = ({ status }: { status: string }) => {
    let statusClasses = "";
    switch (status?.toLowerCase()) {
        case 'disetujui': statusClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"; break;
        case 'ditolak': statusClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"; break;
        default: statusClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"; break;
    }
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClasses}`}>{status}</span>;
};

// Define types for your data
interface PengajuanBarang {
    id: number;
    created_at: string;
    nama_barang: string;
    jumlah: number;
    alasan: string;
    status: string;
    user_id: string;
    full_name: string;
    catatan_admin: string;
}

interface PengajuanUang {
    id: number;
    created_at: string;
    jumlah_uang: number;
    keperluan: string;
    status: string;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
    user_id: string;
    full_name: string;
    catatan_admin: string;
}


export default function AdminPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [pengajuanBarang, setPengajuanBarang] = useState<PengajuanBarang[]>([]);
    const [pengajuanUang, setPengajuanUang] = useState<PengajuanUang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('barang');
    
    // State untuk filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    
    // State untuk Dialog (Modal)
    const [selectedItem, setSelectedItem] = useState<PengajuanBarang | PengajuanUang | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        
        // Convert Date objects to YYYY-MM-DD string for RPC call
        const rpcParams = {
            search_query: searchQuery || null,
            status_filter: statusFilter || null,
            start_date_filter: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            end_date_filter: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        };

        const { data: barangData, error: barangError } = await supabase.rpc('get_all_barang_submissions', rpcParams);
        const { data: uangData, error: uangError } = await supabase.rpc('get_all_uang_submissions', rpcParams);
        
        if(barangError) toast.error("Error fetching barang submissions", { description: barangError.message });
        if(uangError) toast.error("Error fetching uang submissions", { description: uangError.message });

        setPengajuanBarang(barangData || []);
        setPengajuanUang(uangData || []);
        setIsLoading(false);
    }, [supabase, searchQuery, statusFilter, startDate, endDate]);

    useEffect(() => {
        const checkAdminAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
                router.push('/dashboard'); // Jika tidak diizinkan, tendang ke dashboard
             return;
            }
            
            fetchData();
        };
        checkAdminAndFetchData();
    }, [fetchData, router, supabase]);

    const handleUpdate = async () => {
        if (!selectedItem || !newStatus) return;
        const tableName = activeTab === 'barang' ? 'pengajuan_barang' : 'pengajuan_uang';

        const { error } = await supabase.from(tableName)
            .update({ status: newStatus, catatan_admin: adminNote })
            .eq('id', selectedItem.id);

        if (error) {
            toast.error("Update Gagal", { description: error.message });
        } else {
            toast.success("Update Berhasil", { description: `Status untuk pengajuan #${selectedItem.id} telah diubah.` });
            setSelectedItem(null); // Tutup dialog
            fetchData(); // Muat ulang data
        }
    };

    const openUpdateDialog = (item: PengajuanBarang | PengajuanUang) => {
        setSelectedItem(item);
        setNewStatus(item.status);
        setAdminNote(item.catatan_admin || '');
    };

    const handleFilterReset = () => {
        setSearchQuery('');
        setStatusFilter('');
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const displayedData = activeTab === 'barang' ? pengajuanBarang : pengajuanUang;

    return (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h1 className="text-4xl font-extrabold text-gray-900">Admin Panel</h1>
                        <Button variant="ghost" asChild className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors">
                            <Link href="/dashboard">← Kembali</Link>
                        </Button>
                    </div>

                    {/* Filter Section */}
                    <Card className="shadow-lg border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary">
                                <FilterIcon className="h-5 w-5" /> Filter Pengajuan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari pemohon / item..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                
                                <Select onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)} value={statusFilter || 'all'}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="disetujui">Disetujui</SelectItem>
                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : <span>Dari Tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : <span>Sampai Tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <Button onClick={fetchData} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                    <SearchIcon className="mr-2 h-4 w-4" /> Terapkan Filter
                                </Button>
                                <Button onClick={handleFilterReset} variant="outline">
                                    <RefreshCcwIcon className="mr-2 h-4 w-4" /> Reset Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs for Pengajuan Barang / Uang */}
                    <Card className="shadow-lg border border-gray-100">
                        <CardHeader className="p-0">
                            <nav className="px-6 bg-gray-50">
                                <div className="-mb-px flex space-x-8">
                                    <button onClick={() => setActiveTab('barang')} className={`${activeTab === 'barang' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'} whitespace-nowrap py-4 px-1 border-b-2 transition-colors`}>
                                        Pengajuan Barang
                                    </button>
                                    <button onClick={() => setActiveTab('uang')} className={`${activeTab === 'uang' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'} whitespace-nowrap py-4 px-1 border-b-2 transition-colors`}>
                                        Pengajuan Uang
                                    </button>
                                </div>
                            </nav>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Table className="min-w-full">
                                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                    <TableRow className="border-b">
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Pemohon</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Detail Pengajuan</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tanggal</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Memuat data...</TableCell></TableRow>
                                    ) : displayedData.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Tidak ada data pengajuan yang cocok.</TableCell></TableRow>
                                    ) : (
                                        displayedData.map(item => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.full_name || 'Tanpa Nama'}</TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {activeTab === 'barang' 
                                                        ? `${item.nama_barang} (${item.jumlah} unit)` 
                                                        : `Rp ${Number((item as PengajuanUang).jumlah_uang).toLocaleString('id-ID')} - ${(item as PengajuanUang).keperluan}`
                                                    }
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap"><StatusBadge status={item.status} /></TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button variant="outline" size="sm" onClick={() => openUpdateDialog(item)} className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-colors">
                                                        Update Status
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Dialog for Update Status */}
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Update Status Pengajuan #{selectedItem?.id}</DialogTitle>
                            <DialogDescription>
                                Ubah status dan berikan catatan untuk pemohon.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Baru</label>
                                <Select onValueChange={setNewStatus} value={newStatus}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="disetujui">Disetujui</SelectItem>
                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Catatan Admin</label>
                                <Textarea
                                    placeholder="Tulis catatan untuk pemohon di sini..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 text-white transition-colors">
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </DialogContent>

                </div>
            </div>
        </Dialog>
    );
}