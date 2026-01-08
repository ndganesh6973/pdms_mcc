import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Define your credentials
user = 'root'
password = 'pass123'  # <--- Put your actual password here
host = 'localhost'
database = 'mcc_pdms'

# 2. Encode the password to handle special characters (like @ or #)
safe_password = urllib.parse.quote_plus(password)

# 3. Create the MySQL URL string
# Format: mysql+pymysql://username:password@host/database
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{safe_password}@{host}/{database}"

# 4. Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()