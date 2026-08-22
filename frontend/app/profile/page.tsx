'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  DownloadIcon,
  GlobeIcon,
  KeyRoundIcon,
  LaptopIcon,
  MailIcon,
  MapPinIcon,
  SmartphoneIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
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
import { currentUser, money, trips } from '@/lib/data'

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
  const [saved, setSaved] = useState(false)
  const completed = trips.filter((t) => t.status === 'completed').length
  const totalPlanned = trips.reduce((sum, t) => sum + t.estimated, 0)

  function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
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
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 size-8 rounded-full"
              >
                <CameraIcon className="size-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-2xl font-bold text-card sm:text-3xl">
                {currentUser.name}
              </h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-card/80">
                <span className="flex items-center gap-1.5">
                  <MailIcon className="size-4" aria-hidden="true" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                  {currentUser.homeCity}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="border-0 bg-card/15 text-card backdrop-blur">
                  Member since Nov 2024
                </Badge>
                <Badge className="border-0 bg-card/15 text-card backdrop-blur">
                  {completed} trips completed
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
            ['Trips planned', String(trips.length)],
            ['Cities visited', '28'],
            ['Days on the road', '146'],
            ['Lifetime planned spend', money(totalPlanned)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="tabular font-display text-2xl font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

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
                    This is what collaborators see on shared itineraries.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="p-first">First name</FieldLabel>
                        <Input id="p-first" defaultValue="Yash" autoComplete="given-name" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="p-last">Last name</FieldLabel>
                        <Input id="p-last" defaultValue="Mehta" autoComplete="family-name" />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="p-email">Email address</FieldLabel>
                        <Input
                          id="p-email"
                          type="email"
                          defaultValue={currentUser.email}
                          autoComplete="email"
                        />
                        <FieldDescription>Verified on 4 Dec 2024.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="p-phone">Phone number</FieldLabel>
                        <Input
                          id="p-phone"
                          type="tel"
                          defaultValue="+91 98765 43210"
                          autoComplete="tel"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="p-city">Home city</FieldLabel>
                        <Input id="p-city" defaultValue="Ahmedabad" autoComplete="address-level2" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="p-lang">Language</FieldLabel>
                        <Select defaultValue="English">
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
                        defaultValue="Planning long weekends around food markets and ferry rides. Usually travelling with two friends."
                      />
                      <FieldDescription>Shown on itineraries you publish.</FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button type="button" variant="ghost">
                    Discard
                  </Button>
                  <Button type="submit">
                    {saved ? <CheckIcon data-icon="inline-start" /> : null}
                    {saved ? 'Saved' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="preferences" className="pt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>What you travel for</CardTitle>
                  <CardDescription>Used to rank cities and activity suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <ToggleGroup
                    multiple
                    defaultValue={['Food', 'Culture', 'Slow travel']}
                    aria-label="Interests"
                    className="flex-wrap justify-start"
                  >
                    {interests.map((i) => (
                      <ToggleGroupItem key={i} value={i} aria-label={i}>
                        {i}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Separator />
                  <Field>
                    <FieldLabel htmlFor="pace">Preferred pace</FieldLabel>
                    <ToggleGroup
                      id="pace"
                      defaultValue={['Balanced']}
                      aria-label="Preferred pace"
                      className="justify-start"
                    >
                      {paces.map((p) => (
                        <ToggleGroupItem key={p} value={p} aria-label={p}>
                          {p}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>
                      Balanced keeps two to three activities on a normal day.
                    </FieldDescription>
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Defaults for new trips</CardTitle>
                  <CardDescription>Applied every time you start planning.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="p-currency">Default currency</FieldLabel>
                      <Select defaultValue="INR (₹)">
                        <SelectTrigger id="p-currency" className="w-full">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {currencies.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="p-budget">Typical daily budget</FieldLabel>
                      <Input id="p-budget" type="number" defaultValue={90} step={10} />
                      <FieldDescription>Per person, excluding flights.</FieldDescription>
                    </Field>
                    <Separator />
                    {[
                      ['Start days with breakfast', 'Reserve a morning slot for food.', true],
                      ['Avoid back-to-back travel legs', 'Keep a rest day after long transfers.', true],
                      ['Suggest free alternatives', 'Offer a no-cost option beside paid entries.', false],
                    ].map(([title, description, on]) => (
                      <label
                        key={title as string}
                        className="flex items-start justify-between gap-4"
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-ink">{title}</span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {description}
                          </span>
                        </span>
                        <Switch defaultChecked={on as boolean} />
                      </label>
                    ))}
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what reaches your inbox and phone.</CardDescription>
                <CardAction>
                  <Badge variant="secondary">3 of 4 on</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col">
                {notifications.map((n, index) => (
                  <div key={n.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <label className="flex items-start justify-between gap-4">
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-ink">{n.title}</span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {n.description}
                        </span>
                      </span>
                      <Switch defaultChecked={n.on} />
                    </label>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Critical account and booking emails are always sent.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="pt-5">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Last changed 4 months ago.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="cur-pass">Current password</FieldLabel>
                      <Input id="cur-pass" type="password" autoComplete="current-password" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="new-pass">New password</FieldLabel>
                        <Input id="new-pass" type="password" autoComplete="new-password" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirm-pass">Confirm new password</FieldLabel>
                        <Input id="confirm-pass" type="password" autoComplete="new-password" />
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>
                    <KeyRoundIcon data-icon="inline-start" />
                    Update password
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active sessions</CardTitle>
                  <CardDescription>Sign out anything you do not recognise.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <s.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-ink">{s.device}</span>
                        <span className="text-xs text-muted-foreground">{s.last}</span>
                      </span>
                      {s.current ? (
                        <Badge className="ml-auto border-0 bg-success-soft text-success">
                          This device
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Sign out
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your data</CardTitle>
                  <CardDescription>
                    Export every trip, or close the account permanently.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline">
                    <DownloadIcon data-icon="inline-start" />
                    Export trips as JSON
                  </Button>
                  <Button variant="outline">
                    <DownloadIcon data-icon="inline-start" />
                    Download PDF archive
                  </Button>
                </CardContent>
                <CardFooter className="flex-col items-start gap-3 border-t border-border pt-4">
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TriangleAlertIcon
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    Deleting your account removes all itineraries, budgets and shared links. This
                    cannot be undone.
                  </p>
                  <Button variant="destructive">
                    <Trash2Icon data-icon="inline-start" />
                    Delete account
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
