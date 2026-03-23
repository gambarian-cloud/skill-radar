---
source: Example.Validation-Protocol.Readmission-Algorithm.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: 30-Day Readmission Prediction
version: v1.0
---

# 30-Day Readmission Prediction Protocol

**Draft, confidential**

## Descriptive Statistics of Patients

- Remove death during admission (n=0)

### Prehoc Groupings

- Heart failure
- COPD/asthma
- Infection
- Age > 85

## Analysis

**Daily readmission risk rate calculated by machine algorithm**

### Primary Outcome: Overall Performance

**Question:** Overall how good is Biofourmis?

**Model:**
```
actual-predicted = day + patient_characteristics
```

### Secondary Outcomes

#### 1. Which Day is Best?

**Metric:** R²

#### 2. Which Model is Best?

**Analysis on last day:**

Compare three models:

1. **Model 1:**
   ```
   readmission = biofourmis_score
   ```

2. **Model 2:**
   ```
   readmission = epic_score
   ```

3. **Model 3:**
   ```
   readmission = hospital_score
   ```

**Statistical Test:** Compare c-statistics with ROC contrast test
