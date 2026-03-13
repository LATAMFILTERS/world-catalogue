const oemManufacturers = require('../config/oem-manufacturers.json');

/**
 * Servicio para clasificar OEM Codes vs Cross Reference Codes
 *
 * Ambos son códigos equivalentes del producto en "OEM Cross Reference"
 * OEM Codes: Códigos de equipos (Cat, Komatsu, Volvo, Mack, etc)
 * Cross Reference Codes: Códigos de filtros de otros fabricantes (Donaldson, Baldwin, Wix, etc)
 */

class OEMClassifier {
  constructor() {
    // Crear mapas para búsqueda rápida
    this.oemEquipmentMap = new Map();
    this.filterManufacturersMap = new Map();

    // Mapear equipos
    Object.entries(oemManufacturers.oem_equipment_manufacturers).forEach(([name, data]) => {
      this.oemEquipmentMap.set(name.toLowerCase(), {
        canonical: name,
        ...data
      });
      // Agregar aliases
      data.aliases.forEach(alias => {
        this.oemEquipmentMap.set(alias.toLowerCase(), {
          canonical: name,
          ...data
        });
      });
    });

    // Mapear filtros
    Object.entries(oemManufacturers.cross_reference_filter_manufacturers).forEach(([name, data]) => {
      this.filterManufacturersMap.set(name.toLowerCase(), {
        canonical: name,
        ...data
      });
      // Agregar aliases
      data.aliases.forEach(alias => {
        this.filterManufacturersMap.set(alias.toLowerCase(), {
          canonical: name,
          ...data
        });
      });
    });
  }

  /**
   * Clasifica un CÓDIGO basado en su fabricante
   *
   * Un mismo producto puede tener múltiples códigos equivalentes:
   * - OEM Codes: De fabricantes de equipos (Cat, Volvo, etc)
   *   Ej: "CAT 1R1808" = Código equivalente de Caterpillar
   * - Cross Reference Codes: De otros fabricantes de filtros (Donaldson, Baldwin, etc)
   *   Ej: "DONALDSON P181046" = Código equivalente de Donaldson
   *
   * Retorna: { type, manufacturer, code, prefix, full_name }
   */
  classifyCode(oemCode, manufacturerHint = null) {
    if (!oemCode) return null;

    const code = oemCode.trim();
    const parts = code.split(/[\s\-_]+/);

    // Si hay hint de fabricante, usarlo primero
    if (manufacturerHint) {
      const equipment = this.oemEquipmentMap.get(manufacturerHint.toLowerCase());
      if (equipment) {
        return {
          type: 'oem_code',
          manufacturer: equipment.canonical,
          code: code,
          prefix: equipment.prefix,
          full_name: `${equipment.canonical} ${code}`
        };
      }

      const filter = this.filterManufacturersMap.get(manufacturerHint.toLowerCase());
      if (filter) {
        return {
          type: 'cross_reference_code',
          manufacturer: filter.canonical,
          code: code,
          prefix: filter.prefix,
          full_name: `${filter.canonical} ${code}`
        };
      }
    }

    // Buscar por prefijo en el código
    for (const [key, equipment] of this.oemEquipmentMap.entries()) {
      for (const part of parts) {
        if (part.toUpperCase() === equipment.prefix) {
          return {
            type: 'oem_code',
            manufacturer: equipment.canonical,
            code: code,
            prefix: equipment.prefix,
            full_name: `${equipment.canonical} ${code}`
          };
        }
      }
    }

    for (const [key, filter] of this.filterManufacturersMap.entries()) {
      for (const part of parts) {
        if (part.toUpperCase() === filter.prefix) {
          return {
            type: 'cross_reference_code',
            manufacturer: filter.canonical,
            code: code,
            prefix: filter.prefix,
            full_name: `${filter.canonical} ${code}`
          };
        }
      }
    }

    // Si no se puede clasificar, intentar por patrón de código
    // Muchos códigos OEM de equipos tienen patrones específicos
    if (/^\d{5,}$/.test(code) || /^[A-Z]+\d{5,}$/.test(code)) {
      return {
        type: 'oem_code',
        manufacturer: 'Unknown OEM',
        code: code,
        prefix: code.substring(0, 3),
        full_name: code
      };
    }

    // Códigos de filtros generalmente tienen patrones tipo LF, FF, AF, etc
    if (/^[A-Z]{2}\d{3,}/.test(code)) {
      return {
        type: 'cross_reference_code',
        manufacturer: 'Unknown Filter Manufacturer',
        code: code,
        prefix: code.substring(0, 2),
        full_name: code
      };
    }

    // Default: asumir como OEM si tiene números
    return {
      type: 'oem_code',
      manufacturer: 'Unknown',
      code: code,
      prefix: code.substring(0, 2),
      full_name: code
    };
  }

  /**
   * Reclasifica un array de OEM codes
   */
  reclassifyOEMCodes(oemCodesArray) {
    if (!Array.isArray(oemCodesArray)) return [];

    return oemCodesArray.map(item => {
      if (typeof item === 'string') {
        return this.classifyCode(item);
      }

      // Si es objeto con código y fabricante
      if (item.oem_code || item.code) {
        const code = item.oem_code || item.code;
        const manufacturer = item.manufacturer || item.oem_code_manufacturer;
        return this.classifyCode(code, manufacturer);
      }

      return item;
    }).filter(item => item !== null);
  }

  /**
   * Organiza OEM codes en dos grupos
   */
  organizeByType(oemCodesArray) {
    const classified = this.reclassifyOEMCodes(oemCodesArray);

    return {
      oem_codes: classified.filter(c => c.type === 'oem_code'),
      cross_reference_codes: classified.filter(c => c.type === 'cross_reference_code'),
      total: classified.length
    };
  }

  /**
   * Obtiene lista de fabricantes conocidos
   */
  getKnownManufacturers() {
    return {
      equipment_manufacturers: Array.from(this.oemEquipmentMap.values())
        .filter((v, i, a) => a.findIndex(t => t.canonical === v.canonical) === i)
        .map(m => m.canonical),
      filter_manufacturers: Array.from(this.filterManufacturersMap.values())
        .filter((v, i, a) => a.findIndex(t => t.canonical === v.canonical) === i)
        .map(m => m.canonical)
    };
  }
}

module.exports = { OEMClassifier };
