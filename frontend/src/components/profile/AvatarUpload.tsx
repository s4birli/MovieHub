import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import noImage from '../../assets/images/no-image.png';

interface AvatarUploadProps {
    currentAvatar: string | null;
    onUpdate: (file: File) => void;
}

const AvatarUpload = ({ currentAvatar, onUpdate }: AvatarUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (currentAvatar) {
            setPreviewAvatar(currentAvatar);
        } else {
            setPreviewAvatar(null);
        }
    }, [currentAvatar]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
            onUpdate(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <img
                    src={previewAvatar || noImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                    title="Change avatar"
                >
                    <Camera className="w-5 h-5" />
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default AvatarUpload; 