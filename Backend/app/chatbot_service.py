"""
RAG Chatbot Service for Government Water Resources Data
This service provides intelligent responses using RAG (Retrieval-Augmented Generation)
based on data from Indian government water resources websites.
"""

import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotService:
    """RAG-based chatbot service for water resources queries"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        self.vectorstore = None
        self.qa_chain = None
        self.llm = None
        self.is_initialized = False
    
    async def initialize(self) -> bool:
        """Initialize the RAG chatbot with vector store and LLM"""
        try:
            logger.info("Initializing RAG Chatbot Service...")
            
            # Check if vector store exists
            vector_store_path = "gov_water_index"
            if not os.path.exists(vector_store_path):
                logger.error(f"Vector store not found at '{vector_store_path}'")
                logger.error("Please run 'python setup_vectordb.py' first to create the vector database")
                return False
            
            logger.info("Loading existing vector store...")
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            self.vectorstore = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
            logger.info("Vector store loaded successfully!")
            
            # Initialize Claude LLM
            api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY or CLAUDE_API_KEY not found in environment variables")
            
            self.llm = ChatAnthropic(
                model="claude-3-5-sonnet-20240620", 
                temperature=0.1, 
                api_key=api_key
            )
            logger.info("Claude LLM initialized successfully!")
            
            # Create custom prompt template
            prompt_template = """
            Use only the following context from Indian government water resources sites (India WRIS, CGWB, etc.) to answer the question. 
            If the answer isn't in the context, say "I don't have information from the official sources on this topic."
            
            Provide helpful, accurate information about:
            - Groundwater resources and management
            - Rainwater harvesting techniques
            - Water conservation methods
            - Government policies and guidelines
            - Aquifer systems and groundwater levels
            
            Context: {context}
            Question: {question}
            Answer:"""
            
            prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
            
            # Create RAG chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
                chain_type_kwargs={"prompt": prompt}
            )
            
            self.is_initialized = True
            logger.info("RAG Chatbot Service initialized successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG Chatbot Service: {str(e)}")
            return False
    
    async def get_response(self, query: str) -> Dict[str, Any]:
        """Get RAG-based response for user query"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            if not self.qa_chain:
                return {
                    "success": False,
                    "message": "Chatbot service is not properly initialized",
                    "response": "I apologize, but the chatbot service is currently unavailable. Please try again later."
                }
            
            # Get response from RAG chain
            response = self.qa_chain.run(query)
            
            return {
                "success": True,
                "message": "Response generated successfully",
                "response": response,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "response": "I'm sorry, I encountered an error while processing your question. Please try again."
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "initialized": self.is_initialized,
            "vectorstore_loaded": self.vectorstore is not None,
            "llm_loaded": self.llm is not None,
            "vector_db_path": "gov_water_index"
        }

# Global instance
chatbot_service = ChatbotService()