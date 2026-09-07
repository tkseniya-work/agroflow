import mapboxSdk from '@mapbox/mapbox-sdk';
import geocodingService from '@mapbox/mapbox-sdk/services/geocoding';

const baseClient = mapboxSdk({ 
  accessToken: 'pk.eyJ1Ijoic3RlbXl0ZXN0IiwiYSI6ImNqdzZodzJsaDFjYWw0YnFyeWdoY2xjcjIifQ.pkeg_VVDXyP-8BJZT31JTQ' 
});
const geocodingClient = geocodingService(baseClient);

export interface GeocodingResult {
  region?: string;
  city?: string;
  address?: string;
  country?: string;
  fullAddress?: string;
  coordinates: [number, number];
}

export class MapboxGeocodingService {
  static async reverseGeocode(
    longitude: number,
    latitude: number,
    language: string = 'ru'
  ): Promise<GeocodingResult> {
    try {
      const response = await geocodingClient
        .reverseGeocode({
          // Runtime SDK expects coordinates here, but current DefinitelyTyped
          // types share the forward geocode string query shape.
          query: [longitude, latitude] as unknown as string,
          language: [language],
        })
        .send();

      const features = response.body.features;
      
      if (!features || features.length === 0) {
        return this.createSimpleResult(longitude, latitude);
      }

      return this.parseFeature(features[0], longitude, latitude);
      
    } catch (error: any) {
      console.error('Mapbox geocoding error:', error.message || error);
      return this.createSimpleResult(longitude, latitude);
    }
  }

  private static parseFeature(
    feature: any,
    longitude: number,
    latitude: number
  ): GeocodingResult {
    const result: GeocodingResult = {
      coordinates: [longitude, latitude],
      fullAddress: feature.place_name || '',
    };

    if (feature.text) {
      const placeTypes = feature.place_type || [];
      
      if (placeTypes.includes('place') || placeTypes.includes('locality')) {
        result.city = feature.text;
      } else if (placeTypes.includes('region') || placeTypes.includes('district')) {
        result.region = feature.text;
      } else if (placeTypes.includes('address')) {
        result.address = feature.text;
      } else {
        // Если тип неизвестен, используем как город
        result.city = feature.text;
      }
    }

    if (feature.context) {
      for (const context of feature.context) {
        if (context.id.includes('country')) {
          result.country = context.text;
        } else if (context.id.includes('region')) {
          result.region = context.text;
        } else if (context.id.includes('district')) {
          result.region = result.region || context.text;
        } else if (context.id.includes('place')) {
          result.city = result.city || context.text;
        }
      }
    }

    if (!result.address && result.fullAddress) {
      result.address = result.fullAddress;
    }

    return result;
  }

  private static createSimpleResult(
    longitude: number,
    latitude: number
  ): GeocodingResult {
    return {
      coordinates: [longitude, latitude],
      address: `Координаты: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
      fullAddress: `Широта: ${latitude.toFixed(4)}, Долгота: ${longitude.toFixed(4)}`,
    };
  }

  static async forwardGeocode(
    query: string,
    language: string = 'ru'
  ): Promise<GeocodingResult[]> {
    try {
      const response = await geocodingClient
        .forwardGeocode({
          query,
          countries: ['RU'],
          language: [language],
          limit: 5,
        })
        .send();

      return response.body.features.map((feature: any) => {
        const [lng, lat] = feature.center;
        return this.parseFeature(feature, lng, lat);
      });
    } catch (error: any) {
      console.error('Forward geocoding error:', error.message || error);
      return [];
    }
  }
}
