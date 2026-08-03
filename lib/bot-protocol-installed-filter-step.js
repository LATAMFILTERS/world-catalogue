const FILTER_QUESTION_MARKER = '¿Qué filtro de aceite está usando actualmente?';

function getContext(body = {}) {
  return body.context && typeof body.context === 'object' ? body.context : {};
}

function getHistory(body = {}) {
  const history = getContext(body).history;
  return Array.isArray(history) ? history : [];
}

function questionIndex(history = []) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (String(history[index] || '').includes(FILTER_QUESTION_MARKER)) return index;
  }
  return -1;
}

function filterQuestionWasAsked(body = {}) {
  return questionIndex(getHistory(body)) >= 0;
}

function filterAnswerWasRecorded(body = {}) {
  const history = getHistory(body);
  const index = questionIndex(history);
  return index >= 0 && index < history.length - 1;
}

function currentMessageAnswersFilterQuestion(body = {}) {
  const history = getHistory(body);
  const index = questionIndex(history);
  const message = String(body.message || '').trim();
  return index === history.length - 1 && message.length > 0;
}

function installInstalledFilterStep(app) {
  app.use('/api/bot/protocol', (req, res, next) => {
    if (req.method !== 'POST') return next();

    const originalJson = res.json.bind(res);
    res.json = payload => {
      if (payload?.intent !== 'diagnostic' || payload?.phase !== 'diagnostic_assessment') {
        return originalJson(payload);
      }

      if (filterAnswerWasRecorded(req.body || {})) return originalJson(payload);

      if (currentMessageAnswersFilterQuestion(req.body || {})) {
        const currentFilter = String(req.body?.message || '').trim();
        return originalJson({
          ...payload,
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: currentFilter,
            missing_field: null,
            complete: true
          }
        });
      }

      if (!filterQuestionWasAsked(req.body || {})) {
        return originalJson({
          ...payload,
          protocol_version: '1.1.4',
          phase: 'collecting_diagnostic_data',
          plan: [
            ...new Set([...(Array.isArray(payload?.plan) ? payload.plan : []), 'identify_installed_filter'])
          ],
          diagnostic: {
            ...(payload?.diagnostic || {}),
            current_filter: null,
            missing_field: 'current_filter',
            complete: false
          },
          answer: `${FILTER_QUESTION_MARKER} Indica el tipo, la marca y el código o referencia impresa. Si no podés verlo, respondé “no lo sé”.`
        });
      }

      return originalJson(payload);
    };

    next();
  });
}

module.exports = {
  installInstalledFilterStep,
  filterQuestionWasAsked,
  filterAnswerWasRecorded,
  currentMessageAnswersFilterQuestion
};
