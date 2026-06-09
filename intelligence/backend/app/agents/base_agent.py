import logging
from ..config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.has_llm = bool(self.api_key and len(self.api_key.strip()) > 5)
        self.llm = None
        
        if self.has_llm:
            try:
                # Try loading the OpenAI LangChain integration
                try:
                    from langchain_openai import ChatOpenAI
                    self.llm = ChatOpenAI(api_key=self.api_key, model="gpt-4-turbo", temperature=0.2)
                    logger.info("Initialized OpenAI ChatOpenAI agent wrapper using langchain_openai.")
                except ImportError:
                    from langchain_community.chat_models import ChatOpenAI
                    self.llm = ChatOpenAI(openai_api_key=self.api_key, model_name="gpt-4", temperature=0.2)
                    logger.info("Initialized OpenAI ChatOpenAI agent wrapper using langchain_community.")
            except Exception as e:
                logger.warning(f"Failed to initialize ChatOpenAI: {e}. Falling back to mock mode.")
                self.has_llm = False
        else:
            logger.info("No valid OpenAI API key detected. All agent modules will run in fallback demonstration mode.")

    def run_prompt(self, prompt: str, system_instruction: str = "You are a professional AI career advisor.") -> str:
        if self.has_llm and self.llm:
            try:
                from langchain.schema import SystemMessage, HumanMessage
                messages = [
                    SystemMessage(content=system_instruction),
                    HumanMessage(content=prompt)
                ]
                response = self.llm.invoke(messages)
                return response.content
            except Exception as e:
                logger.error(f"OpenAI invocation error: {e}. Falling back to mock generator.")
        return None
