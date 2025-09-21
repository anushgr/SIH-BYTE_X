# AI-Powered Rainwater Harvesting Recommendations

This service integrates Anthropic's Claude AI to provide comprehensive, personalized rainwater harvesting recommendations based on collected environmental data.

## Features

### Comprehensive Data Analysis
The AI service analyzes:
- **Soil Data**: Type, infiltration rate, suitability scores
- **Rainfall Patterns**: Annual/monthly precipitation, seasonal distribution
- **Groundwater Conditions**: Depth, seasonal variations, recharge potential
- **Technical Feasibility**: Roof area, material quality, collection efficiency
- **Economic Viability**: Cost estimates, payback periods, savings potential

### Personalized Recommendations
The AI generates:
1. **Executive Summary**: Clear assessment of RWH viability
2. **Personalized Benefits**: Specific water savings, cost benefits, environmental impact
3. **System Design**: Tailored storage solutions, filtration requirements
4. **Implementation Roadmap**: Phased approach with timelines and costs
5. **Government Incentives**: Available subsidies and tax benefits
6. **Maintenance Requirements**: Ongoing care and service schedules
7. **Risk Mitigation**: Potential challenges and solutions
8. **Next Steps**: Actionable items for implementation

## Setup

### 1. Install Dependencies
```bash
pip install anthropic
```

### 2. Environment Configuration
Create a `.env` file with your Anthropic API key:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

Get your API key from: https://console.anthropic.com/

### 3. Usage

The AI recommendations are automatically generated when calling the main assessment endpoint:

```python
POST /assessment/
```

### Response Format

The API response now includes an `ai_recommendations` field:

```json
{
  "message": "Assessment completed successfully",
  "assessment_data": { ... },
  "preliminary_results": { ... },
  "runoff_analysis": { ... },
  "feasibility_assessment": { ... },
  "structure_recommendations": { ... },
  "soil_analysis": { ... },
  "rainfall_analysis": { ... },
  "aquifer_analysis": { ... },
  "groundwater_analysis": { ... },
  "ai_recommendations": {
    "success": true,
    "ai_recommendation": {
      "structured_sections": {
        "executive_summary": "...",
        "personalized_benefits": "...",
        "recommended_system_design": "...",
        "implementation_roadmap": "...",
        "cost_benefit_analysis": "..."
      },
      "full_text": "Complete AI-generated recommendation text"
    },
    "model_used": "claude-3-5-sonnet-20240620"
  },
  "location": { ... },
  "status": "success"
}
```

## AI Service Configuration

### Model Selection
- **Model**: claude-3-5-sonnet-20240620
- **Temperature**: 0.3 (for consistent, factual responses)
- **Max Tokens**: 3000
- **Focus**: Technical accuracy and actionable recommendations

### Prompt Engineering
The service uses a comprehensive prompt that includes:
- User demographic and location data
- Complete environmental analysis (soil, rainfall, groundwater)
- Technical feasibility assessments
- Economic considerations
- Regional factors (Indian market conditions, government policies)

## Error Handling

If the AI service is unavailable or encounters an error:

```json
{
  "ai_recommendations": {
    "error": "Error description",
    "message": "AI recommendations not available at this time",
    "success": false
  }
}
```

The main assessment will still complete with all other technical data.

## Benefits of AI Integration

1. **Personalized Guidance**: Tailored recommendations based on specific site conditions
2. **Comprehensive Analysis**: Holistic view of all factors affecting RWH success
3. **Actionable Insights**: Clear next steps and implementation guidance
4. **Cost Transparency**: Detailed breakdown of investments and returns
5. **Risk Assessment**: Identification of potential challenges and mitigation strategies
6. **Local Context**: Consideration of Indian market conditions and regulations

## Development Notes

### Service Architecture
- `anthropic_service.py`: Main AI service handler
- Integrated with existing assessment API endpoints
- Fallback mechanisms for service unavailability
- Comprehensive error logging

### Data Flow
1. Collect all environmental and technical data
2. Structure data for AI prompt
3. Generate comprehensive prompt with all context
4. Call Anthropic API
5. Parse and structure AI response
6. Include in assessment response

### Future Enhancements
- Response caching for similar locations
- Fine-tuning prompts based on user feedback
- Integration with real-time government policy updates
- Multi-language support for regional languages