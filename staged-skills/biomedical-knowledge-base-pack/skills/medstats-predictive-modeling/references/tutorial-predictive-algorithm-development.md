---
source: Tutorial.Predictive-Algorithm-Development.2022.docx
extracted: 2026-02-03
content_type: Tutorial
year: 2022
topic: Predictive Algorithm Development
---

# Tutorial: Predictive Algorithm Development

## Introduction

BiovitalsHF-B11 is an observational, multicentre study to evaluate the feasibility of a novel mobile health monitoring platform to capture patient-centered outcomes measures among patients with Heart Failure (HF).

The latest study protocol to date is V2.6, last updated 16 Nov 2021. The study is conducted at 1 US site (Mayo Jacksonville) and 5 SG sites (NUH, NHCS, TTSH, KTPH, and CGH). Target number of subjects is 150 patients. The first patient is recruited in October 2020. Up to August 2022, there are total 63 patients recruited which includes 10 ongoing patients.

## Self-Learning Framework

The learning can be divided into 3 parts, and some of the learning materials are suggested. Please feel free to learn from other materials and plan your own learning steps. Some questions are also listed to help you test your understanding.

### 1. Clinical Background

**Objective:** To understand HF disease overview (symptoms, diagnosis, treatment, and stages), and to know how the traditional outcomes assessment are conducted and understand their limitations.

**Materials:**

- [WebMD Heart Failure Guide](https://www.webmd.com/heart-disease/guide-heart-failure)
- **6MWT:** Faggiano et al 2004, Sophia et al 2019
- **KCCQ:** Spertus et al 2020, FDA KCCQ qualification summary
- **Lab:** Salah et al 2019 (NT-ProBNP)
- **NYHA:** Raphael et al 2007

### 2. Biomarkers and Digital Clinical Measures

**Objective:** To understand various types of biomarkers and how to develop digital clinical measures.

**Materials:**

- FDA-NIH's BEST (Biomarkers, EndpointS, and other Tools) glossary
- The Playbook: Digital Clinical Measures -- only selected pages

### 3. B11 Study Protocol

**Objective:** To get familiar with B11 protocol (study population, endpoints, data collected) and to identify which data are the traditional clinical measures and which data can be used to find potential novel digital clinical measures.

**Materials:**

- B11 protocol
- Summarized list of B11 data (please refer to the study protocol for more details)

## B11 Data Collection Summary

### Wearable Data

| Data Source | Frequency | Notes |
|------------|-----------|-------|
| **Everion PPG and accelerometer** (sent together) | During 6MWT only | Timestamp issue and missing data |
| **Apple watch accelerometer** | During 6MWT only | Timestamp issue and missing data |
| **Everion vitals** | When worn | |
| **Apple watch vitals** | Aggregated daily or several times a day | |
| **Apple watch ECG** | 30 seconds daily | |

### App Data

| Data Source | Frequency | Notes |
|------------|-----------|-------|
| **User walktest** | During 6MWT only | Timestamp issue |
| **QoL reports: KCCQ** | Biweekly | |
| **QoL reports: scheduled questionnaire** | Daily | |
| **Voice biomarkers** (counting task) | Biweekly | Counting task may not be a proper voice data collection for HF patients |

### In-Clinic Data

| Data Element | Frequency | Notes |
|-------------|-----------|-------|
| **eCRF** | Depends on schedule (refer to the study protocol) | |
| - Demographics | | |
| - Baseline LVEF and comorbidities | | |
| - Baseline height, weight, BMI, blood pressure, resting HR, respiration rate, and temperature | | |
| - 6MWT (ground-truth distance) | | |
| - Lab | | |
| - NYHA | | |
| - Disease-related events (e.g. fluid overload, decompensation, re-hospitalization) | | |
| - Medication | | |
| **12-lead ECG** | Week 0, Week 4, Week 8 | |

## Learning Assessment Questions

### Clinical Understanding
- What are some limitations of the traditional HF clinical outcomes assessments?
- Which data collected in B11 are the existing clinical measures and which data can be used to find potential novel digital clinical measures?
- Using the definitions of biomarker types in BEST glossary and referring to B11 study protocol, which biomarker types are possible to explore in B11?

## Appendix: Additional Resources

### a. B11 Engine

**Objectives:** To understand B11 engine input-output and biomarker development plan.

**Materials:**
- Software design specification (unreleased draft v0.0)
- List of biomarker development plan

### b. Advanced Reading Materials

#### Medication Effects
- **Kotecha et al 2017** - Beta blocker and heart rate
- **Wang et al 2019** - ARNI and functional capacity
- **Schmidt et al 2017** - ACEI/ARB and creatinine

#### Guidelines
- **2022 AHA/ACC/HFSA Guideline** for the Management of Heart Failure

#### Decompensation
- Khand 2001
- Mangini 2013
- Njoroge 2021

#### Digital Health Resources
- [DiMe's Library of Digital Endpoints](https://www.dimesociety.org/communication-education/library-of-digital-endpoints/)
- [FDA Biomarker Qualification Program](https://www.fda.gov/drugs/biomarker-qualification-program/qualifying-biomarker-through-biomarker-qualification-program)
- [CDER & CBER Drug Development Tool Qualification Project Search](https://fda.force.com/ddt/s/)

### c. Datasets

**Objectives:** To understand datasets related to B11 projects.

#### B11 Patient Data
- **Location:** `s3://biofourmis-research-data-ap-southeast-1/b11_data/b11_clinical_trial/`
- **Includes:** Everion and Apple Watch accelerometer and vitals, voice recording, QoL (KCCQ and daily symptoms), eCRF

#### Other Useful Datasets

1. **Inhouse Gait Dataset** (used to develop step count algorithm)
   - **Location:** `s3://biofourmis-office-backup-ap-southeast-1/bfry/ACT_experiments/inhouse_gait_experiments_labeled/`

2. **Public Datasets** (activity recognition, posture detection, and energy expenditure)
   - **Location:** `s3://biofourmis-research-data-ap-southeast-1/b11_data/Acc_public_dataset/`

## Key Learning Outcomes

By completing this tutorial, you should be able to:

1. **Understand the clinical context** of heart failure monitoring and traditional outcome measures
2. **Identify biomarker types** and their role in predictive algorithm development
3. **Recognize data sources** from wearables, apps, and clinical settings
4. **Distinguish between** traditional clinical measures and novel digital clinical measures
5. **Access and utilize** relevant datasets for algorithm development
6. **Apply** FDA-NIH BEST framework for biomarker classification
7. **Navigate** regulatory pathways for biomarker qualification
