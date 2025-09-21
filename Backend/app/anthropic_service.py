import os
import json
import logging
from typing import Dict, Any, Optional
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AnthropicRWHService:
    """
    Service for generating personalized rainwater harvesting recommendations using Anthropic's Claude API
    """
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = Anthropic(api_key=self.api_key)
    
    def generate_comprehensive_recommendation(
        self,
        assessment_data: Dict[str, Any],
        soil_analysis: Optional[Dict] = None,
        rainfall_analysis: Optional[Dict] = None,
        groundwater_analysis: Optional[Dict] = None,
        feasibility_assessment: Optional[Dict] = None,
        structure_recommendations: Optional[Dict] = None,
        runoff_analysis: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive, personalized rainwater harvesting recommendations
        
        Args:
            assessment_data: Basic user input data
            soil_analysis: Soil composition and suitability data
            rainfall_analysis: Local rainfall patterns and data
            groundwater_analysis: Groundwater depth and quality data
            feasibility_assessment: Technical and economic feasibility scores
            structure_recommendations: Recommended RWH structures and costs
            runoff_analysis: Roof runoff calculations
            
        Returns:
            Dictionary containing AI-generated recommendations
        """
        
        if not self.client:
            return {
                "error": "Anthropic API not configured. Please set ANTHROPIC_API_KEY environment variable.",
                "success": False
            }
        
        try:
            # Add type checking and debugging
            logger.info(f"AI service input types: assessment_data={type(assessment_data)}")
            logger.info(f"soil_analysis type: {type(soil_analysis)}")
            logger.info(f"rainfall_analysis type: {type(rainfall_analysis)}")
            logger.info(f"groundwater_analysis type: {type(groundwater_analysis)}")
            logger.info(f"feasibility_assessment type: {type(feasibility_assessment)}")
            logger.info(f"structure_recommendations type: {type(structure_recommendations)}")
            logger.info(f"runoff_analysis type: {type(runoff_analysis)}")
            
            # Ensure all parameters are dictionaries or None
            def validate_dict_param(param, param_name):
                if param is not None and not isinstance(param, dict):
                    logger.warning(f"{param_name} is not dict: {type(param)}, converting to None")
                    return None
                return param
            
            soil_analysis = validate_dict_param(soil_analysis, "soil_analysis")
            rainfall_analysis = validate_dict_param(rainfall_analysis, "rainfall_analysis")
            groundwater_analysis = validate_dict_param(groundwater_analysis, "groundwater_analysis")
            feasibility_assessment = validate_dict_param(feasibility_assessment, "feasibility_assessment")
            structure_recommendations = validate_dict_param(structure_recommendations, "structure_recommendations")
            runoff_analysis = validate_dict_param(runoff_analysis, "runoff_analysis")
            
            # Prepare the comprehensive prompt
            try:
                prompt = self._create_comprehensive_prompt(
                    assessment_data=assessment_data,
                    soil_analysis=soil_analysis,
                    rainfall_analysis=rainfall_analysis,
                    groundwater_analysis=groundwater_analysis,
                    feasibility_assessment=feasibility_assessment,
                    structure_recommendations=structure_recommendations,
                    runoff_analysis=runoff_analysis
                )
                logger.info("Prompt created successfully")
            except Exception as prompt_error:
                logger.error(f"Error creating prompt: {str(prompt_error)}")
                raise prompt_error
            
            # Call Anthropic API
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=3000,
                temperature=0.3,  # Lower temperature for more consistent, factual responses
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse the response
            recommendation_text = response.content[0].text
            
            # Try to structure the response (the AI should return structured data)
            structured_recommendation = self._parse_ai_response(recommendation_text)
            
            return {
                "success": True,
                "ai_recommendation": structured_recommendation,
                "raw_response": recommendation_text,
                "model_used": "claude-3-5-sonnet-20240620"
            }
            
        except Exception as e:
            logger.error(f"Error generating AI recommendation: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Assessment data type: {type(assessment_data)}")
            logger.error(f"Soil analysis type: {type(soil_analysis)}")
            logger.error(f"Rainfall analysis type: {type(rainfall_analysis)}")
            logger.error(f"Groundwater analysis type: {type(groundwater_analysis)}")
            logger.error(f"Feasibility assessment type: {type(feasibility_assessment)}")
            logger.error(f"Structure recommendations type: {type(structure_recommendations)}")
            logger.error(f"Runoff analysis type: {type(runoff_analysis)}")
            
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            return {
                "error": f"Failed to generate recommendation: {str(e)}",
                "success": False,
                "error_details": {
                    "error_type": type(e).__name__,
                    "assessment_data_type": str(type(assessment_data)),
                    "soil_analysis_type": str(type(soil_analysis)),
                    "rainfall_analysis_type": str(type(rainfall_analysis)),
                    "groundwater_analysis_type": str(type(groundwater_analysis)),
                    "feasibility_assessment_type": str(type(feasibility_assessment)),
                    "structure_recommendations_type": str(type(structure_recommendations)),
                    "runoff_analysis_type": str(type(runoff_analysis))
                }
            }
    
    def _create_comprehensive_prompt(
        self,
        assessment_data: Dict[str, Any],
        soil_analysis: Optional[Dict] = None,
        rainfall_analysis: Optional[Dict] = None,
        groundwater_analysis: Optional[Dict] = None,
        feasibility_assessment: Optional[Dict] = None,
        structure_recommendations: Optional[Dict] = None,
        runoff_analysis: Optional[Dict] = None
    ) -> str:
        """
        Create a comprehensive prompt for the AI with all available data
        """
        
        prompt = f"""You are an expert rainwater harvesting consultant with deep knowledge of Indian climate conditions, soil types, groundwater systems, and cost-effective RWH solutions. 

Please analyze the following comprehensive data and provide personalized, actionable recommendations for implementing rainwater harvesting at this location.

## USER INFORMATION:
Name: {assessment_data.get('name', 'User')}
Location: {assessment_data.get('address', 'Not specified')}, {assessment_data.get('city', '')}, {assessment_data.get('state', '')}
Household Size: {assessment_data.get('dwellers', 'Not specified')} people
Roof Area: {assessment_data.get('roof_area', 'Not specified')} sq ft
Roof Type: {assessment_data.get('roof_type', 'Not specified')}
Current Water Source: {assessment_data.get('currentWaterSource', 'Not specified')}
Monthly Water Bill: ₹{assessment_data.get('monthlyWaterBill', 'Not specified')}

## TECHNICAL DATA ANALYSIS:
"""

        # Add soil analysis if available
        if soil_analysis and isinstance(soil_analysis, dict) and not soil_analysis.get('error'):
            prompt += f"""
### SOIL ANALYSIS:
- Soil Type: {soil_analysis.get('soil_type', 'Unknown')}
- Texture Class: {soil_analysis.get('texture_class', 'Unknown')}
- Infiltration Rate: {soil_analysis.get('infiltration_rate', 'Unknown')}
- Suitability Score: {soil_analysis.get('suitability_score', 'Unknown')}/10
- RWH Suitability: {soil_analysis.get('rwh_suitability', 'Unknown')}
- Recommendations: {soil_analysis.get('recommendations', 'None available')}
"""

        # Add rainfall analysis if available
        if rainfall_analysis and isinstance(rainfall_analysis, dict) and not rainfall_analysis.get('error'):
            # Safely extract wettest month data
            wettest_month = rainfall_analysis.get('wettest_month', {})
            wettest_month_name = 'Unknown'
            wettest_month_rainfall = 'Unknown'
            if isinstance(wettest_month, dict):
                wettest_month_name = wettest_month.get('name', 'Unknown')
                wettest_month_rainfall = wettest_month.get('rainfall_mm', 'Unknown')
            
            # Safely extract driest month data
            driest_month = rainfall_analysis.get('driest_month', {})
            driest_month_name = 'Unknown'
            driest_month_rainfall = 'Unknown'
            if isinstance(driest_month, dict):
                driest_month_name = driest_month.get('name', 'Unknown')
                driest_month_rainfall = driest_month.get('rainfall_mm', 'Unknown')
            
            prompt += f"""
### RAINFALL ANALYSIS:
- Annual Rainfall: {rainfall_analysis.get('annual_rainfall_mm', 'Unknown')} mm
- Average Monthly: {rainfall_analysis.get('average_monthly_mm', 'Unknown')} mm
- Wettest Month: {wettest_month_name} ({wettest_month_rainfall} mm)
- Driest Month: {driest_month_name} ({driest_month_rainfall} mm)
- Year: {rainfall_analysis.get('year', 'Unknown')}
"""

        # Add groundwater analysis if available
        if groundwater_analysis and isinstance(groundwater_analysis, dict) and not groundwater_analysis.get('error'):
            # Safely extract nearest station data
            nearest_station = groundwater_analysis.get('nearest_station', {})
            station_name = 'Unknown'
            distance_km = 'Unknown'
            if isinstance(nearest_station, dict):
                station_name = nearest_station.get('station_name', 'Unknown')
                distance_km = nearest_station.get('distance_km', 'Unknown')
            
            # Safely extract groundwater analysis data
            gw_analysis = groundwater_analysis.get('groundwater_analysis', {})
            avg_depth = 'Data not available'
            if isinstance(gw_analysis, dict):
                annual_summary = gw_analysis.get('annual_summary', {})
                if isinstance(annual_summary, dict):
                    avg_depth = annual_summary.get('avg_depth_m', 'Data not available')
            
            prompt += f"""
### GROUNDWATER ANALYSIS:
- Nearest Station: {station_name}
- Distance to Station: {distance_km} km
- Analysis Available: {avg_depth}
"""

        # Add runoff analysis if available
        if runoff_analysis and isinstance(runoff_analysis, dict):
            # Safely extract runoff calculations
            runoff_calculations = runoff_analysis.get('runoff_calculations', {})
            annual_collectible = 'Unknown'
            monthly_avg = 'Unknown'
            collection_efficiency = 'Unknown'
            if isinstance(runoff_calculations, dict):
                annual_collectible = runoff_calculations.get('net_annual_collectible_liters', 'Unknown')
                monthly_avg = runoff_calculations.get('average_monthly_collectible_liters', 'Unknown')
                collection_efficiency = runoff_calculations.get('collection_efficiency_percent', 'Unknown')
            
            # Safely extract roof specifications
            roof_specs = runoff_analysis.get('roof_specifications', {})
            roof_quality = 'Unknown'
            if isinstance(roof_specs, dict):
                roof_quality = roof_specs.get('water_quality', 'Unknown')
            
            # Safely extract first flush management
            first_flush = runoff_analysis.get('first_flush_management', {})
            first_flush_required = 'Unknown'
            if isinstance(first_flush, dict):
                first_flush_required = first_flush.get('total_first_flush_capacity_required_liters', 'Unknown')
            
            prompt += f"""
### RUNOFF CALCULATIONS:
- Annual Collectible Water: {annual_collectible} liters
- Monthly Average: {monthly_avg} liters
- Collection Efficiency: {collection_efficiency}%
- Roof Quality: {roof_quality}
- First Flush Required: {first_flush_required} liters
"""

        # Add feasibility assessment if available
        if feasibility_assessment and isinstance(feasibility_assessment, dict):
            # Safely extract overall feasibility data
            overall = feasibility_assessment.get('overall_feasibility', {})
            total_score = 'Unknown'
            rating = 'Unknown'
            recommendation = 'Unknown'
            priority = 'Unknown'
            if isinstance(overall, dict):
                total_score = overall.get('total_score', 'Unknown')
                rating = overall.get('rating', 'Unknown')
                recommendation = overall.get('recommendation', 'Unknown')
                priority = overall.get('priority', 'Unknown')
            
            # Safely extract limiting factors
            limiting_factors = feasibility_assessment.get('limiting_factors', [])
            limiting_factors_str = 'None'
            if isinstance(limiting_factors, list) and limiting_factors:
                limiting_factors_str = ', '.join(limiting_factors)
            
            prompt += f"""
### FEASIBILITY ASSESSMENT:
- Overall Score: {total_score}/100
- Rating: {rating}
- Recommendation: {recommendation}
- Priority Level: {priority}
- Limiting Factors: {limiting_factors_str}
"""

        # Add structure recommendations if available
        if structure_recommendations and isinstance(structure_recommendations, dict):
            prompt += f"""
### RECOMMENDED STRUCTURES:
- Strategy: {structure_recommendations.get('strategy', 'Unknown')}
- Total Estimated Cost: ₹{structure_recommendations.get('total_estimated_cost', 'Unknown')}
- Primary Structures: {len(structure_recommendations.get('primary_structures', []))} options
- Secondary Structures: {len(structure_recommendations.get('secondary_structures', []))} options
- Implementation Phases: {len(structure_recommendations.get('implementation_phases', []))} phases
"""

        prompt += f"""

## REQUESTED OUTPUT:
Please provide a comprehensive, easy-to-understand recommendation report that includes:

1. **EXECUTIVE SUMMARY** (2-3 sentences explaining if RWH is recommended and why)

2. **PERSONALIZED BENEFITS** (Specific to this user):
   - Annual water savings potential in liters
   - Monthly cost savings in ₹
   - Payback period estimation
   - Environmental impact (carbon footprint reduction)

3. **RECOMMENDED SYSTEM DESIGN**:
   - Primary storage solution (tank type, size, cost)
   - Filtration requirements (first flush, filters)
   - Recharge structures (if applicable)
   - Total system cost breakdown

4. **IMPLEMENTATION ROADMAP**:
   - Phase 1: Immediate steps (with timeline and cost)
   - Phase 2: Medium-term additions (with timeline and cost)
   - Phase 3: Long-term enhancements (if applicable)

5. **GOVERNMENT INCENTIVES** (if applicable):
   - Available subsidies in {assessment_data.get('state', 'your state')}
   - Tax benefits and rebates
   - Documentation required

6. **MAINTENANCE REQUIREMENTS**:
   - Daily/weekly tasks
   - Monthly maintenance
   - Annual servicing and costs

7. **RISK MITIGATION**:
   - Potential challenges and solutions
   - Backup options during dry periods
   - Quality control measures

8. **COST-BENEFIT ANALYSIS**:
   - Initial investment: ₹
   - Annual savings: ₹
   - Payback period: X years
   - 10-year total savings: ₹

9. **NEXT STEPS**:
   - Immediate actions to take
   - Vendors/contractors to contact
   - Permits or approvals needed

Please make the language simple, practical, and action-oriented. Focus on specific numbers, costs, and timelines that this user can act upon immediately. Use Indian Rupees (₹) for all cost estimates and consider Indian market prices and availability.

Respond in a structured format that can be easily parsed and displayed to the user.
"""

        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse the AI response into structured data
        This is a basic parser - the AI should ideally return structured data
        """
        
        try:
            # Try to find JSON in the response if the AI returns it
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # If no JSON found, return the text divided into sections
        sections = {}
        current_section = "general"
        current_content = []
        
        for line in response_text.split('\n'):
            line = line.strip()
            if line.startswith('#') or line.startswith('**') and line.endswith('**'):
                # New section detected
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Extract section name
                section_name = line.replace('#', '').replace('**', '').strip().lower()
                current_section = section_name.replace(' ', '_')
                current_content = []
            else:
                if line:  # Skip empty lines
                    current_content.append(line)
        
        # Add the last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return {
            "structured_sections": sections,
            "full_text": response_text
        }

# Create a singleton instance
anthropic_service = AnthropicRWHService()