---
source: Protocol.Example.Clinicmark-TR-2020-385.Everion-Resp-Rate.pdf
extracted: 2026-02-03
content_type: Device Validation Protocol
device: Everion
parameter: Respiratory Rate
protocol_id: Clinicmark-TR-2020-385
year: 2020
---

# Clinical Validation Protocol and Report: Biofourmis Everion Respiratory Rate

**Study Title:** Biofourmis Respiratory Rate Validation Study - Everion  
**Study ID:** PR 2020-385  
**Technical Report:** TR# 2020-385  
**Date:** 29 Jul 2020 (Revision 1)  
**Study Dates:** 16 Feb 2021 – 13 Apr 2021

## 1. Protocol Objectives and Scope

### Purpose

To conduct a Respiratory Rate accuracy validation comparing the Biofourmis Everion+ to the Reference, an FDA cleared End Tidal Carbon Dioxide monitor (GE Datex-Ohmeda) by manually scoring the collected waveform for data analysis.

### Objectives

- **Primary objective:** Compare the accuracy of the device under test (DUT) for the measurement of respiratory rate against a manually scored reference EtCO2 waveform.
- The study was a comparative, single-center, non-randomized, parallel study.

### Scope

- **Claimed Range:** 5 to 35 breaths per minute (BPM)
- **Extended Test Range:** 5 to 50 BPM (analyzed in Appendix B)
- **Environment:** Normal office environment conditions

## 2. Device Specifications

### Device Under Test (DUT): Biofourmis Everion+

- **Type:** Wearable device monitoring vital signs on the upper arm
- **Sensors:** 
  - Optical components (PPG)
  - 3-axis accelerometer
- **Raw Data Mode:**
  - Full PPG signal: 51.2 Hz (Green, Red, IR)
  - Full Accelerometer signal: 51.2 Hz (x-axis, y-axis, z-axis)
- **Intended Use:** Spot-checking, noninvasive monitoring/logging of respiratory rate on adults
- **Regulatory Status:** Investigational (not FDA cleared). Manufactured following 21 CFR 820
- **Data Transmission:** Continuous data collection to mobile/PC app, sent to cloud/Biofourmis servers
- **Serial Numbers Used:**
  - SN: 0121-00795 (Left)
  - SN: 0121-00678 (Right)
  - Ref: 921801
  - FW Ver: 1.00.000

### Reference Device: GE Healthcare S5 Multi-parameter Monitor

- **Device:** GE Healthcare (Datex-Ohmeda) S5 Multi-parameter Monitor
- **Modules:** E-CAiO-00 or M-COVX module (Spirometry/EtCO2)
- **Measurement:** End Tidal Carbon Dioxide (EtCO2) Respiratory Rate
- **Regulatory Status:** FDA cleared
- **Units Used:**
  - Monitor 6185783 (Modules: E-PRESTN-00, M-CAiO)
  - Monitor 5014850 (Modules: M-COVX, MNESTPR)

## 3. Study Population

### Enrollment

- **Total Enrolled:** 20 qualified healthy subjects
- **Sex Distribution:** 10 males, 10 females

### Demographics

| Category | Sub-category | Statistic | Value |
|:---------|:-------------|:----------|:------|
| **Sex** | Male | % (n) | 50% (10/20) |
| | Female | % (n) | 50% (10/20) |
| **Race** | Black / African-American | % (n) | 10% (2/20) |
| | Asian | % (n) | 20% (4/20) |
| | White | % (n) | 70% (14/20) |
| **Ethnicity** | Hispanic or Latino | % (n) | 5% (1/20) |
| | Not Hispanic or Latino | % (n) | 95% (19/20) |
| **Fitzpatrick Scale** | I | % (n) | 5% (1/20) |
| | II | % (n) | 50% (10/20) |
| | III | % (n) | 20% (4/20) |
| | IV | % (n) | 10% (2/20) |
| | V | % (n) | 5% (1/20) |
| | VI | % (n) | 10% (2/20) |
| **Age (Years)** | | Mean ± SD | 34.1 ± 10.5 |
| | | Range (min, max) | (21, 56) |
| **Weight (lbs)** | | Mean ± SD | 153.9 ± 30.7 |
| | | Range (min, max) | (100, 203) |
| **Height (in)** | | Mean ± SD | 67.0 ± 4.1 |
| | | Range (min, max) | (60, 74) |
| **BMI** | | Mean ± SD | 24.0 ± 3.6 |
| | | Range (min, max) | (19.5, 31.5) |

### Exclusion Criteria

- Compromised circulation
- Tattoos in optical path
- Respiratory conditions (asthma, COPD)
- Cardiovascular conditions (arrhythmia, heart failure)
- Significant medical problems

## 4. Validation Methodology

### Data Collection Procedure

1. Subjects connected to Reference EtCO2 monitor (mouthpiece) and DUT (one on each upper arm)
2. Baseline data collected at natural respiratory rate
3. Stable respiratory rates elicited at approximately 5, 10, 15, 20, 25, 30, 35, 40, 45, and 50 BPM using a paced breathing app
4. Data collected for 1-3 minutes per rate once stable
5. Reference EtCO2 waveforms manually scored by counting respiratory peaks per minute
6. DUT data averaged over 60-second intervals corresponding to the Reference period

### Data Quality & Removal

- DUT values must meet signal quality and movement metrics (Movement = 1, indicating 'at rest')
- Data points removed if Reference performed automatic zeroing (no waveform)
- Subject 30 withdrawn due to adverse event (PVCs); data prior to event used
- Subjects 1-23 used for algorithm development (Phase 1 & 2)
- Subjects 24-44 used for final validation (Phase 3)

## 5. Statistical Analysis Methods

### Primary Metrics

**Accuracy Root Mean Square (A<sub>rms</sub>)** and **Bias (Mean Error)**

### Formulas

**Accuracy Root Mean Square:**

```
A_rms = √(Σ(DUT_i - Ref_i)² / n)
```

**Bias (Mean Error):**

```
Bias = Σ(DUT_i - Ref_i) / n
```

**Where:**
- `DUT` = Test device reading
- `Ref` = Reference Respiratory Rate (EtCO2)
- `n` = Number of data points

### Analysis Plan

- Compare DUT vs Reference for all stable respiratory periods
- Calculate Mean, Variance, t-Test (Two-Sample Assuming Unequal Variances)
- Linear Regression (Error Plot)
- Bland-Altman style analysis (Mean Error, Absolute Mean Error, Standard Deviation)

## 6. Acceptance Criteria & Performance Thresholds

### Pass/Fail Criteria

A passing result requires an **A<sub>rms</sub> ≤ 3**

### Results Summary

| Comparison to Reference | A<sub>rms</sub> | Passing Criteria | Result |
|:------------------------|:----------------|:-----------------|:-------|
| Biofourmis Everion+ Device (5-35 BPM) | 0.9 (571 pts) | A<sub>rms</sub> ≤ 3 | **Pass** |
| Extended Range (5-50 BPM) | 1.1 (605 pts) | A<sub>rms</sub> ≤ 3 | **Pass** |

## 7. Validation Results

### Overall Accuracy Results (Claimed Range: 5-35 BPM)

| RR Ranges (breaths/min) | 5-35 | ≤7 | >7-10 | >10-20 | >20-30 | >30 |
|:------------------------|:-----|:---|:------|:-------|:-------|:----|
| **# of pts** | 571 | 79 | 98 | 192 | 153 | 49 |
| **Mean Error (Bias)** | -0.1 | 0.1 | 0.1 | -0.3 | -0.1 | 0.0 |
| **Absolute Mean Error** | 0.1 | 0.1 | 0.1 | 0.3 | 0.1 | 0.0 |
| **A<sub>rms</sub>** | **0.9** | **1.4** | **0.6** | **1.0** | **0.7** | **1.2** |
| **SEE** | 0.94 | 1.5 | 0.6 | -0.9 | 0.7 | 1.2 |

### Statistical Comparison: t-Test Analysis

**Two-Sample t-Test Assuming Unequal Variances**

| Statistic | Reference RR | Biofourmis RR (DUT) |
|:----------|:-------------|:--------------------|
| Mean | 18.0 | 17.9 |
| Variance | 85.6 | 86.1 |
| Observations | 571 | 571 |
| Hypothesized Mean Diff | 0 | |
| df | 1140 | |
| t-stat | 0.15 | |
| P(T≤t) one-tail | 0.44 | |
| t Critical one-tail | 1.65 | |
| P(T≤t) two-tail | 0.88 | |
| t Critical two-tail | 1.96 | |
| **Conclusion** | **Accept they are equal** | |

### Linear Regression Analysis (5-35 BPM)

- **Regression equation:** y = 0.9976x - 0.0374
- **R² value:** 0.9897
- **Correlation Coefficient:** 0.99
- **Maximum difference:** 9.5 BPM
- **Minimum difference:** -9 BPM

## 8. Extended Range Results (5-50 BPM)

### Extended Range Data

| RR Ranges (breaths/min) | 5-50 | ≤7 | >7-10 | >10-20 | >20-30 | >30-40 | >40 |
|:------------------------|:-----|:---|:------|:-------|:-------|:-------|:----|
| **# of pts** | 605 | 79 | 98 | 192 | 153 | 77 | 6 |
| **Mean Error (Bias)** | -0.2 | 0.1 | 0.1 | -0.3 | -0.1 | -0.5 | -1.3 |
| **Absolute Mean Error** | 0.2 | 0.1 | 0.1 | 0.3 | 0.1 | 0.5 | 1.3 |
| **A<sub>rms</sub>** | **1.1** | **1.4** | **0.6** | **1.0** | **0.7** | **2.0** | **2.7** |
| **SEE** | 1.1 | 1.5 | 0.6 | -0.9 | 0.7 | 1.9 | 3.0 |

### Linear Regression Analysis (5-50 BPM)

- **Regression equation:** y = 0.9854x + 0.1266
- **R² value:** 0.9878
- **Correlation Coefficient:** 0.99
- **Maximum difference:** 9.5 BPM
- **Minimum difference:** -12 BPM

## 9. Regulatory Standards & References

### Regulatory Framework

- **FDA:** Food and Drug Administration (Reference device is FDA cleared)
- **ISO:** International Organization for Standardization
- **21 CFR 820:** Good Manufacturing Practice regulation followed by manufacturer
- **Declaration of Helsinki:** Ethical principles followed
- **IRB:** Salus Independent Review Board (Approval: 3 August 2020)

## 10. Study Phases

### Phase Structure

1. **Phase 1 & 2:** Algorithm development
   - Subjects 1-23
   - Data used for refining respiratory rate algorithm
   
2. **Phase 3:** Final validation
   - Subjects 24-44
   - Data used for independent validation testing
   - Results reported in this protocol

## 11. Conclusions

The Biofourmis Everion+ device demonstrated excellent accuracy for respiratory rate monitoring:

- **Claimed range (5-35 BPM):** A<sub>rms</sub> = 0.9 (Pass - well below threshold of 3)
- **Extended range (5-50 BPM):** A<sub>rms</sub> = 1.1 (Pass)
- Strong correlation with reference device (r = 0.99)
- No statistically significant difference between DUT and reference measurements
- Performance consistent across all respiratory rate ranges tested

The device meets all acceptance criteria and is suitable for its intended use as a noninvasive respiratory rate monitoring device for adults.
