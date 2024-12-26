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

    const handleUpdateProfile = async (data: { name: string; email: string; avatar?: File }) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            if (data.avatar) {
                formData.append('avatar', data.avatar);
            }

            await dispatch(updateProfile(formData)).unwrap();
            toast.success('Profil güncellendi');
        } catch (error) {
            toast.error('Profil güncellenirken hata oluştu');
        }
    };

    const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
            toast.success('Şifre güncellendi');
        } catch (error) {
            toast.error('Şifre güncellenirken hata oluştu');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil Ayarları</h1>

                <div className="space-y-6">
                    <ProfileInfo user={user} onUpdate={handleUpdateProfile} />
                    <PasswordUpdate onUpdate={handleUpdatePassword} />
                </div>
            </div>
        </div>
    );
};

export default Profile; 