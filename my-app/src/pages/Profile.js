import React, { useState, useEffect } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import styles from './Profile.module.css';
import { FaMoon, FaSun, FaShoppingBag, FaHeart, FaMoneyBillWave } from 'react-icons/fa';
import { useProfile } from '../context/profile_context';
import { useAuth } from '../context/sign-in_sign-up_context';
import axios from 'axios';

// Import the separate pages
import OrderHistory from './OrderHistory';
import AccountSettings from './AccountSettings';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { getUserDetails, updateUserProfile } = useProfile();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState({});
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [darkMode, setDarkMode] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        orderCount: 0,
        savedItemsCount: 0,
        totalSpent: 0
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (authUser?.userId) {
                    const userData = await getUserDetails(authUser.userId);
                    setUser(userData);
                    setFormData({
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                        email: userData.email
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

        // Load dark mode preference
        const storedDarkMode = JSON.parse(localStorage.getItem('darkMode'));
        if (storedDarkMode) {
            setDarkMode(storedDarkMode);
            document.body.classList.toggle('dark-mode', storedDarkMode);
        }
    }, [authUser, getUserDetails]);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (authUser?.userId) {
                try {
                    const token = localStorage.getItem('token');
                    const [ordersRes, savedItemsRes] = await Promise.all([
                        axios.get(`${API_URL}/api/users/${authUser.userId}/stats/orders`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        axios.get(`${API_URL}/api/users/${authUser.userId}/stats/saved-items`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);

                    setStats({
                        orderCount: ordersRes.data.count,
                        savedItemsCount: savedItemsRes.data.count,
                        totalSpent: ordersRes.data.totalSpent
                    });
                } catch (error) {
                    console.error('Error fetching user stats:', error);
                }
            }
        };

        fetchUserStats();
    }, [authUser?.userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile(authUser.userId, formData);
            setUser({
                ...user,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email
            });
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', JSON.stringify(!darkMode));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(URL.createObjectURL(file));
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}` : 'User Name';
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <>
                    {/* Sidebar with links to different sections */}
                    <div className={styles.sidebar}>
                        <NavLink 
                            to="/profile" 
                            className={({ isActive }) => isActive ? styles.active : ''}
                            end
                        >
                            My Profile
                        </NavLink>
                        <NavLink 
                            to="/profile/order-history" 
                            className={({ isActive }) => isActive ? styles.active : ''}
                        >
                            Order History
                        </NavLink>
                        <NavLink 
                            to="/profile/account-settings" 
                            className={({ isActive }) => isActive ? styles.active : ''}
                        >
                            Account Settings
                        </NavLink>
                        <button 
                            className={styles.logoutButton} 
                            onClick={() => {
                                // Clear all user-related data
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('darkMode');
                                // You might want to clear other user-specific data as well
                                
                                // Reset states
                                setUser({});
                                setDarkMode(false);
                                setProfileImage(null);
                                setCoverImage(null);
                                
                                // Redirect to login page
                                window.location.href = '/';  // This will take user to SignupLogin page
                            }}
                        >
                            Logout
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className={styles.mainContent}>
                        {/* Define Routes for different sections */}
                        <Routes>
                            {/* Default Profile Page */}
                            <Route
                                path="/"
                                element={
                                    <>
                                        <div className={styles.coverImageContainer} style={{ backgroundImage: `url(${coverImage || 'https://via.placeholder.com/1200x300'})` }}>
                                            <input type="file" id="cover-image" accept="image/*" style={{ display: 'none' }} onChange={handleCoverImageChange} />
                                            <button onClick={() => document.getElementById('cover-image').click()}>Change Cover Image</button>
                                        </div>

                                        <div className={styles.profileHeader}>
                                            <div className={styles.profileImageContainer}>
                                                <img id="profile-image" src={profileImage || 'https://via.placeholder.com/100'} alt="Profile" />
                                                <input type="file" id="profile-image-upload" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageChange} />
                                                <button onClick={() => document.getElementById('profile-image-upload').click()} className={styles.editProfileButton}>✎</button>
                                            </div>
                                            <div>
                                                <h2>{fullName}</h2>
                                                <p>Member since: {memberSince}</p>
                                            </div>
                                        </div>

                                        <div className={styles.stats}>
                                            <div className={`${styles.stat} ${styles.orders}`}>
                                                <div className={styles.statIcon}>
                                                    <FaShoppingBag />
                                                </div>
                                                <div className={styles.statContent}>
                                                    <h3>{stats.orderCount}</h3>
                                                    <p>Orders</p>
                                                </div>
                                            </div>
                                            <div className={`${styles.stat} ${styles.saved}`}>
                                                <div className={styles.statIcon}>
                                                    <FaHeart />
                                                </div>
                                                <div className={styles.statContent}>
                                                    <h3>{stats.savedItemsCount}</h3>
                                                    <p>Saved Items</p>
                                                </div>
                                            </div>
                                            <div className={`${styles.stat} ${styles.spent}`}>
                                                <div className={styles.statIcon}>
                                                    <FaMoneyBillWave />
                                                </div>
                                                <div className={styles.statContent}>
                                                    <h3>PKR {Number(stats.totalSpent || 0).toFixed(2)}</h3>
                                                    <p>Total Spent</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="basic-info" className={styles.content}>
                                            <h3>Basic Information</h3>
                                            {editing ? (
                                                <form onSubmit={handleUpdate}>
                                                    <label>
                                                        First Name:
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={formData.firstName || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    </label>
                                                    <label>
                                                        Last Name:
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    </label>
                                                    <label>
                                                        Email:
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    </label>
                                                    <button type="submit">Save</button>
                                                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                                                </form>
                                            ) : (
                                                <>
                                                    <p>Full Name: {fullName}</p>
                                                    <p>Email: {user.email || 'N/A'}</p>
                                                    <button onClick={() => setEditing(true)}>Edit</button>
                                                </>
                                            )}
                                        </div>

                                        <div className={styles.darkModeToggle}>
                                            <button onClick={toggleDarkMode}>
                                                {darkMode ? <FaSun /> : <FaMoon />} Toggle Dark Mode
                                            </button>
                                        </div>
                                    </>
                                }
                            />

                            {/* Order History Page */}
                            <Route path="order-history" element={<OrderHistory />} />
                            
                            {/* Account Settings Page */}
                            <Route path="account-settings" element={<AccountSettings user={user} onUpdateUser={handleUserUpdate} />} />
                        </Routes>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;

