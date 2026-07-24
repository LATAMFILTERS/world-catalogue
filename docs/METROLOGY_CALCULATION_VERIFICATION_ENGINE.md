# Metrology and Calculation Verification Engine
## Engineering Verification, Audit Procedures, and Mathematical Integrity Standard

**Document ID:** `ELIM-ENG-DOC-METROLOGY-001`  
**Revision:** `1.0.0`  
**Status:** `VERIFIED & APPROVED`  
**Effective Date:** July 2026  
**Governing Standards:** ISO 4406:2021, ISO 16889:2022, ISO 4407, ASTM D341, ASTM D2270, DIN 51524, SAE J1858  

---

## 1. Executive Summary & Core Principle

The **Metrology and Calculation Verification Engine** establishes strict engineering requirements, validation protocols, and mathematical frameworks for all calculations executed across the ELIMFILTERS platform.

### Core Principle: Zero Estimation Policy
In industrial filtration, fluid power, and asset protection engineering, approximation or unverified fallbacks introduce catastrophic risk (e.g., miscalculating particle wear, underestimating hydraulic pressure drops, or misclassifying fluid cleanliness codes). 

1. **No Estimated Values**: Every parameter, output value, or calculated index must be derived strictly from verified mathematical formulations, empirical test standards (ISO/ASTM/SAE), or exact laboratory measurements.
2. **Explicit Data Bounds**: If input parameters fall outside standardized test limits or physical boundaries, the engine must flag the condition explicitly rather than returning a silent approximation or unverified default.
3. **Traceability**: Every output metric must maintain 100% mathematical lineage to specific equations in governing international standards.

---

## 2. Metrology Modules & Governing Equations

### 2.1 ISO 4406 Cleanliness Code Generation (`ISO 4406:2021`)

The ISO 4406 standard expresses fluid cleanliness using a 3-part code representing particle counts per milliliter at three cumulative sizes:
- **$\ge 4\,\mu\text{m(c)}$**
- **$\ge 6\,\mu\text{m(c)}$**
- **$\ge 14\,\mu\text{m(c)}$**

#### Mathematical Formulation
For a measured particle concentration $N$ (particles per mL at a specific size threshold), the ISO Scale Number $S$ is determined by:

$$S = \left\lceil \log_2(N) \right\rceil \quad \text{for } N > 0.04$$

Where the scale number $S$ corresponds to upper and lower concentration bounds:

$$\text{Lower Limit} = 2^{S-1} < N \le 2^S = \text{Upper Limit}$$

| ISO Scale Number $S$ | More Than (particles/mL) | Up To and Including (particles/mL) |
| :---: | :---: | :---: |
| **24** | 80,000 | 160,000 |
| **23** | 40,000 | 80,000 |
| **22** | 20,000 | 40,000 |
| **21** | 10,000 | 20,000 |
| **20** | 5,000 | 10,000 |
| **19** | 2,500 | 5,000 |
| **18** | 1,200 | 2,500 |
| **17** | 640 | 1,200 |
| **16** | 320 | 640 |
| **15** | 160 | 320 |
| **14** | 80 | 160 |
| **13** | 40 | 80 |
| **12** | 20 | 40 |
| **11** | 10 | 20 |
| **10** | 5 | 10 |
| **9** | 2.5 | 5 |
| **8** | 1.3 | 2.5 |
| **7** | 0.64 | 1.3 |
| **6** | 0.32 | 0.64 |

#### Verification Procedure
- **Input Check**: Input particle counts must be non-negative real numbers normalized to $1\,\text{mL}$.
- **Monotonicity Rule**: $N_{\ge 4\,\mu\text{m}} \ge N_{\ge 6\,\mu\text{m}} \ge N_{\ge 14\,\mu\text{m}}$. If this condition is violated, the count is rejected as invalid data (e.g., sensor malfunction).
- **Scale Mapping Test**: Tested across 1,000 synthetic test vectors covering values from $0.01$ to $300,000$ particles/mL to verify exact boundary code assignment without precision drift.

---

### 2.2 Multi-Pass Beta Ratio & Efficiency (`ISO 16889:2022` / `SAE J1858`)

Filtration efficiency and Beta Ratios ($\beta_x$) evaluate filter performance under controlled multi-pass conditions using ISO MTD (Medium Test Dust).

#### Mathematical Formulation

$$\beta_x = \frac{N_{\text{upstream}, x}}{N_{\text{downstream}, x}}$$

Where:
- $x$ = Particle size in micrometers ($\mu\text{m(c)}$).
- $N_{\text{upstream}, x}$ = Cumulative particle count per unit volume upstream of the filter at size $\ge x$.
- $N_{\text{downstream}, x}$ = Cumulative particle count per unit volume downstream of the filter at size $\ge x$.

Filtration Efficiency $\eta_x$ (expressed as a percentage) is calculated directly from $\beta_x$:

$$\eta_x = \left( 1 - \frac{1}{\beta_x} \right) \times 100\% = \left( \frac{\beta_x - 1}{\beta_x} \right) \times 100\%$$

#### Verification Standard Values

| Beta Ratio $\beta_x$ | Filtration Efficiency $\eta_x$ | Performance Classification |
| :---: | :---: | :---: |
| **2** | $50.0\%$ | Nominal rating threshold |
| **10** | $90.0\%$ | Low-efficiency barrier |
| **75** | $98.67\%$ | Legacy absolute rating |
| **100** | $99.0\%$ | Standard absolute rating |
| **200** | $99.5\%$ | High-efficiency rating |
| **1000** | $99.9\%$ | Premium critical protection rating |
| **2000** | $99.95\%$ | Ultra-clean hydraulic rating |
| **10000** | $99.99\%$ | Absolute barrier rating |

#### Verification Procedure
- **Physical Boundary Check**: $\beta_x \ge 1.0$. Values of $\beta_x < 1.0$ indicate downstream generation (e.g., media shedding or leak) and must trigger a performance warning.
- **Conversion Integrity**: Dual-directional verification ($\beta \leftrightarrow \eta$) executed to within double-precision floating-point tolerances ($< 10^{-12}$).

---

### 2.3 Fluid Mechanics & Pressure Drop ($\Delta P$)

Total filter housing and element differential pressure ($\Delta P_{\text{total}}$) is calculated using hydrodynamic principles combining housing loss ($\Delta P_{\text{housing}}$) and media loss ($\Delta P_{\text{element}}$).

#### Mathematical Formulations

1. **Darcy-Weisbach Equation for Housing Loss**:

$$\Delta P_{\text{housing}} = \zeta \cdot \frac{\rho \cdot v^2}{2} = \zeta \cdot \frac{8 \cdot \rho \cdot Q^2}{\pi^2 \cdot D^4}$$

Where:
- $\zeta$ = Minor loss coefficient of housing geometry.
- $\rho$ = Fluid density ($\text{kg/m}^3$).
- $v$ = Fluid velocity ($\text{m/s}$).
- $Q$ = Volumetric flow rate ($\text{m}^3/\text{s}$).
- $D$ = Housing port internal diameter ($\text{m}$).

2. **Hagen-Poiseuille / Laminar Flow Resistance for Media**:

$$\Delta P_{\text{element}} = \frac{\mu \cdot Q \cdot R_m}{A_{\text{effective}}}$$

Where:
- $\mu$ = Dynamic viscosity of fluid ($\text{Pa}\cdot\text{s} = \text{cSt} \times \text{density} \times 10^{-6}$).
- $R_m$ = Specific media resistance factor ($\text{m}^{-1}$).
- $A_{\text{effective}}$ = Total effective filtration surface area ($\text{m}^2$).

3. **Viscosity Adjustment (ASTM D341 Baseline Correlation)**:

$$\Delta P_{\text{adjusted}} = \Delta P_{\text{base}} \times \left( \frac{\nu_{\text{actual}}}{\nu_{\text{base}}} \right)^y$$

Where $y = 1.0$ for laminar flow through porous media ($Re < 10$) and $y = 1.75\text{--}2.0$ for fully turbulent housing flow ($Re > 4000$).

#### Verification Procedure
- **Reynolds Number ($Re$) Boundaries**:
  
  $$Re = \frac{\rho \cdot v \cdot D}{\mu} = \frac{4 \cdot \rho \cdot Q}{\pi \cdot D \cdot \mu}$$

  - If $Re < 2000$, flow is treated as laminar.
  - If $Re > 4000$, flow is treated as turbulent.
  - In transition ($2000 \le Re \le 4000$), explicit transition flow interpolation is applied.

---

### 2.4 Contamination Wear Modeling (`ISO 4407` / Macpherson Model)

Abrasive wear on precision hydraulic and engine components (pumps, injectors, bearings) is calculated using particle clearance size ratio and concentration.

#### Mathematical Formulations

1. **Component Wear Rate Index ($W_r$)**:

$$W_r = K \cdot \sum_{i} \left( N_i \cdot \alpha_i \cdot w_i \right)$$

Where:
- $K$ = Component sensitivity factor.
- $N_i$ = Concentration of particles in size class $i$.
- $\alpha_i$ = Particle hardness ratio relative to surface hardness ($H_{\text{particle}} / H_{\text{surface}}$).
- $w_i$ = Size-clearance ratio factor:

$$w_i = \begin{cases} 
\left( \frac{x_i}{h_c} \right)^2 & \text{for } x_i < h_c \\
1.0 & \text{for } h_c \le x_i \le 3 h_c \\
\left( \frac{3 h_c}{x_i} \right) & \text{for } x_i > 3 h_c 
\end{cases}$$

Where $h_c$ is the dynamic fluid film clearance of the component (e.g., $0.5\text{--}2.0\,\mu\text{m}$ for diesel injectors, $1.0\text{--}5.0\,\mu\text{m}$ for hydraulic spool valves).

---

### 2.5 Kinematic Viscosity & Viscosity Index (`ASTM D341` / `ASTM D2270`)

Viscosity temperature behavior is calculated using ASTM D341 Walther equation and ASTM D2270 Viscosity Index calculation.

#### Mathematical Formulations

1. **ASTM D341 Walther Equation**:

$$\log_{10}\left( \log_{10}\left( \nu + 0.7 \right) \right) = A - B \cdot \log_{10}(T)$$

Where:
- $\nu$ = Kinematic viscosity in $\text{cSt}$ ($\text{mm}^2/\text{s}$).
- $T$ = Absolute temperature in Kelvin ($\text{K}$).
- $A, B$ = Fluid-specific constants determined from two reference measurements (e.g., at $40^\circ\text{C}$ and $100^\circ\text{C}$).

2. **ASTM D2270 Viscosity Index ($VI$)**:

If $VI \le 100$:

$$VI = \frac{L - U}{L - H} \times 100$$

Where:
- $U$ = Kinematic viscosity of test oil at $40^\circ\text{C}$.
- $L$ = Kinematic viscosity at $40^\circ\text{C}$ of a $0\,VI$ reference oil having same $100^\circ\text{C}$ viscosity as test oil.
- $H$ = Kinematic viscosity at $40^\circ\text{C}$ of a $100\,VI$ reference oil having same $100^\circ\text{C}$ viscosity as test oil.

---

## 3. Engineering Audit & Integrity Protocols

To maintain compliance and eliminate unverified assumptions, the following audit protocols are enforced across all codebase developments:

1. **Source Attribution Protocol**:
   - Every calculation function must declare its governing international standard in docstrings/comments (e.g., `@standard ISO 4406:2021 Section 5.2`).
   - Hardcoded magical numbers or arbitrary scaling constants without standard citation are strictly prohibited.

2. **Zero Fallback Assurance**:
   - In the event of missing or out-of-spec input data, calculations must return an explicit `MetrologyError` or `BoundaryViolationException` detailing the exact out-of-bound parameter, rather than returning default numbers or $0.0$.

3. **Automated Metrology Test Suite**:
   - Continuous integration tests run benchmark datasets against reference manual calculation sheets and published standard test vectors.
   - Precision tolerance threshold: Maximum relative error $\le 10^{-6}$ for calculated physical properties and absolute zero error on integer ISO scale codes.

---

## 4. Summary Matrix of Supported Standards

| Parameter / Calculation | Governing Standard | Input Bounds | Output Units / Format |
|---|---|---|---|
| **Fluid Cleanliness Code** | ISO 4406:2021 | $N \ge 0\,\text{particles/mL}$ | Scale Code `R4/R6/R14` (e.g., `18/16/13`) |
| **Beta Ratio & Efficiency** | ISO 16889:2022 | $\beta \ge 1.0$, $x \ge 1\,\mu\text{m}$ | $\beta_x$ (ratio), $\eta_x$ (%) |
| **Pressure Drop ($\Delta P$)** | Darcy-Weisbach / Hagen-Poiseuille | $Q > 0, \nu > 0, \rho > 0$ | $\text{kPa}$ / $\text{bar}$ / $\text{PSI}$ |
| **Viscosity Index ($VI$)** | ASTM D2270 | $\nu_{40} > 0, \nu_{100} > 0$ | $VI$ (Dimensionless index) |
| **Temperature-Viscosity** | ASTM D341 | $T > 200\,\text{K}, \nu > 0.2\,\text{cSt}$ | $\nu(T)$ in $\text{cSt}$ |
| **Gravimetric Contamination** | ISO 4405 | Mass $m \ge 0\,\text{mg}$ | $\text{mg/L}$ or $\text{mg/kg}$ |

---

*This document defines the binding metrological standard for all ELIMFILTERS engineering calculations and decision engines.*
