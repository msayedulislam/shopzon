import { useState } from 'react';
import { toast } from 'sonner';

interface LocationData {
  address: string;
  city: string;
  area: string;
  postalCode: string;
}

interface UseLocationDetectReturn {
  detecting: boolean;
  detectLocation: () => Promise<LocationData | null>;
}

export function useLocationDetect(): UseLocationDetectReturn {
  const [detecting, setDetecting] = useState(false);

  const detectLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return null;
    }

    setDetecting(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const addressDetails = data.address || {};

      // Extract address components with better fallbacks
      const houseNumber = addressDetails.house_number || '';
      const road = addressDetails.road || addressDetails.street || '';
      const neighbourhood = addressDetails.neighbourhood || addressDetails.suburb || addressDetails.hamlet || '';
      const quarter = addressDetails.quarter || addressDetails.residential || '';
      const village = addressDetails.village || '';
      
      // City extraction with multiple fallbacks
      const city = addressDetails.city || addressDetails.town || addressDetails.village || 
                   addressDetails.municipality || addressDetails.state_district?.replace(' District', '') || 'Dhaka';
      
      // Area extraction - use neighbourhood, county, or district
      const area = neighbourhood || addressDetails.county || addressDetails.district || 
                   addressDetails.state_district?.replace(' District', '') || '';
      
      const postalCode = addressDetails.postcode || '';

      // Build full address from available parts
      const addressParts = [houseNumber, road, quarter, neighbourhood, village].filter(Boolean);
      
      // If we have specific address parts, use them; otherwise use display_name
      let address = '';
      if (addressParts.length > 0) {
        address = addressParts.join(', ');
      } else if (data.display_name) {
        // Use first 3 parts of display_name for a reasonable address
        const displayParts = data.display_name.split(',').slice(0, 3);
        address = displayParts.map((p: string) => p.trim()).join(', ');
      }

      toast.success('Location detected successfully!');
      
      return {
        address,
        city,
        area,
        postalCode,
      };
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions.');
      } else if (error.code === 2) {
        toast.error('Unable to determine your location. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to detect location. Please enter manually.');
      }
      
      return null;
    } finally {
      setDetecting(false);
    }
  };

  return { detecting, detectLocation };
}
