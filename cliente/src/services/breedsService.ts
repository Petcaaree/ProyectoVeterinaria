// Servicio para obtener información de razas de mascotas desde APIs públicas
interface DogBreed {
  id: number;
  name: string;
  bred_for?: string;
  breed_group?: string;
  life_span?: string;
  temperament?: string;
  origin?: string;
}

interface CatBreed {
  id: string;
  name: string;
  description?: string;
  temperament?: string;
  origin?: string;
  life_span?: string;
}

interface BirdBreed {
  name: string;
  category: string;
}

interface BreedOption {
  value: string;
  label: string;
  details?: {
    temperament?: string;
    origin?: string;
    lifeSpan?: string;
    description?: string;
  };
}

class BreedsService {
  private dogBreedsCache: DogBreed[] | null = null;
  private catBreedsCache: CatBreed[] | null = null;
  private birdBreedsCache: BirdBreed[] | null = null;

  // Razas de aves más comunes (ya que no hay una API gratuita específica)
  private commonBirdBreeds: BirdBreed[] = [
    { name: 'Canario', category: 'Canario' },
    { name: 'Periquito', category: 'Loro pequeño' },
    { name: 'Cacatúa', category: 'Loro grande' },
    { name: 'Agapornis', category: 'Loro pequeño' },
    { name: 'Ninfa', category: 'Cacatúa pequeña' },
    { name: 'Loro Gris Africano', category: 'Loro grande' },
    { name: 'Guacamayo', category: 'Loro grande' },
    { name: 'Jilguero', category: 'Fringílido' },
    { name: 'Pinzón', category: 'Fringílido' },
    { name: 'Diamante de Gould', category: 'Estrildido' },
    { name: 'Mandarín', category: 'Estrildido' },
    { name: 'Bengalí', category: 'Estrildido' },
    { name: 'Verdecillo', category: 'Fringílido' },
    { name: 'Verderón', category: 'Fringílido' },
    { name: 'Amazonas', category: 'Loro mediano' },
    { name: 'Cotorra', category: 'Loro mediano' },
    { name: 'Lori', category: 'Loro pequeño' },
    { name: 'Rosella', category: 'Loro mediano' },
    { name: 'Caique', category: 'Loro pequeño' },
    { name: 'Conuro', category: 'Loro pequeño' }
  ];

  /**
   * Obtiene las razas de perros desde The Dog API
   */
  async getDogBreeds(): Promise<BreedOption[]> {
    try {
      if (this.dogBreedsCache) {
        return this.formatDogBreeds(this.dogBreedsCache);
      }

      console.log('🐕 Obteniendo razas de perros desde The Dog API...');
      const response = await fetch('https://api.thedogapi.com/v1/breeds');
      
      if (!response.ok) {
        throw new Error(`Error al obtener razas de perros: ${response.status}`);
      }

      const breeds: DogBreed[] = await response.json();
      this.dogBreedsCache = breeds;
      
      console.log(`✅ ${breeds.length} razas de perros cargadas exitosamente`);
      return this.formatDogBreeds(breeds);

    } catch (error) {
      console.error('❌ Error al cargar razas de perros:', error);
      // Fallback con razas comunes
      return this.getFallbackDogBreeds();
    }
  }

  /**
   * Obtiene las razas de gatos desde The Cat API
   */
  async getCatBreeds(): Promise<BreedOption[]> {
    try {
      if (this.catBreedsCache) {
        return this.formatCatBreeds(this.catBreedsCache);
      }

      console.log('🐱 Obteniendo razas de gatos desde The Cat API...');
      const response = await fetch('https://api.thecatapi.com/v1/breeds');
      
      if (!response.ok) {
        throw new Error(`Error al obtener razas de gatos: ${response.status}`);
      }

      const breeds: CatBreed[] = await response.json();
      this.catBreedsCache = breeds;
      
      console.log(`✅ ${breeds.length} razas de gatos cargadas exitosamente`);
      return this.formatCatBreeds(breeds);

    } catch (error) {
      console.error('❌ Error al cargar razas de gatos:', error);
      // Fallback con razas comunes
      return this.getFallbackCatBreeds();
    }
  }

  /**
   * Obtiene las razas de aves (lista predefinida)
   */
  async getBirdBreeds(): Promise<BreedOption[]> {
    try {
      if (this.birdBreedsCache) {
        return this.formatBirdBreeds(this.birdBreedsCache);
      }

      // Simular delay para consistencia con otras APIs
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.birdBreedsCache = this.commonBirdBreeds;
      console.log(`✅ ${this.commonBirdBreeds.length} razas de aves cargadas`);
      
      return this.formatBirdBreeds(this.commonBirdBreeds);

    } catch (error) {
      console.error('❌ Error al cargar razas de aves:', error);
      return [];
    }
  }

  /**
   * Obtiene razas según el tipo de mascota
   */
  async getBreedsByType(type: string): Promise<BreedOption[]> {
    switch (type.toUpperCase()) {
      case 'PERRO':
        return await this.getDogBreeds();
      case 'GATO':
        return await this.getCatBreeds();
      case 'AVE':
        return await this.getBirdBreeds();
      case 'OTRO':
        return [
          { value: 'Sin especificar', label: 'Sin especificar' },
          { value: 'Otro', label: 'Otro' }
        ];
      default:
        return [];
    }
  }

  /**
   * Formatea las razas de perros para el dropdown
   */
  private formatDogBreeds(breeds: DogBreed[]): BreedOption[] {
    return breeds
      .map(breed => ({
        value: breed.name,
        label: breed.name,
        details: {
          temperament: breed.temperament,
          origin: breed.origin,
          lifeSpan: breed.life_span,
          description: breed.bred_for ? `Criado para: ${breed.bred_for}` : undefined
        }
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Formatea las razas de gatos para el dropdown
   */
  private formatCatBreeds(breeds: CatBreed[]): BreedOption[] {
    return breeds
      .map(breed => ({
        value: breed.name,
        label: breed.name,
        details: {
          temperament: breed.temperament,
          origin: breed.origin,
          lifeSpan: breed.life_span,
          description: breed.description
        }
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Formatea las razas de aves para el dropdown
   */
  private formatBirdBreeds(breeds: BirdBreed[]): BreedOption[] {
    return breeds
      .map(breed => ({
        value: breed.name,
        label: breed.name,
        details: {
          description: `Categoría: ${breed.category}`
        }
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Razas de perros de respaldo si falla la API
   */
  private getFallbackDogBreeds(): BreedOption[] {
    const fallbackBreeds = [
      'Golden Retriever', 'Labrador Retriever', 'Pastor Alemán', 'Bulldog Francés',
      'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dálmata',
      'Boxer', 'Husky Siberiano', 'Chihuahua', 'Shih Tzu', 'Boston Terrier',
      'Pomerania', 'Border Collie', 'Cocker Spaniel', 'Mastín', 'Schnauzer',
      'Jack Russell Terrier', 'Pit Bull', 'Doberman', 'Galgo', 'San Bernardo',
      'Akita', 'Bichón Frisé', 'Maltés', 'Carlino', 'Caniche', 'Mestizo'
    ];

    return fallbackBreeds
      .map(name => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Razas de gatos de respaldo si falla la API
   */
  private getFallbackCatBreeds(): BreedOption[] {
    const fallbackBreeds = [
      'Persa', 'Maine Coon', 'Siamés', 'Ragdoll', 'Británico de Pelo Corto',
      'Abisinio', 'Birmano', 'Bengalí', 'Ruso Azul', 'Noruego del Bosque',
      'Turco Angora', 'Esfinge', 'Scottih Fold', 'Munchkin', 'Savannah',
      'Oriental', 'Burmés', 'Tonkinés', 'Somali', 'Chartreux',
      'Cornish Rex', 'Devon Rex', 'Manx', 'Himalayas', 'Mestizo'
    ];

    return fallbackBreeds
      .map(name => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Limpia la caché (útil para forzar una recarga)
   */
  clearCache(): void {
    this.dogBreedsCache = null;
    this.catBreedsCache = null;
    this.birdBreedsCache = null;
    console.log('🗑️ Caché de razas limpiado');
  }

  /**
   * Busca una raza específica por nombre
   */
  async searchBreed(type: string, query: string): Promise<BreedOption[]> {
    const breeds = await this.getBreedsByType(type);
    const normalizedQuery = query.toLowerCase().trim();
    
    return breeds.filter(breed => 
      breed.label.toLowerCase().includes(normalizedQuery) ||
      breed.value.toLowerCase().includes(normalizedQuery)
    );
  }
}

// Instancia singleton del servicio
export const breedsService = new BreedsService();

// Tipos exportados para uso en otros componentes
export type { BreedOption, DogBreed, CatBreed, BirdBreed };
