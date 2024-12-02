import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/sign-in_sign-up_context';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: authUser } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${API_URL}/api/orders/user/${authUser.userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to load order history');
            } finally {
                setLoading(false);
            }
        };

        if (authUser?.userId) {
            fetchOrders();
        }
    }, [authUser?.userId]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return '#4CAF50';
            case 'shipped':
                return '#2196F3';
            case 'pending':
                return '#FFC107';
            case 'cancelled':
                return '#f44336';
            case 'paid':
                return '#9C27B0';
            default:
                return '#757575';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const containerStyle = {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f4f4',
        borderRadius: '8px',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '80px',
        minHeight: 'calc(100vh - 180px)',
        overflowX: 'auto',
    };

    const wrapperStyle = {
        padding: '20px 0',
        position: 'relative',
    };

    const tableWrapperStyle = {
        overflowX: 'auto',
        marginBottom: '20px',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
    };

    const thStyle = {
        backgroundColor: '#836472',
        color: 'white',
        padding: '15px',
        textAlign: 'left',
    };

    const tdStyle = {
        padding: '15px',
        borderBottom: '1px solid #ddd',
    };

    const statusStyle = (status) => ({
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '0.85em',
        display: 'inline-block',
    });

    const headingStyle = {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px',
    };

    const loadingStyle = {
        textAlign: 'center',
        padding: '20px',
        color: '#666',
    };

    const errorStyle = {
        textAlign: 'center',
        padding: '20px',
        color: '#f44336',
    };

    if (loading) {
        return <div style={loadingStyle}>Loading order history...</div>;
    }

    if (error) {
        return <div style={errorStyle}>{error}</div>;
    }

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>
                <h2 style={headingStyle}>Order History</h2>
                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No orders found
                    </div>
                ) : (
                    <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Order ID</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.order_id}>
                                        <td style={tdStyle}>#{order.order_id}</td>
                                        <td style={tdStyle}>{formatDate(order.created_at)}</td>
                                        <td style={tdStyle}>
                                            <span style={statusStyle(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>PKR {Number(order.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;