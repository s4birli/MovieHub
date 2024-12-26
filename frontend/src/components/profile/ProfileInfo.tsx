import React, { useState } from 'react';
import { User as UserIcon, Mail } from 'lucide-react';
import AvatarUpload from './AvatarUpload';

interface ProfileInfoProps {
    user: {
        name: string;
        email: string;
        avatar: string | null;
    };
    onUpdate: (data: { name: string; email: string; avatar?: File }) => void;
}

const ProfileInfo = ({ user, onUpdate }: ProfileInfoProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({
            name,
            email,
            ...(avatar && { avatar })
        });
        setIsEditing(false);
        setAvatar(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

            <div className="flex flex-col items-center mb-6">
                <AvatarUpload
                    currentAvatar={user.avatar}
                    onUpdate={(file) => setAvatar(file)}
                />
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setName(user.name);
                                setEmail(user.email);
                                setAvatar(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1">{name}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{email}</p>
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Edit Information
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileInfo; 