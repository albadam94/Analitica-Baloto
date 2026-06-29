from sqlalchemy import Column, Integer, String, Date
from database import Base

class SorteoSQL(Base):
    __tablename__ = "sorteos"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, unique=True, index=True, nullable=False)
    
    # Datos de Baloto Regular
    b_n1 = Column(Integer, nullable=False)
    b_n2 = Column(Integer, nullable=False)
    b_n3 = Column(Integer, nullable=False)
    b_n4 = Column(Integer, nullable=False)
    b_n5 = Column(Integer, nullable=False)
    b_sb = Column(Integer, nullable=False)
    
    # Datos de Revancha
    r_n1 = Column(Integer, nullable=False)
    r_n2 = Column(Integer, nullable=False)
    r_n3 = Column(Integer, nullable=False)
    r_n4 = Column(Integer, nullable=False)
    r_n5 = Column(Integer, nullable=False)
    r_sb = Column(Integer, nullable=False)