import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("ERROR CRÍTICO: La variable de entorno 'DATABASE_URL' no está configurada.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()