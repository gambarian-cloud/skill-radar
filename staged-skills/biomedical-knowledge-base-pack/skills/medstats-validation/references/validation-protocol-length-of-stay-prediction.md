---
source: Example.Validation-Protocol.Length-of-Stay-Prediction.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: Length of Stay Prediction
version: v1.0
---

# Length of Stay Prediction Protocol

**Draft, confidential**

## Descriptive Statistics of Patients

- Remove death during admission (n=0)

### Prehoc Groupings

- Heart failure
- COPD/asthma
- Infection
- Age > 85

## Analysis

### Length of Stay (LOS)

**Note:** Time to discharge is a derivative of LOS

- Daily LOS prediction, calculated at 5pm

### Primary: Overall Performance

**Observed minus predicted each day**

- GEE to account for repeated measures and modeled as a function of time with either linear and/or quadratic terms
  
**Model:**
```
observed-predicted = day + patient_characteristics
```

**Patient characteristics include:**
- Age
- Gender
- Admitting diagnosis

### Secondary Outcomes

#### 1. Overall Correct

**Model:**
```
exactly_correct = day + patient_characteristics
```

#### 2. HD1 Prediction (Hospital Day 1)

- R² between observed and predicted
- RMSE

#### 3. Penultimate Day

- R² between observed and predicted
- RMSE
