import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({ name: '', surname: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const [profileMsg, setProfileMsg] = useState(null);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileData, reviewsData] = await Promise.all([
                userService.getProfile(),
                reviewService.getAllReviews()
            ]);
            setProfile(profileData);
            setReviews(reviewsData);
            setProfileForm({
                name: profileData.name || '',
                surname: profileData.surname || '',
                email: profileData.email || ''
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            const updated = await userService.updateProfile(profileForm);
            setProfile(updated);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setPasswordLoading(true);
        setPasswordMsg(null);
        try {
            await userService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const completedReviews = reviews.filter(r => r.status === 'COMPLETED');
    const avgScore = completedReviews.length > 0
        ? Math.round(completedReviews.reduce((sum, r) => sum + r.overallScore, 0) / completedReviews.length)
        : 0;
    const totalBugs = completedReviews.reduce((sum, r) => sum + (r.totalBugs || 0), 0);

    if (loading) return <div className="loading">Loading profile...</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.name?.charAt(0).toUpperCase()}{profile.surname?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{profile.name} {profile.surname}</h2>
                    <span className="profile-username">@{profile.username}</span>
                    <span className="profile-email">{profile.email}</span>
                    {profile.createdAt && (
                        <span className="profile-since">
                            Member since {new Date(profile.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric'
                        })}
                        </span>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="profile-stat-box">
                    <div className="profile-stat-number">{reviews.length}</div>
                    <div className="profile-stat-label">Total Reviews</div>
                </div>
                <div className="profile-stat-box">
                    <div className="profile-stat-number">{avgScore}/100</div>
                    <div className="profile-stat-label">Average Score</div>
                </div>
                <div className="profile-stat-box">
                    <div className="profile-stat-number">{totalBugs}</div>
                    <div className="profile-stat-label">Bugs Found</div>
                </div>
                <div className="profile-stat-box">
                    <div className="profile-stat-number">{completedReviews.length}</div>
                    <div className="profile-stat-label">Completed</div>
                </div>
            </div>

            <div className="profile-forms">
                <div className="profile-card">
                    <h3>Account Settings</h3>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={profileForm.surname}
                                    onChange={e => setProfileForm({ ...profileForm, surname: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={profileForm.email}
                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                required
                            />
                        </div>
                        {profileMsg && (
                            <div className={`form-msg ${profileMsg.type}`}>{profileMsg.text}</div>
                        )}
                        <button type="submit" className="profile-btn" disabled={profileLoading}>
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="profile-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        {passwordMsg && (
                            <div className={`form-msg ${passwordMsg.type}`}>{passwordMsg.text}</div>
                        )}
                        <button type="submit" className="profile-btn" disabled={passwordLoading}>
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;