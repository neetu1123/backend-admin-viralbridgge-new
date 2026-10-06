export declare const DISCOVERY_CITIES: readonly [{
    readonly name: "Mumbai";
    readonly state: "Maharashtra";
    readonly slug: "mumbai";
}, {
    readonly name: "Delhi";
    readonly state: "Delhi";
    readonly slug: "delhi";
}, {
    readonly name: "Bangalore";
    readonly state: "Karnataka";
    readonly slug: "bangalore";
}, {
    readonly name: "Hyderabad";
    readonly state: "Telangana";
    readonly slug: "hyderabad";
}, {
    readonly name: "Pune";
    readonly state: "Maharashtra";
    readonly slug: "pune";
}, {
    readonly name: "Ahmedabad";
    readonly state: "Gujarat";
    readonly slug: "ahmedabad";
}, {
    readonly name: "Chennai";
    readonly state: "Tamil Nadu";
    readonly slug: "chennai";
}, {
    readonly name: "Kolkata";
    readonly state: "West Bengal";
    readonly slug: "kolkata";
}, {
    readonly name: "Noida";
    readonly state: "Uttar Pradesh";
    readonly slug: "noida";
}, {
    readonly name: "Gurgaon";
    readonly state: "Haryana";
    readonly slug: "gurgaon";
}, {
    readonly name: "Jaipur";
    readonly state: "Rajasthan";
    readonly slug: "jaipur";
}, {
    readonly name: "Lucknow";
    readonly state: "Uttar Pradesh";
    readonly slug: "lucknow";
}, {
    readonly name: "Chandigarh";
    readonly state: "Chandigarh";
    readonly slug: "chandigarh";
}, {
    readonly name: "Indore";
    readonly state: "Madhya Pradesh";
    readonly slug: "indore";
}, {
    readonly name: "Kochi";
    readonly state: "Kerala";
    readonly slug: "kochi";
}, {
    readonly name: "Goa";
    readonly state: "Goa";
    readonly slug: "goa";
}, {
    readonly name: "Surat";
    readonly state: "Gujarat";
    readonly slug: "surat";
}, {
    readonly name: "Nagpur";
    readonly state: "Maharashtra";
    readonly slug: "nagpur";
}, {
    readonly name: "Bhopal";
    readonly state: "Madhya Pradesh";
    readonly slug: "bhopal";
}, {
    readonly name: "Coimbatore";
    readonly state: "Tamil Nadu";
    readonly slug: "coimbatore";
}];
export declare const DEFAULT_DISCOVERY_CATEGORIES: readonly [{
    readonly name: "Gyms";
    readonly slug: "gyms";
    readonly icon: "💪";
    readonly type: "BUSINESS";
    readonly sort_order: 1;
}, {
    readonly name: "Salons";
    readonly slug: "salons";
    readonly icon: "💇";
    readonly type: "BUSINESS";
    readonly sort_order: 2;
}, {
    readonly name: "Restaurants";
    readonly slug: "restaurants";
    readonly icon: "🍽️";
    readonly type: "BUSINESS";
    readonly sort_order: 3;
}, {
    readonly name: "Hotels";
    readonly slug: "hotels";
    readonly icon: "🏨";
    readonly type: "BUSINESS";
    readonly sort_order: 4;
}, {
    readonly name: "Photographers";
    readonly slug: "photographers";
    readonly icon: "📷";
    readonly type: "BOTH";
    readonly sort_order: 5;
}, {
    readonly name: "Makeup Artists";
    readonly slug: "makeup-artists";
    readonly icon: "💄";
    readonly type: "BOTH";
    readonly sort_order: 6;
}, {
    readonly name: "Fashion";
    readonly slug: "fashion";
    readonly icon: "👗";
    readonly type: "BOTH";
    readonly sort_order: 7;
}, {
    readonly name: "Beauty";
    readonly slug: "beauty";
    readonly icon: "✨";
    readonly type: "BOTH";
    readonly sort_order: 8;
}, {
    readonly name: "Fitness";
    readonly slug: "fitness";
    readonly icon: "🏋️";
    readonly type: "BOTH";
    readonly sort_order: 9;
}, {
    readonly name: "Travel";
    readonly slug: "travel";
    readonly icon: "✈️";
    readonly type: "BOTH";
    readonly sort_order: 10;
}, {
    readonly name: "Events";
    readonly slug: "events";
    readonly icon: "🎉";
    readonly type: "BUSINESS";
    readonly sort_order: 11;
}, {
    readonly name: "Wedding";
    readonly slug: "wedding";
    readonly icon: "💍";
    readonly type: "BOTH";
    readonly sort_order: 12;
}, {
    readonly name: "Technology";
    readonly slug: "technology";
    readonly icon: "💻";
    readonly type: "BOTH";
    readonly sort_order: 13;
}, {
    readonly name: "Education";
    readonly slug: "education";
    readonly icon: "📚";
    readonly type: "BOTH";
    readonly sort_order: 14;
}, {
    readonly name: "Healthcare";
    readonly slug: "healthcare";
    readonly icon: "🏥";
    readonly type: "BUSINESS";
    readonly sort_order: 15;
}, {
    readonly name: "Retail";
    readonly slug: "retail";
    readonly icon: "🛍️";
    readonly type: "BUSINESS";
    readonly sort_order: 16;
}, {
    readonly name: "Services";
    readonly slug: "services";
    readonly icon: "🛠️";
    readonly type: "BUSINESS";
    readonly sort_order: 17;
}, {
    readonly name: "Lifestyle";
    readonly slug: "lifestyle";
    readonly icon: "🌿";
    readonly type: "CREATOR";
    readonly sort_order: 18;
}, {
    readonly name: "Food";
    readonly slug: "food";
    readonly icon: "🍔";
    readonly type: "BOTH";
    readonly sort_order: 19;
}, {
    readonly name: "Gaming";
    readonly slug: "gaming";
    readonly icon: "🎮";
    readonly type: "CREATOR";
    readonly sort_order: 20;
}];
export declare function slugify(value: string): string;
export declare function parseLocationFromQuery(q: string): {
    keyword: string;
    city?: string;
    area?: string;
};
