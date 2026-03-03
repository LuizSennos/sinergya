from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str

    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    STORAGE_BUCKET: str

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:"
            f"{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"


settings = Settings()
