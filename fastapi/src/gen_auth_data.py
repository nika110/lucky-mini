import hmac
import hashlib
import json
import time
from urllib.parse import urlencode

def generate_valid_auth_data(bot_token: str, telegram_id: str):
    # Create the user data
    user_data = {
        "id": int(telegram_id),
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "language_code": "en"
    }

    # Current timestamp
    auth_date = int(time.time())

    # Create the initial data
    init_data = {
        "user": json.dumps(user_data),
        "auth_date": auth_date
    }

    # Sort the data
    sorted_data = dict(sorted(init_data.items()))

    # Create data check string
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted_data.items())

    # Generate secret key
    secret = hmac.new(
        bot_token.encode(),
        "WebAppData".encode(),
        hashlib.sha256
    ).digest()

    # Calculate hash
    hash_value = hmac.new(
        secret,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()

    # Add hash to data
    init_data["hash"] = hash_value

    # Create URL-encoded string
    auth_string = urlencode(init_data)

    return {
        "telegram_id": telegram_id,
        "telegram_auth_code": auth_string,
    }

# Generate test data
BOT_TOKEN = "YOUR_BOT_TOKEN"  # Use your actual bot token
telegram_id = "123456789"

test_data = generate_valid_auth_data(BOT_TOKEN, telegram_id)
print(json.dumps(test_data, indent=2))
