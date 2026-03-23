---
name: validation
description: |
  Validation protocols and methodologies for medical algorithms and devices, with comprehensive examples from multiple domains.
  
  **Triggers**: "validate algorithm", "algorithm validation", "device validation", "validation protocol", "clinical validation", "performance metrics", "validation study", "medical device validation"
  
  Provides structured validation frameworks for medical algorithms (biovitals, ECG analysis, predictive models) and medical devices (wearables, monitors), including protocol templates, performance metrics, statistical analysis plans, and acceptance criteria.
---

# Validation

Comprehensive guide to validating medical algorithms and devices. This skill provides structured protocols, statistical methodologies, and reporting standards for ensuring clinical reliability and regulatory compliance.

## Quick Reference

### Algorithm Validation Protocols

| Algorithm Type | Validation Protocol | Key Metrics | Application |
|----------------|---------------------|-------------|-------------|
| **Biovitals Index** | [Protocol](references/validation-protocol-biovitals-index.md) | AUROC, sensitivity, specificity | Multi-parameter vital sign risk score |
| **ECG-Potassium** | [Protocol](references/validation-protocol-ecg-potassium.md) | MAE, correlation with lab values | Potassium estimation from ECG |
| **ECG-QT** | [Protocol](references/validation-protocol-ecg-qt.md) | Bland-Altman agreement | QT interval measurement accuracy |
| **ECG-Rhythm Analytics** | [Protocol](references/validation-protocol-ecg-rhythm-analytics.md) | Sensitivity, PPV | Arrhythmia detection |
| **Length-of-Stay Prediction** | [Protocol](references/validation-protocol-length-of-stay-prediction.md) | RMSE, calibration | Hospital LOS prediction |
| **Readmission Algorithm** | [Protocol](references/validation-protocol-readmission-algorithm.md) | C-statistic, NRI | 30-day readmission risk |

### Device Validation

| Device Type | Validation Protocol | Key Metrics | Application |
|-------------|---------------------|-------------|-------------|
| **Wearable Monitor** | [Protocol](references/validation-protocol-everion-respiratory-rate.md) | Bland-Altman, ICC, bias | Everion respiratory rate monitoring |

## When to Use

Use these validation protocols when:

1.  **Developing New Medical Algorithms**: You have a new predictive model or diagnostic algorithm that needs clinical verification.
2.  **Testing Medical Devices**: You need to validate the accuracy of a hardware device against a gold standard.
3.  **Regulatory Submissions**: You are preparing data for FDA (510k, De Novo) or CE Mark submissions.
4.  **Clinical Deployment**: You need to ensure a tool is safe and effective before using it in patient care.
5.  **Performance Monitoring**: You are establishing benchmarks for ongoing post-market surveillance.

## How to Use

### 1. Select the Appropriate Protocol
Identify whether you are validating an **algorithm** or a **device**, and choose the specific domain (e.g., ECG, predictive model, vital signs).

### 2. Define the Study Design
*   **Retrospective vs. Prospective**: Decide if you can use historical data or need new patient enrollment.
*   **Sample Size**: Calculate required sample size based on expected effect size and power (usually 80% or 90%).
*   **Gold Standard**: Clearly define the ground truth (e.g., Holter monitor for ECG, blood draw for potassium).

### 3. Execute Validation
Follow the specific steps in the referenced protocol:
*   Data collection and cleaning.
*   Blinding procedures (if applicable).
*   Running the algorithm/device alongside the reference.

### 4. Statistical Analysis
Perform the analysis defined in the protocol:
*   **Continuous Variables**: Bland-Altman plots, Pearson/Spearman correlation, RMSE, MAE.
*   **Categorical/Diagnostic**: Sensitivity, Specificity, PPV, NPV, AUROC, Confusion Matrices.
*   **Reliability**: Intraclass Correlation Coefficient (ICC), Kappa statistics.

### 5. Reporting
Generate a validation report summarizing:
*   Study population demographics.
*   Inclusion/exclusion criteria.
*   Statistical results with confidence intervals.
*   Discussion of limitations and conclusion on clinical utility.

## Algorithm Validation Protocols

Detailed methodologies for validating software as a medical device (SaMD) and clinical decision support algorithms.

### [Biovitals Index Validation](references/validation-protocol-biovitals-index.md)
*   **Focus**: Composite risk score validation.
*   **Key Methods**: Logistic regression, ROC analysis, calibration plots.
*   **Use Case**: Early warning systems for patient deterioration.

### [ECG-Potassium Estimation](references/validation-protocol-ecg-potassium.md)
*   **Focus**: Inferring blood biomarkers from physiological signals.
*   **Key Methods**: Mean Absolute Error (MAE), error distribution analysis.
*   **Use Case**: Non-invasive electrolyte monitoring.

### [ECG-QT Interval Accuracy](references/validation-protocol-ecg-qt.md)
*   **Focus**: Precision measurement of waveform intervals.
*   **Key Methods**: Bland-Altman analysis, outlier detection.
*   **Use Case**: Drug safety monitoring (QT prolongation).

### [ECG-Rhythm Analytics](references/validation-protocol-ecg-rhythm-analytics.md)
*   **Focus**: Classification accuracy for arrhythmia detection.
*   **Key Methods**: Class-wise sensitivity/specificity, F1-score.
*   **Use Case**: Automated AFib detection.

### [Length-of-Stay Prediction](references/validation-protocol-length-of-stay-prediction.md)
*   **Focus**: Operational forecasting models.
*   **Key Methods**: Regression metrics (RMSE, R-squared), residual analysis.
*   **Use Case**: Hospital resource planning.

### [Readmission Risk Algorithm](references/validation-protocol-readmission-algorithm.md)
*   **Focus**: Binary classification for clinical outcomes.
*   **Key Methods**: C-statistic, Net Reclassification Improvement (NRI).
*   **Use Case**: Discharge planning and intervention targeting.

## Device Validation Protocol

Methodologies for validating hardware sensors and monitors against clinical reference standards.

### [Wearable Respiratory Rate Validation](references/validation-protocol-everion-respiratory-rate.md)
*   **Focus**: Accuracy of vital sign measurement from wearable sensors.
*   **Key Methods**:
    *   **Bland-Altman Analysis**: To assess bias and limits of agreement.
    *   **Correlation**: To check linear relationship with reference.
    *   **Accuracy Plots**: Visualizing error across the measurement range.
*   **Reference Standard**: Capnography or manual count.

## References

*   **FDA Guidance**: "Software as a Medical Device (SaMD): Clinical Evaluation"
*   **ISO 14155**: Clinical investigation of medical devices for human subjects.
*   **STARD 2015**: Standards for Reporting Diagnostic Accuracy Studies.
*   **TRIPOD**: Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis.
