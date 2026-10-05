export const DISCOVERY_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', slug: 'mumbai' },
  { name: 'Delhi', state: 'Delhi', slug: 'delhi' },
  { name: 'Bangalore', state: 'Karnataka', slug: 'bangalore' },
  { name: 'Hyderabad', state: 'Telangana', slug: 'hyderabad' },
  { name: 'Pune', state: 'Maharashtra', slug: 'pune' },
  { name: 'Ahmedabad', state: 'Gujarat', slug: 'ahmedabad' },
  { name: 'Chennai', state: 'Tamil Nadu', slug: 'chennai' },
  { name: 'Kolkata', state: 'West Bengal', slug: 'kolkata' },
  { name: 'Noida', state: 'Uttar Pradesh', slug: 'noida' },
  { name: 'Gurgaon', state: 'Haryana', slug: 'gurgaon' },
  { name: 'Jaipur', state: 'Rajasthan', slug: 'jaipur' },
  { name: 'Lucknow', state: 'Uttar Pradesh', slug: 'lucknow' },
  { name: 'Chandigarh', state: 'Chandigarh', slug: 'chandigarh' },
  { name: 'Indore', state: 'Madhya Pradesh', slug: 'indore' },
  { name: 'Kochi', state: 'Kerala', slug: 'kochi' },
  { name: 'Goa', state: 'Goa', slug: 'goa' },
  { name: 'Surat', state: 'Gujarat', slug: 'surat' },
  { name: 'Nagpur', state: 'Maharashtra', slug: 'nagpur' },
  { name: 'Bhopal', state: 'Madhya Pradesh', slug: 'bhopal' },
  { name: 'Coimbatore', state: 'Tamil Nadu', slug: 'coimbatore' },
] as const;

export const DEFAULT_DISCOVERY_CATEGORIES = [
  { name: 'Gyms', slug: 'gyms', icon: '💪', type: 'BUSINESS', sort_order: 1 },
  { name: 'Salons', slug: 'salons', icon: '💇', type: 'BUSINESS', sort_order: 2 },
  { name: 'Restaurants', slug: 'restaurants', icon: '🍽️', type: 'BUSINESS', sort_order: 3 },
  { name: 'Hotels', slug: 'hotels', icon: '🏨', type: 'BUSINESS', sort_order: 4 },
  { name: 'Photographers', slug: 'photographers', icon: '📷', type: 'BOTH', sort_order: 5 },
  { name: 'Makeup Artists', slug: 'makeup-artists', icon: '💄', type: 'BOTH', sort_order: 6 },
  { name: 'Fashion', slug: 'fashion', icon: '👗', type: 'BOTH', sort_order: 7 },
  { name: 'Beauty', slug: 'beauty', icon: '✨', type: 'BOTH', sort_order: 8 },
  { name: 'Fitness', slug: 'fitness', icon: '🏋️', type: 'BOTH', sort_order: 9 },
  { name: 'Travel', slug: 'travel', icon: '✈️', type: 'BOTH', sort_order: 10 },
  { name: 'Events', slug: 'events', icon: '🎉', type: 'BUSINESS', sort_order: 11 },
  { name: 'Wedding', slug: 'wedding', icon: '💍', type: 'BOTH', sort_order: 12 },
  { name: 'Technology', slug: 'technology', icon: '💻', type: 'BOTH', sort_order: 13 },
  { name: 'Education', slug: 'education', icon: '📚', type: 'BOTH', sort_order: 14 },
  { name: 'Healthcare', slug: 'healthcare', icon: '🏥', type: 'BUSINESS', sort_order: 15 },
  { name: 'Retail', slug: 'retail', icon: '🛍️', type: 'BUSINESS', sort_order: 16 },
  { name: 'Services', slug: 'services', icon: '🛠️', type: 'BUSINESS', sort_order: 17 },
  { name: 'Lifestyle', slug: 'lifestyle', icon: '🌿', type: 'CREATOR', sort_order: 18 },
  { name: 'Food', slug: 'food', icon: '🍔', type: 'BOTH', sort_order: 19 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', type: 'CREATOR', sort_order: 20 },
] as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function parseLocationFromQuery(q: string): { keyword: string; city?: string; area?: string } {
  const raw = q.trim();
  if (!raw) return { keyword: '' };
  const lower = raw.toLowerCase();
  const city = DISCOVERY_CITIES.find(
    (c) => lower.endsWith(` ${c.name.toLowerCase()}`) || lower === c.name.toLowerCase() || lower.includes(` in ${c.name.toLowerCase()}`),
  );
  if (!city) return { keyword: raw };
  const keyword = raw
    .replace(new RegExp(`\\bin\\s+${city.name}$`, 'i'), '')
    .replace(new RegExp(`\\s+${city.name}$`, 'i'), '')
    .trim();
  return { keyword: keyword || raw, city: city.name };
}
