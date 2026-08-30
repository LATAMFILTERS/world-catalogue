import type { TechnologySlug } from './canonical-technologies';

export type EditorialKey =
  | 'problem'
  | 'applications'
  | 'contamination'
  | 'mechanism'
  | 'protectedAssets'
  | 'selection'
  | 'parameters'
  | 'conditions'
  | 'service'
  | 'mistakes'
  | 'standards'
  | 'families'
  | 'industries'
  | 'faq'
  | 'commercialDecision'
  | 'fieldNote';

export interface TechnologyFAQ {
  question: string;
  answer: string;
}

export interface TechnologyEditorial {
  problem: { title: string; copy: string };
  applications: { title: string; items: readonly string[] };
  contamination: { title: string; copy: string };
  mechanism: { title: string; copy: string };
  protectedAssets: { title: string; items: readonly string[] };
  selection: { title: string; items: readonly string[] };
  parameters: { title: string; items: readonly string[] };
  conditions: { title: string; items: readonly string[] };
  service: { title: string; items: readonly string[] };
  mistakes: { title: string; items: readonly string[] };
  standards: { title: string; copy: string };
  families: { title: string; copy: string };
  industries: { title: string; items: readonly string[] };
  faq: readonly TechnologyFAQ[];
  commercialDecision: { title: string; copy: string };
  fieldNote: { title: string; copy: string };
  flow: readonly EditorialKey[];
}

const CONTENT: Record<TechnologySlug, TechnologyEditorial> = {
  macrocore: {
    problem: { title: 'Dust does not need to be dramatic to be expensive.', copy: 'An intake system can look healthy while fine airborne contamination is already working past a poor seal, an overloaded element or an application that was undersized for the actual duty cycle. MACROCORE™ is applied at that boundary: keep the air mass the engine needs while controlling what must not reach cylinders, rings and turbocharger surfaces.' },
    applications: { title: 'Where we normally evaluate MACROCORE™', items: ['Primary engine air filtration', 'Secondary or safety-element protection where the system architecture requires it', 'High-dust mobile equipment', 'Truck, bus, construction, agriculture, mining and stationary-engine intake systems'] },
    contamination: { title: 'The contaminant is airborne particulate; the failure path is intake exposure.', copy: 'The engineering concern is not simply visible dust. Particle loading, sealing integrity, housing condition and service practice determine whether contamination is captured, bypasses the element or reaches the clean-air side during maintenance.' },
    mechanism: { title: 'Airflow and separation have to coexist.', copy: 'The media pack must provide the required filtration performance without creating unacceptable intake restriction. Seal geometry and element fit are equally important: a high-efficiency media is of little value if the clean-air boundary is compromised.' },
    protectedAssets: { title: 'What sits downstream of the decision', items: ['Turbocharger compressor surfaces', 'Cylinder walls and piston rings', 'Combustion-system air path', 'Engine performance and oil cleanliness indirectly affected by dust ingestion'] },
    selection: { title: 'How an applications engineer approaches selection', items: ['Confirm the exact housing and element position before using dimensions alone', 'Match airflow demand to the engine and operating load', 'Account for dust concentration and service environment', 'Confirm primary versus secondary element role', 'Check sealing geometry, not only outside diameter and height'] },
    parameters: { title: 'Parameters worth discussing before a part number', items: ['Required airflow', 'Initial and terminal restriction limits defined by the equipment application', 'Dust-holding requirement', 'Media configuration', 'Seal design and clean-side integrity', 'Service interval strategy'] },
    conditions: { title: 'Conditions that change the answer', items: ['Mining haul roads and quarry dust', 'Agricultural chaff and seasonal loading', 'Construction demolition environments', 'Highway service with long intervals', 'Restricted inlet routing or damaged pre-cleaning hardware'] },
    service: { title: 'Service is part of filtration performance.', items: ['Use restriction indication or the equipment maintenance strategy rather than visual appearance alone', 'Inspect the clean side for evidence of dust tracks', 'Check housing clamps, gaskets and sealing surfaces', 'Avoid aggressive cleaning practices that can damage media or seals', 'Treat repeated early plugging as an application problem, not just a filter-consumption problem'] },
    mistakes: { title: 'Common field mistakes', items: ['Selecting by dimensions while ignoring airflow and sealing', 'Removing a safety element because it appears clean', 'Installing an element into a damaged housing', 'Extending service after restriction has reached the equipment limit', 'Assuming every dusty operation needs the same media configuration'] },
    standards: { title: 'Technical reference', copy: 'Engine air-cleaner performance is commonly evaluated with ISO 5011 methods. Published product-level performance values should be tied to validated test data for the specific element or assembly rather than treated as universal values for the technology.' },
    families: { title: 'Product-family connection', copy: 'MACROCORE™ belongs to ELIMFILTERS primary and secondary engine-air families. The technology decision should remain connected to the housing architecture and application rather than treated as a generic air-filter label.' },
    industries: { title: 'Operating environments', items: ['Mining', 'Construction', 'Agriculture', 'Truck fleets', 'Power generation', 'Waste and municipal fleets', 'Bus and coach'] },
    faq: [
      { question: 'Should I change an engine air filter because it looks dirty?', answer: 'Not by appearance alone. The correct decision should follow the equipment service strategy, restriction condition and inspection of the complete intake system.' },
      { question: 'What is the difference between a primary and a secondary element?', answer: 'They perform different positions in the intake architecture. The primary element carries the normal contamination load; a secondary element, where specified, protects the clean-air side during service or primary-element failure.' },
      { question: 'Can a higher-efficiency element always be substituted?', answer: 'No. Filtration efficiency, airflow, restriction, capacity and housing compatibility must be evaluated together.' },
      { question: 'What usually causes dust downstream of a new filter?', answer: 'Possible causes include seal damage, incorrect fit, housing damage, service contamination or an application mismatch. The element should not be blamed before the complete intake boundary is inspected.' },
      { question: 'Why do filters plug early in severe-duty service?', answer: 'High dust concentration, poor inlet location, damaged pre-cleaning hardware or undersized capacity can shorten service life. The recurring condition should be treated as a system issue.' },
      { question: 'What information helps ELIMFILTERS select the correct configuration?', answer: 'Equipment model, engine, current element reference, housing information, duty cycle, operating environment and any restriction or premature-service history are useful starting points.' },
    ],
    commercialDecision: { title: 'When MACROCORE™ becomes an engineering conversation', copy: 'If a fleet is experiencing premature restriction, dust downstream of the element, repeated turbocharger/intake wear or unusually short air-filter life, the higher-value decision is to review the intake system and duty cycle rather than simply quote another element.' },
    fieldNote: { title: 'Field note', copy: 'A filter that survives longer is not automatically the better filter. The correct outcome is controlled contamination at an acceptable restriction for the engine and the real operating environment.' },
    flow: ['problem','fieldNote','mechanism','applications','selection','conditions','parameters','protectedAssets','service','mistakes','standards','industries','families','faq','commercialDecision','contamination'],
  },
  microkappa: {
    problem: { title: 'Cabin filtration is an operating-environment issue, not a cosmetic accessory.', copy: 'When dust loading, poor outside-air quality or a restricted cabin filter reduces HVAC performance, the result is felt by the operator first. MICROKAPPA™ is selected around the cabin-air requirement, available airflow and the pressure-drop limits of the HVAC system.' },
    applications: { title: 'Typical applications', items: ['Heavy-duty truck and bus HVAC systems', 'Construction and mining cabs', 'Agricultural equipment', 'Automotive cabin filtration', 'Enclosed operator environments exposed to dust'] },
    contamination: { title: 'What we are controlling', copy: 'The primary concern is airborne particulate entering the operator environment. Where a validated media configuration includes additional adsorptive capability, selected gaseous contaminants may also be addressed; that capability must be confirmed at product level rather than assumed.' },
    mechanism: { title: 'The engineering trade-off is simple to describe and easy to get wrong.', copy: 'More media resistance can reduce cabin airflow. Too little filtration can increase particulate exposure. MICROKAPPA™ therefore balances media configuration, surface area, HVAC airflow and the contamination load of the operating environment.' },
    protectedAssets: { title: 'What benefits from the correct cabin filter', items: ['Operator and passenger environment', 'HVAC evaporator cleanliness', 'Blower performance', 'Cabin pressurization behavior where applicable'] },
    selection: { title: 'Selection questions that matter', items: ['Is the application particulate-only or does it require a validated adsorptive layer?', 'What is the exact HVAC housing and airflow direction?', 'How dusty is the duty cycle?', 'Is low airflow already a complaint?', 'Does the equipment use a recirculation filter in addition to outside-air filtration?'] },
    parameters: { title: 'Engineering parameters', items: ['Media type', 'Pressure drop', 'HVAC airflow demand', 'Dust-holding capacity', 'Seal and frame fit', 'Service interval based on environment'] },
    conditions: { title: 'What changes service life quickly', items: ['Harvest dust', 'Quarry and mine roads', 'Urban soot and traffic exposure', 'High recirculation use', 'Wet debris or damaged cowl drainage'] },
    service: { title: 'Symptoms worth investigating', items: ['Reduced vent airflow', 'Increasing blower noise', 'Visible debris at the filter face', 'Persistent dust inside the cabin', 'Evaporator fouling despite regular maintenance'] },
    mistakes: { title: 'What technicians see repeatedly', items: ['Installing the filter against the airflow arrow', 'Using an undersized frame that allows bypass', 'Leaving the cabin filter in service because the machine still cools', 'Assuming every carbon-colored media has the same gas-removal capability'] },
    standards: { title: 'Technical reference', copy: 'Cabin-filter claims should be tied to the validated media and product test basis. ELIMFILTERS does not publish universal efficiency or gas-removal numbers where a product-specific evidence package is not available.' },
    families: { title: 'Product-family connection', copy: 'MICROKAPPA™ is the cabin-air technology within the ELIMFILTERS portfolio. Selection remains application-specific because HVAC housings, flow directions and available pressure-drop margins vary widely.' },
    industries: { title: 'Where the operator environment becomes critical', items: ['Mining', 'Construction', 'Agriculture', 'Truck fleets', 'Bus and coach', 'Automotive', 'Municipal fleets'] },
    faq: [
      { question: 'Why did cabin airflow decrease after filter replacement?', answer: 'The cause may be an incorrect element, excessive restriction, wrong installation direction or an HVAC issue unrelated to the filter. Fit and airflow should be checked together.' },
      { question: 'Does every MICROKAPPA™ filter remove odors or gases?', answer: 'No. Additional gaseous-contaminant control depends on the specific validated media configuration.' },
      { question: 'How often should a cabin filter be replaced?', answer: 'The interval depends heavily on the environment and HVAC duty. Dusty equipment can require substantially different service practice from highway vehicles.' },
      { question: 'Can a dirty cabin filter damage the HVAC system?', answer: 'Excessive restriction can reduce airflow and increase system workload. Debris bypass can also contribute to evaporator contamination.' },
      { question: 'What should I send for an application review?', answer: 'Vehicle or equipment identification, current filter reference, dimensions if the reference is unknown, housing photos and the operating environment.' },
      { question: 'Why does dust still enter the cab with a new filter?', answer: 'Check door seals, HVAC housing seals, recirculation paths and filter fit. Cabin contamination is not always entering through the media.' },
    ],
    commercialDecision: { title: 'When to request an application review', copy: 'If an operation is dealing with recurring operator complaints, very short cabin-filter intervals or chronic HVAC fouling, ELIMFILTERS can review the application as an operator-environment problem rather than a simple replacement-part transaction.' },
    fieldNote: { title: 'From the cab', copy: 'A cabin filter is often judged only when the vents stop moving air. By then the maintenance team has already lost the opportunity to manage the loading trend proactively.' },
    flow: ['fieldNote','problem','applications','service','contamination','mechanism','protectedAssets','mistakes','selection','parameters','conditions','faq','industries','standards','families','commercialDecision'],
  },
  drycore: {
    problem: { title: 'Water in compressed air becomes a brake-system problem downstream.', copy: 'Condensation, compressor carryover and insufficient regeneration can expose valves, actuators and controls to moisture. DRYCORE™ addresses the drying stage before that water can accumulate through the pneumatic circuit.' },
    applications: { title: 'Where DRYCORE™ is used', items: ['Heavy-duty truck air-brake systems', 'Bus and coach pneumatic systems', 'Vocational vehicles with high compressor duty', 'Selected industrial compressed-air protection positions where the approved application uses this cartridge architecture'] },
    contamination: { title: 'The contaminant is moisture; oil aerosol and debris can complicate the duty.', copy: 'An air dryer does not operate in isolation. Compressor condition, purge frequency, ambient humidity and reservoir maintenance all influence what reaches the cartridge.' },
    mechanism: { title: 'Drying capacity depends on the complete cycle.', copy: 'The cartridge captures moisture during the charge cycle and relies on the system purge/regeneration strategy to restore drying capability. Cartridge condition, purge performance and compressor duty therefore have to be considered together.' },
    protectedAssets: { title: 'Downstream components at risk', items: ['Brake valves', 'Air reservoirs', 'Actuators', 'Pneumatic controls', 'Lines and fittings exposed to condensation or freezing conditions'] },
    selection: { title: 'Before selecting a cartridge', items: ['Confirm dryer make/model or approved application reference', 'Understand compressor duty cycle', 'Identify oil carryover history', 'Check whether the application requires a specific coalescing configuration', 'Confirm thread, sealing and cartridge interface'] },
    parameters: { title: 'Parameters that drive the application', items: ['Drying capacity', 'Purge/regeneration compatibility', 'Airflow demand', 'Compressor duty', 'Ambient moisture load', 'Cartridge interface and seal'] },
    conditions: { title: 'Severe conditions', items: ['Frequent stop-and-go brake use', 'High ambient humidity', 'Cold climates where residual water can freeze', 'Vocational equipment with sustained compressor operation', 'Compressors with excessive oil carryover'] },
    service: { title: 'Warning signs', items: ['Water repeatedly found in reservoirs', 'Abnormally frequent purge behavior', 'Freeze-related pneumatic problems', 'Oil contamination around dryer service', 'Cartridge intervals becoming progressively shorter'] },
    mistakes: { title: 'Common diagnostic mistakes', items: ['Replacing the cartridge without checking purge operation', 'Ignoring compressor oil carryover', 'Treating reservoir water as a cartridge-only issue', 'Installing a cartridge by thread match without validating the dryer application'] },
    standards: { title: 'Technical reference', copy: 'Service limits and dryer performance requirements depend on the vehicle or system architecture. Product claims and maintenance intervals should remain tied to the approved application and equipment guidance.' },
    families: { title: 'Product-family connection', copy: 'DRYCORE™ is the ELIMFILTERS air-dryer filtration architecture. The cartridge should be selected as part of a pneumatic moisture-control system, not as an isolated spin-on component.' },
    industries: { title: 'Primary operating environments', items: ['Truck fleets', 'Bus and coach', 'Waste and municipal', 'Construction', 'Mining support fleets'] },
    faq: [
      { question: 'Why is there still water in the tanks after replacing the air-dryer cartridge?', answer: 'The cartridge may not be the root cause. Purge operation, compressor duty, oil carryover, plumbing and reservoir-drain practice should also be checked.' },
      { question: 'Can I select an air-dryer cartridge by thread size?', answer: 'No. The dryer application, internal configuration, sealing interface and required performance must be validated.' },
      { question: 'What shortens air-dryer cartridge life?', answer: 'High compressor duty, humid conditions, excessive oil carryover and poor regeneration can all increase cartridge loading.' },
      { question: 'Why are cold-weather failures associated with moisture?', answer: 'Residual water can condense and freeze in pneumatic components or lines, restricting movement or airflow.' },
      { question: 'Does DRYCORE™ replace system diagnosis?', answer: 'No. It is a filtration architecture within the dryer system; recurring moisture requires inspection of the complete pneumatic circuit.' },
      { question: 'What data is useful for fleet review?', answer: 'Vehicle model, dryer model, current cartridge reference, compressor history, drain observations, climate and typical duty cycle.' },
    ],
    commercialDecision: { title: 'When cartridge replacement is no longer enough', copy: 'Recurring reservoir water, winter brake-system issues or unusually short cartridge life justify a fleet-level review of compressor duty, dryer operation and service practice. That is the point where ELIMFILTERS can help move from parts replacement to root-cause control.' },
    fieldNote: { title: 'Maintenance reality', copy: 'A wet reservoir after a fresh cartridge is useful evidence. It tells the technician to keep diagnosing instead of assuming the new filter failed.' },
    flow: ['problem','protectedAssets','fieldNote','mechanism','service','conditions','selection','parameters','mistakes','applications','commercialDecision','faq','standards','families','industries','contamination'],
  },
  intekcore: {
    problem: { title: 'A perfect element cannot compensate for a compromised housing.', copy: 'Air-cleaner housings establish the physical boundary between contaminated air and the clean-air path. INTEKCORE™ focuses on housing geometry, structural integrity, element retention and sealing so the filter can perform in the environment it was selected for.' },
    applications: { title: 'Application scope', items: ['Engine air-cleaner assemblies', 'Remote-mounted intake housings', 'Heavy-duty cylindrical air-cleaner systems', 'Intake architectures using primary and safety elements'] },
    contamination: { title: 'The failure mode is often bypass, not media penetration.', copy: 'Dust tracks on the clean side can originate at a distorted housing, damaged seal seat, loose cover, incorrect element or poorly routed inlet. The housing should be treated as a contamination-control component.' },
    mechanism: { title: 'Geometry controls the protected boundary.', copy: 'Inlet routing distributes airflow, the housing supports the media element, the seal interface isolates clean air, and the outlet delivers filtered air to the engine. A weakness in any one of those areas changes the performance of the assembly.' },
    protectedAssets: { title: 'What the housing protects indirectly', items: ['MACROCORE™ filtration elements', 'Turbocharger and engine intake path', 'Clean-air ducting', 'Sensors located downstream of the cleaner'] },
    selection: { title: 'Housing selection is a sizing exercise', items: ['Engine airflow requirement', 'Available installation envelope', 'Inlet and outlet orientation', 'Service access', 'Dust evacuation or pre-cleaning strategy', 'Element family and sealing system'] },
    parameters: { title: 'Engineering parameters', items: ['Rated airflow for the approved assembly', 'Restriction through housing and element', 'Inlet/outlet dimensions', 'Seal geometry', 'Structural loading and vibration environment', 'Service-clearance requirement'] },
    conditions: { title: 'Conditions that expose weak installations', items: ['High vibration', 'Poorly supported ducting', 'Heavy dust loading', 'Water ingress at the inlet', 'Tight installations that force misalignment during service'] },
    service: { title: 'Inspection points technicians should not skip', items: ['Seal seat cleanliness', 'Cover and latch condition', 'Dust-ejection components', 'Clean-air tube connections', 'Housing cracks or deformation', 'Evidence of dust downstream'] },
    mistakes: { title: 'Application mistakes', items: ['Choosing a housing only by physical size', 'Reducing inlet or outlet diameter to make installation easier', 'Ignoring service clearance', 'Mixing elements with similar dimensions but different sealing geometry', 'Allowing unsupported ducting to load the housing outlet'] },
    standards: { title: 'Technical reference', copy: 'Air-cleaner assemblies and elements are commonly evaluated using ISO 5011 methodologies. Assembly-level performance should be documented for the actual housing/element configuration when specific values are published.' },
    families: { title: 'System pairing', copy: 'INTEKCORE™ defines the housing and sealing architecture; MACROCORE™ provides the engine-air filtration element. Their relationship is intentional and should remain application-matched.' },
    industries: { title: 'Common environments', items: ['Construction', 'Mining', 'Agriculture', 'Power generation', 'Truck fleets', 'Industrial equipment'] },
    faq: [
      { question: 'Why is dust getting past a high-quality air filter?', answer: 'Inspect the housing, seal seat, cover, ducting and installation. Bypass around the element can produce the same downstream result as inadequate media.' },
      { question: 'Can I replace a housing with another one that fits the space?', answer: 'Physical fit is not enough. Airflow, restriction, connections, service access and the matching element architecture must be evaluated.' },
      { question: 'What causes an air-cleaner housing to crack?', answer: 'Vibration, unsupported ducting, impact, installation stress and material aging can contribute. The root loading should be corrected along with the housing.' },
      { question: 'Does inlet orientation matter?', answer: 'Yes. Routing and orientation affect packaging, debris/water exposure and airflow distribution.' },
      { question: 'What should be inspected during every air-filter service?', answer: 'Seal surfaces, housing condition, cover/latches, clean-air connections and any dust-ejection hardware.' },
      { question: 'What information is needed to size an INTEKCORE™ assembly?', answer: 'Engine airflow requirement, existing housing or element reference, connection sizes, available envelope, orientation, environment and service-access constraints.' },
    ],
    commercialDecision: { title: 'When to stop searching for a filter and review the intake package', copy: 'If an equipment conversion, repower or recurring dust-bypass problem has changed the original intake conditions, ELIMFILTERS can evaluate the housing and element as one engineered boundary instead of forcing a replacement element into a compromised architecture.' },
    fieldNote: { title: 'What dust tracks tell you', copy: 'A visible trail on the clean side is not just dirt. It is a map of where the protected boundary failed.' },
    flow: ['fieldNote','contamination','problem','applications','mechanism','service','mistakes','selection','parameters','conditions','protectedAssets','families','standards','faq','commercialDecision','industries'],
  },
  syntapore: {
    problem: { title: 'Modern fuel systems do not tolerate casual contamination control.', copy: 'Particles that once passed through lower-pressure fuel systems can become damaging at precision pumps and injectors. SYNTAPORE™ is used for approved primary, secondary and cartridge fuel-filter positions where particulate control is the main filtration duty.' },
    applications: { title: 'Where SYNTAPORE™ belongs', items: ['Primary fuel filtration without a dedicated water-separation function', 'Secondary/final fuel filtration', 'Cartridge fuel-filter modules', 'Diesel engine fuel systems requiring particulate control upstream of precision components'] },
    contamination: { title: 'Primary contaminant: particulate in diesel fuel.', copy: 'Tank debris, handling contamination, corrosion products and fine particles can reach the engine unless the filtration stages are selected and serviced as a system.' },
    mechanism: { title: 'Different stages do different work.', copy: 'A primary stage is generally expected to carry a larger contamination burden; downstream filtration protects increasingly sensitive components. The exact efficiency, capacity and flow requirement must follow the approved application rather than a universal micron rule.' },
    protectedAssets: { title: 'What clean fuel is protecting', items: ['High-pressure fuel pump', 'Precision injectors', 'Metering components', 'Downstream fuel passages'] },
    selection: { title: 'Questions before selecting a fuel filter', items: ['Is this primary or secondary position?', 'Does the application require water separation instead?', 'What is the approved flow and pressure condition?', 'What housing/module does the element fit?', 'Is there a known contamination or premature-plugging history?'] },
    parameters: { title: 'Key engineering parameters', items: ['Filtration efficiency for the specific product', 'Contaminant capacity', 'Fuel flow', 'Pressure drop', 'Media compatibility', 'Seal and housing interface'] },
    conditions: { title: 'Operating conditions that change the filter duty', items: ['Bulk-fuel cleanliness', 'Remote fueling locations', 'High engine load', 'Cold-fuel viscosity', 'Long storage periods', 'Maintenance practices around tanks and transfer equipment'] },
    service: { title: 'What early plugging may be telling you', items: ['Dirty bulk fuel', 'Tank corrosion or debris', 'Microbial/sludge contamination requiring separate investigation', 'Cold-flow restrictions', 'Incorrect filter position or specification'] },
    mistakes: { title: 'Common selection errors', items: ['Confusing a particulate fuel filter with a water separator', 'Choosing by thread or gasket only', 'Using the same micron assumption for every filtration stage', 'Ignoring fuel quality upstream of the vehicle', 'Extending intervals despite restriction or fuel-delivery symptoms'] },
    standards: { title: 'Technical reference', copy: 'Specific product performance should be backed by validated test data and the approved application. ELIMFILTERS avoids publishing a single universal micron or efficiency claim for the entire technology because primary and secondary fuel positions have different requirements.' },
    families: { title: 'Product-family connection', copy: 'SYNTAPORE™ applies to ELIMFILTERS primary and secondary fuel-filter families that do not perform the dedicated separator duties assigned elsewhere in the Fuel Cleanliness architecture.' },
    industries: { title: 'Where fuel cleanliness becomes operational risk', items: ['Truck fleets', 'Mining', 'Construction', 'Agriculture', 'Power generation', 'Marine support applications', 'Bus and coach'] },
    faq: [
      { question: 'How do I know whether I need a primary or secondary fuel filter?', answer: 'Identify the filter position and system architecture first. The stages have different contamination loads and downstream protection roles.' },
      { question: 'Is a lower micron rating always better?', answer: 'No. Efficiency, capacity, flow, pressure drop and the intended filtration stage must be considered together.' },
      { question: 'Can SYNTAPORE™ be used where water separation is required?', answer: 'Not as a generic substitution. Dedicated fuel/water separation positions require the correct separator architecture for that application.' },
      { question: 'Why is my fuel filter plugging much earlier than expected?', answer: 'Investigate bulk-fuel cleanliness, tank condition, cold-flow effects and contamination entering during transfer or maintenance.' },
      { question: 'What symptoms can indicate excessive fuel-filter restriction?', answer: 'Depending on the system, loss of power, fuel-pressure faults or difficult operation under load can appear. Diagnosis should follow the equipment manufacturer procedure.' },
      { question: 'What information helps with application validation?', answer: 'Engine/equipment model, current filter reference, filter position, fuel-system layout and any history of restriction or fuel contamination.' },
    ],
    commercialDecision: { title: 'When fuel filtration becomes a fleet-level problem', copy: 'Repeated injector events, short filter intervals or inconsistent fuel quality justify looking beyond individual filters. ELIMFILTERS can help structure the filtration positions and contamination-control discussion around the complete fuel supply chain.' },
    fieldNote: { title: 'A useful distinction', copy: '“Fuel filter” describes a category. The application position tells us what the element is actually being asked to do.' },
    flow: ['problem','fieldNote','applications','selection','mechanism','contamination','protectedAssets','conditions','service','mistakes','parameters','faq','industries','families','standards','commercialDecision'],
  },
  hydrocore: {
    problem: { title: 'Water is not just another contaminant in diesel fuel.', copy: 'It can corrode, erode, disrupt lubrication at precision fuel components and create recurring maintenance problems if separation is treated as ordinary particulate filtration. HYDROCORE™ is the ELIMFILTERS fuel/water separation architecture for spin-on, cartridge, and approved turbine-style FH/FG separator positions.' },
    applications: { title: 'Application scope', items: ['Spin-on fuel/water separators', 'Cartridge separator modules', 'Pre-filtration positions where the approved system requires water separation', 'Approved turbine-style FH/FG separator assemblies and replacement-element positions'] },
    contamination: { title: 'The target is water carried with the fuel.', copy: 'Free water can settle readily; smaller dispersed or emulsified droplets are more difficult to separate. Fuel condition, flow and media design influence the separation duty, which is why a water separator should not be selected as if it were only a particulate filter.' },
    mechanism: { title: 'Separation depends on droplet behavior and controlled flow.', copy: 'The media and separator geometry encourage water to separate from the fuel stream and collect where the housing design can retain or drain it. Particulate filtration may occur in the same element, but the water-removal duty remains the defining function.' },
    protectedAssets: { title: 'Components exposed when water passes downstream', items: ['High-pressure fuel pump', 'Precision injectors', 'Fuel metering components', 'Downstream filtration stages'] },
    selection: { title: 'How to select the correct separator', items: ['Confirm the separator architecture and filter position', 'Validate flow requirement', 'Confirm housing/module and drain or bowl configuration', 'For FH/FG assemblies, validate the approved stage and replacement-element position', 'Understand expected water load', 'Check whether a water-in-fuel sensor interface is part of the application', 'Match the downstream filtration strategy'] },
    parameters: { title: 'Engineering parameters', items: ['Water-separation performance for the validated product', 'Fuel flow', 'Contaminant capacity', 'Pressure drop', 'Water-holding/drain arrangement', 'Stage/element position for approved turbine-style assemblies', 'Seal and sensor compatibility where applicable'] },
    conditions: { title: 'Conditions that increase separator workload', items: ['Poor bulk-fuel storage', 'Condensation in tanks', 'Remote or mobile fueling', 'Frequent temperature cycling', 'Known water ingress during delivery or transfer'] },
    service: { title: 'What operators should watch', items: ['Water accumulation in the bowl or drain area where provided', 'Water-in-fuel indication when the equipment supports it', 'Correct element position in staged FH/FG assemblies', 'Repeated water findings after draining', 'Corrosion or contamination during service', 'Short element life linked to dirty or wet fuel'] },
    mistakes: { title: 'Common errors in the field', items: ['Replacing a separator with an ordinary fuel filter', 'Ignoring routine draining where the system requires it', 'Assuming a new separator fixes wet bulk fuel', 'Mixing stage ratings or element positions in FH/FG assemblies', 'Selecting by physical dimensions without validating flow and separator function', 'Failing to investigate recurring water-in-fuel warnings'] },
    standards: { title: 'Technical reference', copy: 'Water-separation efficiency and other numeric performance claims must be tied to the specific validated product, assembly, element position and test basis. The technology page explains the engineering function without inventing universal values.' },
    families: { title: 'Product-family connection', copy: 'HYDROCORE™ is assigned to ELIMFILTERS fuel/water separator families, including approved turbine-style FH/FG architectures. It remains separate from plain particulate fuel filtration.' },
    industries: { title: 'Where wet fuel creates expensive downtime', items: ['Construction', 'Mining', 'Agriculture', 'Truck fleets', 'Power generation', 'Marine', 'Waste and municipal', 'Bus and coach'] },
    faq: [
      { question: 'How is a fuel/water separator different from a normal fuel filter?', answer: 'The separator is designed around water removal in addition to any particulate filtration it may provide. The system position and required separation function must be confirmed.' },
      { question: 'Why does water keep returning after I drain the separator?', answer: 'The upstream fuel source, tank condensation or delivery practices may be introducing new water. Repeated water should trigger a fuel-quality investigation.' },
      { question: 'Does every HYDROCORE™ separator use a visible bowl?', answer: 'No. Housing and drain arrangements depend on the approved application.' },
      { question: 'How are FH/FG turbine-style assemblies handled?', answer: 'They remain within HYDROCORE™. Assembly size, stage, element position, flow and service configuration must match the approved application.' },
      { question: 'Can I replace the separator with a finer fuel filter?', answer: 'No. Finer particulate filtration does not automatically provide the required water-separation function.' },
      { question: 'What information does ELIMFILTERS need for a separator review?', answer: 'Equipment and engine identification, current separator or assembly reference, housing/bowl arrangement, stage or filter position, fuel source and any history of water-in-fuel events.' },
    ],
    commercialDecision: { title: 'When the separator is only one part of the solution', copy: 'If several machines are showing water-in-fuel events, frequent draining or premature fuel-system failures, the high-value conversation is about storage, transfer and fleet fuel cleanliness as well as the separator itself.' },
    fieldNote: { title: 'Field note', copy: 'If the same machine keeps finding water, the separator may be doing its job correctly. The next question is why the water keeps arriving.' },
    flow: ['fieldNote','problem','contamination','service','applications','mechanism','selection','conditions','mistakes','protectedAssets','parameters','commercialDecision','faq','industries','families','standards'],
  },
  syntrax: {
    problem: { title: 'Oil carries evidence of what is happening inside the engine.', copy: 'Wear debris, soot agglomerates and contaminants circulate through highly loaded interfaces. SYNTRAX™ is the lubrication filtration architecture used to control that contamination while maintaining the oil flow the engine requires.' },
    applications: { title: 'Application positions', items: ['Full-flow engine oil filtration', 'Approved lubrication filter modules', 'Heavy-duty and light-duty engine lubrication systems', 'Applications requiring contamination capacity across an established oil service interval'] },
    contamination: { title: 'What the filter is asked to carry', copy: 'Lubricant contamination can include wear metals, soot agglomerates, external dirt introduced during service and degradation products. The filter operates in a fluid whose viscosity changes sharply with temperature.' },
    mechanism: { title: 'Cold start and hot operation are two different hydraulic conditions.', copy: 'Media efficiency and capacity matter, but so do pressure drop, bypass-valve behavior and structural integrity. SYNTRAX™ is selected around the complete lubrication circuit rather than a single nominal rating.' },
    protectedAssets: { title: 'Critical lubricated interfaces', items: ['Main and rod bearings', 'Cam and valve-train interfaces', 'Turbocharger bearings where engine-oil supplied', 'Oil galleries and other precision-lubricated surfaces'] },
    selection: { title: 'Selection criteria', items: ['Correct engine application and filter position', 'Oil flow requirement', 'Media efficiency/capacity supported for the product', 'Bypass-valve configuration where integrated', 'Seal and thread/interface', 'Oil viscosity and duty cycle'] },
    parameters: { title: 'Parameters that matter', items: ['Filtration efficiency', 'Contaminant capacity', 'Pressure drop', 'Bypass setting where applicable', 'Burst/structural requirements for the application', 'Oil compatibility and temperature range'] },
    conditions: { title: 'Conditions that change lubrication-filter loading', items: ['High soot operation', 'Extended idle', 'Severe duty and high load', 'Cold starts', 'Extended drain programs', 'Engine wear or contamination ingress'] },
    service: { title: 'Service indicators', items: ['Follow the validated engine/oil maintenance program', 'Investigate abnormal differential-pressure or bypass indications where monitored', 'Inspect removed filters when a failure investigation requires it', 'Treat repeated short intervals as evidence of an upstream engine or oil-condition issue'] },
    mistakes: { title: 'Common mistakes', items: ['Selecting by thread/gasket alone', 'Assuming larger canister means greater validated capacity', 'Changing oil interval without considering filter capacity', 'Ignoring bypass-valve differences', 'Using a filter to compensate for unresolved engine contamination'] },
    standards: { title: 'Technical reference', copy: 'Product-level efficiency, capacity and structural claims should be tied to validated test data and the intended engine application. A technology-level page should explain the decision variables without assigning unsupported universal values.' },
    families: { title: 'Product-family connection', copy: 'SYNTRAX™ is the ELIMFILTERS lubrication and oil-filter technology used across approved engine-oil applications.' },
    industries: { title: 'Operational environments', items: ['Truck fleets', 'Construction', 'Mining', 'Agriculture', 'Power generation', 'Bus and coach', 'Automotive'] },
    faq: [
      { question: 'Why does an oil filter need a bypass valve?', answer: 'Where the engine design uses one in the filter or housing, the bypass provides an alternate oil path when differential pressure becomes excessive. The correct configuration is application-specific.' },
      { question: 'Does a finer filter always protect the engine better?', answer: 'Not automatically. Efficiency must be balanced with oil flow, pressure drop, capacity and the engine lubrication design.' },
      { question: 'Can I extend oil-drain intervals by installing a larger filter?', answer: 'Not on that basis alone. Oil condition, engine requirements and validated filter capacity all have to support the maintenance program.' },
      { question: 'Why is cold-start pressure drop important?', answer: 'Cold oil is more viscous, so the lubrication circuit can see different restriction conditions than at normal operating temperature.' },
      { question: 'What causes an oil filter to load rapidly?', answer: 'High soot, abnormal wear, contamination ingress or an unsuitable service interval can increase loading.' },
      { question: 'What should I provide for a lubrication application review?', answer: 'Engine model, current filter reference, oil grade, service interval, duty cycle and any oil-analysis or failure history.' },
    ],
    commercialDecision: { title: 'When lubrication filtration becomes reliability engineering', copy: 'Fleets using oil analysis, extended drains or experiencing repeated bearing/turbocharger events benefit from evaluating filter capacity and lubrication cleanliness as part of the maintenance program rather than purchasing solely on cross-reference.' },
    fieldNote: { title: 'Shop-floor reality', copy: 'The filter is one of the few components that sees nearly every contaminant circulating in the lubrication system. A recurring loading pattern is information, not just waste.' },
    flow: ['fieldNote','contamination','mechanism','problem','conditions','parameters','selection','service','mistakes','protectedAssets','applications','faq','commercialDecision','industries','families','standards'],
  },
  nanoforce: {
    problem: { title: 'Hydraulic components fail in clear oil every day.', copy: 'Fluid can look clean and still contain a particle population capable of accelerating wear, sticking valves or damaging servo-level clearances. NANOFORCE™ is applied around the cleanliness requirement of the most contamination-sensitive component in the hydraulic circuit.' },
    applications: { title: 'Where hydraulic filtration decisions occur', items: ['Pressure-line filtration', 'Return-line filtration', 'Offline/kidney-loop filtration where approved', 'Selected suction-side protection where the system design supports it', 'Mobile and industrial hydraulic systems'] },
    contamination: { title: 'Particle size and population matter more than appearance.', copy: 'Hard particles, wear debris and externally ingressed contamination circulate through pumps, valves and actuators. Water and varnish may also be reliability concerns, but they require their own diagnostic and control strategies rather than being treated as ordinary particulate loading.' },
    mechanism: { title: 'The cleanliness target comes before the filter rating.', copy: 'An engineer first identifies the component tolerance and desired fluid cleanliness, then selects filtration performance, location and capacity that can maintain that target at the real flow, viscosity and duty cycle.' },
    protectedAssets: { title: 'Sensitive hydraulic assets', items: ['Variable-displacement pumps', 'Servo and proportional valves', 'Directional/control valves', 'Actuators and motors', 'Precision hydraulic interfaces'] },
    selection: { title: 'A disciplined selection sequence', items: ['Establish target fluid cleanliness', 'Identify filter location', 'Confirm maximum and normal flow', 'Review operating and cold-start viscosity', 'Validate element efficiency for the relevant particle sizes', 'Check collapse/bypass requirements and housing rating'] },
    parameters: { title: 'Engineering parameters', items: ['ISO cleanliness target', 'Element efficiency/Beta performance where validated', 'System flow', 'Differential pressure', 'Fluid viscosity and temperature', 'Element collapse rating', 'Housing working pressure', 'Contaminant capacity'] },
    conditions: { title: 'Conditions that change element behavior', items: ['Cold starts', 'High cyclic flow', 'Cylinder retraction surges', 'Dust ingress through breathers or seals', 'Maintenance opening the circuit', 'New-component run-in debris'] },
    service: { title: 'Service should follow condition where the system supports it.', items: ['Use differential-pressure indication where provided', 'Track element life trends', 'Investigate sudden interval reduction', 'Sample fluid consistently when cleanliness monitoring is part of the maintenance program', 'Correct ingress sources rather than relying on increasingly fine filtration alone'] },
    mistakes: { title: 'Hydraulic filtration mistakes with real consequences', items: ['Selecting only by nominal micron rating', 'Ignoring cold-viscosity pressure drop', 'Putting an unsuitable fine element in a suction position', 'Ignoring bypass and collapse requirements', 'Setting no cleanliness target', 'Changing filters without correcting dirt ingress'] },
    standards: { title: 'Standards that matter', copy: 'ISO 16889 is widely used to characterize multi-pass hydraulic filter performance, while ISO 4406 provides a code for reporting fluid particle cleanliness. Product-level Beta values and pressure ratings must come from validated data for the specific element/housing.' },
    families: { title: 'Product-family connection', copy: 'NANOFORCE™ covers ELIMFILTERS hydraulic filtration families. Selection should remain tied to circuit location, cleanliness target and operating condition.' },
    industries: { title: 'High-value hydraulic environments', items: ['Mining', 'Construction', 'Manufacturing', 'Agriculture', 'Waste and municipal', 'Marine', 'Power generation'] },
    faq: [
      { question: 'What ISO cleanliness code should my hydraulic system run?', answer: 'The target should be based on the most contamination-sensitive component and the equipment/application requirements, not a universal number.' },
      { question: 'What does Beta ratio mean?', answer: 'It is a way of expressing particle-removal performance under a defined test method. The relevant value must come from validated data for the specific filter element.' },
      { question: 'Why does a hydraulic filter go into bypass during cold start?', answer: 'High fluid viscosity can create much greater differential pressure. Element selection and system warm-up conditions should be reviewed.' },
      { question: 'Is return-line filtration enough?', answer: 'It depends on the circuit, contamination sources and component sensitivity. Some systems require additional pressure-line or offline control.' },
      { question: 'Why are my filters plugging faster after a component failure?', answer: 'A failing or recently failed component can release wear debris into the circuit. Cleanup should be managed as a contamination event.' },
      { question: 'What information is needed for a hydraulic review?', answer: 'Fluid type, normal/maximum flow, operating pressure, temperature/viscosity range, filter location, current housing/element, cleanliness data and component list.' },
    ],
    commercialDecision: { title: 'When to move from replacement filters to a cleanliness program', copy: 'Repeated pump failures, valve sticking, servo problems or unpredictable element life are signs that the conversation should move to fluid cleanliness targets, ingress control and filtration placement. That is where ELIMFILTERS can support a higher-value reliability review.' },
    fieldNote: { title: 'Reliability note', copy: 'If nobody can state the target cleanliness code, the maintenance team is changing hydraulic filters without a defined contamination-control objective.' },
    flow: ['fieldNote','problem','standards','mechanism','selection','parameters','conditions','contamination','protectedAssets','service','mistakes','faq','commercialDecision','applications','industries','families'],
  },
  thermacore: {
    problem: { title: 'Cooling-system deposits do not have to block a passage completely to reduce reliability.', copy: 'Suspended solids, corrosion debris and poorly controlled coolant condition can affect seals, wet liners, heat-transfer surfaces and small passages. THERMACORE™ provides filtration within the approved cooling-system maintenance strategy.' },
    applications: { title: 'Where THERMACORE™ is applied', items: ['Heavy-duty engine coolant filtration', 'Approved spin-on coolant filter positions', 'Cooling systems using filtration as part of their maintenance architecture'] },
    contamination: { title: 'What filtration can—and cannot—control', copy: 'THERMACORE™ addresses particulate contamination carried in coolant. Coolant chemistry, concentration, additive balance and contamination by other fluids are separate maintenance variables and should not be presented as problems a filter alone can correct.' },
    mechanism: { title: 'Clean passages support stable heat transfer.', copy: 'The coolant filter removes suspended contamination from the circulating coolant stream. The correct element must remain compatible with the engine cooling-system strategy, flow path and coolant specification.' },
    protectedAssets: { title: 'Components influenced by coolant cleanliness', items: ['Water-pump seals and surfaces', 'Wet liners where used', 'Radiator and heat-exchanger passages', 'Thermostat and small flow passages', 'Sealing surfaces throughout the cooling circuit'] },
    selection: { title: 'Selection starts with the coolant strategy', items: ['Confirm engine/equipment application', 'Identify whether the system uses a coolant filter and its intended function', 'Confirm coolant type and maintenance program', 'Validate flow/interface', 'Determine whether the approved element has any product-specific additive function before making that claim'] },
    parameters: { title: 'Engineering parameters', items: ['Coolant compatibility', 'Flow and pressure drop', 'Contaminant capacity', 'Filter interface', 'Service interval', 'Any additive content only when validated for the exact product'] },
    conditions: { title: 'Conditions that deserve closer attention', items: ['Mixed or unknown coolant history', 'Frequent top-off with untreated water', 'Corrosion debris after repairs', 'Older engines with deposit history', 'Cooling systems opened frequently for maintenance'] },
    service: { title: 'What maintenance teams should watch', items: ['Coolant appearance and contamination history', 'System pressure and temperature complaints', 'Filter service interval', 'Evidence of corrosion or solids during repairs', 'Coolant-analysis results where the fleet uses a formal program'] },
    mistakes: { title: 'Common mistakes', items: ['Assuming a coolant filter corrects bad coolant chemistry', 'Using an additive-containing filter without validating compatibility', 'Mixing coolant types without system guidance', 'Ignoring contamination introduced during repairs', 'Selecting only by thread size'] },
    standards: { title: 'Technical reference', copy: 'Coolant maintenance requirements are strongly engine- and coolant-specific. ELIMFILTERS should publish additive, chemistry or service claims only when they are supported for the exact product/application.' },
    families: { title: 'Product-family connection', copy: 'THERMACORE™ is the ELIMFILTERS cooling-system filtration technology. It supports coolant cleanliness while remaining subordinate to the approved coolant chemistry and maintenance plan.' },
    industries: { title: 'Operating environments', items: ['Truck fleets', 'Mining', 'Construction', 'Agriculture', 'Power generation', 'Bus and coach', 'Waste and municipal'] },
    faq: [
      { question: 'Does a coolant filter replace coolant testing or coolant maintenance?', answer: 'No. Filtration controls suspended contamination; coolant chemistry and condition still require the appropriate maintenance program.' },
      { question: 'Do all coolant filters contain additives?', answer: 'No. Any additive function must be confirmed for the exact product and application.' },
      { question: 'Why is particulate contamination harmful in a cooling system?', answer: 'Debris can contribute to abrasive wear, deposits and restriction at sensitive passages or sealing surfaces.' },
      { question: 'Can I choose a coolant filter by thread size?', answer: 'No. Application, flow, coolant compatibility and any product-specific additive function must be validated.' },
      { question: 'What information is useful for a cooling-system review?', answer: 'Engine/equipment model, current filter, coolant type, service interval, repair history and any contamination or temperature concerns.' },
      { question: 'Can filtration fix overheating?', answer: 'Not by itself. Overheating has many possible causes; coolant cleanliness is one part of a broader cooling-system diagnosis.' },
    ],
    commercialDecision: { title: 'When coolant filtration becomes an asset-protection conversation', copy: 'Recurring water-pump/seal issues, visible debris, uncertain coolant history or repeated cooling-system repairs justify a structured review of coolant condition and filtration rather than another isolated filter purchase.' },
    fieldNote: { title: 'Maintenance note', copy: 'A coolant filter should never become permission to ignore chemistry. Clean coolant with the wrong condition can still damage an engine.' },
    flow: ['problem','contamination','fieldNote','protectedAssets','mechanism','applications','selection','mistakes','conditions','service','parameters','faq','commercialDecision','standards','families','industries'],
  },
  turbocore: {
    problem: { title: 'A separator element is only as reliable as the housing it sits in.', copy: 'Turbine-style fuel/water separator assemblies depend on a structural housing to hold the correct flow path, seal boundary and element position under pressure and vibration. TURBOCORE™ is the ELIMFILTERS architecture for these turbine-style FH/FG housings and structural assemblies, paired with HYDROCORE™ filtration media inside them.' },
    applications: { title: 'Application scope', items: ['Turbine-style FH/FG fuel filter housings', 'Structural base and head assemblies for staged fuel/water separation', 'Housing replacement where the shell, not the element, has reached end of service life', 'Heavy-duty and off-highway fuel systems built around turbine-housing architecture'] },
    contamination: { title: 'The housing is not the filtration stage — it is what makes filtration possible.', copy: 'TURBOCORE™ does not remove contaminant itself; the paired HYDROCORE™ element does that work. What the housing controls is whether fuel actually flows through that element under the correct pressure and sealing conditions, rather than bypassing it through a worn port, cracked shell or failed seal.' },
    mechanism: { title: 'Structural integrity keeps the separation boundary intact.', copy: 'Port sizing, head-to-bowl sealing, mounting geometry and element-retention features are engineered together so the housing holds its rated pressure and directs fuel through the staged separation path without unfiltered bypass.' },
    protectedAssets: { title: 'What a compromised housing puts at risk', items: ['High-pressure fuel pump', 'Precision injectors', 'The HYDROCORE™ separation stage it contains', 'Fuel-system pressure integrity', 'Downstream filtration stages'] },
    selection: { title: 'How to select the correct housing', items: ['Confirm the exact turbine (FH/FG) housing model and mounting configuration', 'Validate port sizing and flow requirement', 'Confirm head, bowl, drain and seal configuration', 'Match the housing to the approved HYDROCORE™ element and stage position', 'Check for equipment-specific bracket or mounting-orientation requirements'] },
    parameters: { title: 'Engineering parameters', items: ['Rated flow and pressure', 'Port and thread configuration', 'Seal material and compatibility', 'Drain/bowl arrangement', 'Element-retention geometry', 'Mounting and bracket interface'] },
    conditions: { title: 'Conditions that shorten housing service life', items: ['Vibration-heavy mobile equipment duty', 'Repeated over-torque during element service', 'Corrosion from prolonged water contact at the bowl or drain', 'Physical impact damage in tight engine-bay installations', 'Age-related seal degradation'] },
    service: { title: 'What operators should watch', items: ['Fuel seepage at the head, bowl or drain seal', 'Cracking or corrosion visible on the housing shell', 'Difficulty achieving a proper seal at element service', 'Repeated water-in-fuel findings despite a good element', 'Physical damage after impact or improper handling'] },
    mistakes: { title: 'Common errors in the field', items: ['Reusing a damaged or corroded housing to save cost', 'Mixing housing and element from incompatible product lines', 'Over-torquing the head during service and damaging seal surfaces', 'Assuming persistent water-in-fuel is always an element problem when the housing seal has failed', 'Selecting a housing by rough physical size without confirming port and mounting match'] },
    standards: { title: 'Technical reference', copy: 'Rated pressure, flow and port configuration must be confirmed against the exact validated housing model. The technology page explains the structural function without assigning universal performance values across the FH/FG range.' },
    families: { title: 'Product-family connection', copy: 'TURBOCORE™ is assigned to the ELIMFILTERS turbine-style fuel filter housing family and is paired with HYDROCORE™ filtration media as the element installed inside it. The two technologies are selected together but serve distinct functions.' },
    industries: { title: 'Where turbine-housing architecture is common', items: ['Marine', 'Construction', 'Mining', 'Agriculture', 'Power generation', 'Off-highway equipment', 'Truck fleets'] },
    faq: [
      { question: 'What is the difference between TURBOCORE™ and HYDROCORE™?', answer: 'TURBOCORE™ is the structural housing and assembly; HYDROCORE™ is the fuel/water separation filtration media that installs inside it. Both are needed and are selected together.' },
      { question: 'Do I need to replace the housing every time I service the element?', answer: 'No. The housing is a structural component with its own service life; only the element is normally replaced on the standard maintenance interval unless the housing itself shows damage or seal failure.' },
      { question: 'Why is my separator still showing water in fuel after I changed the element?', answer: 'A housing seal or drain failure can allow bypass or contamination independent of element condition. The housing should be inspected, not just the element.' },
      { question: 'Can any HYDROCORE™ element fit any TURBOCORE™ housing?', answer: 'No. Element and housing must be matched by model, port configuration and stage position for the specific approved application.' },
      { question: 'What causes housing seal leaks?', answer: 'Over-torque during service, seal aging, corrosion at the sealing surface or use of an incompatible seal material can all cause leaks.' },
      { question: 'What information does ELIMFILTERS need for a housing review?', answer: 'Equipment and engine identification, current housing model or reference, mounting configuration, and any history of leaks, corrosion or damage.' },
    ],
    commercialDecision: { title: 'When the housing, not just the element, needs attention', copy: 'Recurring water-in-fuel findings after element service, visible corrosion or cracking, or difficulty achieving a proper seal are signals that the conversation should include housing condition, not just the next element sale.' },
    fieldNote: { title: 'Field note', copy: 'A new element in a compromised housing still leaves the system exposed. Check the shell and seals before assuming the filtration stage is at fault.' },
    flow: ['fieldNote','problem','contamination','mechanism','protectedAssets','applications','selection','service','mistakes','conditions','parameters','faq','commercialDecision','families','standards','industries'],
  },
};

export function getTechnologyEditorial(slug: string): TechnologyEditorial | undefined {
  return CONTENT[slug as TechnologySlug];
}
