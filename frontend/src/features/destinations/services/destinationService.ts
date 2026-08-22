import { City } from '@/types/models';
import { cities } from '@/services/mocks';

export const destinationService = {
  getDestinations: async (): Promise<City[]> => {
    return Promise.resolve(cities);
  }
};
