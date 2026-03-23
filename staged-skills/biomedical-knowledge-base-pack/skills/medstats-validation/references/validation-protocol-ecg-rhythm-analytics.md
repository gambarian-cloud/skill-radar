---
source: Example.Validation-Protocol.ECG-RhythmAnalytics.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: RhythmAnalytics (RA)
version: v1.0
---

# RhythmAnalytics Evaluation Protocol

**Draft, confidential**

## RA Overview

### Dataset

- All home hospital telemetry
- Strip = 1 min

### Strip Selection (Table 1)

1. RA scans entire dataset
2. Random sampling of RA's identified arrhythmias per Table 1
   - Force same number per patient
3. Random sampling of areas identified as normal by RA per Table 1 for patients with heart failure exacerbation or mention of arrhythmia in their EHR

### Gold-Standard Annotation

- 2 initial reviews with 3rd review for incongruencies
- Exact arrhythmia classification, categorical (Table 2)
- Arrhythmia subgroup classification, categorical (Table 2)

### RA Annotation

- Exact arrhythmia classification, categorical (Table 2)
- Arrhythmia subgroup classification, categorical (Table 2)

### Gold-Standard vs RA (Table 3)

**Performance Metrics:**
- Sensitivity, specificity, PPV, NPV, FNR (miss rate), accuracy, F-1 score, precision-recall
  - Exact arrhythmia
  - Subgroup arrhythmia
  - Give 95% CIs for each measure using clustering by patient

## Table 1. Strip Selection

| **Arrhythmia**              | **Number of arrhythmias identified by RA (n=1,590,572)** | **Number of strips randomly selected** |
|-----------------------------|----------------------------------------------------------|-----------------------------------------|
| Atrial fibrillation/flutter | 184,142                                                  | 1,000                                   |
| PVC                         | 233,317                                                  | 1,000                                   |
| Ventricular Bigeminy        | 34,075                                                   | 1,000                                   |
| Ventricular Trigeminy       | 18,127                                                   | 1,000                                   |
| PSVT                        | 9,044                                                    | 1,000                                   |
| Sinus bradycardia           | 106,710                                                  | 1,000                                   |
| Sinus tachycardia           | 105,365                                                  | 1,000                                   |
| Pause                       | 698                                                      | 1,000                                   |
| No arrhythmia               | —                                                        | 2,000                                   |

**Note:** Biofourmis needs to provide total number of strips analyzed by RA

**Requirement:** At least 10 instances of arrhythmia to test.

## Table 2. Arrhythmia Classification

| **Arrhythmia**              |
|-----------------------------|
| Atrial fibrillation/flutter |
| PVC                         |
| Ventricular Bigeminy        |
| Ventricular Trigeminy       |
| PSVT                        |
| Sinus bradycardia           |
| Sinus tachycardia           |
| Pause                       |
| Unknown                     |
| Random strips               |

## Table 3a. Correctly Identifies Arrhythmia

|                            |                        | **Gold standard**                                      |                                                            |
|----------------------------|------------------------|--------------------------------------------------------|------------------------------------------------------------|
|                            |                        | **Arrhythmia**                                         | **No arrhythmia**                                          |
| **RA**                     | **Arrhythmia identified** | TP (RA correct)                                     | FP (incorrectly finds arrhythmia)                          |
|                            | **Arrhythmia not identified** | FN (incorrectly misses arrhythmia)              | TN (RA correct)                                            |

**Analysis:** Separate 2×2 for subgrouping of arrhythmias

## Table 3b. Correctly Identifies Specific Rhythm

|                            |                     | **Gold standard** |                                           |
|----------------------------|---------------------|-------------------|-------------------------------------------|
|                            |                     | **Afib**          | **No afib**                               |
| **RA**                     | **Afib identified** | TP (RA correct)   | FP (incorrectly finds arrhythmia)         |
|                            | **Afib not identified** | —             | —                                         |

**Calculate:** PPV only
