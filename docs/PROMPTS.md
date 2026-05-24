# AI Prompt System

## Current Role of Prompting

The current backend uses prompting only after it has already built a structured dataset summary from pandas.

The prompt input is not the raw file. It is a sanitized summary that may include:

- row count
- column count
- column names
- missing-value counts
- duplicate row count
- numeric statistics
- numeric highlights
- categorical highlights
- trend highlights

## System Prompt

```text
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
```

## Dataset Analysis Prompt

```text
Analyze the following dataset summary.

Generate:
1. Key trends
2. Important statistics
3. Anomalies
4. Business insights
5. Recommendations

Dataset Summary:
{{dataset_summary}}
```

## Safety Notes

Before prompt construction, the backend sanitizes dataset summary text to reduce prompt injection risk by:

- removing control characters
- replacing structural tags
- replacing brace and angle-bracket syntax
- filtering common prompt-injection phrases
- truncating the final summary length

## Fallback Behavior

If OpenAI is not configured or the request fails, the application still returns a report by using local analysis output from the backend services.

That fallback path is expected behavior in the MVP.
