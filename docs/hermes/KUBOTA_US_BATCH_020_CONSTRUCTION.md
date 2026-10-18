# Kubota USA — Batch 020: KX040-4 U35-4 SVL75-2 construction
2026-10-17. Research only, no canonical inserts or new SKU. OEM = Kubota original part number.

## KX040-4 OEM positions
Air primary RD158-42270; air safety RD158-42280; lube HH164-32430; hydraulic suction RD411-62210; pilot filter R1411-64930; return RD461-62120.
Evidence: https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-kx040-4-excavator-s-n-31772-above and https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-kx040-4-excavator .
Fuel conflict by kit and serial: RD159-51020, RD159-51022, 1J800-43172; do not merge.
Kubota authorized parts dealer references https://store.germanbliss.com/kubota/excavators/kx-series-excavator/kx040-4-parts lists air RD158-42270 / RD158-42280, lube HH164-32430, hydraulic RD411-62210/RD461-62120, water separator RD159-51940, and fuel 11151-41350. Source disagreement remains unresolved.

## U35-4
Dealer kit https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-for-kubota-u35-4-excavator lists TC020-16320 air primary; T0270-93220 secondary; HH1C0-32430 lube; 68773-62210 hydraulic suction; 15221-43170 fuel; RD401-61270 pilot filter.
Dealer genuine catalog https://store.germanbliss.com/kubota/excavators/u-series-excavator/u35-4-parts lists V0511-65150 hydraulic return, RD411-62150 breather, RD819-51280 water separator. These are additional positions, not necessarily all in same kit.

## SVL75-2
First-party-number reseller kit https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-svl75-2-skid-steer-loader-s-n-26157-below lists 59800-26110 primary air, 3A111-19130 secondary, HH1C0-32430 lube, HHTA0-59900 HST, HH166-43560 fuel. Extended kit includes 68773-62210 suction.
At serial 26158-35177, reseller kit https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-svl75-2-skid-steer-loader-s-n-26158-35177-2595151 lists HHV00-51640 fuel and V0511-65150 return. Another kit SKU https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-for-kubota-svl75-2-skid-steer-loader-msu-ka-0174 lists 1K947-43172 fuel. Preserve exact serial fitment; do not unify conflicting fuel OEMs.

## First cross research
Kubota 15221-43170 -> Donaldson P550127; Fleetguard FF5226 from https://www.filterfinderonline.com/products/15221-43170 and https://www.allprodiesel.net/products/fleetguard-ff5226-fuel-filter . Candidate EF90127 (EF9+0127). Existing data/dims.csv mentions EF90127: reuse identity after live DB validation. Manufacturer-specific direct Kubota OEM cross not yet inspected, so review only.
RD158-42270 and RD158-42280 -> no confirmed direct Donaldson/Fleetguard cross from present first pass. Only MANN C12009/CF701, WIX WA10854/WA10890 are reported https://www.airfilter-crossreference.com/convert/KUBOTA/RD158-42270 and https://crossfilters.com/products/wix-wa10854-wa10890-air-filter-set-replaces-rd158-42280-rd158-42270 . Under owner diesel rule do not use MANN or WIX as base. A third-party indirect listing suggests Donaldson P500280 for inner air RD158-42280 https://inlinefilters.co.uk/FilterCrossReference/Kubota/RD15842280/ ; direct manufacturer OEM cross and specs not verified, leave open.
SVL75-2 lube HH1C0-32430 -> prior Donaldson P550318 candidate EL80318; SVL75-2 air 59800-26110 / 3A111-19130 -> previous P827653/P829332 research candidates, require genuine fitment by serial. HHTA0-59900 hydraulic HST no verified Donaldson/Fleetguard cross; leave open.

## Gating
No unverified SKU minting or duplicated product, and no assumption that an aftermarket kit establishes a complete service schedule. Owner method OEM first / Donaldson first-pass / verified Fleetguard fallback / OEM last; automatic approval only on evidenced cross + identity + no collision, four digits with leading zeros.
Ponytail: reused Isuzu/NPR research and Kubota batches, canonical SKU identity checks. Only research document created, no scripts or services.
