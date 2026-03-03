from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Sinergya"
    DEBUG: bool = True
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DB_USER: str = "postgres"
    DB_PASSWORD: str
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5432
    DB_NAME: str = "sinergya"

    # Supabase Storage
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    STORAGE_BUCKET: str = "sinergya-media"

    
    
    @property
    def DATABASE_URL(self) -> str:
     return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?prepared_statement_cache_size=0"

    class Config:
        env_file = ".env"

settings = Settings()
