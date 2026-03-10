import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import './AdminCustomers.css';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customer/all');
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="admin-customers__loading">
                <div className="admin-customers__spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-customers">
            <div className="admin-customers__topbar">
                <div className="admin-customers__count">{customers.length} total customers</div>
                <div className="admin-customers__search-group">
                    <div className="admin-customers__search-wrap">
                        <span className="admin-customers__search-icon">🔍</span>
                        <input placeholder="Search customers..." className="admin-customers__search-input" />
                    </div>
                </div>
            </div>

            <div className="admin-customers__grid">
                {customers.length === 0 ? (
                    <div className="admin-customers__empty">No customers found.</div>
                ) : (
                    customers.map(customer => (
                        <div key={customer.id} className="admin-customers__card">
                            <div className="admin-customers__card-head">
                                <div className="admin-customers__avatar">{getInitials(customer.name)}</div>
                                <div className="admin-customers__identity">
                                    <div className="admin-customers__name">{customer.name}</div>
                                    <div className="admin-customers__email">{customer.email}</div>
                                </div>
                            </div>

                            <div className="admin-customers__metrics">
                                <Metric label="Visits" value={customer.visits} />
                                <Metric label="Spent" value={`$${customer.spent}`} />
                                <Metric label="Rating" value="5.0★" isLast />
                            </div>

                            <div className="admin-customers__tags">
                                {customer.vehicles.map(tag => (
                                    <span key={tag} className="admin-customers__tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const Metric = ({ label, value, isLast }) => (
    <div className={`admin-customers__metric ${isLast ? '' : 'admin-customers__metric--divider'}`}>
        <div className="admin-customers__metric-value">{value}</div>
        <div className="admin-customers__metric-label">{label}</div>
    </div>
);

export default AdminCustomers;

