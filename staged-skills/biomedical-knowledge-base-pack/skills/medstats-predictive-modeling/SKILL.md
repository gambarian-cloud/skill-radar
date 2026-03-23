---
name: predictive-modeling
description: |
  Predictive algorithm and index development methodology for medical applications, with step-by-step tutorial and real-world case study.
  
  **Triggers**: "build predictive model", "algorithm development", "predictive index", "develop algorithm", "model development", "COVID index", "predictive algorithm tutorial"
  
  Provides comprehensive methodology for developing predictive algorithms in healthcare, including problem definition, feature engineering, model selection, validation, and deployment considerations. Includes COVID-19 severity index case study.
---

# Predictive Modeling

This skill provides a comprehensive framework for developing, validating, and deploying predictive algorithms and clinical indices in healthcare settings. It bridges the gap between statistical theory and practical clinical application.

## Quick Reference

| Phase | Key Activities | Reference | Considerations |
|-------|----------------|-----------|----------------|
| **Problem Definition** | Define objective, target population, outcome | [Tutorial](references/tutorial-predictive-algorithm-development.md#problem-definition) | Clinical relevance, regulatory path |
| **Data Collection** | Dataset selection, inclusion criteria | [Tutorial](references/tutorial-predictive-algorithm-development.md#data-collection) | Data quality, bias assessment |
| **Feature Engineering** | Select predictors, transform variables | [Tutorial](references/tutorial-predictive-algorithm-development.md#feature-engineering) | Clinical interpretability |
| **Model Selection** | Algorithm comparison, complexity vs performance | [Tutorial](references/tutorial-predictive-algorithm-development.md#model-selection) | Explainability requirements |
| **Validation** | Train/test split, cross-validation, external validation | [Tutorial](references/tutorial-predictive-algorithm-development.md#validation) | Overfitting prevention |
| **Evaluation** | Metrics, calibration, discrimination | [Tutorial](references/tutorial-predictive-algorithm-development.md#evaluation) | Clinical utility assessment |
| **Case Study** | Real-world example: COVID-19 severity index | [Example](references/example-covid-index.md) | Lessons learned |

## When to Use

Use this skill when you need to:

*   **Develop Clinical Decision Support Tools**: Create algorithms to assist clinicians in diagnosis, prognosis, or treatment selection.
*   **Create Risk Stratification Scores**: Build indices to classify patients into risk categories (e.g., low, medium, high risk) for targeted interventions.
*   **Predict Patient Outcomes**: Model the likelihood of specific events such as mortality, hospital readmission, disease progression, or complications.
*   **Automate Diagnostic Screening**: Develop algorithms to flag potential cases of a condition based on electronic health record (EHR) data or other inputs.
*   **Analyze Feature Importance**: Understand which clinical factors are most strongly associated with an outcome.

## How to Use

Follow this step-by-step workflow to develop a robust predictive model:

1.  **Define the Clinical Question**: clearly articulate what you are predicting, for whom, and why. Refer to the [Problem Definition](references/tutorial-predictive-algorithm-development.md#problem-definition) section.
2.  **Prepare Your Data**: Gather retrospective data, clean it, and handle missing values. See [Data Collection](references/tutorial-predictive-algorithm-development.md#data-collection).
3.  **Engineer Features**: Transform raw data into clinically meaningful predictors. Consult [Feature Engineering](references/tutorial-predictive-algorithm-development.md#feature-engineering).
4.  **Select and Train Models**: Choose appropriate algorithms (e.g., Logistic Regression, Random Forest, XGBoost) and train them. Use the [Model Selection](references/tutorial-predictive-algorithm-development.md#model-selection) guide.
5.  **Validate Rigorously**: Perform internal and external validation to ensure generalizability. Follow the [Validation](references/tutorial-predictive-algorithm-development.md#validation) protocols.
6.  **Evaluate Performance**: Assess the model using metrics like AUC-ROC, calibration plots, and decision curve analysis. See [Evaluation](references/tutorial-predictive-algorithm-development.md#evaluation).
7.  **Review Real-World Application**: Study the [COVID-19 Severity Index Case Study](references/example-covid-index.md) to understand how these steps come together in practice.

## Algorithm Development Phases

This section outlines the core phases of development, linking to the detailed tutorial for in-depth guidance.

### 1. Problem Definition & Study Design
Before writing code, you must define the clinical use case.
*   **Target Population**: Who is the model for? (e.g., "Adult patients admitted with COVID-19")
*   **Outcome Variable**: What are you predicting? (e.g., "In-hospital mortality", "ICU admission within 24 hours")
*   **Time Horizon**: When is the prediction made, and for what future window?
*   **[Read more in the Tutorial](references/tutorial-predictive-algorithm-development.md#problem-definition)**

### 2. Data Collection & Preprocessing
High-quality data is the foundation of any model.
*   **Data Sources**: EHR, registries, claims data.
*   **Inclusion/Exclusion Criteria**: Applying clinical logic to filter the cohort.
*   **Missing Data Handling**: Imputation strategies vs. complete case analysis.
*   **[Read more in the Tutorial](references/tutorial-predictive-algorithm-development.md#data-collection)**

### 3. Feature Engineering & Selection
Transforming raw variables into predictive features.
*   **Domain Knowledge**: Incorporating clinical expertise (e.g., calculating BMI from height and weight).
*   **Dimensionality Reduction**: Selecting the most relevant features to prevent overfitting.
*   **Univariate Analysis**: Screening variables for association with the outcome.
*   **[Read more in the Tutorial](references/tutorial-predictive-algorithm-development.md#feature-engineering)**

### 4. Model Development
Training the algorithm.
*   **Algorithm Choice**: Logistic Regression (interpretable) vs. Gradient Boosting/Neural Networks (high performance).
*   **Hyperparameter Tuning**: Optimizing model configuration.
*   **Ensemble Methods**: Combining models for better stability.
*   **[Read more in the Tutorial](references/tutorial-predictive-algorithm-development.md#model-selection)**

### 5. Validation & Evaluation
Proving the model works.
*   **Internal Validation**: Cross-validation, bootstrapping.
*   **External Validation**: Testing on a separate dataset (different hospital, different time period).
*   **Performance Metrics**: Sensitivity, Specificity, PPV, NPV, AUC-ROC, Calibration Slope/Intercept.
*   **[Read more in the Tutorial](references/tutorial-predictive-algorithm-development.md#validation)**

## Case Study: COVID-19 Severity Index

To see these principles applied in a real-world scenario, refer to the **[COVID-19 Severity Index Case Study](references/example-covid-index.md)**.

This case study demonstrates:
*   **Rapid Development**: How a team moved from problem definition to a deployed model during a pandemic.
*   **Variable Selection**: Choosing practical, widely available lab values (e.g., LDH, CRP, Lymphocyte count).
*   **Score Creation**: Converting a logistic regression model into a simple integer-based point score for bedside use.
*   **Validation**: How the model performed on an external validation cohort.

## References

*   **[Tutorial: Predictive Algorithm Development](references/tutorial-predictive-algorithm-development.md)**: The core instructional guide for this skill.
*   **[Example: COVID-19 Severity Index](references/example-covid-index.md)**: A detailed walkthrough of a specific predictive model project.
