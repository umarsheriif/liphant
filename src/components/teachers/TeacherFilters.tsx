'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { Specialization } from '@/types';

const SPECIALIZATIONS: Specialization[] = [
  'adhd',
  'autism',
  'speech',
  'occupational',
  'behavioral',
  'learning',
  'sensory',
  'developmental',
  'social',
  'other',
];

const DEFAULT_CITIES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Mansoura',
  'Tanta',
  'Aswan',
  'Luxor',
];

interface TeacherFiltersProps {
  initialFilters?: {
    query?: string;
    city?: string;
    specialization?: string;
    minRating?: string;
    maxRate?: string;
  };
  cities?: string[];
}

export function TeacherFilters({ initialFilters = {}, cities }: TeacherFiltersProps) {
  const availableCities = cities && cities.length > 0 ? cities : DEFAULT_CITIES;
  const t = useTranslations('teacher.search.filters');
  const tSpec = useTranslations('specializations');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialFilters.query || '');
  const [isOpen, setIsOpen] = useState(false);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = createQueryString({ q: query || null });
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const queryString = createQueryString({ [key]: value });
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setQuery('');
    router.push(pathname);
    setIsOpen(false);
  };

  const activeFiltersCount = [
    searchParams.get('city'),
    searchParams.get('specialization'),
    searchParams.get('minRating'),
    searchParams.get('maxRate'),
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={useTranslations('teacher.search')('placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{useTranslations('common')('search')}</span>
        </Button>

        {/* Mobile Filters */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>{useTranslations('common')('filter')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <FilterContent
                t={t}
                tSpec={tSpec}
                searchParams={searchParams}
                handleFilterChange={handleFilterChange}
                cities={availableCities}
              />
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Desktop Filters */}
      <div className="hidden flex-wrap gap-3 md:flex">
        <Select
          value={searchParams.get('city') || ''}
          onValueChange={(value) => handleFilterChange('city', value || null)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('location')} />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('specialization') || ''}
          onValueChange={(value) => handleFilterChange('specialization', value || null)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('specialization')} />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {tSpec(spec)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('minRating') || ''}
          onValueChange={(value) => handleFilterChange('minRating', value || null)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('rating')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('maxRate') || ''}
          onValueChange={(value) => handleFilterChange('maxRate', value || null)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('price')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="200">Under 200 EGP/hr</SelectItem>
            <SelectItem value="300">Under 300 EGP/hr</SelectItem>
            <SelectItem value="500">Under 500 EGP/hr</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get('city') && (
            <Badge variant="secondary" className="gap-1">
              {searchParams.get('city')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('city', null)}
              />
            </Badge>
          )}
          {searchParams.get('specialization') && (
            <Badge variant="secondary" className="gap-1">
              {tSpec(searchParams.get('specialization') as Specialization)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('specialization', null)}
              />
            </Badge>
          )}
          {searchParams.get('minRating') && (
            <Badge variant="secondary" className="gap-1">
              {searchParams.get('minRating')}+ Stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('minRating', null)}
              />
            </Badge>
          )}
          {searchParams.get('maxRate') && (
            <Badge variant="secondary" className="gap-1">
              Under {searchParams.get('maxRate')} EGP/hr
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('maxRate', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

function FilterContent({
  t,
  tSpec,
  searchParams,
  handleFilterChange,
  cities,
}: {
  t: ReturnType<typeof useTranslations>;
  tSpec: ReturnType<typeof useTranslations>;
  searchParams: URLSearchParams;
  handleFilterChange: (key: string, value: string | null) => void;
  cities: string[];
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>{t('location')}</Label>
        <Select
          value={searchParams.get('city') || ''}
          onValueChange={(value) => handleFilterChange('city', value || null)}
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
        <Label>{t('specialization')}</Label>
        <Select
          value={searchParams.get('specialization') || ''}
          onValueChange={(value) => handleFilterChange('specialization', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {tSpec(spec as Specialization)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('rating')}</Label>
        <Select
          value={searchParams.get('minRating') || ''}
          onValueChange={(value) => handleFilterChange('minRating', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Minimum rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('price')}</Label>
        <Select
          value={searchParams.get('maxRate') || ''}
          onValueChange={(value) => handleFilterChange('maxRate', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Max hourly rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="200">Under 200 EGP/hr</SelectItem>
            <SelectItem value="300">Under 300 EGP/hr</SelectItem>
            <SelectItem value="500">Under 500 EGP/hr</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
