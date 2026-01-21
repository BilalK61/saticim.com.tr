import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Calendar, Search, ArrowDown, ArrowUp } from 'lucide-react';

const GameScores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        fetchScores();
    }, [selectedMonth, selectedYear]);

    const fetchScores = async () => {
        setLoading(true);
        try {
            // Calculate start and end dates for the selected month
            const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
            const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999).toISOString();

            const { data: scoresData, error } = await supabase
                .from('game_scores')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('score', { ascending: false });

            if (error) throw error;

            if (scoresData && scoresData.length > 0) {
                // Fetch profiles
                const userIds = [...new Set(scoresData.map(s => s.user_id))];
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, email')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                const profilesMap = {};
                profiles.forEach(p => profilesMap[p.id] = p);

                const mergedScores = scoresData.map(s => ({
                    ...s,
                    user: profilesMap[s.user_id] || { username: 'Bilinmeyen', email: 'bilinmiyor' }
                }));

                setScores(mergedScores);
            } else {
                setScores([]);
            }

        } catch (error) {
            console.error('Skorlar çekilirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sorted = [...scores].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        setScores(sorted);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Oyun Skorları
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Fiyat tahmin oyunu sıralaması ve skor geçmişi</p>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <Calendar size={18} className="text-gray-400 ml-2" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="p-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
                    >
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="p-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
                ) : scores.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 w-16">#</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Kullanıcı</th>
                                    <th
                                        className="px-6 py-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort('score')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Skor
                                            {sortConfig.key === 'score' && (
                                                sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Tarih
                                            {sortConfig.key === 'created_at' && (
                                                sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scores.map((score, index) => (
                                    <tr key={score.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {score.user.avatar_url ? (
                                                        <img src={score.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-400">
                                                            {(score.user.username?.[0] || score.user.email?.[0] || '?').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {score.user.full_name || score.user.username || 'Kullanıcı'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {score.user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold">
                                                <Trophy size={14} className="text-blue-500" />
                                                {score.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(score.created_at).toLocaleString('tr-TR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Skor Bulunamadı</h3>
                        <p className="text-gray-500">Seçilen tarih aralığında oyun skoru bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameScores;
