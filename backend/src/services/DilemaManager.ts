import { Dilema } from '../types/types.js';
import { ALL_DILEMAS } from '../data/dilemas.js';

export class DilemaManager {
  private allDilemas: Dilema[] = ALL_DILEMAS;

  constructor() {
    // Embaralha os dilemas na inicialização
    this.shuffleDilemas();
  }

  private shuffleDilemas() {
    for (let i = this.allDilemas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.allDilemas[i], this.allDilemas[j]] = [this.allDilemas[j], this.allDilemas[i]];
    }
  }

  public getAllDilemas(): Dilema[] {
    return this.allDilemas;
  }

  public getDilemasForGame(count: number = 5): Dilema[] {
    // Retorna os primeiros 'count' dilemas embaralhados
    return this.allDilemas.slice(0, count);
  }

  public getDilemaById(id: string): Dilema | undefined {
    return this.allDilemas.find(d => d.id === id);
  }
}
