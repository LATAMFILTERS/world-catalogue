const { Logger } = require('../utils/logger');

class EmbeddingCacheService {
    static cache = new Map();
    static stats = { hits: 0, misses: 0 };
    static MAX_CACHE_SIZE = 1000;
    static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    static getCacheKey(text) {
        // Use hash of text as cache key to avoid memory issues with very long text
        const hash = require('crypto')
            .createHash('sha256')
            .update(text)
            .digest('hex');
        return hash;
    }

    static get(text) {
        const key = this.getCacheKey(text);
        const entry = this.cache.get(key);

        if (entry) {
            // Check if entry has expired
            if (Date.now() - entry.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
                Logger.debug('Cached embedding expired', { keyLength: key.length });
                this.stats.misses++;
                return null;
            }

            this.stats.hits++;
            Logger.debug('Embedding cache hit', {
                keyLength: key.length,
                hits: this.stats.hits,
                size: this.cache.size
            });
            return entry.embedding;
        }

        this.stats.misses++;
        return null;
    }

    static set(text, embedding) {
        const key = this.getCacheKey(text);

        // Implement LRU-like behavior - if cache is full, clear oldest entries
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const entriesToDelete = Math.floor(this.MAX_CACHE_SIZE * 0.1); // Delete 10% oldest
            const sortedEntries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)
                .slice(0, entriesToDelete);

            sortedEntries.forEach(([k]) => this.cache.delete(k));
            Logger.debug('Embedding cache evicted old entries', { evicted: entriesToDelete });
        }

        this.cache.set(key, {
            embedding,
            timestamp: Date.now()
        });

        Logger.debug('Embedding cached', { keyLength: key.length, size: this.cache.size });
    }

    static getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

        return {
            cacheSize: this.cache.size,
            hits: this.stats.hits,
            misses: this.stats.misses,
            total: total,
            hitRate: `${hitRate}%`
        };
    }

    static clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.stats = { hits: 0, misses: 0 };
        Logger.info('Embedding cache cleared', { entriesCleared: size });
    }
}

module.exports = { EmbeddingCacheService };
