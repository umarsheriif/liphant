'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  Smartphone,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock settings data
const mockSettings = {
  notifications: {
    emailBookings: true,
    emailMessages: true,
    emailPromotions: false,
    pushBookings: true,
    pushMessages: true,
    smsBookings: false,
  },
  privacy: {
    showProfile: true,
    showOnlineStatus: true,
    allowMessages: true,
  },
  preferences: {
    language: 'en',
    timezone: 'Africa/Cairo',
  },
};

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(mockSettings);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Settings saved successfully');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed successfully');
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not available in demo mode');
  };

  const updateNotification = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const updatePrivacy = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings({
      ...settings,
      privacy: { ...settings.privacy, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set your preferred language and timezone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, language: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.preferences.timezone}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, timezone: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                  <SelectItem value="Africa/Tripoli">Tripoli (GMT+2)</SelectItem>
                  <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive emails about booking confirmations and changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailBookings}
                  onCheckedChange={(checked) => updateNotification('emailBookings', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive emails when you get new messages
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailMessages}
                  onCheckedChange={(checked) => updateNotification('emailMessages', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promotions & updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive emails about new features and offers
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailPromotions}
                  onCheckedChange={(checked) => updateNotification('emailPromotions', checked)}
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              Push Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Get push notifications for booking changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushBookings}
                  onCheckedChange={(checked) => updateNotification('pushBookings', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Get push notifications for new messages
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushMessages}
                  onCheckedChange={(checked) => updateNotification('pushMessages', checked)}
                />
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              SMS Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive SMS reminders before scheduled sessions
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsBookings}
                  onCheckedChange={(checked) => updateNotification('smsBookings', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control your profile visibility and interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show profile publicly</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to view your profile
              </p>
            </div>
            <Switch
              checked={settings.privacy.showProfile}
              onCheckedChange={(checked) => updatePrivacy('showProfile', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show online status</Label>
              <p className="text-xs text-muted-foreground">
                Let others see when you&apos;re online
              </p>
            </div>
            <Switch
              checked={settings.privacy.showOnlineStatus}
              onCheckedChange={(checked) => updatePrivacy('showOnlineStatus', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow messages from anyone</Label>
              <p className="text-xs text-muted-foreground">
                Receive messages without prior booking
              </p>
            </div>
            <Switch
              checked={settings.privacy.allowMessages}
              onCheckedChange={(checked) => updatePrivacy('allowMessages', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Change Password</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isLoading || !currentPassword || !newPassword}
              variant="outline"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers, including
                    your profile, bookings, messages, and reviews.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
