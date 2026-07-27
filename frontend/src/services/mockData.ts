export const recentTrips = [
  { id: 1, title: 'North Loop to Skyline Tower', time: '26 min', savings: 'Rs. 182', mode: 'Rapido + Metro', score: '94' },
  { id: 2, title: 'Airport Express Corridor', time: '41 min', savings: 'Rs. 268', mode: 'Metro + Walk', score: '89' },
  { id: 3, title: 'Harbor Evening Sprint', time: '19 min', savings: 'Rs. 74', mode: 'Cab', score: '81' },
]

export const savedPlaces = [
  { id: 1, label: 'Home', detail: 'North Loop, Sector 12', signal: 'Low traffic' },
  { id: 2, label: 'Work', detail: 'Skyline Tower, Business District', signal: 'Metro preferred' },
  { id: 3, label: 'Airport', detail: 'Terminal 3, East Hub', signal: 'Express active' },
]

export const trafficOverview = [
  { label: 'North Loop', value: 37, tone: 'cyan' },
  { label: 'CBD', value: 76, tone: 'amber' },
  { label: 'Harbor Link', value: 51, tone: 'violet' },
  { label: 'East Hub', value: 42, tone: 'emerald' },
]

export const agentSteps = [
  {
    name: 'Geographic Agent',
    status: 'Resolved',
    progress: 100,
    detail: 'Demand zones, walkability, station access',
    logs: ['Origin snapped to Sector 12 gate', '540m walk radius scored', 'Rain-safe corridors preferred'],
    tone: 'cyan',
  },
  {
    name: 'Transit Agent',
    status: 'Running',
    progress: 86,
    detail: 'Metro frequency, transfers, platform load',
    logs: ['Blue line headway: 4 min', 'Platform 4 crowding moderate', 'Interchange risk reduced'],
    tone: 'violet',
  },
  {
    name: 'Mobility Agent',
    status: 'Collecting',
    progress: 72,
    detail: 'Cab, bike taxi, fare surge, pickup ETA',
    logs: ['Rapido ETA dropped to 3 min', 'Cab surge detected near CBD', 'Bike taxi confidence 91%'],
    tone: 'emerald',
  },
  {
    name: 'Synthesis Agent',
    status: 'Optimizing',
    progress: 58,
    detail: 'Cost, time, comfort, carbon trade-offs',
    logs: ['Balanced profile selected', 'Rs. 182 savings confirmed', 'Final explanation generated'],
    tone: 'amber',
  },
]

export const routeComparison = [
  { id: 1, title: 'Metro', cost: 'Rs. 96', eta: '34 min', walking: '1.2 km', transfers: '2', comfort: 74, recommended: false, carbon: '0.42 kg', accent: 'cyan' },
  { id: 2, title: 'Cab', cost: 'Rs. 265', eta: '22 min', walking: '0.4 km', transfers: '0', comfort: 82, recommended: false, carbon: '2.9 kg', accent: 'violet' },
  { id: 3, title: 'Rapido + Metro', cost: 'Rs. 142', eta: '26 min', walking: '0.7 km', transfers: '1', comfort: 91, recommended: true, carbon: '0.86 kg', accent: 'emerald' },
  { id: 4, title: 'Bus', cost: 'Rs. 54', eta: '49 min', walking: '1.8 km', transfers: '2', comfort: 61, recommended: false, carbon: '0.66 kg', accent: 'amber' },
  { id: 5, title: 'Walking', cost: 'Rs. 0', eta: '74 min', walking: '5.4 km', transfers: '0', comfort: 48, recommended: false, carbon: '0 kg', accent: 'slate' },
]

export const journeyTimeline = [
  { title: 'Walk', subtitle: 'Sector 12 gate to pickup point', duration: '5 min', icon: 'walk', distance: '420 m' },
  { title: 'Rapido', subtitle: 'Electric bike taxi to Central Metro', duration: '12 min', icon: 'bike', distance: '3.1 km' },
  { title: 'Metro', subtitle: 'Blue line northbound to Business District', duration: '18 min', icon: 'train', distance: '8 stops' },
  { title: 'Walk', subtitle: 'Skyline Tower final approach', duration: '4 min', icon: 'walk', distance: '280 m' },
]

export const historyStats = [
  { label: 'Trips optimized', value: '124', change: '+18%', detail: 'this quarter' },
  { label: 'Money saved', value: 'Rs. 3.2k', change: '+11%', detail: 'versus cab-only' },
  { label: 'Carbon avoided', value: '42 kg', change: '+24%', detail: 'estimated CO2' },
]

export const savingsData = [
  { name: 'Mon', value: 154, carbon: 2.1 },
  { name: 'Tue', value: 182, carbon: 2.8 },
  { name: 'Wed', value: 140, carbon: 1.7 },
  { name: 'Thu', value: 228, carbon: 3.4 },
  { name: 'Fri', value: 206, carbon: 3.1 },
  { name: 'Sat', value: 262, carbon: 4.2 },
  { name: 'Sun', value: 188, carbon: 2.6 },
]
