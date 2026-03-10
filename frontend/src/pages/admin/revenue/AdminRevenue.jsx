import './AdminRevenue.css';
import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

const AdminRevenue = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/bookings/revenue');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching revenue stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="admin-revenue__loading">
                <div className="admin-revenue__spinner"></div>
            </div>
        );
    }

    const maxMonthlyRevenue = Math.max(...(stats?.monthlyRevenue || [1000]), 100);
    const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const totalServiceValue = stats?.serviceBreakdown.reduce((sum, s) => sum + s.value, 0) || 1;

    return (
        <div className="admin-revenue">
            <div className="admin-revenue__top-cards">
                <RevenueBigCard label="This Month" value={`Rs. ${stats?.thisMonth?.toLocaleString() || '0'}`} delta="Live update" up />
                <RevenueBigCard label="This Year" value={`Rs. ${stats?.thisYear?.toLocaleString() || '0'}`} delta="Fiscal year 2026" up />
                <RevenueBigCard label="Avg Per Job" value={`Rs. ${Math.round(stats?.avgJobValue || 0).toLocaleString()}`} delta="Efficiency metric" up />
            </div>

            <div className="admin-revenue__charts-row">
                <section className="admin-revenue__panel">
                    <div className="admin-revenue__panel-head">
                        <h3 className="admin-revenue__panel-title">Revenue Analytics</h3>
                        <div className="admin-revenue__range-tabs">
                            <button className="admin-revenue__range-tab">W</button>
                            <button className="admin-revenue__range-tab">M</button>
                            <button className="admin-revenue__range-tab admin-revenue__range-tab--active">Y</button>
                        </div>
                    </div>
                    <div className="admin-revenue__bar-chart">
                        {stats?.monthlyRevenue ? stats.monthlyRevenue.map((amt, i) => {
                            const barPct = Math.max((amt / maxMonthlyRevenue) * 100, 2);
                            const roundedBarPct = Math.min(100, Math.max(5, Math.round(barPct / 5) * 5));
                            return (
                                <div key={monthLabels[i]} className={`admin-revenue__bar admin-revenue__bar--h${roundedBarPct}`}>
                                    <div className="admin-revenue__bar-tip">{monthLabels[i]}: Rs. {amt.toLocaleString()}</div>
                                </div>
                            );
                        }) : (
                            <div className="admin-revenue__empty">No monthly data available</div>
                        )}
                    </div>
                    <div className="admin-revenue__month-row">
                        {monthLabels.map((m) => <span key={m}>{m}</span>)}
                    </div>
                </section>

                <section className="admin-revenue__panel">
                    <div className="admin-revenue__panel-head">
                        <h3 className="admin-revenue__panel-title">Service Breakdown</h3>
                    </div>
                    <div className="admin-revenue__breakdown-list">
                        {stats?.serviceBreakdown.length === 0 ? (
                            <div className="admin-revenue__empty admin-revenue__empty--padded">No data available</div>
                        ) : (
                            stats?.serviceBreakdown.map((s, i) => (
                                <BreakdownRow
                                    key={s.name}
                                    label={s.name}
                                    pct={Math.round((s.value / totalServiceValue) * 100)}
                                    amt={`Rs. ${s.value.toLocaleString()}`}
                                    color={['orange', 'blue', 'green', 'purple', 'gray'][i % 5]}
                                    isLast={i === stats.serviceBreakdown.length - 1}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            <section className="admin-revenue__panel admin-revenue__panel--table">
                <div className="admin-revenue__panel-head admin-revenue__panel-head--soft">
                    <h3 className="admin-revenue__panel-title">Mechanic Performance</h3>
                </div>
                <div className="admin-revenue__table-wrap">
                    <table className="admin-revenue__table">
                        <thead>
                            <tr>
                                <th>Mechanic</th>
                                <th>Total Jobs</th>
                                <th>Revenue Generated</th>
                                <th>Avg Job Value</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.mechanicPerformance.length === 0 ? (
                                <tr><td colSpan="5" className="admin-revenue__table-empty">No mechanic data available</td></tr>
                            ) : (
                                stats?.mechanicPerformance.map((m, i) => (
                                    <RevMechRow
                                        key={m.name}
                                        initials={getInitials(m.name)}
                                        name={m.name}
                                        color={['violet', 'amber', 'blue', 'green'][i % 4]}
                                        jobs={m.jobs}
                                        revenue={`Rs. ${m.revenue.toLocaleString()}`}
                                        avg={`Rs. ${Math.round(m.avg).toLocaleString()}`}
                                        rating="Active"
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const RevenueBigCard = ({ label, value, delta, up }) => (
    <div className="admin-revenue-card">
        <div className="admin-revenue-card__label">{label}</div>
        <div className="admin-revenue-card__value">{value}</div>
        <div className="admin-revenue-card__delta">
            <span>{up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}</span>
            {delta}
        </div>
    </div>
);

const BreakdownRow = ({ label, pct, amt, color, isLast }) => {
    const width = pct >= 100 ? 100 : pct >= 90 ? 90 : pct >= 80 ? 80 : pct >= 70 ? 70 : pct >= 60 ? 60 : pct >= 50 ? 50 : pct >= 40 ? 40 : pct >= 30 ? 30 : pct >= 20 ? 20 : pct >= 10 ? 10 : 5;
    return (
        <div className={`admin-breakdown-row ${isLast ? 'admin-breakdown-row--last' : ''}`}>
            <div className="admin-breakdown-row__label">{label}</div>
            <div className="admin-breakdown-row__track">
                <div className={`admin-breakdown-row__fill admin-breakdown-row__fill--${color} admin-breakdown-row__fill--w${width}`}></div>
            </div>
            <div className="admin-breakdown-row__pct">{pct}%</div>
            <div className="admin-breakdown-row__amt">{amt}</div>
        </div>
    );
};

const RevMechRow = ({ initials, name, color, jobs, revenue, avg, rating }) => (
    <tr className="admin-rev-mech-row">
        <td>
            <div className="admin-rev-mech-row__name-wrap">
                <div className={`admin-rev-mech-row__avatar admin-rev-mech-row__avatar--${color}`}>{initials}</div>
                <span className="admin-rev-mech-row__name">{name}</span>
            </div>
        </td>
        <td className="admin-rev-mech-row__jobs">{jobs}</td>
        <td className="admin-rev-mech-row__revenue">{revenue}</td>
        <td className="admin-rev-mech-row__avg">{avg}</td>
        <td className="admin-rev-mech-row__status"><Star size={14} /> <span>{rating}</span></td>
    </tr>
);

export default AdminRevenue;
