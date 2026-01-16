'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { updateService, type ServiceActionState } from '@/app/[locale]/(dashboard)/center/services/actions';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface EditServiceFormProps {
  service: {
    id: string;
    nameEn: string;
    nameAr: string | null;
    descriptionEn: string | null;
    descriptionAr: string | null;
    price: number;
    duration: number;
    isActive: boolean;
  };
}

const initialState: ServiceActionState = {};

export function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateService, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('Service updated successfully');
      router.push(`/center/services/${service.id}`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, service.id]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={service.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nameEn">Name (English) *</Label>
          <Input
            id="nameEn"
            name="nameEn"
            defaultValue={service.nameEn}
            placeholder="Speech Therapy"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameAr">Name (Arabic)</Label>
          <Input
            id="nameAr"
            name="nameAr"
            defaultValue={service.nameAr || ''}
            placeholder="علاج النطق"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEn">Description (English)</Label>
        <Textarea
          id="descriptionEn"
          name="descriptionEn"
          defaultValue={service.descriptionEn || ''}
          placeholder="Professional speech therapy sessions..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionAr">Description (Arabic)</Label>
        <Textarea
          id="descriptionAr"
          name="descriptionAr"
          defaultValue={service.descriptionAr || ''}
          placeholder="جلسات علاج نطق احترافية..."
          dir="rtl"
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (SAR) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            defaultValue={service.price}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="15"
            max="480"
            defaultValue={service.duration}
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Service Active</Label>
          <p className="text-sm text-muted-foreground">
            Inactive services won&apos;t appear in booking options
          </p>
        </div>
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={service.isActive}
          value="true"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/center/services/${service.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
