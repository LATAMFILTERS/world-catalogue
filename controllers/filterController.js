const Filter = require('../models/Filter');

exports.searchHomologousByCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "code" es requerido'
      });
    }
    const searchCode = code.trim().toUpperCase();
    const filter = await Filter.findOne({
      $or: [
        { ELIMFILTERS_SKU: searchCode },
        { OEM_Codes: searchCode },
        { Cross_Reference_Codes: searchCode }
      ]
    });
    if (!filter) {
      return res.status(404).json({
        success: false,
        error: No se encontró filtro con código: 
      });
    }
    res.status(200).json({
      success: true,
      data: filter,
      matched_code: searchCode,
      source: 'WordPress Integration'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllFilters = async (req, res) => {
  try {
    const filters = await Filter.find().limit(20);
    res.status(200).json({ success: true, data: filters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
