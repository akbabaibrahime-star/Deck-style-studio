
import React, { useState, useRef } from 'react';
import type { User } from '../types.ts';
import { MapSelector } from './MapSelector.tsx';
import { AvatarCropper } from './AvatarCropper.tsx';
import { MapIcon } from './Icons.tsx';

interface EditProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedAvatarSave = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: croppedImage }));
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input to allow re-selection of the same file
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length > 1) {
      const [category, field] = keys as [keyof User, string];
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as object),
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (address: { street: string; city: string; country: string }) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...address,
      }
    }));
    setIsMapOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                    <img src={formData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
                    <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        <span className="font-semibold">Change</span>
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        aria-hidden="true"
                    />
                </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
              <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h2 className="text-lg font-semibold mb-2">Contact Info</h2>
              <div>
                <label htmlFor="contact.email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input type="email" name="contact.email" id="contact.email" value={formData.contact.email} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="mt-4">
                <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" name="contact.phone" id="contact.phone" value={formData.contact.phone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            
             <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Address</h2>
                  <button 
                    type="button" 
                    onClick={() => setIsMapOpen(true)}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <MapIcon className="w-4 h-4" />
                    Select on Map
                  </button>
              </div>
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-400 mb-1">Street</label>
                <input type="text" name="address.street" id="address.street" value={formData.address.street} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="mt-4">
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-400 mb-1">City</label>
                <input type="text" name="address.city" id="address.city" value={formData.address.city} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
               <div className="mt-4">
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                <input type="text" name="address.country" id="address.country" value={formData.address.country} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10 max-w-md mx-auto">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {isMapOpen && <MapSelector onClose={() => setIsMapOpen(false)} onLocationSelect={handleLocationSelect} />}
      {imageToCrop && (
        <AvatarCropper
          imageSrc={imageToCrop}
          onSave={handleCroppedAvatarSave}
          onClose={() => setImageToCrop(null)}
        />
      )}
    </>
  );
};