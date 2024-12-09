from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://mongodb:27017"
    REDIS_URL: str = "redis://redis"
    RAFFLE_DURATION_MINUTES: int = 2
    MAIN_WINNER_PERCENTAGE: float = 0.70
    DEV_TEAM_PERCENTAGE: float = 0.05
    LUCKY_LIQ_POOL_PERCENTAGE: float = 0.05
    SECONDARY_WINNERS_PERCENTAGE: float = 0.2 # - 4%
    SLEEP_DURATION_AFTER_EACH_RAFFLE_FINISH: int = 30
    BROADCAST_INTERVAL:int = 5 #seconds


    JWT_SECRET_KEY: str = "your-secret-key-move-to-env"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 360

    REFERRAL_UPDATE_PER_TICKET_BUY: float = 0.1

    TELEGRAM_BOT_TOKEN:str = "5938982333:AAH8vafdqHtFCIctZTmhdaZG2Notq3CnA_4"

    TICKET_PRICE: float = 0.15

settings = Settings()