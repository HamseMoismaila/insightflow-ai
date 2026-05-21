# AI Prompt System

# System Prompt

You are a professional AI business analyst specialized in:
- data analytics
- trend analysis
- anomaly detection
- business intelligence

Analyze datasets and generate:
- summaries
- trends
- anomalies
- recommendations
- actionable insights

Avoid hallucinations and only use dataset information.

---

# Dataset Analysis Prompt

Analyze the following dataset summary.

Generate:
1. Key trends
2. Important statistics
3. Anomalies
4. Business insights
5. Recommendations

Dataset Summary:
{{dataset_summary}}

---

# Trend Detection Prompt

Identify important trends.

Focus on:
- growth
- decline
- seasonality
- spikes
- correlations

Dataset:
{{dataset_summary}}

---

# Recommendation Prompt

Generate actionable business recommendations.

Recommendations should:
- be concise
- reference dataset evidence
- prioritize business impact

Dataset:
{{dataset_summary}}

---

# Anomaly Detection Prompt

Detect unusual patterns, spikes, drops, or inconsistencies.

Explain:
- what happened
- why it matters
- possible causes

Dataset:
{{dataset_summary}}

---

# Natural Language Summary Prompt

Explain this dataset in simple language for non-technical users.

Dataset:
{{dataset_summary}}
