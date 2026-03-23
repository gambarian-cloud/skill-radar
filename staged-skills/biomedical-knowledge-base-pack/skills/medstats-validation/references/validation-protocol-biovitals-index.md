---
source: Example.Validation-Protocol.Biovitals-Index.v1.0.docx
extracted: 2026-02-03
content_type: Validation Protocol
algorithm: BioVitals Index
version: v1.0
---

# BioVitals Evaluation Protocol

**Draft, confidential**

## Descriptive Statistics of Patients

## Traditional Vital Sign Monitoring

- \# and % patients with no alarm at all
- \# alarms, per patient per hour
- \# alarms with clinical utility,[^1] per patient per hour (true positives)
- \# alarms without clinical utility, per patient per hour (false positives)
- PPV/precision for clinical utility at the alarm (Table 1)
- Sensitivity, specificity, PPV, NPV for recognition of a safety composite at the patient level (Table 2)

## BI Monitoring

- Same calculations as traditional, above

## NEWS2 Monitoring

- Cutoff: medium or high risk (score > 4) (will not include AVPU)
- Same calculations as traditional, above

## BI vs NEWS2 vs Traditional Vital Sign Monitoring

### Primary Outcome

Compare the alarm burden, \# per patient per hour

- Negative binomial, clustering by patients

### Secondary Outcomes

#### Compare the PPV for clinical utility at the alarm level

- Negative binomial clustering by patients

#### Compare the sensitivity, specificity, PPV, NPV for recognition of a safety composite

- Negative binomial clustering by patients

#### Compare the \# of alarms with clinical utility over the total length of stay

- Each patient will have an outcome that is the number of alarms with clinical utility (by BI, NEWS2, and traditional vital signs) over their total relevant length of stay (in hours). For both BI and NEWS2, the primary outcome will be the rate of alarms with clinical utility per hour.

- We will use GEE with three outcomes per patient (the number of clinically important alarms for BI, NEWS2, and traditional vital signs); the GEE will account for the clustering between the three outcomes on a patient. The GEE will use a negative binomial marginal model with a log-link for the number of alarms with clinical utility and an offset for log length-of stay (in hours); with this model, we model the rate per hour of number of alarms with clinical utility with BI, NEWS2, and traditional vital signs. The main covariate in the negative binomial model will be a three-level covariate for method: BI vs NEWS2 vs traditional vital signs, and the exponential of the effect of this covariate will be a pair-wise rate ratio for BI vs NEWS2 vs traditional vital signs.

#### Alarms with clinical utility missed by BI but fired by traditional, %

## Table 1. Alarm-level (cluster by patient)

|                        | **Gold standard**                                              |                                                                    |         |
|------------------------|----------------------------------------------------------------|--------------------------------------------------------------------|---------|
|                        | **Clinical utility**                                           | **No clinical utility**                                            |         |
| **Alarm fires**        | TP (alarm was useful)                                          | FP (alarm fired but wasn't useful)                                 | Known   |
| **Alarm does not fire**| FN (should have but didn't -- unknown)                         | TN (didn't fire and shouldn't have fired -- unknown)               | Unknown |
|                        | Unknown                                                        | Unknown                                                            | Unknown |

**Calculate: PPV**

## Table 2. Patient-level

|                                | **Gold standard**                      |                                        |       |
|--------------------------------|----------------------------------------|----------------------------------------|-------|
|                                | **Safety composite occurred**          | **Safety composite didn't occur**      |       |
| **Pt has an alarm that fired** | TP                                     | FP                                     | Known |
| **Pt has an alarm that doesn't fire** | FN                              | TN                                     | Known |
|                                | Known                                  | Known                                  | Known |

**Safety composite:** overnight visit, extra unplanned visit, transfer back to the hospital, death during admission, delirium, loss of consciousness, other major event

**Calculate:** sensitivity, specificity, PPV, NPV

## Definitions

[^1]: An alarm with clinical utility is defined as one associated with a change in clinical management or that identified a safety event (overnight visit, extra unplanned visit, transfer back to the hospital, death during admission, delirium, loss of consciousness, other major event)
