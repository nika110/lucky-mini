from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://mongodb:27017"
    REDIS_URL: str = "redis://redis"
    RAFFLE_DURATION_MINUTES: int = 20
    MAIN_WINNER_PERCENTAGE: float = 0.70
    DEV_TEAM_PERCENTAGE: float = 0.05
    LUCKY_LIQ_POOL_PERCENTAGE: float = 0.05
    SECONDARY_WINNERS_PERCENTAGE: float = 0.2 # - 4%

    JWT_SECRET_KEY: str = "your-secret-key-move-to-env"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 360

settings = Settings()