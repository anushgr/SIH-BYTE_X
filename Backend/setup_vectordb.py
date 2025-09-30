"""
One-time setup script to build the RAG vector database for Rooftop Rainwater Harvesting
This script downloads and processes comprehensive data from government websites, 
research papers, and technical manuals related to:
- Rooftop Rainwater Harvesting (RTRWH)
- Artificial Recharge techniques
- Groundwater data and aquifer information
- Rainfall data and climate information
- Cost estimation and design guidelines
- FAQ and practical implementation guides

Run this script once to set up the complete knowledge base for the chatbot.
"""

import os
import time
from dotenv import load_dotenv
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import logging
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore", category=FutureWarning)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_vector_database():
    """Build the vector database from government websites"""
    
    # Load environment variables
    load_dotenv()
    
    # Comprehensive URLs for Rooftop Rainwater Harvesting and Artificial Recharge
    urls = [
        # CGWB Official Resources
        "https://cgwb.gov.in/en/ground-water",
        "https://cgwb.gov.in/en/ground-water-quality",
        "https://cgwb.gov.in/en/ground-water-level",
        "https://cgwb.gov.in/Documents/GW_Year_Book_2022-23.pdf",
        "https://cgwb.gov.in/artificial-recharge",
        "https://cgwb.gov.in/rainwater-harvesting",
        
        # India WRIS Portal
        "https://indiawris.gov.in/wris/#/",
        "https://indiawris.gov.in/wiki/doku.php?id=ground_water_resources",
        "https://indiawris.gov.in/wris/#/geoSpatialData",
        "https://indiawris.gov.in/wiki/doku.php?id=artificial_recharge",
        
        # Rooftop Rainwater Harvesting Specific
        "https://jalshakti-dowr.gov.in/sites/default/files/RWH_Book.pdf",
        "https://jalshakti-dowr.gov.in/sites/default/files/Rainwater_Harvesting_Manual.pdf",
        "https://www.rainwaterharvesting.org/index.html",
        "https://www.rainwaterharvesting.org/methods/rooftop.html",
        "https://www.rainwaterharvesting.org/methods/artificial-recharge.html",
        
        # Government Manuals and Guidelines
        "https://jalshakti-dowr.gov.in/artificial-recharge-groundwater",
        "https://jalshakti-dowr.gov.in/rainwater-harvesting",
        "https://mowr.gov.in/sites/default/files/Guidelines_for_artificial_recharge.pdf",
        "https://mowr.gov.in/sites/default/files/Rainwater_Harvesting_Guidelines.pdf",
        
        # Technical Papers and Research
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691424/",
        "https://www.ijarsct.co.in/Paper26339.pdf",
        "https://www.sciencedirect.com/science/article/pii/S2214581820301403",
        "https://www.mdpi.com/2073-4441/13/24/3634",
        
        # State Government Resources
        "https://www.tn.gov.in/department/rural-development-and-panchayat-raj/rainwater-harvesting",
        "https://ksdma.kerala.gov.in/rainwater-harvesting/",
        "https://www.karnataka.gov.in/rainwater-harvesting",
        "https://rajasthan.gov.in/dept/groundwater/rainwater-harvesting",
        
        # Cost Estimation and Design Guidelines
        "https://cpwd.gov.in/Publication/rainwater_harvesting.pdf",
        "https://www.nbmcw.com/tech-articles/water-management/rainwater-harvesting-design-and-cost-estimation.html",
        "https://www.constructionworld.in/infrastructure-news/water-infrastructure/rainwater-harvesting-cost-benefit-analysis/31324",
        
        # Aquifer and Geological Data
        "https://bhukosh.gsi.gov.in/Bhukosh/Public",
        "https://cgwb.gov.in/documents/aquifer-maps",
        "https://indiawris.gov.in/wiki/doku.php?id=aquifer_mapping",
        
        # Climate and Rainfall Data
        "https://www.imd.gov.in/pages/rainfall_statistics.php",
        "https://mausam.imd.gov.in/",
        "https://www.indiawaterportal.org/rainfall-data",
        
        # Urban Planning and Municipal Guidelines
        "https://mohua.gov.in/pdf/5c80e2225a124rainwater-harvesting-handbook.pdf",
        "https://smartcities.gov.in/sites/default/files/Rainwater_Harvesting_Handbook.pdf",
        "https://www.delhi.gov.in/rainwater-harvesting-guidelines",
        
        # FAQ and Practical Guides
        "https://cgwb.gov.in/faq/artificial-recharge-faq",
        "https://cgwb.gov.in/faq/rainwater-harvesting-faq",
        "https://www.raincentre.org/frequently-asked-questions",
        
        # Design Calculations and Technical Specifications
        "https://www.bis.gov.in/standards/technical-committee-detail/WRD-15/",
        "https://www.cpheeo.gov.in/cms/manual-on-water-supply-and-treatment.php",
        
        # Regional and Local Case Studies
        "https://www.teriin.org/projects/nfa/pdf/working-paper-6-rainwater-harvesting.pdf",
        "https://www.iwmi.cgiar.org/Publications/Working_Papers/working/WOR133.pdf",
        
        # Water Conservation Organizations
        "https://www.cse.org.in/rainwaterharvesting/",
        "https://www.arghyam.org/rainwater-harvesting/",
        "https://www.tarunbharatsangh.in/rainwater-harvesting",
        
        # International Best Practices (for reference)
        "https://www.unwater.org/publications/un-water-analytical-brief-groundwater",
        "https://www.who.int/publications/i/item/9789241512770",
        
        # Additional Technical Resources
        "https://nwm.gov.in/sites/default/files/RWH-AR_Guidelines.pdf",
        "https://www.nic.in/sites/default/files/RainwaterHarvestingManual.pdf",
        "https://www.cdma.co.in/rainwater-harvesting-manual.pdf"
    ]
    
    print("🚀 Starting comprehensive vector database creation for RTRWH...")
    print(f"📥 Loading documents from {len(urls)} government websites and resources...")
    print("   This may take several minutes due to the large number of sources...")
    
    # Load documents from URLs
    docs = []
    successful_urls = 0
    failed_urls = []
    
    for i, url in enumerate(urls, 1):
        try:
            print(f"   [{i:2d}/{len(urls)}] Loading: {url}")
            
            # Configure WebBaseLoader with timeout and headers
            loader = WebBaseLoader(
                url, 
                header_template={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
            
            loaded_docs = loader.load()
            if loaded_docs:
                docs.extend(loaded_docs)
                successful_urls += 1
                print(f"        ✅ Loaded {len(loaded_docs)} documents ({sum(len(doc.page_content) for doc in loaded_docs):,} characters)")
            else:
                print(f"        ⚠️ No content found")
                failed_urls.append(url)
                
        except Exception as e:
            print(f"        ❌ Failed: {str(e)[:100]}...")
            failed_urls.append(url)
    
    if not docs:
        raise ValueError("❌ No documents were successfully loaded")
    
    # Print summary
    print(f"\n📊 Loading Summary:")
    print(f"   ✅ Successfully loaded: {successful_urls}/{len(urls)} URLs")
    print(f"   📄 Total documents: {len(docs)}")
    print(f"   📝 Total content: {sum(len(doc.page_content) for doc in docs):,} characters")
    
    if failed_urls:
        print(f"   ❌ Failed URLs: {len(failed_urls)}")
        logger.warning(f"Failed to load {len(failed_urls)} URLs: {failed_urls[:5]}...")  # Log first 5
    
    print(f"\n📊 Successfully loaded {len(docs)} documents from {successful_urls}/{len(urls)} URLs")
    
    # Chunk the documents
    print("✂️ Splitting documents into chunks...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)
    print(f"📝 Created {len(chunks)} text chunks")
    
    # Create embeddings and vector store
    print("🧠 Creating embeddings (this may take a while)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    print("💾 Building vector store...")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Save the vector store
    vector_store_path = "gov_water_index"
    vectorstore.save_local(vector_store_path)
    
    print(f"✅ Vector database saved to '{vector_store_path}'")
    print("🎉 Setup complete! The chatbot now has comprehensive knowledge about:")
    print("   🏠 Rooftop Rainwater Harvesting (RTRWH)")
    print("   💧 Artificial Recharge techniques")
    print("   🗺️ Aquifer data and groundwater information")
    print("   🌧️ Rainfall data and climate information")
    print("   💰 Cost estimation and feasibility analysis")
    print("   📋 Design guidelines and technical specifications")
    print("   ❓ FAQs and practical implementation guides")
    print("\n🤖 Your RTRWH assessment chatbot is ready to help users!")
    
    return vector_store_path

if __name__ == "__main__":
    try:
        build_vector_database()
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        logger.error(f"Setup failed: {str(e)}")