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

export const currentUser = {
  name: 'Yash Mehta',
  firstName: 'Yash',
  initials: 'YM',
  email: 'yash.mehta@example.com',
  homeCity: 'Ahmedabad, India',
  currency: 'INR',
}

export const trips: Trip[] = [
  {
    id: 'rajasthan-royal-heritage',
    name: 'Royal Rajasthan & Golden Triangle',
    cover: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    start: '2026-10-15',
    end: '2026-10-25',
    dateLabel: '15 – 25 Oct 2026',
    cities: ['Jaipur', 'Udaipur', 'Delhi'],
    travellers: 3,
    estimated: 48500,
    budget: 55000,
    progress: 72,
    status: 'upcoming',
    style: 'Balanced',
    summary: 'Grand palaces, lakeside sunset dinners, heritage fort walks and iconic street food.',
    collaborators: ['YM', 'AR', 'SK'],
  },
  {
    id: 'goa-coastal-escape',
    name: 'Goa Coastal & Heritage Trail',
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    start: '2026-11-05',
    end: '2026-11-10',
    dateLabel: '5 – 10 Nov 2026',
    cities: ['Goa'],
    travellers: 4,
    estimated: 28000,
    budget: 32000,
    progress: 45,
    status: 'draft',
    style: 'Comfort',
    summary: 'Portuguese villas, beachside shacks, spice plantation lunch and sunset kayaking.',
    collaborators: ['YM', 'NP'],
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters & Spice Trail',
    cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    start: '2026-12-20',
    end: '2026-12-28',
    dateLabel: '20 – 28 Dec 2026',
    cities: ['Kochi', 'Mysuru'],
    travellers: 2,
    estimated: 38000,
    budget: 42000,
    progress: 20,
    status: 'draft',
    style: 'Luxury',
    summary: 'Houseboat cruising on Vembanad lake, Kathakali performances, Mysore Palace and Sadhya feast.',
    collaborators: ['YM'],
  },
  {
    id: 'himalayan-manali-valley',
    name: 'Himalayan Passes & River Valleys',
    cover: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    start: '2025-05-12',
    end: '2025-05-19',
    dateLabel: '12 – 19 May 2025',
    cities: ['Manali', 'Shimla', 'Rishikesh'],
    travellers: 3,
    estimated: 32000,
    budget: 30000,
    progress: 100,
    status: 'completed',
    style: 'Comfort',
    summary: 'Snow valleys at Rohtang, paragliding in Solang, white water rafting in Rishikesh, and cedar forest walks.',
    collaborators: ['YM', 'RM', 'PM'],
  },
  {
    id: 'varanasi-spiritual-ganga',
    name: 'Varanasi Ghats & Cultural Soul',
    cover: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    start: '2026-03-10',
    end: '2026-03-14',
    dateLabel: '10 – 14 Mar 2026',
    cities: ['Varanasi', 'Agra'],
    travellers: 2,
    estimated: 18500,
    budget: 20000,
    progress: 88,
    status: 'ongoing',
    style: 'Balanced',
    summary: 'Ganga Aarti ceremonies, sunrise wooden boat rides, Taj Mahal dawn tour, Banarasi chaat and silk weaving.',
    collaborators: ['YM', 'AR'],
  },
]

export const featuredTrip = trips[0]

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

export const cities: City[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    description: 'The Pink City famous for majestic Amber Fort, Hawa Mahal, Dal Baati Churma, and vibrant bazaars.',
    dailyCost: 2600,
    popularity: 98,
    suggestedDays: '3 – 4 days',
    tags: ['Heritage', 'Palaces', 'Food', 'Culture'],
    climate: 'Warm',
    budgetLevel: 'Medium',
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
    description: 'City of Lakes renowned for Lake Pichola palaces, sunset boat rides, rooftop dining, and folk dances.',
    dailyCost: 2400,
    popularity: 96,
    suggestedDays: '2 – 4 days',
    tags: ['Lakes', 'Romance', 'Heritage', 'Food'],
    climate: 'Warm',
    budgetLevel: 'Medium',
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    description: 'The spiritual capital of India with historic Ganga Ghats, evening Maha Aarti, Banarasi Paan and street chaat.',
    dailyCost: 1800,
    popularity: 94,
    suggestedDays: '2 – 3 days',
    tags: ['Spiritual', 'History', 'Food', 'Ghats'],
    climate: 'Seasonal',
    budgetLevel: 'Low',
  },
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    region: 'West India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description: 'Golden sand beaches, Portuguese architecture, spicy Goan fish curry thalis, and coastal water adventures.',
    dailyCost: 3200,
    popularity: 97,
    suggestedDays: '4 – 7 days',
    tags: ['Beach', 'Nightlife', 'Food', 'Adventure'],
    climate: 'Tropical',
    budgetLevel: 'Medium',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    region: 'West India',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    description: 'The City of Dreams: iconic Marine Drive, Gateway of India, Chowpatty Vada Pav, and buzzing nightlife.',
    dailyCost: 3800,
    popularity: 95,
    suggestedDays: '3 – 5 days',
    tags: ['Urban', 'Food', 'Coastal', 'Culture'],
    climate: 'Coastal',
    budgetLevel: 'High',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    description: 'India Gate, Red Fort, Humayun Tomb, and the legendary food lanes of Chandni Chowk with Parathas and Kebabs.',
    dailyCost: 2800,
    popularity: 96,
    suggestedDays: '3 – 5 days',
    tags: ['Heritage', 'Food', 'History', 'Shopping'],
    climate: 'Seasonal',
    budgetLevel: 'Medium',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    description: 'The Garden City celebrated for lush Lalbagh, Bangalore Palace, authentic Benne Masala Dosa, and craft cafes.',
    dailyCost: 3000,
    popularity: 91,
    suggestedDays: '2 – 4 days',
    tags: ['Gardens', 'Food', 'Cafes', 'Modern'],
    climate: 'Pleasant',
    budgetLevel: 'Medium',
  },
  {
    id: 'kochi',
    name: 'Kochi',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    description: 'Queen of the Arabian Sea: Chinese fishing nets, Fort Kochi colonial streets, spice markets, and Kerala Sadya.',
    dailyCost: 2400,
    popularity: 93,
    suggestedDays: '3 – 5 days',
    tags: ['Backwaters', 'Heritage', 'Food', 'Coastal'],
    climate: 'Tropical',
    budgetLevel: 'Low',
  },
  {
    id: 'manali',
    name: 'Manali',
    country: 'India',
    region: 'Himalayas',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    description: 'Breathtaking Himalayan peaks, Rohtang Pass snow, paragliding in Solang Valley, and steaming Himachali Siddu.',
    dailyCost: 2600,
    popularity: 94,
    suggestedDays: '4 – 6 days',
    tags: ['Mountains', 'Adventure', 'Nature', 'Snow'],
    climate: 'Cool',
    budgetLevel: 'Medium',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    country: 'India',
    region: 'East India',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    description: 'City of Joy: Victoria Memorial, Howrah Bridge, authentic Rosogolla, Mishti Doi, and legendary Kolkata Kathi Rolls.',
    dailyCost: 1900,
    popularity: 90,
    suggestedDays: '3 – 4 days',
    tags: ['Culture', 'Food', 'Literature', 'History'],
    climate: 'Warm',
    budgetLevel: 'Low',
  },
  {
    id: 'agra',
    name: 'Agra',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'Home of the timeless Taj Mahal, Agra Fort, Mughlai culinary delicacies, and world-famous Agra Petha.',
    dailyCost: 2200,
    popularity: 98,
    suggestedDays: '1 – 2 days',
    tags: ['Taj Mahal', 'Mughal', 'Food', 'Heritage'],
    climate: 'Seasonal',
    budgetLevel: 'Low',
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=800&q=80',
    description: 'The Golden Temple sanctuary, Wagah Border beating retreat, buttery Amritsari Kulcha, and rich creamy Lassi.',
    dailyCost: 1900,
    popularity: 95,
    suggestedDays: '2 – 3 days',
    tags: ['Golden Temple', 'Spiritual', 'Food', 'Heritage'],
    climate: 'Seasonal',
    budgetLevel: 'Low',
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    description: 'The Blue City & Sun City: soaring Mehrangarh Fort, Jaswant Thada cenotaphs, spicy Mirchi Vada, and Mawa Kachori.',
    dailyCost: 2300,
    popularity: 95,
    suggestedDays: '2 – 3 days',
    tags: ['Forts', 'Heritage', 'Food', 'Culture'],
    climate: 'Warm',
    budgetLevel: 'Low',
  },
  {
    id: 'jaisalmer',
    name: 'Jaisalmer',
    country: 'India',
    region: 'North India',
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
    description: 'The Golden City: living sandstone Sonar Qila, Sam Sand Dunes desert camping, sunset camel safaris, and Ker Sangri.',
    dailyCost: 2500,
    popularity: 94,
    suggestedDays: '2 – 4 days',
    tags: ['Desert', 'Forts', 'Adventure', 'Culture'],
    climate: 'Warm',
    budgetLevel: 'Medium',
  },
  {
    id: 'hampi',
    name: 'Hampi',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=800&q=80',
    description: 'UNESCO World Heritage Vijayanagara capital: iconic Stone Chariot, Virupaksha Temple, coracle boat rides, and boulder hills.',
    dailyCost: 1800,
    popularity: 93,
    suggestedDays: '2 – 4 days',
    tags: ['UNESCO', 'History', 'Adventure', 'Ruins'],
    climate: 'Warm',
    budgetLevel: 'Low',
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    country: 'India',
    region: 'Himalayas',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Yoga Capital & Adventure Hub: white water river rafting on Ganga, Laxman Jhula, Beatles Ashram, and Triveni Ghat Aarti.',
    dailyCost: 2100,
    popularity: 96,
    suggestedDays: '3 – 5 days',
    tags: ['Adventure', 'Spiritual', 'Rafting', 'Yoga'],
    climate: 'Pleasant',
    budgetLevel: 'Low',
  },
  {
    id: 'shimla',
    name: 'Shimla',
    country: 'India',
    region: 'Himalayas',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    description: 'Queen of Hills: colonial Mall Road, Christ Church, UNESCO Kalka-Shimla toy train, Jakhoo Temple, and snow vistas.',
    dailyCost: 2700,
    popularity: 92,
    suggestedDays: '3 – 4 days',
    tags: ['Mountains', 'Colonial', 'Toy Train', 'Nature'],
    climate: 'Cool',
    budgetLevel: 'Medium',
  },
  {
    id: 'mysuru',
    name: 'Mysuru',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    description: 'City of Palaces: dazzling illuminated Mysore Palace, Chamundeshwari Temple, melt-in-mouth Mysore Pak, and silk sarees.',
    dailyCost: 2200,
    popularity: 91,
    suggestedDays: '2 – 3 days',
    tags: ['Palaces', 'Heritage', 'Food', 'Culture'],
    climate: 'Pleasant',
    budgetLevel: 'Low',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=800&q=80',
    description: 'City of Pearls & Nizams: iconic Charminar, Golconda Fort acoustics, world-famous Hyderabadi Dum Biryani, and Irani chai.',
    dailyCost: 2900,
    popularity: 95,
    suggestedDays: '3 – 4 days',
    tags: ['Biryani', 'Heritage', 'Forts', 'Culture'],
    climate: 'Warm',
    budgetLevel: 'Medium',
  },
  {
    id: 'puri',
    name: 'Puri',
    country: 'India',
    region: 'East India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    description: 'Spiritual Beach Haven: sacred Shree Jagannath Temple, golden surf beaches, holy Mahaprasad, and Konark Sun Temple.',
    dailyCost: 1700,
    popularity: 89,
    suggestedDays: '2 – 3 days',
    tags: ['Spiritual', 'Beach', 'UNESCO', 'Food'],
    climate: 'Coastal',
    budgetLevel: 'Low',
  },
  {
    id: 'leh',
    name: 'Leh & Ladakh',
    country: 'India',
    region: 'Himalayas',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    description: 'Land of High Passes: azure Pangong Tso Lake, Nubra Valley sand dunes, Khardung La Pass, Thukpa and butter tea.',
    dailyCost: 3400,
    popularity: 97,
    suggestedDays: '5 – 8 days',
    tags: ['High Altitude', 'Adventure', 'Lakes', 'Monasteries'],
    climate: 'Cool',
    budgetLevel: 'High',
  },
  {
    id: 'madurai',
    name: 'Madurai',
    country: 'India',
    region: 'South India',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: 'Athens of the East: towering Meenakshi Amman Temple gopurams, Thirumalai Nayakkar Palace, chilled Jigarthanda & Kari Dosa.',
    dailyCost: 1800,
    popularity: 92,
    suggestedDays: '2 – 3 days',
    tags: ['Temples', 'Heritage', 'Food', 'Culture'],
    climate: 'Warm',
    budgetLevel: 'Low',
  },
]

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

export const activities: Activity[] = [
  // Jaipur
  {
    id: 'amber-fort-tour',
    title: 'Amber Fort Guided Heritage Walk',
    city: 'Jaipur',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    description: 'Explore Sheesh Mahal, Diwan-e-Aam, and grand ramparts of the hilltop Rajput fortress.',
    duration: '2h 30m',
    cost: 500,
    rating: 4.9,
    location: 'Amer, Jaipur',
    bestTime: 'Morning',
    added: true,
    indoor: false,
  },
  {
    id: 'rawat-kachori-breakfast',
    title: 'Rawat Mishthan Bhandar Pyaaz Kachori & Lassi',
    city: 'Jaipur',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy onion kachori served piping hot with sweet & tangy chutneys and thick clay-pot lassi.',
    duration: '1h',
    cost: 180,
    rating: 4.8,
    location: 'Station Road, Jaipur',
    bestTime: 'Morning',
    indoor: true,
  },
  {
    id: 'hawa-mahal-photos',
    title: 'Hawa Mahal Palace of Winds & Bazaars',
    city: 'Jaipur',
    category: 'Sightseeing',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    description: 'Photowalk through the 953 honeycomb windows and Johari Bazaar artisan jewelry stalls.',
    duration: '1h 30m',
    cost: 200,
    rating: 4.7,
    location: 'Badi Chaupar, Jaipur',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'chokhi-dhani-thali',
    title: 'Chokhi Dhani Rajasthani Village Feast',
    city: 'Jaipur',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'Unlimited royal Dal Baati Churma, Gatte ki Sabzi, puppet shows, folk dance and camel rides.',
    duration: '3h 30m',
    cost: 1100,
    rating: 4.9,
    location: 'Tonk Road, Jaipur',
    bestTime: 'Evening',
    indoor: false,
  },

  // Udaipur
  {
    id: 'lake-pichola-cruise',
    title: 'Lake Pichola Sunset Boat Cruise',
    city: 'Udaipur',
    category: 'Sightseeing',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80',
    description: 'Sail past Jag Mandir Island and Lake Palace as the sun sets gold over the Aravalli hills.',
    duration: '1h 15m',
    cost: 450,
    rating: 4.9,
    location: 'Rameshwar Ghat, Udaipur',
    bestTime: 'Evening',
    added: true,
    indoor: false,
  },
  {
    id: 'city-palace-udaipur',
    title: 'Udaipur City Palace & Crystal Gallery',
    city: 'Udaipur',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80',
    description: 'Marvel at peacock mosaics, mirror work galleries, and royal courtyards overlooking the lake.',
    duration: '2h 30m',
    cost: 350,
    rating: 4.8,
    location: 'City Palace Complex, Udaipur',
    bestTime: 'Morning',
    indoor: true,
  },
  {
    id: 'dharohar-folk-dance',
    title: 'Dharohar Cultural Dance at Bagore Ki Haveli',
    city: 'Udaipur',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    description: 'Vibrant Rajasthani folk music, Chari fire dance, and Bhavai pot-balancing performance.',
    duration: '1h',
    cost: 150,
    rating: 4.9,
    location: 'Gangaur Ghat, Udaipur',
    bestTime: 'Evening',
    indoor: true,
  },

  // Varanasi
  {
    id: 'ganga-aarti-boat',
    title: 'Dashashwamedh Ghat Evening Ganga Aarti',
    city: 'Varanasi',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
    description: 'Witness the divine rhythmic fire prayer ritual from a boat on the sacred river Ganga.',
    duration: '2h',
    cost: 300,
    rating: 5.0,
    location: 'Dashashwamedh Ghat',
    bestTime: 'Evening',
    added: true,
    indoor: false,
  },
  {
    id: 'kashi-chaat-trail',
    title: 'Kashi Street Food & Banarasi Paan Trail',
    city: 'Varanasi',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    description: 'Taste legendary Tamatar Chaat, Palak Patta Chaat, Rabri Malaiyo, and meetha Banarasi Paan.',
    duration: '2h',
    cost: 250,
    rating: 4.8,
    location: 'Godowlia Chowk, Varanasi',
    bestTime: 'Evening',
    indoor: false,
  },

  // Goa
  {
    id: 'goan-fish-curry',
    title: 'Authentic Goan Fish Curry Thali & Bebinca',
    city: 'Goa',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh kingfish curry with kokum, Goan red rice, fried prawns, and traditional multi-layered Bebinca dessert.',
    duration: '1h 30m',
    cost: 450,
    rating: 4.8,
    location: 'Panaji / Candolim, Goa',
    bestTime: 'Afternoon',
    indoor: true,
  },
  {
    id: 'bom-jesus-heritage',
    title: 'Old Goa Churches & Bom Jesus Basilica',
    city: 'Goa',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    description: 'UNESCO World Heritage Portuguese Baroque churches and the sacred tomb of St. Francis Xavier.',
    duration: '2h',
    cost: 0,
    rating: 4.7,
    location: 'Old Goa',
    bestTime: 'Morning',
    indoor: true,
  },

  // Mumbai
  {
    id: 'mumbai-chowpatty-crawl',
    title: 'Girgaon Chowpatty Street Food Safari',
    city: 'Mumbai',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic Mumbai Vada Pav, buttery Pav Bhaji, Sev Puri, and Kulfi Falooda with sea breeze.',
    duration: '2h',
    cost: 220,
    rating: 4.8,
    location: 'Girgaon Chowpatty, Marine Drive',
    bestTime: 'Evening',
    indoor: false,
  },
  {
    id: 'gateway-elephanta',
    title: 'Gateway of India & Elephanta Rock Caves Ferry',
    city: 'Mumbai',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    description: 'Scenic boat ride from the Gateway to 6th-century rock-cut Shiva cave sculptures.',
    duration: '4h',
    cost: 380,
    rating: 4.6,
    location: 'Apollo Bunder, Colaba',
    bestTime: 'Morning',
    indoor: false,
  },

  // Delhi
  {
    id: 'chandni-chowk-parathas',
    title: 'Old Delhi Chandni Chowk Food Trail',
    city: 'Delhi',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'Ghee-fried parathas at Paranthe Wali Gali, succulent kebabs, Jalebi-Rabri and spiced chai.',
    duration: '2h 30m',
    cost: 350,
    rating: 4.9,
    location: 'Chandni Chowk, Old Delhi',
    bestTime: 'Evening',
    indoor: false,
  },
  {
    id: 'qutub-minar-complex',
    title: 'Qutub Minar & Mehrauli Heritage Trail',
    city: 'Delhi',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'World’s tallest brick minaret, ancient iron pillar, and Indo-Islamic sandstone architecture.',
    duration: '2h',
    cost: 250,
    rating: 4.7,
    location: 'Mehrauli, New Delhi',
    bestTime: 'Morning',
    indoor: false,
  },

  // Bengaluru
  {
    id: 'vidyarthi-bhavan-dosa',
    title: 'Vidyarthi Bhavan Crispy Masala Dosa & Filter Kaapi',
    city: 'Bengaluru',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    description: 'Historic heritage eatery serving golden butter masala dosa and aromatic South Indian filter coffee.',
    duration: '1h 15m',
    cost: 140,
    rating: 4.9,
    location: 'Gandhi Bazaar, Basavanagudi',
    bestTime: 'Morning',
    indoor: true,
  },

  // Manali
  {
    id: 'solang-paragliding',
    title: 'Solang Valley Paragliding & Zorbing Adventure',
    city: 'Manali',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    description: 'Soar like an eagle above snow-capped Himalayan ridges and lush cedar valleys.',
    duration: '3h',
    cost: 2200,
    rating: 4.9,
    location: 'Solang Valley, Manali',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'himachali-siddu-trout',
    title: 'Traditional Himachali Siddu & Fresh River Trout',
    city: 'Manali',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    description: 'Steamed wheat Siddu stuffed with spiced poppy seeds and ghee alongside pan-fried Himalayan trout.',
    duration: '1h 30m',
    cost: 450,
    rating: 4.8,
    location: 'Old Manali Village',
    bestTime: 'Evening',
    indoor: true,
  },

  // Amritsar
  {
    id: 'golden-temple-langar',
    title: 'Golden Temple Darshan & Sacred Community Langar',
    city: 'Amritsar',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=600&q=80',
    description: 'Experience spiritual peace around the Amrit Sarovar and partake in the world’s largest free community kitchen.',
    duration: '3h',
    cost: 0,
    rating: 5.0,
    location: 'Harmandir Sahib, Amritsar',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'amritsari-kulcha-dhaba',
    title: 'Kesar Da Dhaba Amritsari Kulcha & Dal Makhani',
    city: 'Amritsar',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy tandoori stuffed Amritsari kulcha with slow-cooked buttery Maa ki Daal and peda lassi.',
    duration: '1h 30m',
    cost: 280,
    rating: 4.9,
    location: 'Chowk Passian, Amritsar',
    bestTime: 'Afternoon',
    indoor: true,
  },

  // Jodhpur
  {
    id: 'mehrangarh-fort-tour',
    title: 'Mehrangarh Fort & Flying Fox Zipline',
    city: 'Jodhpur',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'Tour the invincible cliffside fortress and zipline past battlements overlooking the Blue City.',
    duration: '3h',
    cost: 750,
    rating: 4.9,
    location: 'Fort Road, Jodhpur',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'jodhpur-mirchi-vada',
    title: 'Shahi Samosa & Janta Sweet Home Mirchi Vada',
    city: 'Jodhpur',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    description: 'Fiery Bhavnagri chili stuffed with spiced potato mash, gram flour fried, and sweet Mawa Kachori.',
    duration: '1h',
    cost: 160,
    rating: 4.9,
    location: 'Clock Tower Market, Jodhpur',
    bestTime: 'Afternoon',
    indoor: true,
  },

  // Jaisalmer
  {
    id: 'sam-sand-dunes-safari',
    title: 'Sam Sand Dunes Camel Safari & Thar Desert Sunset',
    city: 'Jaisalmer',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&q=80',
    description: 'Ride across golden sand ripples on camelback and enjoy live Kalbelia dance with Rajasthani dinner.',
    duration: '4h',
    cost: 1200,
    rating: 4.9,
    location: 'Sam Sand Dunes, Jaisalmer',
    bestTime: 'Evening',
    indoor: false,
  },
  {
    id: 'jaisalmer-sonar-qila',
    title: 'Living Golden Fort (Sonar Qila) & Havelis',
    city: 'Jaisalmer',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&q=80',
    description: 'Wander inside India’s only living fort, with intricate Jain temples and carved sandstone Patwon Haveli.',
    duration: '2h 30m',
    cost: 300,
    rating: 4.8,
    location: 'Fort Complex, Jaisalmer',
    bestTime: 'Morning',
    indoor: false,
  },

  // Hampi
  {
    id: 'hampi-stone-chariot',
    title: 'Vijaya Vittala Stone Chariot & Musical Pillars',
    city: 'Hampi',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=600&q=80',
    description: 'Marvel at the iconic monolithic stone chariot shrine and acoustical stone pillars of Hampi.',
    duration: '2h 30m',
    cost: 250,
    rating: 4.9,
    location: 'Vittala Temple Complex, Hampi',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'tungabhadra-coracle',
    title: 'Tungabhadra River Coracle Boat & Boulder Hike',
    city: 'Hampi',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    description: 'Glide in a circular reed coracle boat on the river and climb Matanga Hill for panoramic 360° ruins.',
    duration: '2h',
    cost: 350,
    rating: 4.8,
    location: 'Hampi Bazaar Ghat',
    bestTime: 'Evening',
    indoor: false,
  },

  // Rishikesh
  {
    id: 'rishikesh-ganga-rafting',
    title: 'Shivpuri to Rishikesh White Water River Rafting',
    city: 'Rishikesh',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    description: 'Tackle thrilling Grade III rapids like Roller Coaster and Golf Course with cliff jumping.',
    duration: '3h 30m',
    cost: 1200,
    rating: 4.9,
    location: 'Shivpuri Base, Rishikesh',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'triveni-ghat-aarti',
    title: 'Triveni Ghat Evening Maha Aarti & Chotiwala Feast',
    city: 'Rishikesh',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    description: 'Listen to Vedic chants at the holy confluence followed by traditional satvik Ayurvedic thali.',
    duration: '2h 30m',
    cost: 350,
    rating: 4.8,
    location: 'Triveni Ghat, Rishikesh',
    bestTime: 'Evening',
    indoor: false,
  },

  // Shimla
  {
    id: 'kalka-shimla-toy-train',
    title: 'UNESCO Kalka-Shimla Heritage Toy Train Ride',
    city: 'Shimla',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
    description: 'Chug through 102 tunnels, curved stone bridges, and misty pine valleys on the historic narrow-gauge railway.',
    duration: '3h',
    cost: 450,
    rating: 4.8,
    location: 'Shimla Railway Station',
    bestTime: 'Morning',
    indoor: true,
  },
  {
    id: 'shimla-mall-road-walk',
    title: 'The Ridge, Christ Church & Himachali Chana Madra',
    city: 'Shimla',
    category: 'Sightseeing',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
    description: 'Colonial heritage walk across the Ridge, neo-Gothic Christ Church, and slow-cooked yogurt chickpea Madra.',
    duration: '2h',
    cost: 220,
    rating: 4.7,
    location: 'The Mall, Shimla',
    bestTime: 'Evening',
    indoor: false,
  },

  // Mysuru
  {
    id: 'mysore-palace-illumination',
    title: 'Mysore Palace Royal Architecture & 100,000 Lights',
    city: 'Mysuru',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    description: 'Witness the breathtaking Indo-Saracenic royal palace lit up with 100,000 golden bulbs on weekend evenings.',
    duration: '2h',
    cost: 200,
    rating: 4.9,
    location: 'Sayyaji Rao Road, Mysuru',
    bestTime: 'Evening',
    indoor: false,
  },
  {
    id: 'mysore-pak-tasting',
    title: 'Guru Sweet Mart Original Mysore Pak & Mylari Dosa',
    city: 'Mysuru',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'Taste the legendary melt-in-mouth ghee sweet invented for the Maharaja and fluffy Mylari butter dosa.',
    duration: '1h 15m',
    cost: 160,
    rating: 4.9,
    location: 'Devaraja Market, Mysuru',
    bestTime: 'Morning',
    indoor: true,
  },

  // Hyderabad
  {
    id: 'charminar-biryani-walk',
    title: 'Charminar Heritage & Authentic Hyderabadi Dum Biryani',
    city: 'Hyderabad',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=600&q=80',
    description: 'Visit the 1591 monument, shop bangles in Laad Bazaar, and relish aromatic slow-cooked saffron Dum Biryani.',
    duration: '3h',
    cost: 450,
    rating: 4.9,
    location: 'Charminar / Old City, Hyderabad',
    bestTime: 'Evening',
    indoor: false,
  },
  {
    id: 'golconda-fort-acoustics',
    title: 'Golconda Fort Acoustical Tour & Sound Show',
    city: 'Hyderabad',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'Clap at Fateh Darwaza to hear echoes at Bala Hissar 1km away; explore diamond vaults and evening light show.',
    duration: '2h 30m',
    cost: 250,
    rating: 4.8,
    location: 'Ibrahim Bagh, Hyderabad',
    bestTime: 'Morning',
    indoor: false,
  },

  // Puri
  {
    id: 'jagannath-temple-darshan',
    title: 'Shree Jagannath Temple & Sacred Mahaprasad Feast',
    city: 'Puri',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    description: 'Experience the 12th-century Kalinga sanctuary and taste the divine 56-bhog Mahaprasad cooked in earthen pots.',
    duration: '2h 30m',
    cost: 150,
    rating: 4.9,
    location: 'Grand Road, Puri',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'konark-sun-temple-drive',
    title: 'Konark Sun Temple (UNESCO Black Pagoda) Coastal Tour',
    city: 'Puri',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    description: 'Scenic marine drive to the giant 24-wheeled stone chariot of the Sun God with erotic sculptures.',
    duration: '3h 30m',
    cost: 400,
    rating: 4.9,
    location: 'Konark, Odisha',
    bestTime: 'Morning',
    indoor: false,
  },

  // Leh & Ladakh
  {
    id: 'pangong-tso-excursion',
    title: 'Pangong Tso Blue Lake & Chang La Pass Day Trip',
    city: 'Leh & Ladakh',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80',
    description: 'Cross the world’s 3rd highest pass to reach the color-changing sapphire lake at 14,270 ft.',
    duration: '8h',
    cost: 2800,
    rating: 5.0,
    location: 'Pangong Lake, Ladakh',
    bestTime: 'Morning',
    indoor: false,
  },
  {
    id: 'ladakhi-thukpa-butter-tea',
    title: 'Authentic Ladakhi Thukpa, Momos & Gur-Gur Butter Tea',
    city: 'Leh & Ladakh',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    description: 'Handmade noodles in rich vegetable or yak broth served with steaming dumplings and salty pink butter tea.',
    duration: '1h 30m',
    cost: 320,
    rating: 4.8,
    location: 'Main Bazaar, Leh',
    bestTime: 'Evening',
    indoor: true,
  },

  // Madurai
  {
    id: 'meenakshi-amman-temple',
    title: 'Meenakshi Amman Temple 1,000-Pillar Hall & Aarti',
    city: 'Madurai',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    description: 'Walk beneath soaring Dravidian gopurams decorated with thousands of brightly colored mythological statues.',
    duration: '2h 30m',
    cost: 100,
    rating: 4.9,
    location: 'Madurai Main, Tamil Nadu',
    bestTime: 'Morning',
    indoor: true,
  },
  {
    id: 'jigarthanda-kari-dosa',
    title: 'Famous Famous Jigarthanda & Konar Mess Kari Dosa',
    city: 'Madurai',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    description: 'Chilled almond gum, nannari syrup and condensed milk dessert paired with legendary minced mutton Kari Dosa.',
    duration: '1h 30m',
    cost: 240,
    rating: 4.9,
    location: 'East Marret Street, Madurai',
    bestTime: 'Evening',
    indoor: true,
  },
]

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

export const itinerary: ItineraryDay[] = [
  {
    id: 'day-1',
    label: 'Day 1',
    date: 'Thu 15 Oct',
    city: 'Jaipur',
    activities: [
      {
        id: 'a1',
        slot: 'Morning',
        time: '08:30',
        title: 'Rawat Mishthan Bhandar Pyaaz Kachori & Lassi',
        category: 'Food',
        duration: '1h',
        cost: 180,
        location: 'Station Road, Jaipur',
        note: 'Piping hot kachoris with green chutney.',
      },
      {
        id: 'a2',
        slot: 'Afternoon',
        time: '13:30',
        title: 'Amber Fort Guided Heritage Walk',
        category: 'Heritage',
        duration: '2h 30m',
        cost: 500,
        location: 'Amer Fort Ramparts',
        booked: true,
      },
      {
        id: 'a3',
        slot: 'Evening',
        time: '19:30',
        title: 'Chokhi Dhani Rajasthani Village Feast',
        category: 'Food',
        duration: '3h 30m',
        cost: 1100,
        location: 'Tonk Road, Jaipur',
        booked: true,
      },
    ],
  },
  {
    id: 'day-2',
    label: 'Day 2',
    date: 'Fri 16 Oct',
    city: 'Jaipur',
    activities: [
      {
        id: 'a4',
        slot: 'Morning',
        time: '09:00',
        title: 'Hawa Mahal Palace of Winds & Bazaars',
        category: 'Sightseeing',
        duration: '1h 30m',
        cost: 200,
        location: 'Badi Chaupar',
      },
      {
        id: 'a5',
        slot: 'Afternoon',
        time: '14:00',
        title: 'City Palace & Jantar Mantar Observatory',
        category: 'Culture',
        duration: '2h 30m',
        cost: 300,
        location: 'City Palace Road',
        booked: true,
      },
    ],
  },
  {
    id: 'day-3',
    label: 'Day 3',
    date: 'Sat 17 Oct',
    city: 'Udaipur',
    travelNote: 'Vande Bharat Express Jaipur → Udaipur · 6h · ₹1,250',
    activities: [
      {
        id: 'a6',
        slot: 'Afternoon',
        time: '15:30',
        title: 'Udaipur City Palace & Crystal Gallery',
        category: 'Heritage',
        duration: '2h 30m',
        cost: 350,
        location: 'City Palace Complex',
      },
      {
        id: 'a7',
        slot: 'Evening',
        time: '18:15',
        title: 'Lake Pichola Sunset Boat Cruise',
        category: 'Sightseeing',
        duration: '1h 15m',
        cost: 450,
        location: 'Rameshwar Ghat',
        booked: true,
      },
    ],
  },
  {
    id: 'day-4',
    label: 'Day 4',
    date: 'Sun 18 Oct',
    city: 'Udaipur',
    activities: [
      {
        id: 'a8',
        slot: 'Morning',
        time: '09:30',
        title: 'Saheliyon Ki Bari & Fateh Sagar Lake Walk',
        category: 'Nature',
        duration: '2h',
        cost: 100,
        location: 'Saheli Marg',
      },
      {
        id: 'a9',
        slot: 'Evening',
        time: '19:00',
        title: 'Dharohar Cultural Dance at Bagore Ki Haveli',
        category: 'Culture',
        duration: '1h',
        cost: 150,
        location: 'Gangaur Ghat',
        booked: true,
      },
    ],
  },
]

export const unscheduled = [
  { id: 'u1', title: 'Nahargarh Fort Sunset Viewpoint', city: 'Jaipur', cost: 100, duration: '1h 30m' },
  { id: 'u2', title: 'Jag Mandir Palace Afternoon Tea', city: 'Udaipur', cost: 800, duration: '2h' },
  { id: 'u3', title: 'Sunder Nursery Heritage Garden Walk', city: 'Delhi', cost: 50, duration: '1h 45m' },
]

export const budgetByCategory = [
  { category: 'Transport', amount: 14200, fill: 'var(--color-transport)' },
  { category: 'Stays', amount: 21500, fill: 'var(--color-stays)' },
  { category: 'Activities', amount: 6800, fill: 'var(--color-activities)' },
  { category: 'Meals', amount: 4800, fill: 'var(--color-meals)' },
  { category: 'Other', amount: 1200, fill: 'var(--color-other)' },
]

export const dailySpend = [
  { day: 'Oct 15', amount: 4200 },
  { day: 'Oct 16', amount: 3600 },
  { day: 'Oct 17', amount: 5800 },
  { day: 'Oct 18', amount: 3900 },
  { day: 'Oct 19', amount: 4400 },
  { day: 'Oct 20', amount: 5100 },
  { day: 'Oct 21', amount: 3200 },
  { day: 'Oct 22', amount: 6400 },
]

export const budgetByCity = [
  { city: 'Jaipur', nights: 3, amount: 18500, share: 38 },
  { city: 'Udaipur', nights: 3, amount: 16800, share: 35 },
  { city: 'Delhi', nights: 3, amount: 13200, share: 27 },
]

export const expenses = [
  { id: 'e1', item: 'Vande Bharat train, Jaipur → Udaipur', city: 'Jaipur', category: 'Transport', day: 'Oct 17', amount: 3750 },
  { id: 'e2', item: 'Heritage Haveli Stay, 3 nights', city: 'Jaipur', category: 'Stays', day: 'Oct 15', amount: 10500 },
  { id: 'e3', item: 'Amber Fort VIP entries × 3', city: 'Jaipur', category: 'Activities', day: 'Oct 15', amount: 1500 },
  { id: 'e4', item: 'Lake Palace View Resort, 3 nights', city: 'Udaipur', category: 'Stays', day: 'Oct 17', amount: 11000 },
  { id: 'e5', item: 'Lake Pichola Sunset boat × 3', city: 'Udaipur', category: 'Activities', day: 'Oct 17', amount: 1350 },
  { id: 'e6', item: 'Chokhi Dhani Royal Village Feasts', city: 'Jaipur', category: 'Meals', day: 'Oct 15', amount: 3300 },
]

export const adminMonthly = [
  { month: 'Sep', trips: 1420 },
  { month: 'Oct', trips: 1840 },
  { month: 'Nov', trips: 2280 },
  { month: 'Dec', trips: 2940 },
  { month: 'Jan', trips: 2420 },
  { month: 'Feb', trips: 2780 },
]

export const adminCities = [
  { city: 'Jaipur', trips: 2840, change: '+24%' },
  { city: 'Udaipur', trips: 2410, change: '+18%' },
  { city: 'Goa', trips: 2290, change: '+15%' },
  { city: 'Varanasi', trips: 1910, change: '+28%' },
  { city: 'Manali', trips: 1780, change: '+12%' },
]

export const adminActivities = [
  { activity: 'Fort & Palace walks', added: 5120 },
  { activity: 'Iconic Street Food tours', added: 4860 },
  { activity: 'Sunset Lake & River cruises', added: 4210 },
  { activity: 'Temple Aarti ceremonies', added: 3740 },
  { activity: 'Himalayan Adventure sports', added: 3180 },
]

export const adminUsers = [
  { id: 'u-1041', name: 'Aarti Rao', email: 'aarti@example.com', trips: 12, joined: '12 Jan 2026', status: 'Active' },
  { id: 'u-1042', name: 'Sam Keller', email: 'sam.k@example.com', trips: 4, joined: '3 Feb 2026', status: 'Active' },
  { id: 'u-1043', name: 'Nina Patel', email: 'nina.p@example.com', trips: 27, joined: '19 Nov 2025', status: 'Active' },
  { id: 'u-1044', name: 'Rohan Sharma', email: 'rohan.s@example.com', trips: 8, joined: '21 Feb 2026', status: 'Active' },
  { id: 'u-1045', name: 'Priya Iyer', email: 'priya.i@example.com', trips: 9, joined: '8 Dec 2025', status: 'Active' },
]

export const adminEngagement = [
  { label: 'Daily active users', value: '6,420', share: 34, note: '34% of all accounts' },
  { label: 'Weekly active users', value: '14,280', share: 62, note: '62% of all accounts' },
  { label: 'Return within 30 days', value: '74%', share: 74, note: 'Up 8 points' },
  { label: 'Avg. sessions / traveller', value: '4.6', share: 52, note: 'Per week' },
]

export const adminSharedItineraries = [
  { id: 's-1', title: 'Royal Rajasthan & Golden Triangle', owner: 'Aarti Rao', views: 6820, copies: 482, city: 'Jaipur' },
  { id: 's-2', title: 'Udaipur Lakes & Palaces Romance', owner: 'Priya Iyer', views: 5140, copies: 388, city: 'Udaipur' },
  { id: 's-3', title: 'Goa Coastal & Heritage Trail', owner: 'Sam Keller', views: 4610, copies: 320, city: 'Goa' },
  { id: 's-4', title: 'Varanasi Ghats & Cultural Soul', owner: 'Nina Patel', views: 3960, copies: 290, city: 'Varanasi' },
  { id: 's-5', title: 'Manali & Solang Adventure', owner: 'Rohan Sharma', views: 3280, copies: 243, city: 'Manali' },
]

export const moderationQueue = [
  { id: 'm-1', type: 'Shared itinerary', title: 'Backpacking Himachal on ₹1200/day', reporter: 'u-1042', reason: 'Spam links in notes' },
  { id: 'm-2', type: 'Activity note', title: 'Sunset boat, Lake Pichola', reporter: 'u-1045', reason: 'Contact details in description' },
  { id: 'm-3', type: 'Profile bio', title: 'traveldeals_india', reporter: 'u-1041', reason: 'Promotional account' },
]

export const cityColors: Record<string, string> = {
  Jaipur: 'bg-brand',
  Udaipur: 'bg-success',
  Delhi: 'bg-warning',
  Goa: 'bg-sky-500',
  Mumbai: 'bg-indigo-500',
  Varanasi: 'bg-amber-600',
  Jodhpur: 'bg-blue-600',
  Jaisalmer: 'bg-yellow-600',
  Hampi: 'bg-amber-700',
  Rishikesh: 'bg-teal-600',
  Shimla: 'bg-cyan-600',
  Mysuru: 'bg-rose-600',
  Hyderabad: 'bg-purple-600',
  Puri: 'bg-emerald-600',
  Leh: 'bg-sky-700',
  Madurai: 'bg-red-600',
}

export function money(amount: number | null | undefined, currency = '₹') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0`
  }
  return `${currency}${amount.toLocaleString('en-IN')}`
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

export const communityTrips: CommunityTrip[] = [
  {
    id: 'c-1',
    title: 'Royal Rajasthan & Golden Triangle',
    author: 'Aarti Rao',
    authorAvatar: 'AR',
    authorRole: 'Pro Traveler · 14 trips',
    rating: 4.9,
    reviewsCount: 54,
    cover: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    cities: ['Jaipur', 'Udaipur', 'Delhi'],
    days: 10,
    budget: 48500,
    style: 'Balanced',
    bookmarked: true,
    likes: 492,
    description: 'A 10-day majestic route across Jaipur, Udaipur and Delhi with royal forts, lakeside palaces, and iconic food spots.',
    reviews: [
      { id: 'r1', user: 'Sam K.', avatar: 'SK', rating: 5, comment: 'Amber Fort and Rawat kachori timings were perfect. Saved so much queue time!', date: '2 days ago' },
      { id: 'r2', user: 'Yash M.', avatar: 'YM', rating: 5, comment: 'Super well structured. The Vande Bharat transfer between Jaipur and Udaipur was very smooth.', date: '1 week ago' },
    ],
  },
  {
    id: 'c-2',
    title: 'Goa Coastal & Heritage Trail',
    author: 'Rohan Sharma',
    authorAvatar: 'RS',
    authorRole: 'Local Expert · Goa',
    rating: 4.8,
    reviewsCount: 38,
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    cities: ['Goa'],
    days: 6,
    budget: 28000,
    style: 'Comfort',
    bookmarked: false,
    likes: 315,
    description: 'Old Goa Portuguese cathedrals, authentic seafood thalis, spice plantations, and Palolem kayaking.',
    reviews: [
      { id: 'r3', user: 'Nina P.', avatar: 'NP', rating: 5, comment: 'The sunset kayaking at Palolem beach was the highlight of our vacation!', date: '3 days ago' },
    ],
  },
  {
    id: 'c-3',
    title: 'Varanasi Ghats & Cultural Soul',
    author: 'Priya Iyer',
    authorAvatar: 'PI',
    authorRole: 'Heritage Curator · 12 trips',
    rating: 5.0,
    reviewsCount: 46,
    cover: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    cities: ['Varanasi'],
    days: 4,
    budget: 18500,
    style: 'Balanced',
    bookmarked: true,
    likes: 410,
    description: 'Sunrise boat rides along the 84 ghats, the divine evening Maha Aarti, Banarasi chaat trails, and Sarnath.',
    reviews: [
      { id: 'r4', user: 'Aarti R.', avatar: 'AR', rating: 5, comment: 'Ganga Aarti boat view was surreal. The chaat recommendations were unforgettable!', date: 'Yesterday' },
    ],
  },
]
