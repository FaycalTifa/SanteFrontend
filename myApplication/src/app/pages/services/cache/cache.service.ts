// services/cache/cache.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, expiry: Date.now() + ttl });
    console.log(`✅ Cache set: ${key}`);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      console.log(`✅ Cache hit: ${key}`);
      return cached.data;
    }
    console.log(`❌ Cache miss: ${key}`);
    return null;
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  removeSS(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache removed: ${key}`);
  }

    remove(key: string): void {
        console.log(`🗑️ Cache remove: ${key}`);
        localStorage.removeItem(key);
        // ou sessionStorage selon votre implémentation
    }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    return cached !== undefined && cached.expiry > Date.now();
  }
}
