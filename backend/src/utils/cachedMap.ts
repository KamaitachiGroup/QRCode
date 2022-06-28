type KeyInfo<K> = {
  creationDate: number;
  duration: number;
  value: K;
};

export class CachedMap<K, V> {
  private map: Map<K, KeyInfo<V>>;

  constructor() {
    this.map = new Map<K, KeyInfo<V>>();
  }

  public get(key: K): V | undefined {
    const info = this.map.get(key);
    if (! info) {
      return undefined;
    }
    if (info.duration === -1 || Date.now() - info.creationDate < info.duration) {
      return info.value;
    }
    this.map.delete(key);
    return undefined;
  }

  public set(key: K, value: V, duration?: number): void {
    this.map.set(key, {
      creationDate: Date.now(),
      duration: duration || -1,
      value,
    });
  }

  public has(key: K): boolean {
    return this.map.has(key);
  }

  public delete(key: K): void {
    this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }
}