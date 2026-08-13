export interface SWAPIPerson {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

export interface SWAPIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SWAPIFilm {
  title: string;
  episode_id: number;
  url: string;
}

export interface SWAPIVehicle {
  name: string;
  model: string;
  url: string;
}

export interface PersonWithDetails extends Omit<SWAPIPerson, 'films' | 'vehicles'> {
  filmsDetails: SWAPIFilm[];
  vehiclesDetails: SWAPIVehicle[];
}

export const fetchPeople = async (page: number = 1): Promise<{ results: PersonWithDetails[], next: string | null }> => {
  const response = await fetch(`https://swapi.py4e.com/api/people/?page=${page}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: SWAPIResponse<SWAPIPerson> = await response.json();

  // For each person, we want to fetch their films and vehicles in parallel
  const detailedPeoplePromises = data.results.map(async (person) => {
    // Parallelize fetching films and vehicles for a single person
    const [films, vehicles] = await Promise.all([
      fetchFilms(person.films),
      fetchVehicles(person.vehicles)
    ]);

    return {
      ...person,
      filmsDetails: films,
      vehiclesDetails: vehicles
    };
  });

  // Wait for all people to have their details fetched
  const results = await Promise.all(detailedPeoplePromises);

  return {
    results,
    next: data.next
  };
};

const fetchFilms = async (filmUrls: string[]): Promise<SWAPIFilm[]> => {
  const filmPromises = filmUrls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch film: ${url}`);
        return null;
    }
    return response.json();
  });
  const results = await Promise.all(filmPromises);
  return results.filter((f): f is SWAPIFilm => f !== null);
};

const fetchVehicles = async (vehicleUrls: string[]): Promise<SWAPIVehicle[]> => {
  const vehiclePromises = vehicleUrls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch vehicle: ${url}`);
        return null;
    }
    return response.json();
  });
  const results = await Promise.all(vehiclePromises);
  return results.filter((v): v is SWAPIVehicle => v !== null);
};
