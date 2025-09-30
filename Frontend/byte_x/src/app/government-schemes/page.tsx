"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import SpotlightCard from "@/components/SpotlightCard"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, FileText, Globe } from "lucide-react"
import { STATE_URLS, STATE_NAMES } from "@/lib/state-data"

interface GovernmentScheme {
  name: string
  description: string
  benefits: string[]
  eligibility: string[]
  officialLink?: string
}

interface StateData {
  name: string
  officialWaterSite: string
  schemes: GovernmentScheme[]
}

export default function GovernmentSchemesPage() {
  const stateData: Record<string, StateData> = useMemo(() => ({
    "Andhra Pradesh": {
      name: "Andhra Pradesh",
      officialWaterSite: STATE_URLS["Andhra Pradesh"],
      schemes: [
        {
          name: "Mandatory Rainwater Harvesting",
          description: "Compulsory rainwater harvesting for buildings 300+ sq meters",
          benefits: [
            "Mandatory for buildings 300+ sq meters in municipal corporations",
            "Applies to Urban Development Authorities and Municipalities",
            "Promotes water conservation and groundwater recharge",
            "Improves local water security"
          ],
          eligibility: [
            "Buildings with area 300+ sq meters",
            "Municipal corporations areas",
            "Urban Development Authority areas",
            "Municipality areas"
          ],
          officialLink: STATE_URLS["Andhra Pradesh"]
        },
        {
          name: "Jal Shakti Abhiyan Support",
          description: "Central government financial support for rainwater harvesting",
          benefits: [
            "₹3,551 crore allocated over 3 years",
            "196 projects worth ₹522 crore under AMRUT 2.0",
            "Focus on water body rejuvenation",
            "Community-level implementation support"
          ],
          eligibility: [
            "Government departments",
            "Municipal corporations",
            "Urban Development Authorities",
            "Community organizations"
          ]
        },
        {
          name: "Community Rainwater Harvesting Initiative",
          description: "Large-scale community implementation program",
          benefits: [
            "750+ rainwater harvesting pits planned",
            "Technical guidance and support",
            "Community awareness programs",
            "Groundwater level improvement"
          ],
          eligibility: [
            "Resident Welfare Associations",
            "Community organizations",
            "Local colonies and societies",
            "Municipal areas"
          ]
        }
      ]
    },
    "Arunachal Pradesh": {
      name: "Arunachal Pradesh",
      officialWaterSite: STATE_URLS["Arunachal Pradesh"],
      schemes: [
        {
          name: "Arunachal Pradesh Water Resources Development",
          description: "Integrated water resource management and conservation",
          benefits: [
            "Promotes traditional water harvesting methods",
            "Supports spring rejuvenation projects",
            "Focuses on community-based water management",
            "Encourages rainwater harvesting in hilly areas"
          ],
          eligibility: [
            "Hill communities",
            "Local self-governments",
            "Water user groups",
            "Traditional institutions"
          ],
          officialLink: STATE_URLS["Arunachal Pradesh"]
        }
      ]
    },
    "Assam": {
      name: "Assam",
      officialWaterSite: STATE_URLS["Assam"],
      schemes: [
        {
          name: "Assam Water Resources Development",
          description: "Flood management and water conservation initiatives",
          benefits: [
            "Flood mitigation through water harvesting",
            "Groundwater recharge in flood-prone areas",
            "Community water storage solutions",
            "Traditional water management revival"
          ],
          eligibility: [
            "Flood-prone communities",
            "Agricultural cooperatives",
            "Local development authorities",
            "Community organizations"
          ],
          officialLink: STATE_URLS["Assam"]
        }
      ]
    },
    "Bihar": {
      name: "Bihar",
      officialWaterSite: STATE_URLS["Bihar"],
      schemes: [
        {
          name: "Bihar Water Resources Development",
          description: "Comprehensive water management and conservation program",
          benefits: [
            "Promotes rooftop rainwater harvesting",
            "Supports groundwater recharge projects",
            "Focuses on rural water security",
            "Encourages community participation"
          ],
          eligibility: [
            "Rural households",
            "Agricultural communities",
            "Local panchayats",
            "Water user associations"
          ],
          officialLink: STATE_URLS["Bihar"]
        }
      ]
    },
    "Chhattisgarh": {
      name: "Chhattisgarh",
      officialWaterSite: STATE_URLS["Chhattisgarh"],
      schemes: [
        {
          name: "Chhattisgarh Water Resources Development",
          description: "Integrated water resource management",
          benefits: [
            "Promotes traditional water harvesting",
            "Supports groundwater recharge",
            "Focuses on tribal area water security",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Tribal communities",
            "Rural households",
            "Local self-governments",
            "Agricultural cooperatives"
          ],
          officialLink: STATE_URLS["Chhattisgarh"]
        }
      ]
    },
    "Delhi": {
      name: "Delhi",
      officialWaterSite: STATE_URLS["Delhi"],
      schemes: [
        {
          name: "Delhi Jal Board Rainwater Harvesting",
          description: "Mandatory rainwater harvesting for buildings above 100 sqm",
          benefits: [
            "Mandatory for buildings above 100 sqm",
            "Subsidy for installation available",
            "Technical guidance and support",
            "Groundwater recharge promotion",
            "Reduced water bills"
          ],
          eligibility: [
            "Building owners above 100 sqm",
            "Residential complexes",
            "Commercial establishments",
            "Institutional buildings",
            "Government buildings"
          ],
          officialLink: STATE_URLS["Delhi"]
        },
        {
          name: "Delhi Building Bye-Laws",
          description: "Comprehensive building regulations for water conservation",
          benefits: [
            "Mandatory rainwater harvesting in new constructions",
            "Building plan approval linked to RWH compliance",
            "Penalty for non-compliance",
            "Technical specifications provided"
          ],
          eligibility: [
            "New building constructions",
            "Building plan applicants",
            "Property developers",
            "Individual property owners"
          ]
        }
      ]
    },
    "Goa": {
      name: "Goa",
      officialWaterSite: STATE_URLS["Goa"],
      schemes: [
        {
          name: "Goa Rainwater Harvesting Subsidy Scheme",
          description: "Financial assistance for rainwater harvesting systems with up to 50% subsidy",
          benefits: [
            "Individual households/residential houses: Up to 50% of cost or ₹1,00,000/- whichever is less",
            "Residential complexes and apartment buildings: Up to 50% of cost or ₹5,00,000/- whichever is less",
            "Commercial complexes and hospitality businesses: Up to 50% of cost or ₹5,00,000/- whichever is less",
            "Industrial units or plot area of 1500 sq.m and above: Up to 50% of cost or ₹5,00,000/- whichever is less",
            "Promotes groundwater recharge and water conservation",
            "Supports sustainable tourism practices"
          ],
          eligibility: [
            "Individual households and residential houses",
            "Residential complexes and apartment buildings",
            "Commercial complexes and hospitality businesses",
            "Industrial units with plot area of 1500 sq.m and above",
            "Property owners in Goa",
            "Buildings with valid construction permits"
          ],
          officialLink: STATE_URLS["Goa"]
        }
      ]
    },
    "Gujarat": {
      name: "Gujarat",
      officialWaterSite: STATE_URLS["Gujarat"],
      schemes: [
        {
          name: "Rajkot Municipal Corporation Rainwater Harvesting",
          description: "Mandatory rainwater harvesting for buildings above 80 sqm",
          benefits: [
            "Mandatory for buildings with 80+ sqm built-up area",
            "5-year moratorium for existing buildings above 1000 sqm",
            "Groundwater recharge promotion",
            "Water conservation compliance"
          ],
          eligibility: [
            "Buildings with 80+ sqm built-up area",
            "Existing buildings above 1000 sqm",
            "New constructions",
            "Commercial and residential properties"
          ],
          officialLink: STATE_URLS["Gujarat"]
        },
        {
          name: "Sujalam Sufalam Yojana",
          description: "Water conservation and groundwater recharge program",
          benefits: [
            "Desert area water management",
            "Groundwater recharge promotion",
            "Community water storage",
            "Traditional water system revival"
          ],
          eligibility: [
            "Desert communities",
            "Agricultural cooperatives",
            "Local panchayats",
            "Water user groups"
          ]
        }
      ]
    },
    "Haryana": {
      name: "Haryana",
      officialWaterSite: STATE_URLS["Haryana"],
      schemes: [
        {
          name: "Haryana Rainwater Harvesting Mandate",
          description: "Mandatory rainwater harvesting for large buildings",
          benefits: [
            "Mandatory for buildings on plots 500+ square yards",
            "Rooftop rainwater harvesting incentives",
            "Groundwater recharge promotion",
            "Water conservation compliance"
          ],
          eligibility: [
            "Buildings on plots 500+ square yards",
            "Large residential properties",
            "Commercial establishments",
            "Institutional buildings"
          ],
          officialLink: STATE_URLS["Haryana"]
        },
        {
          name: "Haryana Water Resources Development",
          description: "Comprehensive water management initiatives",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on agricultural water efficiency",
            "Encourages community water management"
          ],
          eligibility: [
            "Agricultural communities",
            "Rural households",
            "Local panchayats",
            "Water user associations"
          ]
        }
      ]
    },
    "Himachal Pradesh": {
      name: "Himachal Pradesh",
      officialWaterSite: STATE_URLS["Himachal Pradesh"],
      schemes: [
        {
          name: "Himachal Pradesh Rainwater Harvesting Mandate",
          description: "Mandatory rainwater harvesting for all urban buildings",
          benefits: [
            "Mandatory for all buildings in urban areas",
            "No building plan approval without RWH system",
            "Applies to schools, government buildings, industries",
            "Mountain water conservation focus"
          ],
          eligibility: [
            "All buildings in urban areas",
            "Schools and educational institutions",
            "Government buildings",
            "Industries and bus stands"
          ],
          officialLink: STATE_URLS["Himachal Pradesh"]
        }
      ]
    },
    "Jammu & Kashmir": {
      name: "Jammu & Kashmir",
      officialWaterSite: STATE_URLS["Jammu & Kashmir"],
      schemes: [
        {
          name: "Jammu & Kashmir Water Resources Development",
          description: "Integrated water resource management",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on mountain water management",
            "Encourages community participation"
          ],
          eligibility: [
            "Mountain communities",
            "Rural households",
            "Local self-governments",
            "Agricultural cooperatives"
          ],
          officialLink: STATE_URLS["Jammu & Kashmir"]
        }
      ]
    },
    "Jharkhand": {
      name: "Jharkhand",
      officialWaterSite: STATE_URLS["Jharkhand"],
      schemes: [
        {
          name: "Jharkhand Water Resources Development",
          description: "Water conservation and management program",
          benefits: [
            "Promotes traditional water harvesting",
            "Supports groundwater recharge",
            "Focuses on tribal area water security",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Tribal communities",
            "Rural households",
            "Local panchayats",
            "Water user associations"
          ],
          officialLink: STATE_URLS["Jharkhand"]
        }
      ]
    },
    "Karnataka": {
      name: "Karnataka",
      officialWaterSite: STATE_URLS["Karnataka"],
      schemes: [
        {
          name: "Mandatory Rainwater Harvesting",
          description: "Compulsory rainwater harvesting in major cities",
          benefits: [
            "Mandatory in cities with population over 20 lakh",
            "20% rebate on property tax for 5 years",
            "Rooftop rainwater harvesting in government buildings",
            "Groundwater recharge promotion"
          ],
          eligibility: [
            "Major cities with 20+ lakh population",
            "Government buildings",
            "Property owners implementing RWH",
            "Urban areas"
          ],
          officialLink: STATE_URLS["Karnataka"]
        },
        {
          name: "Krishi Bhagya Scheme",
          description: "Financial assistance for rainwater storage units",
          benefits: [
            "Assistance for rainwater storage units",
            "Support for farmers' water needs",
            "Agricultural water security",
            "Drought mitigation"
          ],
          eligibility: [
            "Farmers",
            "Agricultural communities",
            "Rural areas",
            "Agricultural cooperatives"
          ]
        },
        {
          name: "Bengaluru Rainwater Harvesting Mandate",
          description: "Mandatory rainwater harvesting for buildings above 2,325 sq ft",
          benefits: [
            "Mandatory for buildings on plots 2,325+ sq ft in Bengaluru",
            "Dual piping system for buildings above 10,763 sq ft",
            "Utilization of harvested water for domestic purposes",
            "Groundwater recharge promotion"
          ],
          eligibility: [
            "Buildings on plots 2,325+ sq ft in Bengaluru",
            "Buildings above 10,763 sq ft (dual piping required)",
            "New constructions",
            "Existing buildings (compliance required)"
          ]
        }
      ]
    },
    "Kerala": {
      name: "Kerala",
      officialWaterSite: STATE_URLS["Kerala"],
      schemes: [
        {
          name: "Kerala Municipality Building Rules",
          description: "Mandatory rainwater harvesting for all new buildings",
          benefits: [
            "Mandatory for all new buildings as per 2004 rules",
            "Rooftop rainwater harvesting implementation",
            "Water conservation promotion",
            "Sustainable water management"
          ],
          eligibility: [
            "All new building constructions",
            "Building plan applicants",
            "Property developers",
            "Individual property owners"
          ],
          officialLink: STATE_URLS["Kerala"]
        }
      ]
    },
    "Madhya Pradesh": {
      name: "Madhya Pradesh",
      officialWaterSite: STATE_URLS["Madhya Pradesh"],
      schemes: [
        {
          name: "Madhya Pradesh Water Resources Development",
          description: "Water conservation and management program",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on rural water security",
            "Encourages community participation"
          ],
          eligibility: [
            "Rural communities",
            "Agricultural cooperatives",
            "Local panchayats",
            "Water user associations"
          ],
          officialLink: STATE_URLS["Madhya Pradesh"]
        }
      ]
    },
    "Maharashtra": {
      name: "Maharashtra",
      officialWaterSite: STATE_URLS["Maharashtra"],
      schemes: [
        {
          name: "Nagpur Municipal Corporation Rainwater Harvesting",
          description: "Mandatory rainwater harvesting in Nagpur since March 2005",
          benefits: [
            "Mandatory for all buildings in Nagpur",
            "Building permission linked to RWH compliance",
            "Penalty for non-compliance",
            "Groundwater recharge promotion",
            "Water conservation enforcement"
          ],
          eligibility: [
            "All buildings in Nagpur",
            "New constructions",
            "Existing buildings",
            "Commercial and residential properties"
          ],
          officialLink: STATE_URLS["Maharashtra"]
        },
        {
          name: "Maharashtra Water Resources Development",
          description: "Comprehensive water management initiatives",
          benefits: [
            "Promotes rainwater harvesting across state",
            "Supports groundwater recharge",
            "Focuses on drought mitigation",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Drought-prone areas",
            "Rural communities",
            "Agricultural societies",
            "Local development authorities"
          ]
        }
      ]
    },
    "Manipur": {
      name: "Manipur",
      officialWaterSite: STATE_URLS["Manipur"],
      schemes: [
        {
          name: "Manipur Water Resources Development",
          description: "Integrated water resource management",
          benefits: [
            "Promotes traditional water harvesting",
            "Supports groundwater recharge",
            "Focuses on community water management",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Local communities",
            "Rural households",
            "Traditional institutions",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Manipur"]
        }
      ]
    },
    "Meghalaya": {
      name: "Meghalaya",
      officialWaterSite: STATE_URLS["Meghalaya"],
      schemes: [
        {
          name: "Meghalaya Water Resources Development",
          description: "Water conservation and management program",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on tribal area water security",
            "Encourages community participation"
          ],
          eligibility: [
            "Tribal communities",
            "Rural households",
            "Local self-governments",
            "Water user associations"
          ],
          officialLink: STATE_URLS["Meghalaya"]
        }
      ]
    },
    "Mizoram": {
      name: "Mizoram",
      officialWaterSite: STATE_URLS["Mizoram"],
      schemes: [
        {
          name: "Mizoram Water Resources Development",
          description: "Integrated water resource management",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on mountain water management",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Mountain communities",
            "Rural households",
            "Local panchayats",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Mizoram"]
        }
      ]
    },
    "Nagaland": {
      name: "Nagaland",
      officialWaterSite: STATE_URLS["Nagaland"],
      schemes: [
        {
          name: "Nagaland Water Resources Development",
          description: "Water conservation and management program",
          benefits: [
            "Promotes traditional water harvesting",
            "Supports groundwater recharge",
            "Focuses on tribal area water security",
            "Encourages community participation"
          ],
          eligibility: [
            "Tribal communities",
            "Rural households",
            "Traditional institutions",
            "Water user associations"
          ],
          officialLink: STATE_URLS["Nagaland"]
        }
      ]
    },
    "Odisha": {
      name: "Odisha",
      officialWaterSite: STATE_URLS["Odisha"],
      schemes: [
        {
          name: "CHHATA Scheme",
          description: "Community Harnessing and Harvesting Rainwater Artificially from Terrace to Aquifer",
          benefits: [
            "Rooftop rainwater harvesting focus",
            "Recharge wells implementation",
            "Community-based approach",
            "Financial assistance for implementation"
          ],
          eligibility: [
            "Rural communities",
            "Agricultural societies",
            "Local panchayats",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Odisha"]
        },
        {
          name: "Odisha Water Resources Development",
          description: "Comprehensive water management initiatives",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on coastal water management",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Coastal communities",
            "Rural households",
            "Agricultural cooperatives",
            "Local development authorities"
          ]
        }
      ]
    },
    "Punjab": {
      name: "Punjab",
      officialWaterSite: STATE_URLS["Punjab"],
      schemes: [
        {
          name: "Punjab Rainwater Harvesting Mandate",
          description: "Mandatory rainwater harvesting for large buildings",
          benefits: [
            "Mandatory for buildings on plots 500+ square yards",
            "Rooftop rainwater harvesting incentives",
            "Groundwater recharge promotion",
            "Water conservation compliance"
          ],
          eligibility: [
            "Buildings on plots 500+ square yards",
            "Large residential properties",
            "Commercial establishments",
            "Institutional buildings"
          ],
          officialLink: STATE_URLS["Punjab"]
        },
        {
          name: "Punjab Water Resources Management",
          description: "Comprehensive water management initiatives",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on agricultural water efficiency",
            "Encourages community water management"
          ],
          eligibility: [
            "Agricultural communities",
            "Rural households",
            "Local panchayats",
            "Water user associations"
          ]
        }
      ]
    },
    "Rajasthan": {
      name: "Rajasthan",
      officialWaterSite: STATE_URLS["Rajasthan"],
      schemes: [
        {
          name: "Farm Pond Scheme",
          description: "Financial support for rainwater harvesting ponds",
          benefits: [
            "Up to ₹1.35 lakh subsidy per farmer",
            "70% government contribution, 30% farmer contribution",
            "Higher subsidies for SC/ST farmers",
            "Desert area water security",
            "Agricultural water management"
          ],
          eligibility: [
            "Farmers in Rajasthan",
            "Agricultural landholders",
            "SC/ST farmers (higher subsidies)",
            "Rural communities"
          ],
          officialLink: STATE_URLS["Rajasthan"]
        },
        {
          name: "Desert Water Management",
          description: "Comprehensive desert water conservation program",
          benefits: [
            "Traditional water system revival",
            "Groundwater recharge promotion",
            "Community water storage solutions",
            "Drought mitigation strategies"
          ],
          eligibility: [
            "Desert communities",
            "Rural households",
            "Traditional institutions",
            "Water user groups"
          ]
        }
      ]
    },
    "Sikkim": {
      name: "Sikkim",
      officialWaterSite: STATE_URLS["Sikkim"],
      schemes: [
        {
          name: "Sikkim Water Resources Development",
          description: "Mountain water resource management",
          benefits: [
            "Spring rejuvenation projects",
            "Traditional water harvesting revival",
            "Community water storage solutions",
            "Sustainable mountain water management"
          ],
          eligibility: [
            "Mountain communities",
            "Hill panchayats",
            "Traditional institutions",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Sikkim"]
        }
      ]
    },
    "Tamil Nadu": {
      name: "Tamil Nadu",
      officialWaterSite: STATE_URLS["Tamil Nadu"],
      schemes: [
        {
          name: "Tamil Nadu Rainwater Harvesting Mandate",
          description: "Pioneer state in mandatory rainwater harvesting",
          benefits: [
            "Mandatory for all buildings",
            "Significant improvement in groundwater levels",
            "Grants provided for implementation",
            "State-wide water conservation success"
          ],
          eligibility: [
            "All building constructions",
            "Residential properties",
            "Commercial establishments",
            "Institutional buildings"
          ],
          officialLink: STATE_URLS["Tamil Nadu"]
        }
      ]
    },
    "Telangana": {
      name: "Telangana",
      officialWaterSite: STATE_URLS["Telangana"],
      schemes: [
        {
          name: "Hyderabad Metro Water Supply Rainwater Harvesting",
          description: "Mandatory rainwater harvesting for buildings above 200 sqm",
          benefits: [
            "Mandatory for buildings with plot area over 200 sqm",
            "Technical guidance from HMWSSB",
            "Community awareness programs",
            "Groundwater recharge promotion",
            "Water conservation compliance"
          ],
          eligibility: [
            "Buildings with plot area over 200 sqm",
            "Residential premises",
            "Commercial establishments",
            "Institutional buildings"
          ],
          officialLink: STATE_URLS["Telangana"]
        },
        {
          name: "APWALTA 2002 Compliance",
          description: "Andhra Pradesh Water, Land and Trees Act implementation",
          benefits: [
            "Legal framework for water conservation",
            "Groundwater protection measures",
            "Tree plantation requirements",
            "Sustainable water management"
          ],
          eligibility: [
            "All building constructions",
            "Property developers",
            "Individual property owners",
            "Commercial establishments"
          ]
        }
      ]
    },
    "Tripura": {
      name: "Tripura",
      officialWaterSite: STATE_URLS["Tripura"],
      schemes: [
        {
          name: "Tripura Water Resources Development",
          description: "Water conservation and management program",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on tribal area water security",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Tribal communities",
            "Rural households",
            "Local self-governments",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Tripura"]
        }
      ]
    },
    "Uttar Pradesh": {
      name: "Uttar Pradesh",
      officialWaterSite: STATE_URLS["Uttar Pradesh"],
      schemes: [
        {
          name: "Per Drop More Crop Scheme",
          description: "Financial support for farm pond construction",
          benefits: [
            "₹52,000 subsidy for farm pond construction",
            "Focus on drought mitigation",
            "Improved irrigation efficiency",
            "Agricultural water security"
          ],
          eligibility: [
            "Farmers constructing farm ponds",
            "Agricultural landholders",
            "Rural communities",
            "Drought-prone areas"
          ],
          officialLink: STATE_URLS["Uttar Pradesh"]
        },
        {
          name: "Uttar Pradesh Water Resources Development",
          description: "Comprehensive water management initiatives",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on agricultural water efficiency",
            "Encourages community water management"
          ],
          eligibility: [
            "Agricultural communities",
            "Rural households",
            "Local panchayats",
            "Water user associations"
          ]
        }
      ]
    },
    "Uttarakhand": {
      name: "Uttarakhand",
      officialWaterSite: STATE_URLS["Uttarakhand"],
      schemes: [
        {
          name: "Uttarakhand Water Resources Development",
          description: "Mountain water resource management",
          benefits: [
            "Spring rejuvenation projects",
            "Traditional water harvesting revival",
            "Community water storage solutions",
            "Sustainable mountain water management"
          ],
          eligibility: [
            "Mountain communities",
            "Hill panchayats",
            "Traditional institutions",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Uttarakhand"]
        }
      ]
    },
    "West Bengal": {
      name: "West Bengal",
      officialWaterSite: STATE_URLS["West Bengal"],
      schemes: [
        {
          name: "West Bengal Municipal Building Rules",
          description: "Mandatory rainwater harvesting under Rule 171",
          benefits: [
            "Mandatory installation under Rule 171 of 2007",
            "Building plan approval linked to RWH compliance",
            "Water conservation promotion",
            "Sustainable development focus"
          ],
          eligibility: [
            "All new building constructions",
            "Building plan applicants",
            "Property developers",
            "Individual property owners"
          ],
          officialLink: STATE_URLS["West Bengal"]
        },
        {
          name: "West Bengal Water Conservation Initiative",
          description: "Comprehensive water conservation program",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on coastal water management",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Coastal communities",
            "Rural households",
            "Agricultural cooperatives",
            "Local development authorities"
          ]
        }
      ]
    },
    "Andaman & Nicobar Islands": {
      name: "Andaman & Nicobar Islands",
      officialWaterSite: STATE_URLS["Andaman & Nicobar Islands"],
      schemes: [
        {
          name: "Andaman & Nicobar Water Resources Development",
          description: "Island water resource management",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on island water security",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Island communities",
            "Rural households",
            "Local self-governments",
            "Water user groups"
          ],
          officialLink: STATE_URLS["Andaman & Nicobar Islands"]
        }
      ]
    },
    "Chandigarh": {
      name: "Chandigarh",
      officialWaterSite: STATE_URLS["Chandigarh"],
      schemes: [
        {
          name: "Chandigarh Water Resources Development",
          description: "Urban water conservation initiatives",
          benefits: [
            "Promotes rooftop rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on urban water management",
            "Encourages sustainable city practices"
          ],
          eligibility: [
            "Urban households",
            "Commercial establishments",
            "Educational institutions",
            "Government buildings"
          ],
          officialLink: STATE_URLS["Chandigarh"]
        }
      ]
    },
    "Puducherry": {
      name: "Puducherry",
      officialWaterSite: STATE_URLS["Puducherry"],
      schemes: [
        {
          name: "Puducherry Water Resources Development",
          description: "Union territory water management",
          benefits: [
            "Promotes rainwater harvesting",
            "Supports groundwater recharge",
            "Focuses on coastal water management",
            "Encourages sustainable water practices"
          ],
          eligibility: [
            "Residential properties",
            "Commercial buildings",
            "Educational institutions",
            "Government establishments"
          ],
          officialLink: STATE_URLS["Puducherry"]
        }
      ]
    }
  }), [])

  const [selectedState, setSelectedState] = useState<string>("")
  const selectedStateData = selectedState ? stateData[selectedState] : null

  // Re-apply translations for newly mounted elements when a state is selected
  useEffect(() => {
    if (!selectedState) return
    try {
      const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en'
      // small delay to ensure the elements are in the DOM
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }))
      }, 0)
    } catch {}
  }, [selectedState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="gradient-text-animated">
                Government Schemes
              </span>{" "}
              for Water Conservation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Explore state-specific government schemes and initiatives for rainwater harvesting and water conservation. Find official programs, benefits, eligibility criteria, and direct links to government portals.
            </p>
          </header>
        </div>
      </section>

      {/* State Selection Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 backdrop-blur-sm">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  <span data-translate="Select Your State">Select Your State</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  <span data-translate="Choose your state to view specific government schemes, programs, and official water resource portals.">
                    Choose your state to view specific government schemes, programs, and official water resource portals.
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-center">
                <label htmlFor="state" className="text-lg font-semibold text-gray-900 dark:text-white sm:w-48">
                  <span data-translate="Choose State">Choose State</span>
                </label>
                <select
                  id="state"
                  className="w-full sm:max-w-md rounded-xl border-2 bg-white dark:bg-gray-800 p-4 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {STATE_NAMES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* State Information Section */}
      {selectedStateData && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                <MapPin className="inline-block w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                {selectedStateData.name}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Government schemes and initiatives for water conservation and rainwater harvesting
              </p>
            </div>

            {/* Official Government Site Link */}
            <div className="mb-12">
              <SpotlightCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          Official Water Resources Portal
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Visit the official government website for detailed information
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                    >
                      <a
                        href={selectedStateData.officialWaterSite}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Portal
                      </a>
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Government Schemes */}
            <div className="space-y-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                <FileText className="inline-block w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Government Schemes & Programs
              </h3>
              
              {selectedStateData.schemes.map((scheme, index) => (
                <SpotlightCard key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          {scheme.name}
                        </h4>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                          {scheme.description}
                        </p>
                      </div>
                      {scheme.officialLink && (
                        <Button
                          asChild
                          variant="outline"
                          className="ml-4 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <a
                            href={scheme.officialLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Official Link
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      {/* Benefits */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                          Key Benefits
                        </h5>
                        <ul className="space-y-2">
                          {scheme.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Eligibility */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">i</span>
                          Eligibility Criteria
                        </h5>
                        <ul className="space-y-2">
                          {scheme.eligibility.map((criteria, criteriaIndex) => (
                            <li key={criteriaIndex} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Information Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 backdrop-blur-sm">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Important Information
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Please note the following when applying for government schemes
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Keep all required documents ready including land records, identity proof, and project proposals
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Application Timeline</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Check application deadlines and processing times on official government portals
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Support</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Reach out to local water resource departments for assistance and clarifications
                  </p>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Start Assessment Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/50 dark:to-blue-900/50 backdrop-blur-sm">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl">🚀</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
                Now that you've explored government schemes and incentives, take our comprehensive assessment to get personalized recommendations for your specific location and requirements.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
              >
                <span className="text-lg sm:text-xl">📊</span>
                <span data-translate="Start Your Assessment" className="flex-shrink-0">Start Your Assessment</span>
                <span className="text-lg sm:text-xl">→</span>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 px-2">
                Get personalized recommendations based on your location, roof area, and water needs
              </p>
            </div>
          </SpotlightCard>
        </div>
      </section>
    </div>
  )
}
