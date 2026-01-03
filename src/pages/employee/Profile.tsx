import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, IdCard, Building2, Phone, DollarSign, Briefcase, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [designation, setDesignation] = useState(profile?.designation || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    setUploading(false);

    if (updateError) {
      toast.error('Failed to update profile');
      console.error(updateError);
      return;
    }

    toast.success('Avatar updated successfully!');
    refreshProfile();
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        designation: designation.trim() || null,
        department: department.trim() || null,
        phone_number: phoneNumber.trim() || null,
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      toast.error('Failed to update profile');
      console.error(error);
      return;
    }

    toast.success('Profile updated successfully!');
    setIsEditing(false);
    refreshProfile();
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setDesignation(profile?.designation || '');
    setDepartment(profile?.department || '');
    setPhoneNumber(profile?.phone_number || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors shadow-md"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>

            {/* Name and Role */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground">{profile?.full_name}</h2>
              <p className="text-muted-foreground capitalize">{profile?.role || 'Employee'}</p>
              <p className="text-sm text-primary mt-1">{profile?.employee_id}</p>
            </div>

            {/* Edit Button */}
            <div className="sm:ml-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading} className="gradient-primary">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-foreground font-medium">{profile?.full_name || '-'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-foreground font-medium">{profile?.email || '-'}</p>
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <IdCard className="w-4 h-4" />
                Employee ID
              </Label>
              <p className="text-foreground font-medium">{profile?.employee_id || '-'}</p>
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                Designation
              </Label>
              {isEditing ? (
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Enter your designation"
                />
              ) : (
                <p className="text-foreground font-medium">{profile?.designation || '-'}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                Department
              </Label>
              {isEditing ? (
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter your department"
                />
              ) : (
                <p className="text-foreground font-medium">{profile?.department || '-'}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-foreground font-medium">{profile?.phone_number || '-'}</p>
              )}
            </div>

            {/* Salary (Read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                Monthly Salary
              </Label>
              <p className="text-foreground font-medium">
                ₹{(profile?.salary || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
