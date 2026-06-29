from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# LOCAL: Modifica con tu usuario y contraseña local de Postgres si vas a probar en tu máquina primero.
# SUPABASE: Cuando estés listo, reemplazarás este string por el "Connection String" de Supabase.
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres.ygqbkvwcpqayybooyvsm:Baloto2026data@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
)

# El engine se encarga de hablar el lenguaje de Postgres
engine = create_engine(DATABASE_URL)

# Cada sesión es una transacción con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la que heredarán nuestros modelos de tablas SQL
Base = declarative_base()

# Dependencia para FastAPI: Abre la base de datos por petición y la cierra al terminar
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()