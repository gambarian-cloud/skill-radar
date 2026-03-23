---
source: Example.Validation-Protocol.ECG-QT.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: ECG QT Interval
version: v1.0
---

# QT Evaluation Protocol

**Draft, confidential**

## Descriptive Statistics of Patients

## Analysis

### Overview

- Compare the AI model to the ECG technician's measurement whenever ECG technician performs measurement

### Prehoc Groupings

- Heart failure
- COPD/asthma
- Infection
- Age > 85
- QT-prolonging drugs

### Sample

- Number of patients: TBD
- Number of strips: TBD
- Number of QTs to analyze per strip: TBD

### Power Calculation

For QT on 'agreement between ECG technician and AI algorithm' at patient-level, if we say the main goal is to detect a null that the ICC is good (say ICC=.65) vs excellent (say, 0.75), we need **160 patients**. 

That sample size would just be at the patient level. If we want to look at agreement at the strip level, we would need to adjust for the fact that one patient contributes many strips, so that we would need a larger number of strips than 160.

## Primary Outcome: Correctly Identify QT Interval

### Bland-Altman Analysis

- d̄ ± confidence intervals, mmol/L

### Agreement Between ECG Technician and AI Algorithm

ICC for continuous variables:

- ICC <0.4 are poor
- ICC 0.4-0.75 are good
- ICC > 0.75 are excellent

### RMSE (Root Mean Square Error)

- RMSE between technician and AI < 10% of range
