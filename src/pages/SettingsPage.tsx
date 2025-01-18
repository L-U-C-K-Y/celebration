import { useState, useEffect } from 'react';
import { ArrowLeft, User, Bell, Lock, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaUpload } from '@/components/ui/media-upload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { uploadMedia } from '@/lib/utils';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    avatarUrl: '',
    email: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true,
    celebrations: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        username: profile.username || '',
        fullName: profile.full_name || '',
        avatarUrl: profile.avatar_url || '',
        email: user.email || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (files: File[]) => {
    if (!files.length) return;

    setLoading(true);
    try {
      const file = files[0];
      const path = await uploadMedia(file, 'avatars');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: path })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatarUrl: path }));
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update avatar';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.fullName,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Coming Soon',
      description: 'Password change functionality will be available soon.',
    });
  };

  const handleNotificationUpdate = async (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: 'Preferences Updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
              >
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatarUrl} />
                        <AvatarFallback>
                          {profile.fullName?.[0] || profile.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <MediaUpload
                        id="avatar"
                        accept="image/*"
                        onFilesSelected={handleAvatarUpload}
                        maxFiles={1}
                        className="absolute bottom-0 right-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-white/20 border-white/20 text-white"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fullName" className="text-white">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-white/20 border-white/20 text-white"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-white/20 border-white/20 text-white opacity-50"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-purple-600 hover:bg-white/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-sm text-white/60">
                          Receive updates about your celebrations via email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => handleNotificationUpdate('email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-sm text-white/60">
                          Get instant updates in your browser
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => handleNotificationUpdate('push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Event Reminders</Label>
                        <p className="text-sm text-white/60">
                          Get notified before important dates
                        </p>
                      </div>
                      <Switch
                        checked={notifications.reminders}
                        onCheckedChange={(checked) => handleNotificationUpdate('reminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Celebration Updates</Label>
                        <p className="text-sm text-white/60">
                          Stay updated on celebration activities
                        </p>
                      </div>
                      <Switch
                        checked={notifications.celebrations}
                        onCheckedChange={(checked) => handleNotificationUpdate('celebrations', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-white/20 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-white">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-white/20 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-white/20 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-purple-600 hover:bg-white/90"
                  >
                    Change Password
                  </Button>
                </form>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}