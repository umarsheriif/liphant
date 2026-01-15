'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileImageUpload } from '@/components/forms';
import { Loader2, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

// Mock user data - would come from auth/database
const mockParentProfile: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  city: string;
  district: string;
  children: { id: string; name: string; age: number; conditions: string[] }[];
  bio: string;
  preferredLanguage: string;
} = {
  id: '1',
  fullName: 'Omar Sherif',
  email: 'omar@example.com',
  phone: '+20 123 456 7890',
  avatar: null,
  city: 'Cairo',
  district: 'Maadi',
  children: [
    { id: '1', name: 'Ahmed', age: 7, conditions: ['ADHD'] },
    { id: '2', name: 'Sara', age: 5, conditions: ['Autism Spectrum'] },
  ],
  bio: 'Parent of two wonderful children looking for supportive shadow teachers.',
  preferredLanguage: 'en',
};

const cities = ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada'];
const conditions = [
  'ADHD',
  'Autism Spectrum',
  'Speech Delay',
  'Learning Disabilities',
  'Sensory Processing',
  'Developmental Delays',
  'Down Syndrome',
  'Cerebral Palsy',
  'Other',
];

interface Child {
  id: string;
  name: string;
  age: number;
  conditions: string[];
}

export default function ParentProfilePage() {
  const t = useTranslations('parent.profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(mockParentProfile);
  const [children, setChildren] = useState<Child[]>(mockParentProfile.children);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setSelectedImage(file);
    setProfile({ ...profile, avatar: previewUrl });
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Profile updated successfully');
  };

  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: '',
      age: 0,
      conditions: [],
    };
    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter((child) => child.id !== id));
  };

  const updateChild = (id: string, field: keyof Child, value: string | number | string[]) => {
    setChildren(
      children.map((child) =>
        child.id === id ? { ...child, [field]: value } : child
      )
    );
  };

  const toggleCondition = (childId: string, condition: string) => {
    setChildren(
      children.map((child) => {
        if (child.id !== childId) return child;
        const hasCondition = child.conditions.includes(condition);
        return {
          ...child,
          conditions: hasCondition
            ? child.conditions.filter((c) => c !== condition)
            : [...child.conditions, condition],
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and children&apos;s profiles
        </p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            This photo will be visible to teachers you contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileImageUpload
            currentImage={profile.avatar}
            fallbackText={profile.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
            onImageChange={handleImageChange}
            size="md"
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={profile.preferredLanguage}
                onValueChange={(value) =>
                  setProfile({ ...profile, preferredLanguage: value })
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell teachers a bit about yourself and your family..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            Help us find teachers near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={profile.city}
                onValueChange={(value) =>
                  setProfile({ ...profile, city: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District/Area</Label>
              <Input
                id="district"
                value={profile.district}
                onChange={(e) =>
                  setProfile({ ...profile, district: e.target.value })
                }
                placeholder="e.g., Maadi, Zamalek"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Children Information</CardTitle>
            <CardDescription>
              Add details about your children to help teachers prepare
            </CardDescription>
          </div>
          <Button onClick={addChild} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {children.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No children added yet. Click &quot;Add Child&quot; to get started.
            </div>
          ) : (
            children.map((child, index) => (
              <div
                key={child.id}
                className="relative rounded-lg border p-4 space-y-4"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeChild(child.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <h4 className="font-medium">Child {index + 1}</h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={child.name}
                      onChange={(e) =>
                        updateChild(child.id, 'name', e.target.value)
                      }
                      placeholder="Child's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      min={0}
                      max={18}
                      value={child.age || ''}
                      onChange={(e) =>
                        updateChild(child.id, 'age', parseInt(e.target.value) || 0)
                      }
                      placeholder="Age"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Conditions/Special Needs</Label>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((condition) => (
                      <Badge
                        key={condition}
                        variant={
                          child.conditions.includes(condition)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => toggleCondition(child.id, condition)}
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
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
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
