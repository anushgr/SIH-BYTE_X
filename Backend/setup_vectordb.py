"""
One-time setup script to build the RAG vector database
Run this script once to download and process all government website data
"""

import os
from dotenv import load_dotenv
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_vector_database():
    """Build the vector database from government websites"""
    
    # Load environment variables
    load_dotenv()
    
    # Government websites URLs for RAG
    urls = [
        "https://indiawris.gov.in/wris/#/",
        "https://indiawris.gov.in/wiki/doku.php?id=ground_water_resources",
        "https://cgwb.gov.in/en/ground-water",
        "https://cgwb.gov.in/en/ground-water-quality",
        "https://cgwb.gov.in/en/ground-water-level",
        "https://cgwb.gov.in/Documents/GW_Year_Book_2022-23.pdf",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691424/",
        "https://www.ijarsct.co.in/Paper26339.pdf",
        "https://indiawris.gov.in/wris/#/geoSpatialData"
    ]
    
    print("🚀 Starting vector database creation...")
    print("📥 Loading documents from government websites...")
    
    # Load documents from URLs
    docs = []
    successful_urls = 0
    
    for i, url in enumerate(urls, 1):
        try:
            print(f"   [{i}/{len(urls)}] Loading: {url}")
            loader = WebBaseLoader(url)
            loaded_docs = loader.load()
            docs.extend(loaded_docs)
            successful_urls += 1
            print(f"   ✅ Loaded {len(loaded_docs)} documents")
        except Exception as e:
            print(f"   ❌ Failed to load {url}: {str(e)}")
    
    if not docs:
        raise ValueError("❌ No documents were successfully loaded")
    
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
    print("🎉 Setup complete! The chatbot can now use this database for fast responses.")
    
    return vector_store_path

if __name__ == "__main__":
    try:
        build_vector_database()
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        logger.error(f"Setup failed: {str(e)}")