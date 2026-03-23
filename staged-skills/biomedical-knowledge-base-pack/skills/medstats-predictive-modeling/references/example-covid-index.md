---
source: Tutorial.Predictive-Algorithm-Development.Example-COVID-Index.2020.pdf
extracted: 2026-02-03
content_type: Example
year: 2020
topic: Predictive Algorithm Development
---

# Case Study: Development and Validation of COVID-GRAM
## A Clinical Risk Score to Predict Critical Illness in COVID-19

**Source:** JAMA Internal Medicine | Original Investigation  
**Authors:** Wenhua Liang, MD; Hengrui Liang, MD; et al.  
**Publication Date:** May 12, 2020  

---

## 1. Abstract & Overview

### Objective
To develop and validate a clinical score at hospital admission for predicting which patients with COVID-19 will develop critical illness based on a nationwide cohort in China.

### Design, Setting, and Participants
- **Retrospective cohort:** 1,590 patients from 575 hospitals in 31 provincial administrative regions (Development Cohort)
- **Validation cohort:** 710 patients from 4 additional cohorts
- **Timeline:** Data analyzed between February 20, 2020, and March 17, 2020

### Main Outcomes
Critical illness defined as a composite measure of:
1. Admission to the intensive care unit (ICU)
2. Invasive ventilation
3. Death

### Key Results
- **10 independent predictive factors** were identified
- **AUC (Development Cohort):** 0.88 (95% CI, 0.85-0.91)
- **AUC (Validation Cohort):** 0.88 (95% CI, 0.84-0.93)
- **Implementation:** Online risk calculator created (COVID-GRAM)

---

## 2. Methodology: Step-by-Step Tutorial

The following procedures describe the statistical and operational steps taken to build the predictive index.

### Step 1: Data Sources and Processing

**Data Collection:**
- Medical records from laboratory-confirmed hospitalized COVID-19 cases
- Obtained via the National Health Commission of China

**Verification Process:**
- Records reviewed, abstracted, and cross-checked by a team of experienced respiratory clinicians
- Each record independently checked by 2 clinicians

**Inclusion Criteria:**
- All patients with complete data on clinical status at hospitalization
- Required data: lab findings, symptoms, signs, severity, discharge status

### Step 2: Outcome Definition

**Critical COVID-19 Illness:** A composite endpoint defined as ANY of the following:
1. Admission to the intensive care unit (ICU)
2. Invasive ventilation required
3. Death

### Step 3: Variable Selection (Feature Engineering)

**Initial Variable Pool:**
- **72 potential variables** measured at hospital admission
- Categories: demographics, symptoms, imaging, laboratory tests, medical history

**Missing Data Imputation:**
- **Numeric features:** Predictive mean matching
- **Binary variables:** Logistic regression
- **Factor features:** Bayesian polytomous regression
- **Exclusion criterion:** Variables with >20% missing values were excluded

**Selection Method: LASSO Regression**
- **Method:** Least Absolute Shrinkage and Selection Operator (LASSO) regression
- **Purpose:** Minimize potential collinearity and prevent over-fitting
- **Tuning:** 10-fold cross-validation to select the minimum λ (penalty factor)
- **Software:** R package "glmnet"

### Step 4: Score Construction (Modeling)

**Model Type:** Multivariable Logistic Regression

**Process:**
1. Variables identified by LASSO entered into logistic regression model
2. Only consistently statistically significant variables retained
3. Final model used to construct the risk score (COVID-GRAM)

### Step 5: Assessment of Accuracy & Validation

**Performance Metric:**
- Area Under the Receiver Operating Characteristic Curve (AUC)

**Internal Validation:**
- 200 bootstrap resamples used to validate accuracy estimates
- Reduces overfit bias

**External Validation:**
- Tested on separate cohort of 710 patients from 4 sources:
  - Hubei province
  - Daye Hospital
  - Foshan Hospital
  - Nanhai Hospital

**Benchmark Comparison:**
- Accuracy compared with CURB-6 model

---

## 3. Statistical Methods and Algorithms

### The Predictive Algorithm (Logistic Regression)

The risk score is based on the coefficients from the logistic regression model.

#### Formula for Probability

$$\text{Probability} = \frac{e^{\text{LinearPredictor}}}{1 + e^{\text{LinearPredictor}}}$$

#### Linear Predictor Formula

$$\text{LinearPredictor} = \text{Constant} + \sum_{n} (\beta_n \times X_n)$$

Where:
- $\beta_n$ is the coefficient (natural log of the Odds Ratio) for variable $X_n$
- $X_n$ is the value of the variable

#### Confidence Intervals Formula

**Lower 95% CI:**
$$\frac{\exp(\sum X_n \beta_n - \sum z \times SE(\beta))}{1 + \exp(\sum X_n \beta_n - \sum z \times SE(\beta))}$$

**Upper 95% CI:**
$$\frac{\exp(\sum X_n \beta_n + \sum z \times SE(\beta))}{1 + \exp(\sum X_n \beta_n + \sum z \times SE(\beta))}$$

### Selected Predictors and Coefficients (The COVID-GRAM Index)

**Table: Final Predictive Model Variables**

| Variable | Odds Ratio (95% CI) | P Value |
|:---------|:-------------------|:--------|
| **X-ray abnormality** (yes vs no) | 3.39 (2.14-5.38) | <.001 |
| **Age**, per year | 1.03 (1.01-1.05) | .002 |
| **Hemoptysis** (yes vs no) | 4.53 (1.36-15.15) | .01 |
| **Dyspnea** (yes vs no) | 1.88 (1.18-3.01) | .01 |
| **Unconsciousness** (yes vs no) | 4.71 (1.39-15.98) | .01 |
| **No. of comorbidities** | 1.60 (1.27-2.00) | <.001 |
| **Cancer history** (yes vs no) | 4.07 (1.23-13.43) | .02 |
| **Neutrophil to lymphocyte ratio** | 1.06 (1.02-1.10) | .003 |
| **Lactate dehydrogenase**, U/L | 1.002 (1.001-1.004) | <.001 |
| **Direct bilirubin**, μmol/L | 1.15 (1.06-1.24) | .001 |
| **Constant** | 0.001 | |

---

## 4. Results and Data Tables

### Development Cohort Overview
- **Total patients:** 1,590
- **Critical illness rate:** 8.2% (131 patients)
- **Mortality:** 3.2%

### Table 1: Demographics and Clinical Characteristics (Development Cohort)

| Characteristic | Total (N=1590) | Critical Illness: No (N=1459) | Critical Illness: Yes (N=131) |
|:---------------|:---------------|:------------------------------|:------------------------------|
| **Age**, mean (SD), y | 48.9 (15.7) | 47.8 (15.2) | 61.6 (14.8) |
| **Male**, No. (%) | 904 (57.3) | 816 (56.4) | 88 (67.2) |
| **Symptoms** | | | |
| Fever | 1351 (88.0) | 1237 (87.8) | 114 (89.8) |
| Dry cough | 1052 (70.2) | 959 (69.9) | 93 (73.8) |
| Fatigue | 584 (42.8) | 539 (43.1) | 45 (39.1) |
| Dyspnea (Shortness of breath) | 331 (23.7) | 257 (20.2) | 74 (62.2) |
| Hemoptysis | 16 (1.2) | 10 (0.8) | 6 (5.3) |
| Unconsciousness | 20 (1.4) | 10 (0.8) | 10 (8.5) |
| **Comorbidities** | | | |
| Any | 399 (25.1) | 322 (22.1) | 77 (58.8) |
| COPD | 24 (1.5) | 12 (0.8) | 12 (9.2) |
| Diabetes | 130 (8.2) | 99 (6.8) | 31 (23.7) |
| Hypertension | 269 (16.9) | 216 (14.8) | 53 (40.5) |
| Cancer (Malignancy) | 18 (1.1) | 11 (0.8) | 7 (5.3) |
| **Imaging** | | | |
| Abnormal chest radiograph | 243 (15.3) | 184 (12.6) | 59 (45.0) |
| Abnormal chest CT | 1130 (71.1) | 1035 (70.9) | 95 (72.5) |

### Table 2: Laboratory Findings (Development Cohort)

| Variable | Total Mean (SD) | Critical Illness: No | Critical Illness: Yes |
|:---------|:----------------|:---------------------|:----------------------|
| **Neutrophil count**, ×10⁹/L | 4.14 (2.2) | 3.9 (1.9) | 6.4 (3.6) |
| **Lymphocyte count**, ×10⁹/L | 1.4 (3.1) | 1.5 (3.3) | 0.7 (0.4) |
| **Neutrophil-lymphocyte ratio** | 5.1 (5.6) | 4.4 (3.8) | 12.7 (12.4) |
| **Lactate dehydrogenase**, U/L | 314.3 (693.7) | 273.6 (135.2) | 723.6 (2239.5) |
| **Direct bilirubin**, mmol/L | 4 (2.7) | 3.7 (2.3) | 6.5 (4.1) |
| **C-reactive protein**, mg/L | 34.8 (49.2) | 30.6 (43.8) | 84.5 (76.3) |
| **Procalcitonin**, ng/mL | 0.7 (9.8) | 0.8 (10.3) | 0.6 (1.4) |

### Table 3: Validation Cohort Statistics

| Characteristic | Validation Total (N=729) | Critical Illness: No (N=642) | Critical Illness: Yes (N=87) |
|:---------------|:-------------------------|:-----------------------------|:-----------------------------|
| **Age**, mean (SD) | 48.2 (15.2) | 46.2 (14.3) | 63.1 (13.1) |
| **Neutrophil-lymphocyte ratio** | 5.8 (8.7) | 4.3 (3.8) | 17.1 (20.0) |
| **Lactate dehydrogenase** | 288.3 (151.2) | 264.1 (119.6) | 479.5 (223.8) |
| **Abnormal chest radiograph** | 355 (49.1%) | 277 (43.3%) | 78 (92.9%) |
| **Unconsciousness** | 6 (0.8%) | 0 (0%) | 6 (0.7%) |

---

## 5. Web-Based Calculator Implementation

A web-based tool was developed to allow clinicians to enter the 10 variables and automatically calculate risk.

### Input Variables

1. **X-ray abnormality** (No/Yes)
2. **Age** (Years)
3. **Hemoptysis** (No/Yes)
4. **Dyspnea** (No/Yes)
5. **Unconsciousness** (No/Yes)
6. **Number of comorbidities** (Count)
7. **Cancer history** (No/Yes)
8. **Neutrophil/Lymphocytes ratio (NLR)** (Value)
9. **Lactate dehydrogenase** (Value)
10. **Direct Bilirubin** (Value)

### Output Metrics

- **Total point score**
- **Probability (%)** of critical illness
- **Risk group** classification

### Risk Stratification

| Risk Level | Probability Range | Clinical Interpretation |
|:-----------|:------------------|:------------------------|
| **Low-risk** | < 0.7% | Consider standard monitoring |
| **Medium-risk** | 0.7% - 59.3% | Enhanced monitoring recommended |
| **High-risk** | > 59.3% | Consider ICU admission or aggressive treatment |

---

## 6. Discussion & Clinical Implications

### Key Findings

1. **Prediction Accuracy:** COVID-GRAM successfully predicts critical illness at admission (AUC 0.88)
2. **Risk Factors:** Older age and comorbidities are significant predictors
3. **Model Performance:** Superior to existing CURB-6 model (AUC 0.88 vs 0.75)

### Clinical Utility

#### Low Risk Patients
- **Strategy:** Standard monitoring protocols
- **Resource allocation:** Outpatient or general ward care

#### Medium Risk Patients
- **Strategy:** Enhanced monitoring
- **Resource allocation:** Close observation with frequent assessments

#### High Risk Patients
- **Strategy:** Aggressive treatment or early ICU admission
- **Resource allocation:** Intensive care resources, ventilator availability

### Resource Optimization

The COVID-GRAM score helps optimize:
- ICU bed allocation
- Ventilator distribution
- Healthcare personnel deployment
- Especially critical in resource-limited settings

### Study Limitations

1. **Sample Size:** Modest sample size for construction and validation
2. **Geographic Limitation:** Data entirely from China, potentially limiting generalizability to other regions
3. **Study Design:** Retrospective design may introduce selection bias
4. **Temporal Factors:** Developed during early pandemic phase; virus variants may affect applicability

---

## 7. Key Lessons for Predictive Algorithm Development

### 1. Data Quality and Verification
- Multiple independent reviewers for data validation
- Cross-checking procedures to ensure accuracy
- Systematic approach to missing data

### 2. Variable Selection Strategy
- Start with comprehensive variable pool
- Use advanced methods (LASSO) to prevent overfitting
- Consider clinical interpretability alongside statistical significance

### 3. Model Validation
- Internal validation (bootstrap resampling)
- External validation on independent cohorts
- Comparison with existing models/benchmarks

### 4. Clinical Implementation
- Create user-friendly tools (web calculator)
- Provide clear risk stratification
- Link predictions to actionable clinical decisions

### 5. Statistical Rigor
- Define outcomes clearly before analysis
- Use appropriate imputation methods
- Report confidence intervals and validation metrics

---

## 8. References and Citations

### Primary Citations

1. **WHO/Sepsis/Outcomes:** References regarding clinical spectrum, sepsis, and mortality in critical patients
2. **Wu et al:** Risk factors for ARDS and death included older age, neutrophilia, organ dysfunction, coagulopathy, and elevated D-dimer
3. **Data Sources:** China National Health Commission cohort data
4. **ATS Guidelines:** American Thoracic Society guidelines for community-acquired pneumonia severity
5. **COVID-GRAM:** The specific risk score developed in this study
6. **CURB-6 Model:** Comparison model for pneumonia severity
7. **Zhou and colleagues:** Found lower lymphocyte count and higher LDH in patients who died

### Supporting Literature

- Faggiano et al 2004 - 6-minute walk test methodology
- Spertus et al 2020 - KCCQ outcomes assessment
- Salah et al 2019 - NT-ProBNP biomarker
- Raphael et al 2007 - NYHA classification

---

## 9. Practical Application Checklist

### For Algorithm Development

- [ ] Define clear, clinically meaningful outcome
- [ ] Assemble comprehensive variable set
- [ ] Implement data quality checks
- [ ] Handle missing data appropriately
- [ ] Use regularization (LASSO) for variable selection
- [ ] Build logistic regression model
- [ ] Perform internal validation (bootstrap)
- [ ] Conduct external validation on independent cohort
- [ ] Compare with existing models
- [ ] Calculate discrimination metrics (AUC)
- [ ] Define clinically useful risk thresholds
- [ ] Create implementation tool
- [ ] Document limitations

### For Clinical Implementation

- [ ] Create user-friendly interface
- [ ] Provide clear interpretation guidance
- [ ] Link to clinical decision pathways
- [ ] Consider local resource constraints
- [ ] Plan for model updating/refinement
- [ ] Monitor performance in practice
- [ ] Collect feedback from end-users

---

## 10. Summary

The COVID-GRAM case study demonstrates a systematic approach to developing and validating a clinical predictive index. Key success factors include:

1. **Rigorous methodology** from data collection through validation
2. **Advanced statistical techniques** to prevent overfitting
3. **Clear clinical outcomes** tied to actionable decisions
4. **Practical implementation** through accessible tools
5. **Transparent reporting** of performance and limitations

This example serves as a template for developing predictive algorithms in other clinical contexts, emphasizing the importance of both statistical rigor and clinical utility.
