/**
 * Test Email Flow - Simulates complete email processing
 * Tests: Classification + Translation + Routing
 */

const EmailIntentClassifier = require('./lib/email-intent-classifier');
const TranslationService = require('./lib/translation-service');

async function testEmailFlow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  EMAIL FLOW TEST - Classification + Translation + Routing');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize services
  const classifier = new EmailIntentClassifier();
  const translator = new TranslationService();

  // Test cases in different languages
  const testEmails = [
    {
      name: 'Distributor (Spanish)',
      senderName: 'Juan García',
      senderEmail: 'juan@empresaventas.mx',
      subject: 'Interés en ser distribuidor de ELIMFILTERS',
      body: `Hola,

Nos interesa mucho ser distribuidor de ELIMFILTERS en México.
Tenemos una red establecida de clientes en el sector agrícola.
¿Cuál es el proceso para aplicar?

Saludos,
Juan García
Empresa Ventas`,
    },
    {
      name: 'Support (Spanish)',
      senderName: 'María López',
      senderEmail: 'maria@industria.es',
      subject: 'Problema con filtro de aire - No funciona correctamente',
      body: `Buenos días,

Estoy teniendo problemas con el filtro de aire EA10695.
El motor tiene poco rendimiento desde que instalé el filtro.
Hemos revisado la instalación y parece correcta.

¿Qué debo hacer?

María López
Industrias López S.A.`,
    },
    {
      name: 'Sales (Spanish)',
      senderName: 'Carlos Rodríguez',
      senderEmail: 'carlos@mineria.cl',
      subject: 'Cotización de filtros hidráulicos',
      body: `Hola,

Necesitamos cotización para:
- 50x Filtros Hidráulicos EH60222
- 30x Filtros de Aire EA10695
- Envío a Santiago de Chile

¿Cuál es el precio y plazo de entrega?

Carlos`,
    },
    {
      name: 'Technical (English)',
      senderName: 'Technical Manager',
      senderEmail: 'tech@engineer.co.uk',
      subject: 'ISO 16889 Beta Ratio Specifications',
      body: `Hello,

We need detailed ISO 16889 Beta ratio specifications for the NANOFORCE technology.
We're evaluating your hydraulic filters for our fleet.

Can you provide the technical data sheet?

Best regards,
Technical Manager`,
    },
  ];

  // Process each test email
  for (const email of testEmails) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(`TEST: ${email.name}`);
    console.log(`${'─'.repeat(65)}\n`);

    // Step 1: Classification
    console.log('📋 STEP 1: EMAIL CLASSIFICATION');
    console.log('─'.repeat(40));
    const classification = classifier.classify(email.subject, email.body);
    console.log(`  Intent Type: ${classification.type.toUpperCase()}`);
    console.log(`  Confidence: ${(classification.confidence * 100).toFixed(0)}%`);
    console.log(`  Route To: ${classification.respondTo}`);
    console.log(`  Redirect URL: ${classification.redirectUrl || 'N/A'}`);

    // Step 2: Translation
    console.log('\n🌐 STEP 2: EMAIL TRANSLATION');
    console.log('─'.repeat(40));
    const translation = await translator.translateEmailToEnglish(
      email.subject,
      email.body
    );
    console.log(`  Original Language: ${translation.language.toUpperCase()}`);
    console.log(`  Translation Applied: ${translation.translated ? 'YES' : 'NO'}`);

    // Step 3: Auto-Response
    console.log('\n💬 STEP 3: AUTO-RESPONSE TO CUSTOMER');
    console.log('─'.repeat(40));
    const responseLang = translation.language === 'es' || translation.language === 'unknown' && email.name.includes('Spanish') ? 'es' : 'en';
    const autoResponse = classification.userResponse[responseLang] || classification.userResponse['en'];
    console.log(`  Language: ${responseLang === 'es' ? 'Spanish' : 'English'}`);
    console.log(`  Response Preview:`);
    console.log(`  "${autoResponse.substring(0, 80)}..."\n`);

    // Step 4: Internal Email Summary
    console.log('\n📧 STEP 4: INTERNAL EMAIL (What HQ Team Receives)');
    console.log('─'.repeat(40));
    console.log(`  FROM: ${email.senderName} <${email.senderEmail}>`);
    console.log(`  TO: ${classification.respondTo}`);
    console.log(`  SUBJECT: [${classification.type.toUpperCase()}] ${translation.subject || email.subject} — Auto-routed`);
    console.log(`\n  CONTENT:`);
    console.log(`  ┌─────────────────────────────────────────┐`);
    console.log(`  │ Intent: ${classification.type.toUpperCase()} (${(classification.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`  │ Original Language: ${translation.language.toUpperCase()}${translation.translated ? ' (TRANSLATED TO ENGLISH)' : ''}`);
    console.log(`  │ Sender: ${email.senderName}`);
    console.log(`  └─────────────────────────────────────────┘`);
    console.log(`\n  Subject: ${translation.subject || email.subject}`);
    console.log(`\n  Message:\n${(translation.body || email.body).substring(0, 200)}...`);

    if (translation.translated && translation.originalBody) {
      console.log(`\n  ORIGINAL (${translation.language.toUpperCase()}):\n${translation.originalBody.substring(0, 150)}...`);
    }

    // Step 5: Routing Decision
    console.log('\n\n🎯 STEP 5: ROUTING DECISION');
    console.log('─'.repeat(40));
    console.log(`  ✓ Email classified as: ${classification.type.toUpperCase()}`);
    console.log(`  ✓ Automatically routed to: ${classification.respondTo}`);
    console.log(`  ✓ Auto-response sent to: ${email.senderEmail}`);
    if (classification.type === 'distributor') {
      console.log(`  ✓ Redirect URL provided: ${classification.redirectUrl}`);
    }
  }

  console.log(`\n\n${'═'.repeat(65)}`);
  console.log('✅ ALL TEST EMAILS PROCESSED SUCCESSFULLY');
  console.log('═'.repeat(65));
}

// Run test
testEmailFlow().catch(err => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});
