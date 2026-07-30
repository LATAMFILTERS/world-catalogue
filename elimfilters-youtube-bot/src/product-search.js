/**
 * Product Catalog Search
 *
 * Multi-strategy product search:
 * 1. Motor code (DD60, C15, 6BT, ISX500)
 * 2. OEM code (P552100, K123456)
 * 3. Competitor code (FRAM, Bosch, Mann filters)
 * 4. SKU (EL82100)
 * 5. Keyword search (fallback)
 */

export function createProductSearch({ pool }) {
  return {
    // Search by motor code (highest priority - most likely to match)
    async searchByMotor(motorCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty,
                (c.equipment_applications->>0) as primary_application
         FROM elimfilters_catalog c
         WHERE c.equipment_applications @> $1::jsonb
         LIMIT 5`,
        [JSON.stringify([motorCode])]
      );
      return result.rows;
    },

    // Search by OEM code (second priority)
    async searchByOemCode(oemCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty
         FROM elimfilters_catalog c
         WHERE c.oem_codes @> $1::jsonb
         LIMIT 5`,
        [JSON.stringify([{ code: oemCode }])]
      );
      return result.rows;
    },

    // Search by competitor code (third priority)
    async searchByCompetitorCode(competitorCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty
         FROM elimfilters_catalog c
         WHERE c.competitor_codes @> $1::jsonb
         LIMIT 5`,
        [JSON.stringify([{ code: competitorCode }])]
      );
      return result.rows;
    },

    // Search by SKU (direct lookup)
    async searchBySku(sku) {
      const result = await pool.query(
        `SELECT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.equipment_applications
         FROM elimfilters_catalog c
         WHERE c.sku = $1
         LIMIT 1`,
        [sku]
      );
      return result.rows[0] || null;
    },

    // Keyword search (fallback)
    async searchByKeyword(keyword) {
      const searchTerm = `%${keyword}%`;
      const result = await pool.query(
        `SELECT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty
         FROM elimfilters_catalog c
         WHERE c.product_name ILIKE $1 OR c.description ILIKE $1
         LIMIT 5`,
        [searchTerm]
      );
      return result.rows;
    },

    // Get product details with tech specs
    async getProductDetails(sku) {
      const result = await pool.query(
        `SELECT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.equipment_applications,
                c.beta_ratio, c.micron_rating, c.dirt_capacity_grams
         FROM elimfilters_catalog c
         WHERE c.sku = $1`,
        [sku]
      );
      return result.rows[0] || null;
    }
  };
}
