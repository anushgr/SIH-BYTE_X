# RAG Chatbot using Anthropic API and Web Data from Government Websites
# This script:
# 1. Takes a list of URLs from gov sites (e.g., India WRIS, CGWB).
# 2. Loads content from those URLs (scraping web pages).
# 3. Builds a vector store for RAG.
# 4. Allows querying with answers grounded in the fetched data.
# Note: Run this once to build the index, then query. For large sites, provide specific deep links.
# Compliance: Check site terms/robots.txt; this is for educational use.

# Install dependencies if needed:
# pip install anthropic langchain langchain-anthropic langchain-community sentence-transformers faiss-cpu beautifulsoup4 requests python-dotenv

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Step 1: Define your website links (add more specific URLs from indiawris.gov.in and cgwb.gov.in)
# Examples: Main pages, reports, data sections. Find them by browsing the sites.
urls = [
    "https://indiawris.gov.in/wris/#/",  # WRIS home (adapt to specific pages)
    "https://indiawris.gov.in/wiki/doku.php?id=ground_water_resources",  # Example wiki page
    "https://cgwb.gov.in/en/ground-water",  # CGWB groundwater section
    "https://cgwb.gov.in/en/ground-water-quality",  # CGWB groundwater quality section
    "https://cgwb.gov.in/en/ground-water-level",  # CGWB groundwater level section
    "https://cgwb.gov.in/Documents/GW_Year_Book_2022-23.pdf", # CGWB groundwater year book
    "https://prod-qt-images.s3.amazonaws.com/indiawaterportal/import/sites/default/files/iwp2/aquifer_systems_of_india_cgwb_2012.pdf",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691424/",
    "https://www.ijarsct.co.in/Paper26339.pdf",
    "https://indiawris.gov.in/wris/#/geoSpatialData"
]

# Step 2: Load documents from URLs
docs = []
for url in urls:
    loader = WebBaseLoader(url)
    docs.extend(loader.load())
print(f"Loaded {len(docs)} documents from URLs.")

# Step 3: Chunk the documents
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# Step 4: Embed and create vector store
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("gov_water_index")  # Save for reuse
print("Vector store created and saved.")

# Step 5: Set up Claude LLM (API key loaded from .env file)
llm = ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0.1, api_key=os.getenv("CLAUDE_API_KEY"))

# Custom prompt to restrict to sources
prompt_template = """
Use only the following context from Indian government water resources sites (India WRIS, CGWB, etc.) to answer the question. If the answer isn't in the context, say "I don't have information from the sources on this."
Context: {context}
Question: {question}
Answer:"""
PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

# RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),  # Top 5 relevant chunks
    chain_type_kwargs={"prompt": PROMPT}
)

# Step 6: Chat function (run queries here)
def answer_query(query):
    response = qa_chain.run(query)
    return response

# Example usage: Input your query
if __name__ == "__main__":
    while True:
        query = input("Enter your query (or 'exit' to quit): ")
        if query.lower() == 'exit':
            break
        print("Answer:", answer_query(query))

# Tips:
# - Expand 'urls' list with more links (e.g., crawl sitemaps if needed, but manually for now).
# - If sites block scraping, use APIs if available (CGWB has some data downloads).
# - For real-time updates, re-run loading periodically.
# - If you have many URLs, consider asynchronous loading or a crawler like Scrapy.