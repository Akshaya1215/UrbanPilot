export const recentTrips = [
  { id: 1, title: 'Airport Express', time: '08:20', savings: '₹182', mode: 'Rapido + Metro' },
  { id: 2, title: 'Downtown Commute', time: '17:45', savings: '₹96', mode: 'Bus + Metro' },
  { id: 3, title: 'Evening Sprint', time: '20:10', savings: '₹74', mode: 'Cab' },
]

export const savedPlaces = [
  { id: 1, label: 'Home', detail: 'North Loop, Sector 12' },
  { id: 2, label: 'Work', detail: 'Skyline Tower, Business District' },
  { id: 3, label: 'Airport', detail: 'Terminal 3, East Hub' },
]

export const trafficOverview = [
  { label: 'North Loop', value: 37, tone: 'text-cyan-400' },
  { label: 'CBD', value: 76, tone: 'text-amber-400' },
  { label: 'Harbor', value: 51, tone: 'text-violet-400' },
]

export const agentSteps = [
  { name: 'Geographic Agent', status: 'Completed', progress: 100, detail: 'Demand zones mapped' },
  { name: 'Transit Agent', status: 'Running', progress: 82, detail: 'Live feed scanning' },
  { name: 'Mobility Agent', status: 'Collecting prices', progress: 64, detail: 'Fare matrix synced' },
  { name: 'Synthesis Agent', status: 'Thinking...', progress: 46, detail: 'Trade-off optimization' },
]

export const routeComparison = [
  { id: 1, title: 'Metro Only', cost: '₹96', eta: '34 min', walking: '1.2 km', transfers: '2', comfort: 74, recommended: false },
  { id: 2, title: 'Cab', cost: '₹265', eta: '22 min', walking: '0.4 km', transfers: '0', comfort: 82, recommended: false },
  { id: 3, title: 'Rapido + Metro', cost: '₹142', eta: '26 min', walking: '0.7 km', transfers: '1', comfort: 91, recommended: true },
  { id: 4, title: 'Bus + Metro', cost: '₹84', eta: '41 min', walking: '1.6 km', transfers: '3', comfort: 67, recommended: false },
]

export const journeyTimeline = [
  { title: 'Walk', subtitle: 'From current location', duration: '5 min', icon: 'Footprints' },
  { title: 'Rapido', subtitle: 'Shared electric ride', duration: '12 min', icon: 'Car' },
  { title: 'Metro', subtitle: 'Northbound line', duration: '18 min', icon: 'Train' },
  { title: 'Walk', subtitle: 'Final approach', duration: '4 min', icon: 'Footprints' },
]

export const historyStats = [
  { label: 'Trips', value: '124', change: '+18%' },
  { label: 'Savings', value: '₹3.2k', change: '+11%' },
  { label: 'Avg. ETA', value: '27 min', change: '-6%' },
]

export const savingsData = [
  { name: 'Mon', value: 154 },
  { name: 'Tue', value: 182 },
  { name: 'Wed', value: 140 },
  { name: 'Thu', value: 228 },
  { name: 'Fri', value: 206 },
  { name: 'Sat', value: 262 },
  { name: 'Sun', value: 188 },
]
