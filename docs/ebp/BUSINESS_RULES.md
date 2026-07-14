# ELIMFILTERS Business Platform — Business Rules

## Product identity

- `elimfilters_code` is the immutable canonical SKU identifier.
- Every SKU has one Product Engineering Passport (PEP) and may have multiple revisions.
- Base/reference codes and brands identify the market reference but do not replace the ELIMFILTERS SKU.

## Engineering ownership

ELIMFILTERS exclusively defines and approves:

- Technology assignment
- Required filtration media and construction
- Efficiency, micron and beta targets where applicable
- Adhesive, gasket, center tube, end cap and other material requirements
- Bypass and anti-drainback requirements where applicable
- Dimensions, thread and performance targets
- Packaging policy
- Engineering revision and approval status

A manufacturer may submit offered or actual values, compliance confirmations, deviations, evidence, and commercial information. It may never overwrite required values.

## Manufacturer identity

- Every manufacturer receives a permanent confidential code in the format `EFM-XXXX` or an equivalent non-sequential generated identifier.
- Manufacturer legal name, contacts, location, certifications, contracts, and banking details are restricted data.
- One SKU may have several manufacturer proposals and several approved manufacturers.

## Manufacturer proposal

Every proposal is bound to:

- One manufacturer code
- One SKU
- One PEP revision
- One request batch
- One submission version

Proposal history is append-only. Corrections create a new version or auditable revision.

## Packaging

- Automotive: individual branded box required unless ELIMFILTERS approves an exception.
- Industrial: no individual box by default.
- Protective bags, separators, caps, moisture barriers, or other protection may be required by product.
- Industrial master-carton targets are generally 6, 12, or 24 units, but a manufacturer may submit a physical/logistical deviation.
- Store target quantity, manufacturer recommendation, and final approved quantity separately.

## Selection engine

The engine must first apply mandatory compliance gates. A non-compliant proposal cannot win solely because of price.

Eligible proposals are scored using documented weights that include at minimum:

- Technical compliance
- FOB price
- Packaging compliance and logistics
- MOQ
- Lead time
- Capacity
- Evidence and certifications
- Historical quality and delivery performance when available

The engine recommends primary, secondary, and backup manufacturers per SKU. Final approval remains with ELIMFILTERS.

## Distributor visibility

A distributor may only see approved, published product and commercial data assigned to its account. It may never see manufacturer identity, FOB cost, internal engineering requirements, margins, other distributors' data, or unpublished products.
