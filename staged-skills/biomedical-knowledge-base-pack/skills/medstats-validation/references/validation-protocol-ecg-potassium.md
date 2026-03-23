---
source: Example.Validation-Protocol.ECG-Potassium-Algorithm.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: ECG Potassium Algorithm
version: v1.0
---

# Potassium Evaluation Protocol

**Draft, confidential**

## Descriptive Statistics of Patients

## Analysis

- Compare the AI model to the lab measurement each time there is a lab measurement after the 2nd lab measurement

### Prehoc Groupings

- IV diuretic use
- Potassium supplementation
- Any diuretic use

## Primary Outcome: Correctly Identifies Numeric Potassium-Value

### Bland-Altman Analysis

- d̄ ± confidence intervals, mmol/L
- **Prespecified:** agreement interval less than 0.3 mmol/L is meaningful and useful for clinical care

### Agreement Between Lab and AI Algorithm

ICC for continuous variables:

- ICC <0.4 are poor
- ICC 0.4-0.75 are good
- ICC > 0.75 are excellent

### RMSE (Root Mean Square Error)

- < 10% of range: good
- \> 10% of range: not good

## Secondary Outcomes

### Analysis at Each Repeated Measure

**Groupings:** all measures, 1st only, 2nd only, 3rd only, 4th only

### 1. Correctly Identifies Hyperkalemia (>5.1mmol/L) vs Normokalemia (3.4-5.1mmol/L) vs Hypokalemia (<3.4mmol/L)

|                    |                | **Core lab**     |                  |
|--------------------|----------------|------------------|------------------|
|                    |                | **HyperK**       | **Not HyperK**   |
| **AI-algorithm**   | **HyperK**     | TP               | FP               |
|                    | **Not HyperK** | FN               | TN               |

**Calculate:** Sensitivity, specificity, PPV, NPV, accuracy, F1-score

### 2. Correctly Identifies K≥4 and K<4

|                    |            | **Core lab** |          |
|--------------------|------------|--------------|----------|
|                    |            | **K≥4**      | **K<4**  |
| **AI-algorithm**   | **K≥4**    | TP           | FP       |
|                    | **K<4**    | FN           | TN       |

**Calculate:** Sensitivity, specificity, PPV, NPV, accuracy, F1-score

### 3. % Values Within ± 0.3mEq

Formula:
```
(TP + TN) / (P + N)
```
