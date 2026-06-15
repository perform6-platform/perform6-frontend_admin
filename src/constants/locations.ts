export type LocationStatus = 'active' | 'inactive';

export interface Location {
  id: string;
  name: string;
  devices: number;
  address: string;
  status: LocationStatus;
}

export const mockLocations: Location[] = [
  { id: 'loc-1', name: 'New York Gym', devices: 12, address: '123 Main St, New York, NY', status: 'active' },
  { id: 'loc-2', name: 'Chicago Gym', devices: 9, address: '456 Oak St, Chicago, IL', status: 'active' },
  { id: 'loc-3', name: 'Dallas Gym', devices: 8, address: '789 Elm St, Dallas, TX', status: 'active' },
  { id: 'loc-4', name: 'Los Angeles Gym', devices: 7, address: '221 Pine St, Los Angeles, CA', status: 'active' },
  { id: 'loc-5', name: 'Miami Gym', devices: 6, address: '654 Beach St, Miami, FL', status: 'active' },
  { id: 'loc-6', name: 'Boston Gym', devices: 5, address: '987 River St, Boston, MA', status: 'active' },
  { id: 'loc-7', name: 'Seattle Gym', devices: 5, address: '112 Harbor Ave, Seattle, WA', status: 'active' },
  { id: 'loc-8', name: 'Denver Gym', devices: 4, address: '330 Mountain Rd, Denver, CO', status: 'active' },
  { id: 'loc-9', name: 'Atlanta Gym', devices: 6, address: '445 Peachtree St, Atlanta, GA', status: 'active' },
  { id: 'loc-10', name: 'Phoenix Gym', devices: 4, address: '778 Desert Blvd, Phoenix, AZ', status: 'active' },
  { id: 'loc-11', name: 'San Diego Gym', devices: 5, address: '901 Coast Hwy, San Diego, CA', status: 'active' },
  { id: 'loc-12', name: 'Portland Gym', devices: 3, address: '256 Forest Ln, Portland, OR', status: 'active' },
  { id: 'loc-13', name: 'Austin Gym', devices: 4, address: '612 Live Oak Dr, Austin, TX', status: 'active' },
  { id: 'loc-14', name: 'Nashville Gym', devices: 3, address: '884 Music Row, Nashville, TN', status: 'active' },
  { id: 'loc-15', name: 'Charlotte Gym', devices: 4, address: '159 Queen City Ave, Charlotte, NC', status: 'active' },
  { id: 'loc-16', name: 'Minneapolis Gym', devices: 3, address: '402 Lake St, Minneapolis, MN', status: 'active' },
  { id: 'loc-17', name: 'Detroit Gym', devices: 2, address: '733 Motor Ave, Detroit, MI', status: 'inactive' },
  { id: 'loc-18', name: 'Philadelphia Gym', devices: 4, address: '518 Liberty St, Philadelphia, PA', status: 'active' },
  { id: 'loc-19', name: 'Houston Gym', devices: 5, address: '267 Bayou Rd, Houston, TX', status: 'active' },
  { id: 'loc-20', name: 'Orlando Gym', devices: 3, address: '841 Theme Park Way, Orlando, FL', status: 'active' },
  { id: 'loc-21', name: 'Las Vegas Gym', devices: 4, address: '190 Strip Blvd, Las Vegas, NV', status: 'active' },
  { id: 'loc-22', name: 'Salt Lake Gym', devices: 2, address: '355 Valley View, Salt Lake City, UT', status: 'active' },
  { id: 'loc-23', name: 'Kansas City Gym', devices: 3, address: '476 Plaza Dr, Kansas City, MO', status: 'active' },
  { id: 'loc-24', name: 'Columbus Gym', devices: 2, address: '623 Buckeye St, Columbus, OH', status: 'active' },
];
