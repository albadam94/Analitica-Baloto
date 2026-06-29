from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from datetime import date
from sqlalchemy.orm import Session

# Importamos nuestros módulos locales
from database import engine, Base, get_db
import models
from analytics import BalotoEngine

# Creamos las tablas en PostgreSQL automáticamente si no existen al arrancar
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Baloto Analytics API con PostgreSQL", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine_analytics = BalotoEngine()

# --- MODELOS DE ENTRADA (VALIDACIONES PYDANTIC) ---
class SorteoData(BaseModel):
    n1: int = Field(..., ge=1, le=43)
    n2: int = Field(..., ge=1, le=43)
    n3: int = Field(..., ge=1, le=43)
    n4: int = Field(..., ge=1, le=43)
    n5: int = Field(..., ge=1, le=43)
    sb: int = Field(..., ge=1, le=16)

    @model_validator(mode='after')
    def verificar_numeros_unicos(self):
        numeros = [self.n1, self.n2, self.n3, self.n4, self.n5]
        if len(set(numeros)) != 5:
            raise ValueError("Las 5 balotas principales deben ser números únicos.")
        return self

class SorteoIngreso(BaseModel):
    fecha: date
    baloto: SorteoData
    revancha: SorteoData


# --- ENDPOINTS CONECTADOS A POSTGRESQL ---

@app.get("/api/sorteos/{fecha}")
def obtener_sorteo_por_fecha(fecha: str, db: Session = Depends(get_db)):
    try:
        fecha_date = date.fromisoformat(fecha)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use AAAA-MM-DD")

    # 1. Consultamos el sorteo directamente en la base de datos SQL
    sorteo = db.query(models.SorteoSQL).filter(models.SorteoSQL.fecha == fecha_date).first()
    
    # 2. Obtenemos el total de sorteos jugados acumulados en Postgres
    total_sorteos = db.query(models.SorteoSQL).count()
    
    # 3. Traemos todo el histórico de la BD para recalcular el Top de números en caliente
    todos_los_sorteos = db.query(models.SorteoSQL).all()
    historico_formateado = [
        {"n1": s.b_n1, "n2": s.b_n2, "n3": s.b_n3, "n4": s.b_n4, "n5": s.b_n5, "sb": s.b_sb}
        for s in todos_los_sorteos
    ]
    
    # Sincronizamos el motor con los datos reales de la BD
    engine_analytics.actualizar_datos(historico_formateado)
    top_numeros = engine_analytics.obtener_numeros_mas_activos()
    top_numeros_str = [str(n).zfill(2) for n in top_numeros]

    if sorteo:
        return {
            "sorteos_jugados": total_sorteos,
            "baloto": {"n1": sorteo.b_n1, "n2": sorteo.b_n2, "n3": sorteo.b_n3, "n4": sorteo.b_n4, "n5": sorteo.b_n5, "sb": sorteo.b_sb},
            "revancha": {"n1": sorteo.r_n1, "n2": sorteo.r_n2, "n3": sorteo.r_n3, "n4": sorteo.r_n4, "n5": sorteo.r_n5, "sb": sorteo.r_sb},
            "numeros_activos": top_numeros_str
        }
    
    return {
        "sorteos_jugados": total_sorteos,
        "baloto": None,
        "revancha": None,
        "numeros_activos": top_numeros_str
    }


@app.post("/api/sorteos/ingresar")
def ingresar_nuevo_sorteo(data: SorteoIngreso, db: Session = Depends(get_db)):
    # Verificamos si ya existe un sorteo guardado para esa fecha para no duplicarlo
    sorteo_existente = db.query(models.SorteoSQL).filter(models.SorteoSQL.fecha == data.fecha).first()
    
    if sorteo_existente:
        # Si ya existe, lo actualizamos con los nuevos datos ingresados
        sorteo_existente.b_n1 = data.baloto.n1
        sorteo_existente.b_n2 = data.baloto.n2
        sorteo_existente.b_n3 = data.baloto.n3
        sorteo_existente.b_n4 = data.baloto.n4
        sorteo_existente.b_n5 = data.baloto.n5
        sorteo_existente.b_sb = data.baloto.sb
        sorteo_existente.r_n1 = data.revancha.n1
        sorteo_existente.r_n2 = data.revancha.n2
        sorteo_existente.r_n3 = data.revancha.n3
        sorteo_existente.r_n4 = data.revancha.n4
        sorteo_existente.r_n5 = data.revancha.n5
        sorteo_existente.r_sb = data.revancha.sb
    else:
        # Si es nuevo, creamos el registro mapeado hacia la tabla SQL
        nuevo_sorteo = models.SorteoSQL(
            fecha=data.fecha,
            b_n1=data.baloto.n1, b_n2=data.baloto.n2, b_n3=data.baloto.n3, b_n4=data.baloto.n4, b_n5=data.baloto.n5, b_sb=data.baloto.sb,
            r_n1=data.revancha.n1, r_n2=data.revancha.n2, r_n3=data.revancha.n3, r_n4=data.revancha.n4, r_n5=data.revancha.n5, r_sb=data.revancha.sb
        )
        db.add(nuevo_sorteo)
        
    db.commit()
    return {"status": "success", "message": "Datos guardados de forma persistente en PostgreSQL"}


@app.get("/api/predict")
def generar_prediccion(db: Session = Depends(get_db)):
    # Sincronizamos activamente con la base de datos antes de calcular las probabilidades distribuidas
    todos_los_sorteos = db.query(models.SorteoSQL).all()
    historico_formateado = [
        {"n1": s.b_n1, "n2": s.b_n2, "n3": s.b_n3, "n4": s.b_n4, "n5": s.b_n5, "sb": s.b_sb}
        for s in todos_los_sorteos
    ]
    engine_analytics.actualizar_datos(historico_formateado)
    return engine_analytics.generar_combinacion_inteligente()