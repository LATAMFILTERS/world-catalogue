'use strict';

async function fetchApplicationPage(client, { afterSku, limit, make }) {
  const result = await client.query(`
    WITH page_skus AS (
      SELECT c.sku, c.filter_type, c.sub_type, c.duty, c.technology, c.vehicle_applications
      FROM elimfilters_catalog c
      WHERE c.vehicle_applications IS NOT NULL
        AND jsonb_typeof(c.vehicle_applications) = 'array'
        AND ($1::text = '' OR c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make', $1::text)))
        AND ($2::text = '' OR c.sku > $2::text)
      ORDER BY c.sku
      LIMIT $3::int
    )
    SELECT c.sku, c.filter_type, c.sub_type, c.duty, c.technology, app.application,
           (SELECT COUNT(*)::int FROM page_skus) AS page_sku_count
    FROM page_skus c
    CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
    WHERE ($1::text = '' OR UPPER(COALESCE(app.application->>'make', '')) = $1::text)
    ORDER BY c.sku
  `, [make, afterSku, limit]);

  return result.rows;
}

module.exports = { fetchApplicationPage };
