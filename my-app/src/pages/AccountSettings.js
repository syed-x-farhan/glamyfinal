import React, { useState } from 'react';
import styles from './AccountSettings.module.css';
import { FaUser, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { useProfile } from '../context/profile_context';
import { useAuth } from '../context/sign-in_sign-up_context';

const AccountSettings = () => {
    const { updateUserProfile } = useProfile();
    const { user: authUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: authUser?.firstName || '',
        lastName: authUser?.lastName || '',
        email: authUser?.email || ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile(authUser.userId, formData);
            setShowSuccess(true);
            
            // Update local storage
            const updatedUser = {
                ...authUser,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className={styles.settingsContainer}>
            {showSuccess && (
                <div className={styles.successMessage}>
                    <FaCheckCircle className={styles.successIcon} />
                    Changes saved successfully!
                </div>
            )}
            
            <div className={styles.settingsHeader}>
                <h2>Account Settings</h2>
                <p>Manage your profile information</p>
            </div>

            <div className={styles.settingsContent}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formSection}>
                        <h3>Personal Information</h3>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <FaUser className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <FaUser className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputWrapper}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton}>
                            Save Changes
                        </button>
                        <button type="button" className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;