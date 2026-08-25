export type SystemEditorialSlug =
  | 'air-intake'
  | 'fuel-cleanliness'
  | 'lubrication'
  | 'hydraulic'
  | 'cooling-system';

export type SystemEditorialKey =
  | 'risk'
  | 'fieldNote'
  | 'failurePath'
  | 'architecture'
  | 'protectedAssets'
  | 'selection'
  | 'parameters'
  | 'conditions'
  | 'service'
  | 'mistakes'
  | 'standards'
  | 'industries'
  | 'faq'
  | 'commercialDecision';

export interface SystemFAQ {
  question: string;
  answer: string;
}

export interface SystemEditorialCopy {
  title: string;
  copy: string;
  image?: string;
  imageAlt?: string;
  imageSide?: 'left' | 'right';
}

export interface SystemEditorial {
  risk: SystemEditorialCopy;
  fieldNote: SystemEditorialCopy;
  failurePath: SystemEditorialCopy;
  architecture: SystemEditorialCopy;
  protectedAssets: { title: string; items: readonly string[] };
  selection: { title: string; items: readonly string[] };
  parameters: { title: string; items: readonly string[] };
  conditions: { title: string; items: readonly string[] };
  service: { title: string; items: readonly string[] };
  mistakes: { title: string; items: readonly string[] };
  standards: SystemEditorialCopy;
  industries: { title: string; items: readonly string[] };
  faq: readonly SystemFAQ[];
  commercialDecision: SystemEditorialCopy;
  flow: readonly SystemEditorialKey[];
}

const CONTENT: Record<SystemEditorialSlug, SystemEditorial> = {
  'air-intake': {
    risk: {
      image: '/images/pelon-air_converted.avif',
      imageAlt: 'ELIMFILTERS primary air element',
      imageSide: 'left',
      title: 'Dust becomes engine wear only after the intake boundary fails.',
      copy: 'The question is not whether an element looks dirty, but whether the intake path controls contaminant entry while still delivering required airflow — media loading, restriction, sealing and housing integrity all shape that outcome. Particulate bypassing a compromised seal and reaching turbocharger surfaces or cylinders becomes engine wear, not a filtration issue; excessive restriction cuts airflow and performance on its own.\n\nPrimary filtration carries the normal dust load while secondary protection guards the clean side during service or failure; housings, sealing surfaces and restriction monitoring determine whether the media performs as designed. Dust on the clean side, damaged seals or a housing that no longer closes are system findings — replacing the element alone can leave the asset exposed.',
    },
    fieldNote: {
      title: 'What a field inspection should reveal',
      copy: 'Dust tracks on the clean side, damaged sealing surfaces, repeated early restriction, collapsed media or a housing that no longer closes correctly are system findings. Replacing the element without correcting the boundary can leave the asset exposed.',
    },
    failurePath: {
      title: 'How the failure develops',
      copy: 'Airborne particulate enters through the intake path or bypasses a compromised seal. Once abrasive contamination reaches turbocharger compressor surfaces, cylinders and rings, the damage mechanism is no longer a filter issue; it is an engine-wear issue. Excessive restriction creates a different failure path by reducing available airflow and affecting performance.',
    },
    architecture: {
      title: 'The protection architecture has to manage both contamination and airflow.',
      copy: 'Primary filtration carries the normal dust load. Secondary protection, where the equipment architecture requires it, protects the clean side during service or primary-element failure. Housings, inlet geometry, sealing surfaces and restriction monitoring determine whether the media can perform as designed. Cabin and compressed-air positions belong to the broader airflow domain but must be selected by their own operating requirements.',
    },
    protectedAssets: {
      title: 'Assets downstream of the decision',
      items: ['Turbocharger compressor surfaces', 'Cylinder walls and piston rings', 'Combustion-air path', 'Air-cleaner housing and seals', 'Operator HVAC path where cabin filtration is part of the application', 'Pneumatic components where air drying is required'],
    },
    selection: {
      title: 'Questions to answer before choosing the configuration',
      items: ['Exact equipment, engine and housing identification', 'Primary versus secondary element position', 'Required airflow and allowable restriction', 'Dust concentration and duty cycle', 'Housing condition and seal geometry', 'Service strategy and restriction indication'],
    },
    parameters: {
      title: 'Engineering parameters that matter',
      items: ['Airflow demand', 'Initial and terminal restriction', 'Dust-holding capacity', 'Media configuration', 'Seal integrity', 'Housing fit', 'Service interval strategy'],
    },
    conditions: {
      title: 'Conditions that change the answer',
      items: ['Mining and quarry dust', 'Agricultural chaff and seasonal loading', 'Construction and demolition environments', 'Long highway service intervals', 'High ambient humidity', 'Damaged or inefficient pre-cleaning hardware'],
    },
    service: {
      title: 'Service indicators worth acting on',
      items: ['Restriction reaching the equipment service threshold', 'Dust evidence on the clean side', 'Damaged seals or housing clamps', 'Recurring premature plugging', 'Changes in airflow or engine response', 'Media damage caused by inappropriate cleaning'],
    },
    mistakes: {
      title: 'Common application mistakes',
      items: ['Selecting by dimensions alone', 'Ignoring housing or seal damage', 'Removing a safety element because it appears clean', 'Extending service after restriction reaches the equipment limit', 'Treating every dusty environment as the same duty cycle'],
    },
    standards: {
      image: '/images/cabin-hero.avif',
      imageAlt: 'ELIMFILTERS cabin air filter',
      imageSide: 'right',
      title: 'Selecting and servicing the correct configuration',
      copy: 'Correct selection starts with exact equipment, engine and housing identification, the primary-versus-secondary position, required airflow and restriction, dust concentration and duty cycle, and the service strategy in place — mining dust, chaff, construction sites and humidity each change the right configuration. Assets at stake include turbocharger surfaces, cylinder walls, the combustion-air path, housing seals and cabin or pneumatic components where applicable.\n\nRestriction reaching the service threshold, dust on the clean side, damaged seals and recurring premature plugging are the signals worth acting on — not appearance alone. Common mistakes include selecting by dimensions only, ignoring housing damage, and extending service past the restriction limit. When a fleet faces repeated dust ingress or intake wear, ELIMFILTERS can review the complete airflow boundary to select the correct protection architecture.',
    },
    industries: {
      title: 'Where airflow protection becomes operationally critical',
      items: ['Mining', 'Construction', 'Agriculture', 'Truck fleets', 'Power generation', 'Waste and municipal fleets', 'Bus and coach'],
    },
    faq: [
      { question: 'Should an engine air filter be changed because it looks dirty?', answer: 'Not by appearance alone. Restriction condition, service strategy, housing integrity and clean-side inspection are better decision inputs.' },
      { question: 'Why can a new filter still allow dust downstream?', answer: 'Incorrect fit, damaged seals, housing damage or contamination introduced during service can bypass otherwise capable media.' },
      { question: 'Does higher efficiency always mean better engine protection?', answer: 'Only if airflow, restriction, capacity and sealing remain compatible with the application.' },
      { question: 'What data should be sent for an intake-system review?', answer: 'Equipment and engine identification, current references, housing information, operating environment, service interval and any restriction or dust-ingress history.' },
    ],
    commercialDecision: {
      title: 'When this should become an engineering review',
      copy: 'If a fleet is experiencing repeated dust ingress, short element life, high restriction or intake-related wear, ELIMFILTERS can review the complete airflow boundary and duty cycle. The objective is to select the correct protection architecture for the asset, not simply quote another replacement element.',
    },
    flow: ['risk','standards'],
  },

  'fuel-cleanliness': {
    risk: {
      image: '/images/syntapor_motor.avif',
      imageAlt: 'ELIMFILTERS SYNTAPORE fuel filtration on engine',
      imageSide: 'left',
      title: 'Fuel contamination becomes expensive when it reaches precision components.',
      copy: 'Modern fuel systems have little tolerance for abrasive particles, free water or unstable fuel quality. The protection strategy is staged around the failure path — controlling particulate loading, removing water, and keeping contamination away from high-pressure pumps and injectors. Contamination entering during transfer, storage or tank breathing promotes corrosion, microbial growth and abrasive wear, growing more severe as pressure increases toward the injectors.\n\nA plugged filter and recurring water are different failure signatures: plugging points to upstream particulate ingress, while returning water points to storage, condensation or poor drainage further in the supply chain — replacing the last element corrects neither cause. Particulate filtration and water separation solve different problems and must not be treated as interchangeable; each occupies a defined position, and flow, capacity and drainage must work together.',
    },
    fieldNote: {
      title: 'Water and particles tell different stories.',
      copy: 'A plugged fine filter may be responding to upstream contamination, while recurring water can point to storage, condensation, tank ingress or poor drainage practice. Replacing the last element in the chain does not correct an upstream source.',
    },
    failurePath: {
      title: 'The failure path runs from storage to injection.',
      copy: 'Contamination can enter during fuel transfer, storage, tank breathing or service. Water can promote corrosion and microbial activity; hard particles can accelerate wear in precision fuel components. As system pressure increases downstream, the consequences of contamination become more severe.',
    },
    architecture: {
      title: 'Fuel protection is a staged cleanliness strategy.',
      copy: 'Particulate filtration and water separation solve different problems and must not be treated as interchangeable. Standard fuel/water separation, turbine-specific separation architectures and primary/secondary particulate filtration each occupy a defined position. Flow, water-holding capacity, micron requirement, drainage and service access have to work together.',
    },
    protectedAssets: {
      title: 'Components the system is protecting',
      items: ['High-pressure fuel pumps', 'Injectors and precision control valves', 'Fuel rails and metering components', 'Transfer pumps', 'Downstream particulate filters', 'Combustion stability indirectly affected by fuel quality'],
    },
    selection: {
      title: 'Selection starts with the contamination problem, not the brand name.',
      items: ['Confirm engine, fuel-system architecture and existing filter positions', 'Identify whether the application needs particulate control, water separation or both', 'Confirm required flow and pressure conditions', 'Review fuel quality and storage practices', 'Validate service access, drainage and water-monitoring needs', 'Use the installed reference as evidence, not as the only design input'],
    },
    parameters: {
      title: 'Parameters that drive fuel-system selection',
      items: ['Fuel flow', 'Particle efficiency requirement', 'Water-separation requirement', 'Water-holding capacity', 'Pressure drop', 'Fuel temperature and viscosity', 'Service interval and drain strategy'],
    },
    conditions: {
      title: 'Operating conditions that change the strategy',
      items: ['Bulk fuel storage', 'High humidity and condensation exposure', 'Remote fuel quality variation', 'High-hour stationary engines', 'Mining and off-road refueling', 'Marine or power-generation environments with extended storage'],
    },
    service: {
      title: 'What should trigger investigation',
      items: ['Recurring water in the separator', 'Premature plugging', 'Hard starting or loss of power under load', 'Visible contamination in drained fuel', 'Repeated injector or pump problems', 'Shortening service intervals without a change in duty cycle'],
    },
    mistakes: {
      title: 'Mistakes that increase risk',
      items: ['Assuming a finer element automatically improves the system', 'Ignoring water because the engine still runs', 'Using a separator where only particulate filtration is required or vice versa', 'Failing to inspect storage and transfer practices', 'Selecting by thread or external dimensions without validating flow and architecture'],
    },
    standards: {
      image: '/images/syntapore_mecanico_camion.avif',
      imageAlt: 'ELIMFILTERS SYNTAPORE fuel filter service on truck',
      imageSide: 'right',
      title: 'Selecting and servicing the correct configuration',
      copy: 'Selecting the right configuration starts with confirming the engine, fuel-system architecture and existing filter positions, then identifying whether the application needs particulate control, water separation, or both. Fuel flow, water-holding capacity, pressure drop, viscosity and drain strategy drive the decision, while bulk storage, humidity and mining or marine duty each raise the bar differently. Exposed components include the high-pressure pump, injectors, control valves and fuel rails.\n\nRecurring water, premature plugging, hard starting or shortening service intervals are signals that justify investigation. A separator and a fuel filter are not interchangeable, and the finest micron rating is not automatically correct once flow, pressure drop and capacity are weighed together. Fuel-cleanliness protection is critical across truck fleets, mining, agriculture and marine operations — recurring failures justify a full review of the contamination path, not just a cross-reference.',
    },
    industries: {
      title: 'Typical high-risk operating environments',
      items: ['Truck fleets', 'Mining', 'Construction', 'Agriculture', 'Power generation', 'Marine', 'Oil and gas', 'Waste and municipal fleets'],
    },
    faq: [
      { question: 'Is a fuel filter the same as a fuel/water separator?', answer: 'No. They can coexist in the same protection architecture, but particulate filtration and water separation address different contamination mechanisms.' },
      { question: 'Why does water keep returning after the separator is drained?', answer: 'The source may be storage, condensation, tank ingress or contaminated fuel supply. Repeated water should trigger a system review.' },
      { question: 'Should the finest possible micron rating always be used?', answer: 'No. Efficiency, flow, pressure drop, capacity and the filter position must be evaluated together.' },
      { question: 'What information is useful for a fuel-system review?', answer: 'Engine or equipment identification, current filter references, fuel source, operating hours, water or plugging history, and the existing primary/secondary/separation layout.' },
    ],
    commercialDecision: {
      title: 'When to review the complete fuel-cleanliness architecture',
      copy: 'Recurring injector failures, water events, premature plugging or unstable fuel quality justify more than a cross-reference exercise. ELIMFILTERS can review the contamination path, filtration stages and operating conditions to determine the correct protection strategy before a product is specified.',
    },
    flow: ['risk','standards'],
  },

  lubrication: {
    risk: {
      image: '/images/oil-hand.avif',
      imageAlt: 'ELIMFILTERS lubrication filter held in hand',
      imageSide: 'left',
      title: 'Lubrication protection has to work while the oil is changing.',
      copy: 'Engine oil carries soot, wear debris and oxidation products while temperature and viscosity shift through the duty cycle — the system must control contamination without compromising oil delivery, bypass behavior or pressure stability. Particles generated at bearings, rings and gears circulate through the same fluid that protects the engine; if restriction becomes excessive, flow or bypass behavior creates a separate risk.\n\nMedia efficiency, contaminant capacity, structural integrity and valve behavior must stay compatible with oil viscosity and temperature — the goal is stable protection across the full service interval, not maximum filtration in isolation. A filter cannot correct a problem created elsewhere: fuel dilution, coolant contamination or wrong viscosity can overwhelm the strategy, so element condition should be read together with oil condition and engine behavior.',
    },
    fieldNote: {
      title: 'A filter cannot correct a lubrication problem created elsewhere.',
      copy: 'Fuel dilution, coolant contamination, excessive soot loading, wrong viscosity or abnormal wear can overwhelm the filtration strategy. Element condition should be interpreted together with oil condition and engine behavior.',
    },
    failurePath: {
      title: 'Wear debris circulates through the same fluid that protects the engine.',
      copy: 'Particles generated at bearings, rings, gears and other loaded interfaces are carried through the lubrication circuit. If contamination is not controlled, abrasive and fatigue wear can accelerate. If restriction becomes excessive, flow or bypass behavior can create a different risk.',
    },
    architecture: {
      title: 'The engineering balance is cleanliness versus reliable oil delivery.',
      copy: 'Media efficiency, contaminant capacity, structural integrity, pressure drop and valve behavior must remain compatible with oil viscosity and operating temperature. The goal is not maximum filtration in isolation; it is stable protection across the full service interval.',
    },
    protectedAssets: {
      title: 'Lubricated assets at risk',
      items: ['Main and connecting-rod bearings', 'Turbocharger bearings', 'Camshaft and valve-train interfaces', 'Piston and ring lubrication zones', 'Oil pump and galleries', 'Other pressure-lubricated engine surfaces'],
    },
    selection: {
      title: 'How to approach the lubrication application',
      items: ['Confirm engine and exact filter position', 'Validate thread, sealing and bypass requirements', 'Review oil grade and expected viscosity range', 'Consider soot and contamination load from the duty cycle', 'Use service history and oil analysis where available', 'Do not extend intervals without supporting evidence'],
    },
    parameters: {
      title: 'Parameters worth validating',
      items: ['Oil flow', 'Pressure drop', 'Media efficiency', 'Contaminant capacity', 'Bypass-valve requirement', 'Operating viscosity and temperature', 'Structural integrity under pressure'],
    },
    conditions: {
      title: 'Conditions that increase lubrication stress',
      items: ['High idle time', 'Heavy load and high thermal duty', 'Cold starts', 'Soot-intensive operation', 'Extended service intervals', 'Fuel dilution or coolant contamination events'],
    },
    service: {
      title: 'Signals that deserve more than a routine filter change',
      items: ['Abnormal oil pressure', 'Repeatedly shortened filter life', 'Unusual debris in the removed element', 'Oil analysis showing increasing wear metals or contamination', 'Evidence of dilution or coolant ingress', 'Bypass or pressure-related complaints'],
    },
    mistakes: {
      title: 'Common lubrication-system mistakes',
      items: ['Extending drain intervals based only on filter claims', 'Ignoring bypass-valve compatibility', 'Selecting by thread and gasket dimensions only', 'Treating abnormal wear debris as normal service contamination', 'Assuming a filter can compensate for incorrect oil or mechanical wear'],
    },
    standards: {
      image: '/images/syntrax.avif',
      imageAlt: 'ELIMFILTERS SYNTRAX lubrication filtration technology',
      imageSide: 'right',
      title: 'Selecting and servicing the correct configuration',
      copy: 'Selection starts with confirming the engine and exact filter position, then validating thread, sealing and bypass requirements against the oil grade and viscosity range — soot load, service history and oil analysis should inform the decision, and intervals should never be extended without evidence. Oil flow, pressure drop, media efficiency, bypass-valve requirement and structural integrity drive selection, while high idle time, heavy load and soot-intensive duty raise lubrication stress differently.\n\nAbnormal oil pressure, repeatedly shortened filter life, unusual debris and oil analysis showing rising wear metals are signals that deserve more than a routine change — a better filter does not by itself justify a longer interval. Common mistakes include extending drains on filter claims alone, ignoring bypass-valve compatibility and selecting by thread dimensions only. When oil pressure or wear trends create uncertainty, ELIMFILTERS can review the filtration application alongside the operating condition.',
    },
    industries: {
      title: 'Where lubrication reliability has high operational value',
      items: ['Truck fleets', 'Mining', 'Construction', 'Agriculture', 'Power generation', 'Bus and coach', 'Waste and municipal fleets'],
    },
    faq: [
      { question: 'Can a better oil filter justify a longer oil-change interval?', answer: 'Not by itself. Oil condition, engine requirements, duty cycle and validated maintenance guidance still govern the interval.' },
      { question: 'Why is bypass behavior important?', answer: 'The lubrication system must preserve oil delivery under changing viscosity and restriction. Incorrect bypass characteristics can alter that protection strategy.' },
      { question: 'What does abnormal debris in a used filter mean?', answer: 'It can indicate wear or contamination upstream. The element should be inspected as evidence of system condition, not simply discarded.' },
      { question: 'What should be provided for a lubrication review?', answer: 'Engine identification, current reference, oil grade, service interval, operating hours and any oil-pressure or oil-analysis history.' },
    ],
    commercialDecision: {
      title: 'When lubrication filtration should be reviewed as an asset-protection decision',
      copy: 'If oil pressure, abnormal wear, shortened service life or contamination trends are creating uncertainty, ELIMFILTERS can review the filtration application alongside the operating condition. The commercial decision should follow the engineering evidence, not precede it.',
    },
    flow: ['risk','standards'],
  },

  hydraulic: {
    risk: {
      title: 'Hydraulic contamination is a tolerance problem before it becomes a failure.',
      copy: 'Pumps, proportional valves, servo components and actuators operate across clearances where particles that appear insignificant can change leakage, response and wear. The protection target has to be defined around the most contamination-sensitive component in the circuit, not the circuit as a whole.\n\nContamination can enter through service, seals, reservoir breathing and new fluid, while additional debris is generated internally by component wear. Without adequate control, particles circulate through precision clearances and create abrasion, erosion and sticking.\n\nPressure, return, suction and offline positions do not perform the same function, so media efficiency, collapse resistance, flow capacity and differential-pressure behavior must match the location. A well-selected element in the wrong position is still the wrong system decision.\n\nA clean-looking fluid can still be hydraulically dirty, since visual inspection does not establish cleanliness. Repeated valve sticking, pump wear or short element life should be connected to particle-control evidence, sampling practice and the actual circuit architecture, not appearance.',
    },
    fieldNote: {
      title: 'A clean-looking fluid can still be hydraulically dirty.',
      copy: 'Visual inspection does not establish cleanliness. Repeated valve sticking, pump wear or short element life should be connected to particle-control evidence, sampling practice and the actual circuit architecture.',
    },
    failurePath: {
      title: 'Particles are generated, ingressed and recirculated.',
      copy: 'Contamination can enter through service, seals, reservoir breathing and new fluid, while additional debris is generated internally by component wear. Without adequate control, particles circulate through precision clearances and create abrasion, erosion and sticking.',
    },
    architecture: {
      title: 'Hydraulic protection depends on placement as much as media.',
      copy: 'Pressure, return, suction and offline positions do not perform the same function. Media efficiency, collapse resistance, flow capacity and differential-pressure behavior must match the location. A well-selected element in the wrong position is still the wrong system decision.',
    },
    protectedAssets: {
      title: 'Precision components being protected',
      items: ['Hydraulic pumps', 'Servo and proportional valves', 'Directional and control valves', 'Actuators and cylinders', 'Manifolds and pressure-control components', 'Sensitive downstream components with tight clearances'],
    },
    selection: {
      title: 'Selection should begin at the most sensitive component.',
      items: ['Identify target cleanliness requirement', 'Map filter position in the circuit', 'Confirm flow and maximum pressure', 'Validate collapse/burst requirements', 'Review fluid viscosity and temperature', 'Consider contamination ingression and duty cycle', 'Confirm indicator or bypass strategy where applicable'],
    },
    parameters: {
      title: 'Hydraulic engineering parameters',
      items: ['Target cleanliness level', 'Beta-rated particle performance where validated', 'Flow', 'Operating and peak pressure', 'Differential pressure', 'Collapse resistance', 'Fluid viscosity and temperature', 'Contaminant capacity'],
    },
    conditions: {
      title: 'Conditions that raise contamination demand',
      items: ['High-cycle mobile hydraulics', 'Dusty construction and mining environments', 'Frequent hose or attachment changes', 'Reservoir breathing exposure', 'High thermal load', 'Component replacement or system opening'],
    },
    service: {
      title: 'Indicators that the circuit needs investigation',
      items: ['Differential-pressure indicator activation', 'Repeated valve sticking or sluggish response', 'Pump noise or wear trends', 'Short element service life', 'Particle-count deterioration', 'Contamination after component replacement or hose failure'],
    },
    mistakes: {
      title: 'Common hydraulic-selection mistakes',
      items: ['Choosing a micron number without a cleanliness target', 'Ignoring filter position', 'Using an element without validating pressure and collapse requirements', 'Assuming new hydraulic fluid is clean enough for the circuit', 'Replacing filters repeatedly without locating contamination ingress'],
    },
    standards: {
      title: 'Selecting and servicing the correct configuration',
      copy: 'Selection should begin at the most sensitive component: identify the target cleanliness requirement, map the filter position in the circuit, confirm flow and maximum pressure, validate collapse and burst requirements, review fluid viscosity and temperature, and confirm the indicator or bypass strategy where applicable.\n\nTarget cleanliness level, Beta-rated particle performance where validated, flow, operating and peak pressure, differential pressure, collapse resistance, fluid viscosity and temperature, and contaminant capacity are the parameters that drive the decision. High-cycle mobile hydraulics, dusty construction and mining environments, frequent hose or attachment changes, reservoir breathing exposure, high thermal load, and component replacement or system opening all raise contamination demand.\n\nThe precision components being protected are hydraulic pumps, servo and proportional valves, directional and control valves, actuators and cylinders, and manifolds and pressure-control components. Differential-pressure indicator activation, repeated valve sticking or sluggish response, pump noise or wear trends, short element service life, and particle-count deterioration are the indicators that the circuit needs investigation.\n\nA lower micron rating is not automatically better; target cleanliness, pressure drop, flow, media performance and circuit position must be evaluated together, and a new hydraulic system can still be contaminated from manufacturing debris, new fluid, hose assembly or installation work before it ever enters service. The most common mistakes are choosing a micron number without a cleanliness target, ignoring filter position, using an element without validating pressure and collapse requirements, and replacing filters repeatedly without locating the actual contamination ingress point.\n\nISO 16889 is commonly used to characterize multi-pass hydraulic-filter performance, while ISO 4406 is widely used to express fluid cleanliness, and product claims must remain tied to validated application data and the sensitivity of the protected circuit. Hydraulic cleanliness drives availability across mining, construction, manufacturing, agriculture, waste and municipal equipment, oil and gas, and marine applications. If valves are sticking, pumps are wearing prematurely or particle counts remain unstable, ELIMFILTERS can review the contamination-control architecture and filter position against the actual circuit, a reliability decision, not merely a replacement-part transaction.',
    },
    industries: {
      title: 'Applications where hydraulic cleanliness drives availability',
      items: ['Mining', 'Construction', 'Manufacturing', 'Agriculture', 'Waste and municipal equipment', 'Oil and gas', 'Marine'],
    },
    faq: [
      { question: 'Is a lower micron rating always better in hydraulics?', answer: 'No. The target cleanliness, pressure drop, flow, media performance and circuit position must be evaluated together.' },
      { question: 'Why can a new hydraulic system still be contaminated?', answer: 'Manufacturing debris, new fluid, hose assembly and installation work can introduce particles before the asset enters service.' },
      { question: 'When should particle counting be used?', answer: 'When cleanliness is a controlled reliability parameter, particle-count data provides better evidence than visual inspection alone.' },
      { question: 'What information is needed for a hydraulic review?', answer: 'Equipment or circuit identification, filter position, current reference, flow, pressure, fluid type, cleanliness target and failure or particle-count history.' },
    ],
    commercialDecision: {
      title: 'When a hydraulic filter quote is not enough',
      copy: 'If valves are sticking, pumps are wearing prematurely or particle counts remain unstable, ELIMFILTERS can review the contamination-control architecture and filter position against the actual circuit. That is a reliability decision, not merely a replacement-part transaction.',
    },
    flow: ['risk','standards'],
  },

  'cooling-system': {
    risk: {
      title: 'A cooling circuit can lose protection before it overheats.',
      copy: 'Corrosion products, mineral scale, degraded coolant and additive imbalance can reduce heat transfer or attack internal surfaces long before the temperature gauge shows a dramatic event. Cooling protection has to preserve fluid condition and keep debris from circulating through the thermal circuit, not just top off what is lost.\n\nScale and corrosion products can restrict passages and reduce heat exchange, while depleted or incorrect coolant chemistry can expose liners, pumps, seals and metal surfaces. Suspended debris then circulates through the same system tasked with controlling engine temperature, compounding the original problem.\n\nParticulate removal can support circuit cleanliness, but filtration cannot compensate for incorrect coolant chemistry, mixed formulations, contamination or an unresolved leak. Where additive-support filtration is used, the configuration has to match the approved cooling-system requirement exactly.\n\nOverheating is often the final symptom, not the first warning. Discolored coolant, recurring debris, deposits, unexplained coolant loss or repeated component corrosion are earlier system signals, and a coolant filter should be evaluated in that context rather than treated as an isolated maintenance item.',
    },
    fieldNote: {
      title: 'Overheating is often the final symptom, not the first warning.',
      copy: 'Discolored coolant, recurring debris, deposits, unexplained coolant loss or repeated component corrosion are earlier system signals. A coolant filter should be evaluated in that context rather than treated as an isolated maintenance item.',
    },
    failurePath: {
      title: 'The damage path runs through heat-transfer surfaces and wetted components.',
      copy: 'Scale and corrosion products can restrict passages and reduce heat exchange. Depleted or incorrect coolant chemistry can expose liners, pumps, seals and metal surfaces. Suspended debris then circulates through the same system tasked with controlling engine temperature.',
    },
    architecture: {
      title: 'Cooling protection combines cleanliness with coolant-condition discipline.',
      copy: 'Particulate removal can support circuit cleanliness, but filtration cannot compensate for incorrect coolant chemistry, mixed formulations, contamination or an unresolved leak. Where additive-support filtration is used, the configuration has to match the approved cooling-system requirement.',
    },
    protectedAssets: {
      title: 'Components exposed to coolant condition',
      items: ['Wet liners where applicable', 'Water pump and seals', 'Radiator and heat-exchanger passages', 'Thermostat and coolant-control components', 'Engine block and head coolant passages', 'Hoses and other wetted surfaces'],
    },
    selection: {
      title: 'Cooling-system selection questions',
      items: ['Confirm equipment and cooling-system design', 'Identify current coolant type and maintenance strategy', 'Determine whether the application uses particulate-only or additive-support filtration', 'Review coolant condition and contamination history', 'Confirm mounting and flow configuration', 'Avoid mixing service strategies without evidence'],
    },
    parameters: {
      title: 'Parameters that matter',
      items: ['Coolant chemistry and compatibility', 'Flow through the filter position', 'Debris load', 'Additive requirement where applicable', 'Temperature range', 'Service interval', 'System pressure and sealing condition'],
    },
    conditions: {
      title: 'Conditions that change the cooling risk',
      items: ['High thermal load', 'Extended idle or stationary generation duty', 'Hard-water contamination', 'Mixed or incorrect coolant formulations', 'Frequent top-off due to leaks', 'Severe ambient heat or dirty heat exchangers'],
    },
    service: {
      title: 'Cooling-system indicators worth investigating',
      items: ['Recurring overheating', 'Discolored or contaminated coolant', 'Visible scale or corrosion debris', 'Repeated water-pump or seal problems', 'Unexplained coolant loss', 'Evidence of mixed coolant or improper top-off fluid'],
    },
    mistakes: {
      title: 'Common cooling-system mistakes',
      items: ['Treating the coolant filter as a substitute for coolant maintenance', 'Mixing incompatible coolant formulations', 'Adding chemicals without confirming system requirement', 'Ignoring recurring debris after filter replacement', 'Failing to correct leaks that continually dilute the coolant strategy'],
    },
    standards: {
      title: 'Selecting and servicing the correct configuration',
      copy: 'Selection starts with confirming the equipment and cooling-system design, identifying the current coolant type and maintenance strategy, and determining whether the application uses particulate-only or additive-support filtration. Coolant condition, contamination history, mounting and flow configuration all matter, and service strategies should never be mixed without evidence.\n\nCoolant chemistry and compatibility, flow through the filter position, debris load, additive requirement where applicable, temperature range, service interval, and system pressure and sealing condition are the parameters that drive selection. High thermal load, extended idle or stationary generation duty, hard-water contamination, mixed or incorrect coolant formulations, and frequent top-off due to leaks each change the cooling risk.\n\nThe components exposed to coolant condition include wet liners where applicable, the water pump and seals, radiator and heat-exchanger passages, the thermostat and coolant-control components, engine block and head coolant passages, and hoses and other wetted surfaces. Recurring overheating, discolored or contaminated coolant, visible scale or corrosion debris, and unexplained coolant loss are the indicators worth investigating.\n\nA coolant filter can contribute to cleanliness but cannot prevent overheating on its own, since heat-exchanger restriction, coolant chemistry, flow, thermostat, pump or mechanical problems can all cause it independently. Mixing different coolants should never be assumed safe without validated compatibility guidance, and debris returning after a filter change usually means the circuit still contains corrosion, scale or an unresolved chemistry problem. The most common mistakes are treating the coolant filter as a substitute for coolant maintenance, mixing incompatible formulations, adding chemicals without confirming the system requirement, and failing to correct leaks that continually dilute the coolant strategy.\n\nCooling-system maintenance and coolant chemistry are strongly application-specific, and product or additive claims should remain tied to validated evidence and equipment guidance rather than generalized across engines or formulations. Thermal reliability is critical across power generation, mining, construction, truck fleets, agriculture, bus and coach, and waste and municipal equipment. Recurring contamination, overheating, corrosion or shortened component life warrants a full review of the coolant strategy and filtration position, since the appropriate product family can only be identified once the operating condition is understood.',
    },
    industries: {
      title: 'Applications where thermal reliability is critical',
      items: ['Power generation', 'Mining', 'Construction', 'Truck fleets', 'Agriculture', 'Bus and coach', 'Waste and municipal equipment'],
    },
    faq: [
      { question: 'Can a coolant filter prevent overheating?', answer: 'It can contribute to cleanliness, but overheating can also result from heat-exchanger restriction, coolant chemistry, flow, thermostat, pump or mechanical problems.' },
      { question: 'Can different coolants be mixed?', answer: 'Compatibility depends on the formulations and equipment requirements. Mixing should not be assumed safe without validated guidance.' },
      { question: 'Why does debris return after a coolant filter is changed?', answer: 'The circuit may still contain corrosion, scale or an unresolved chemistry problem that continues generating contamination.' },
      { question: 'What information helps with a cooling-system review?', answer: 'Equipment identification, coolant type, current filter reference, service history, overheating or contamination symptoms and any recent cooling-system repairs.' },
    ],
    commercialDecision: {
      title: 'When cooling protection should be reviewed as a system',
      copy: 'Recurring contamination, overheating, corrosion or shortened component life warrants a review of the coolant strategy and filtration position. ELIMFILTERS can help determine whether filtration is part of the corrective architecture and identify the appropriate product family only after the operating condition is understood.',
    },
    flow: ['risk','standards'],
  },
};

export function getSystemEditorial(slug: string): SystemEditorial | undefined {
  return CONTENT[slug as SystemEditorialSlug];
}
