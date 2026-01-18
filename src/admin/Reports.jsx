import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AlertTriangle, CheckCircle, XCircle, Search, Eye, ExternalLink } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, all, resolved

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('listing_reports')
                .select(`
                    *,
                    listings:listing_id (
                        title,
                        price,
                        currency,
                        category
                    ),
                    reporter:profiles (
                        full_name,
                        username
                    )
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                if (filter === 'resolved' || filter === 'dismissed') {
                    query = query.in('status', ['resolved', 'dismissed']);
                } else {
                    query = query.eq('status', 'pending');
                }
            }

            const { data, error } = await query;

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('listing_reports')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setReports(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            ));

            // Refetch if simple filter requires removal
            if (filter === 'pending' && newStatus !== 'pending') {
                setReports(prev => prev.filter(r => r.id !== id));
            }

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Durum güncellenemedi.");
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            resolved: "bg-green-100 text-green-800",
            dismissed: "bg-gray-100 text-gray-800",
            reviewed: "bg-blue-100 text-blue-800"
        };
        const labels = {
            pending: "Bekliyor",
            resolved: "Çözüldü",
            dismissed: "Reddedildi",
            reviewed: "İncelendi"
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">İlan Şikayetleri</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Tümü
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">İlan</th>
                                <th className="px-6 py-4">Bildiren</th>
                                <th className="px-6 py-4">Neden</th>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Şikayet bulunamadı.</td></tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            {report.listings ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 truncate max-w-xs">{report.listings.title}</span>
                                                    <a href={`/ilan-detay/${report.listing_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1 mt-1">
                                                        İlana Git <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Silinmiş İlan ({report.listing_id})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.reporter ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{report.reporter.full_name || report.reporter.username}</span>
                                                    <span className="text-gray-500 text-xs">{report.reporter.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Anonim</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <div className="font-medium text-red-600 mb-1">{report.reason}</div>
                                                <p className="text-gray-600 text-xs line-clamp-2">{report.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(report.created_at).toLocaleDateString('tr-TR')}
                                            <div className="text-xs">{new Date(report.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={report.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {report.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'dismissed')}
                                                        title="Reddet"
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'resolved')}
                                                        title="Çözüldü olarak işaretle"
                                                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
