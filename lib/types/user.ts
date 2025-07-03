export interface User {
  id: number;
  username: string;
  email: string;
  business_area: string; // Primary business area
  business_areas: string[]; // List of all associated business areas
  created_at: string;
} 