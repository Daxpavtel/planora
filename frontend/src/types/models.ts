export type TripStatus = 'upcoming' | 'draft' | 'completed' | 'ongoing'

export type Trip = {
  id: string
  name: string
  cover: string
  start: string
  end: string
  dateLabel: string
  cities: string[]
  travellers: number
  estimated: number
  budget: number
  progress: number
  status: TripStatus
  style: 'Budget' | 'Balanced' | 'Comfort' | 'Luxury'
  summary: string
  collaborators: string[]
}

export type City = {
  id: string
  name: string
  country: string
  region: string
  image: string
  description: string
  dailyCost: number
  popularity: number
  suggestedDays: string
  tags: string[]
  climate: string
  budgetLevel: 'Low' | 'Medium' | 'High'
}

export type Activity = {
  id: string
  title: string
  city: string
  category: string
  image: string
  description: string
  duration: string
  cost: number
  rating: number
  location: string
  bestTime: 'Morning' | 'Afternoon' | 'Evening' | 'Any time'
  added?: boolean
  indoor: boolean
}

export type ItineraryActivity = {
  id: string
  time: string
  title: string
  category: string
  duration: string
  cost: number
  location: string
  note?: string
  booked?: boolean
  slot: 'Morning' | 'Afternoon' | 'Evening'
}

export type ItineraryDay = {
  id: string
  label: string
  date: string
  city: string
  travelNote?: string
  activities: ItineraryActivity[]
}

export type CommunityReview = {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
}

export type CommunityTrip = {
  id: string
  title: string
  author: string
  authorAvatar: string
  authorRole: string
  rating: number
  reviewsCount: number
  cover: string
  cities: string[]
  days: number
  budget: number
  style: 'Budget' | 'Balanced' | 'Comfort' | 'Luxury'
  bookmarked: boolean
  likes: number
  description: string
  reviews: CommunityReview[]
}
