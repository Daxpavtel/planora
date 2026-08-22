'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CameraIcon,
  CheckIcon,
  DownloadIcon,
  GlobeIcon,
  KeyRoundIcon,
  LaptopIcon,
  MailIcon,
  MapPinIcon,
  SmartphoneIcon,
  StarIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { authApi, citiesApi, tripsApi } from '@/lib/api'
import { currentUser as seedUser, money, type City, type Trip } from '@/lib/data'

const interests = ['Food', 'Culture', 'Nature', 'Nightlife', 'Budget', 'Adventure', 'Slow travel']
const currencies = ['INR (₹)', 'EUR (€)', 'USD ($)', 'GBP (£)']
const languages = ['English', 'Hindi', 'Gujarati', 'Portuguese', 'Japanese']
const paces = ['Relaxed', 'Balanced', 'Packed']

const notifications = [
  {
    id: 'reminders',
    title: 'Trip reminders',
    description: 'Departure countdowns, packing nudges and check-in windows.',
    on: true,
  },
  {
    id: 'collab',
    title: 'Collaborator activity',
    description: 'When someone edits a day or comments on an activity.',
    on: true,
  },
  {
    id: 'prices',
    title: 'Price drops',
    description: 'Stays and flights for cities you have saved.',
    on: false,
  },
  {
    id: 'digest',
    title: 'Weekly digest',
    description: 'A Sunday summary of your open plans and suggestions.',
    on: true,
  },
]

const sessions = [
  { id: 's1', device: 'MacBook Pro · Ahmedabad', last: 'Active now', icon: LaptopIcon, current: true },
  { id: 's2', device: 'iPhone 15 · Ahmedabad', last: '2 hours ago', icon: SmartphoneIcon },
  { id: 's3', device: 'Chrome · Lisbon', last: '18 Feb 2026', icon: GlobeIcon },
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(seedUser)
  const [tripList, setTripList] = useState<Trip[]>([])
  const [savedCities, setSavedCities] = useState<City[]>([])
  const [fullName, setFullName] = useState('Yash Mehta')
  const [email, setEmail] = useState('yash.mehta@example.com')
  const [language, setLanguage] = useState('English')
  const [homeCity, setHomeCity] = useState('Ahmedabad, India')
  const [bio, setBio] = useState('Planning trips with authentic food markets and scenic views.')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const [meData, tripsData, savedData] = await Promise.allSettled([
          authApi.getMe(),
          tripsApi.getAll(),
          citiesApi.getSaved(),
        ])

        if (meData.status === 'fulfilled' && meData.value) {
          setUser(meData.value)
          setFullName(meData.value.name || meData.value.full_name || 'Yash Mehta')
          setEmail(meData.value.email || 'yash.mehta@example.com')
          setLanguage(meData.value.language_preference || 'English')
        }

        if (tripsData.status === 'fulfilled') {
          setTripList(tripsData.value)
        }

        if (savedData.status === 'fulfilled') {
          setSavedCities(savedData.value)
        }
      } catch (err) {
        console.warn('Profile load fallback:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const completed = tripList.filter((t) => t.status === 'completed').length
  const totalPlanned = tripList.reduce((sum, t) => sum + (t.estimated || 0), 0)

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setSaving(true)
      await authApi.updateProfile({
        full_name: fullName,
        email,
        language_preference: language,
      })
      setSaved(true)
      toast.success('Profile updated successfully!')
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveSavedCity(cityId: string | number) {
    try {
      await citiesApi.removeSaved(cityId)
      setSavedCities((prev) => prev.filter((c) => String(c.city_id || c.id) !== String(cityId)))
      toast.success('Removed destination from saved list.')
    } catch (err) {
      toast.error('Failed to remove saved destination.')
    }
  }

  return (
    <AppShell title="Profile & settings">
      <div className="flex flex-col gap-8">
        <section className="relative overflow-hidden rounded-3xl bg-ink">
          <Image
            src="/images/lisbon.png"
            alt=""
            width={1600}
            height={600}
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
            <div className="relative w-fit">
              <Avatar className="size-20 ring-4 ring-card/20">
                <AvatarFallback className="bg-brand-soft text-xl font-semibold text-brand">
                  {user.initials || 'YM'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 size-8 rounded-full"
                onClick={() => toast.info('Photo upload is enabled in settings')}
              >
                <CameraIcon className="size-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-2xl font-bold text-card sm:text-3xl">
                {fullName}
              </h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-card/80">
                <span className="flex items-center gap-1.5">
                  <MailIcon className="size-4" aria-hidden="true" />
                  {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                  {homeCity}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="border-0 bg-card/15 text-card backdrop-blur">
                  Member since 2026
                </Badge>
                <Badge className="border-0 bg-card/15 text-card backdrop-blur">
                  {completed} trips completed
                </Badge>
                <Badge className="border-0 bg-card/15 text-card backdrop-blur">
                  {savedCities.length} destinations bookmarked
                </Badge>
              </div>
            </div>
            <div className="sm:ml-auto">
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                render={<Link href="/trips" />}
              >
                My trips
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Trips in database', String(tripList.length)],
            ['Saved destinations', String(savedCities.length)],
            ['Trips completed', String(completed)],
            ['Lifetime estimated spend', money(totalPlanned || 2840)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="tabular font-display text-2xl font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Saved Destinations List (User Profile Requirement) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Saved Destinations</h3>
              <p className="text-xs text-muted-foreground">
                Cities you&apos;ve bookmarked from Explore for upcoming trip planning.
              </p>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/explore" />}>
              Explore more cities
            </Button>
          </div>

          {savedCities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No destinations saved yet. Visit the Explore page to bookmark favorite cities.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedCities.map((city) => (
                <Card key={city.id || city.city_id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={city.image || '/images/paris.png'}
                      alt={city.name}
                      width={400}
                      height={200}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedCity(city.city_id || city.id)}
                      className="absolute right-2.5 top-2.5 rounded-full bg-card/90 p-1.5 text-destructive shadow-sm hover:bg-card"
                      title="Remove from saved"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-card backdrop-blur">
                      <StarIcon className="size-2.5 fill-warning text-warning" />
                      Cost Index: {city.cost_index}
                    </span>
                  </div>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm font-bold text-ink">
                      {city.name}, {city.country}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {city.region} · Daily Cost: {money(city.dailyCost || 80)}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-3 pt-2">
                    <Button variant="outline" size="sm" className="w-full" render={<Link href="/explore" />}>
                      Explore activities
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Preplanned Trips Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Pre-planned Trips</h3>
            <Button variant="ghost" size="sm" render={<Link href="/trips" />}>
              View all trips
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripList
              .filter((t) => t.status === 'upcoming' || t.status === 'draft' || t.status === 'ongoing')
              .slice(0, 3)
              .map((trip) => (
                <Card key={trip.id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={trip.cover || '/images/paris.png'}
                      alt={trip.name}
                      width={400}
                      height={200}
                      className="h-28 w-full object-cover"
                    />
                    <Badge className="absolute left-2.5 top-2.5 border-0 bg-ink/80 text-card backdrop-blur text-[10px]">
                      {trip.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm font-bold text-ink">{trip.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {trip.dateLabel} · {(trip.cities || []).join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-3 pt-2">
                    <Button variant="outline" size="sm" className="w-full" render={<Link href={`/trips/${trip.id}`} />}>
                      View Itinerary
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </section>

        <Separator />

        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="preferences">Travel preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-5">
            <form onSubmit={onSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Personal details</CardTitle>
                  <CardDescription>
                    Update your name, email, and preferences stored in the MySQL database.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="p-name">Full name</FieldLabel>
                        <Input
                          id="p-name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="p-email">Email address</FieldLabel>
                        <Input
                          id="p-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="p-city">Home city</FieldLabel>
                        <Input
                          id="p-city"
                          value={homeCity}
                          onChange={(e) => setHomeCity(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="p-lang">Language Preference</FieldLabel>
                        <Select value={language} onValueChange={(v) => setLanguage(v as string)}>
                          <SelectTrigger id="p-lang" className="w-full">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {languages.map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="p-bio">Short bio</FieldLabel>
                      <Textarea
                        id="p-bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setFullName(user.name || 'Yash Mehta')}>
                    Discard
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saved ? <CheckIcon data-icon="inline-start" /> : null}
                    {saved ? 'Saved' : saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="preferences" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Travel Preferences</CardTitle>
                <CardDescription>Default filters for new trips and destination recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Default Travel Style</FieldLabel>
                    <ToggleGroup defaultValue={['Balanced']} className="justify-start">
                      {['Budget', 'Balanced', 'Comfort', 'Luxury'].map((s) => (
                        <ToggleGroupItem key={s} value={s}>{s}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                  <Field>
                    <FieldLabel>Preferred Interests</FieldLabel>
                    <ToggleGroup multiple defaultValue={['Food', 'Culture']} className="justify-start flex-wrap">
                      {interests.map((i) => (
                        <ToggleGroupItem key={i} value={i}>{i}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control alerts, price drops, and collaborator activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col divide-y divide-border">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.description}</p>
                      </div>
                      <Switch defaultChecked={n.on} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Security & Active Sessions</CardTitle>
                <CardDescription>Manage active logins and connected devices.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="flex flex-col divide-y divide-border">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 py-3">
                      <s.icon className="size-5 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{s.device}</p>
                        <p className="text-xs text-muted-foreground">{s.last}</p>
                      </div>
                      {s.current && <Badge variant="secondary">Current device</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
