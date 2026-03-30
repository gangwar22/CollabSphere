import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { FileText, Files, Users, BarChart } from 'lucide-react';

const AnalyticsPanel = ({ projectId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await API.get(`/analytics/${projectId}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [projectId]);

    if (loading) return <div className="text-center py-10 opacity-50">Calculating analytics...</div>;
    if (!data) return <div className="text-center py-10 opacity-50 text-red-500 text-xs uppercase tracking-widest font-bold">Analytics Unavailable</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Notes', value: data.projectSummary.totalNotes, icon: FileText, color: 'text-blue-500' },
                    { label: 'Total Files', value: data.projectSummary.totalFiles, icon: Files, color: 'text-purple-500' },
                    { label: 'Total Members', value: data.projectSummary.memberCount, icon: Users, color: 'text-green-500' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl">
                        <div className={`p-2 w-fit rounded-lg bg-dark-bg ${stat.color} mb-4`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-dark-muted text-xs uppercase font-bold tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="glass p-8 rounded-2xl">
                <div className="flex items-center space-x-2 mb-8">
                    <BarChart className="text-primary-500" size={20} />
                    <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Contribution Leaderboard</h4>
                </div>

                <div className="space-y-6">
                    {data.memberActivity.map((member, i) => (
                        <div key={member.userId}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-white">{member.name}</span>
                                <span className="text-xs text-dark-muted">{member.notesCreated + member.filesUploaded} total contributions</span>
                            </div>
                            <div className="flex h-2 rounded-full bg-dark-bg overflow-hidden">
                                <div
                                    className="bg-primary-500 transition-all duration-1000"
                                    style={{ width: `${(member.notesCreated / (data.projectSummary.totalNotes || 1)) * 100}%` }}
                                />
                                <div
                                    className="bg-purple-500 transition-all duration-1000"
                                    style={{ width: `${(member.filesUploaded / (data.projectSummary.totalFiles || 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] uppercase font-bold tracking-widest opacity-50">
                                <span className="text-primary-400">{member.notesCreated} Notes</span>
                                <span className="text-purple-400">{member.filesUploaded} Files</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
