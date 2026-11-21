export const SERVICES = [
  { icon: 'Stethoscope', title: 'Check-ups & cleans', text: 'A thorough exam, scale & clean and digital x-rays — with a clear plan, not a sales pitch.', from: 'From $169' },
  { icon: 'Baby', title: "Children's dentistry", text: 'Short, gentle visits with Dr Priya. Bulk-billed for eligible kids under CDBS.', from: '$0 with CDBS' },
  { icon: 'Sparkles', title: 'Teeth whitening', text: 'In-chair whitening in 90 minutes, or custom take-home trays at your own pace.', from: 'From $349' },
  { icon: 'Smile', title: 'Clear aligners', text: 'Straighten your teeth discreetly. Free consult with a 3D scan and smile preview.', from: 'From $4,900' },
  { icon: 'Gem', title: 'Crowns, veneers & implants', text: 'Natural-looking restorations, planned digitally and finished with care.', from: 'From $1,450' },
  { icon: 'Siren', title: 'Same-day emergencies', text: 'Toothache, chips or swelling? We keep emergency slots free every morning.', from: '$95 exam' },
]

export const PLANS = [
  {
    name: 'New patient visit',
    price: '$199',
    unit: 'one-off',
    blurb: 'Everything you need for a fresh start.',
    items: ['Full exam with your dentist', 'Scale, clean & polish', 'Two digital bitewing x-rays', 'Written treatment plan'],
    cta: 'Book a first visit',
  },
  {
    name: 'Tidewell Care Plan',
    price: '$29',
    unit: '/month',
    blurb: 'For people without private health cover.',
    items: ['Two check-ups & cleans a year', 'All routine x-rays', 'One emergency exam a year', '15% off all other treatment'],
    cta: 'Ask about the plan',
    featured: true,
  },
  {
    name: 'In-chair whitening',
    price: '$549',
    unit: 'one-off',
    blurb: 'Brighter in a single 90-minute visit.',
    items: ['Shade check and gum protection', 'Professional whitening gel', 'Sensitivity care kit', 'Take-home top-up gel'],
    cta: 'Book a consult',
  },
]

export const MORE_PRICES = [
  ['Returning patient check-up & clean', '$169'],
  ['Tooth-coloured filling', '$180 – $320'],
  ['Ceramic crown', '$1,650'],
  ['Single implant with crown', 'from $4,800'],
  ['Custom night guard', '$450'],
  ['Emergency exam', '$95'],
]

export const FAQ_IDS = ['health-funds', 'hours', 'emergency', 'anxiety', 'payment-plans', 'cancel-policy', 'parking', 'kids-price']

export const REVIEWS = [
  { name: 'Hannah W.', text: "I hadn't been to a dentist in eight years. Dr Priya was so patient — no lecture, just a plan. I actually look forward to my check-ups now." },
  { name: 'Marcus T.', text: 'Cracked a tooth on a Saturday morning, asked the chat at 7am and was in the chair by 10. Claimed through Bupa on the spot.' },
  { name: 'Ana R.', text: 'My two kids love Tidewell. The stickers help, but honestly it’s how calm everyone is. Bulk-billed too.' },
]

export const HOURS = [
  ['Monday – Wednesday', '8:00am – 6:00pm'],
  ['Thursday', '8:00am – 8:00pm'],
  ['Friday', '8:00am – 6:00pm'],
  ['Saturday', '9:00am – 2:00pm'],
  ['Sunday & public holidays', 'Closed'],
]
