import React from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import ProfileInfo from '../components/profile/ProfileInfo';
import PasswordUpdate from '../components/profile/PasswordUpdate';
import { updateProfile, updatePassword } from '../redux/authSlice';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Profile = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return null;

    const handleUpdateProfile = async (data: { name: string; email: string; formData: FormData }) => {
        try {
            await dispatch(updateProfile(data.formData)).unwrap();
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
            toast.success('Password updated successfully');
        } catch (error) {
            toast.error('Failed to update password');
        }
    };

    return (
        <div>
            <Navbar
                currentPage={0}
                pageSize={0}
                selectedGenres={[]}
                selectedCategory={''}
                selectedStatus={''}
                sortBy={'rating'}
                sortOrder={'desc'}
                search={''}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

                <div className="space-y-6">
                    <ProfileInfo user={user} onUpdate={handleUpdateProfile} />
                    <PasswordUpdate onUpdate={handleUpdatePassword} />
                </div>
            </div>
        </div>
    );
};

export default Profile; 