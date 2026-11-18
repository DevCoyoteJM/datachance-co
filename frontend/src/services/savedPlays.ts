import type { SavedPlay } from '../types';

const STORAGE_KEY = 'datachance_saved_plays_v1';

export const savedPlaysService = {
  getPlays(): SavedPlay[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePlay(play: {
    number: string;
    type: '4_CIFRAS' | 'PATA' | 'BALOTO';
    source: 'ESTADISTICO' | 'PIRAMIDE' | 'HIBRIDO' | 'DATOS_DEL_DIA' | 'MANUAL';
    lotteryName?: string;
    superbalota?: string;
    notes?: string;
  }): SavedPlay {
    const current = this.getPlays();
    const newPlay: SavedPlay = {
      ...play,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toISOString(),
    };
    // Prepend to show latest first
    const updated = [newPlay, ...current.filter((p) => p.number !== play.number || p.lotteryName !== play.lotteryName)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('saved-plays-updated'));
    return newPlay;
  },

  deletePlay(id: string): void {
    const current = this.getPlays();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('saved-plays-updated'));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('saved-plays-updated'));
  },
};
