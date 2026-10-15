'use strict';
/** @param {{applications?: string[], governance?: {applicationEvidencePublicationReady?: boolean}}} record */
function publicApplicationLines(record = {}) {
  return record.governance?.applicationEvidencePublicationReady === true && Array.isArray(record.applications)
    ? record.applications : [];
}
module.exports = { publicApplicationLines };
