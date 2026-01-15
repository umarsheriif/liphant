'use client';

import { useState, useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileImageUpload } from '@/components/forms';
import { Loader2, Plus, X, Save, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';
import { updateTeacherProfile, toggleAvailability, type UpdateProfileState } from './actions';

interface TeacherProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bioEn: string | null;
  bioAr: string | null;
  specializations: string[];
  experienceYears: number;
  education: string | null;
  certifications: { name: string; issuer?: string; year?: number }[];
  hourlyRate: number;
  city: string | null;
  district: string | null;
  serviceRadiusKm: number;
  isAvailable: boolean;
  preferredLanguage: string;
}

interface ProfileFormProps {
  initialData: TeacherProfileData;
}

const cities = ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada'];
const specializations = [
  'adhd',
  'autism',
  'speech',
  'occupational',
  'behavioral',
  'learning',
  'sensory',
  'developmental',
  'social',
  'physical',
];

const specializationLabels: Record<string, string> = {
  adhd: 'ADHD',
  autism: 'Autism Spectrum',
  speech: 'Speech Therapy',
  occupational: 'Occupational Therapy',
  behavioral: 'Behavioral Therapy',
  learning: 'Learning Disabilities',
  sensory: 'Sensory Processing',
  developmental: 'Developmental Delays',
  social: 'Social Skills',
  physical: 'Physical Therapy',
};

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('teacher.profile');
  const [profile, setProfile] = useState(initialData);
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData.certifications.map((cert, i) => ({
      id: i.toString(),
      name: cert.name,
      issuer: cert.issuer || '',
      year: cert.year?.toString() || '',
    }))
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    async (prevState, formData) => {
      const result = await updateTeacherProfile(prevState, formData);
      if (result.success) {
        toast.success('Profile updated successfully');
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    {}
  );

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setSelectedImage(file);
    setProfile({ ...profile, avatar: previewUrl });
  };

  const toggleSpecialization = (spec: string) => {
    const hasSpec = profile.specializations.includes(spec);
    setProfile({
      ...profile,
      specializations: hasSpec
        ? profile.specializations.filter((s) => s !== spec)
        : [...profile.specializations, spec],
    });
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { id: Date.now().toString(), name: '', issuer: '', year: '' },
    ]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
  };

  const updateCertification = (
    id: string,
    field: keyof Certification,
    value: string
  ) => {
    setCertifications(
      certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    setProfile({ ...profile, isAvailable: checked });
    const result = await toggleAvailability(checked);
    if (result.error) {
      toast.error(result.error);
      setProfile({ ...profile, isAvailable: !checked });
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional profile visible to parents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Available for bookings</span>
          <Switch
            checked={profile.isAvailable}
            onCheckedChange={handleAvailabilityToggle}
          />
        </div>
      </div>

      {/* Hidden fields for form data */}
      <input type="hidden" name="specializations" value={JSON.stringify(profile.specializations)} />
      <input type="hidden" name="certifications" value={JSON.stringify(
        certifications.map(c => ({
          name: c.name,
          issuer: c.issuer || undefined,
          year: c.year ? parseInt(c.year) : undefined,
        }))
      )} />
      <input type="hidden" name="isAvailable" value={profile.isAvailable.toString()} />
      <input type="hidden" name="avatarUrl" value={profile.avatar || ''} />

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            A professional photo helps parents trust you
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
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
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
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Bio</CardTitle>
          <CardDescription>
            Tell parents about your experience and approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bioEn">Bio (English)</Label>
            <Textarea
              id="bioEn"
              name="bioEn"
              value={profile.bioEn || ''}
              onChange={(e) => setProfile({ ...profile, bioEn: e.target.value })}
              placeholder="Describe your experience, teaching style, and what makes you unique..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bioAr">Bio (Arabic)</Label>
            <Textarea
              id="bioAr"
              name="bioAr"
              dir="rtl"
              value={profile.bioAr || ''}
              onChange={(e) => setProfile({ ...profile, bioAr: e.target.value })}
              placeholder="اكتب نبذة عن خبرتك وأسلوبك في التدريس..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
          <CardDescription>
            Select the areas you specialize in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <Badge
                key={spec}
                variant={
                  profile.specializations.includes(spec) ? 'default' : 'outline'
                }
                className="cursor-pointer px-3 py-1 text-sm"
                onClick={() => toggleSpecialization(spec)}
              >
                {specializationLabels[spec] || spec}
              </Badge>
            ))}
          </div>
          {profile.specializations.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Select at least one specialization
            </p>
          )}
        </CardContent>
      </Card>

      {/* Experience & Education */}
      <Card>
        <CardHeader>
          <CardTitle>Experience & Education</CardTitle>
          <CardDescription>
            Your qualifications and background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                value={profile.experienceYears}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    experienceYears: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                value={profile.education || ''}
                onChange={(e) =>
                  setProfile({ ...profile, education: e.target.value })
                }
                placeholder="e.g., Bachelor in Special Education"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
            <CardDescription>
              Add your professional certifications
            </CardDescription>
          </div>
          <Button type="button" onClick={addCertification} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {certifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No certifications added yet
            </div>
          ) : (
            certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <Input
                    value={cert.name}
                    onChange={(e) =>
                      updateCertification(cert.id, 'name', e.target.value)
                    }
                    placeholder="Certification name"
                  />
                  <Input
                    value={cert.year}
                    onChange={(e) =>
                      updateCertification(cert.id, 'year', e.target.value)
                    }
                    placeholder="Year obtained"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCertification(cert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pricing & Location */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Location</CardTitle>
          <CardDescription>
            Set your rate and service area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (EGP)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min={0}
                value={profile.hourlyRate}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hourlyRate: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={profile.city || ''}
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
              <input type="hidden" name="city" value={profile.city || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District/Area</Label>
              <Input
                id="district"
                name="district"
                value={profile.district || ''}
                onChange={(e) =>
                  setProfile({ ...profile, district: e.target.value })
                }
                placeholder="e.g., Maadi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceRadiusKm">Service Radius (km)</Label>
              <Input
                id="serviceRadiusKm"
                name="serviceRadiusKm"
                type="number"
                min={1}
                max={50}
                value={profile.serviceRadiusKm}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    serviceRadiusKm: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
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
    </form>
  );
}
