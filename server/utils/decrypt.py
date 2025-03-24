from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import dotenv
import os

dotenv.load_dotenv()

def decrypt_data(encrypted_data):
    if not encrypted_data:
        return

    try:
        hex_key = os.getenv("ENCRYPTION_KEY")
        hex_iv = os.getenv("ENCRYPTION_IV")

        key = bytes.fromhex(hex_key)
        iv = bytes.fromhex(hex_iv)

        encrypted_data = base64.b64decode(encrypted_data)

        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )

        decryptor = cipher.decryptor()

        decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

        # remove PKCS#7 padding
        padding_value = decrypted_data[-1]

        if padding_value > 16:
            raise ValueError("Invalid padding...")
        
        # verify padding is correct
        for i in range(1, padding_value + 1):
            if decrypted_data[-i] != padding_value:
                raise ValueError("Invalid padding...")
            
        # remove padding
        unpadded_data = decrypted_data[:-padding_value]

        # convert to string
        plain_text = unpadded_data.decode("utf-8")

        return plain_text
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}")
