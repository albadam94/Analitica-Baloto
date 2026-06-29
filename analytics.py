import pandas as pd
import numpy as np
import random
from typing import List, Dict, Any

class BalotoEngine:
    def __init__(self):
        # Base de datos simulada de sorteos históricos para entrenar el motor estadístico
        # En el siguiente paso la alimentaremos desde un archivo CSV/JSON real
        self.historico = [
            {"n1": 15, "n2": 4, "n3": 10, "n4": 2, "n5": 40, "sb": 10},
            {"n1": 15, "n2": 8, "n3": 12, "n4": 22, "n5": 41, "sb": 5},
            {"n1": 3, "n2": 4, "n3": 10, "n4": 35, "n5": 40, "sb": 10},
            {"n1": 1, "n2": 10, "n3": 15, "n4": 28, "n5": 33, "sb": 14},
            {"n1": 4, "n2": 14, "n3": 21, "n4": 39, "n5": 43, "sb": 10},
        ]
        self.df = pd.DataFrame(self.historico)
        
    def obtener_numeros_mas_activos(self) -> List[int]:
        """Calcula los 6 números que más veces han salido en el histórico"""
        if self.df.empty:
            return [15, 4, 10, 2, 40, 10]
            
        # Unimos las columnas de los números regulares para contar su frecuencia total
        todos_los_numeros = pd.concat([self.df['n1'], self.df['n2'], self.df['n3'], self.df['n4'], self.df['n5']])
        top_5_regulares = todos_los_numeros.value_counts().index.tolist()[:5]
        
        # Encontramos la súper balota más común
        top_sb = self.df['sb'].value_counts().index.tolist()[0]
        
        # Si no hay suficientes datos únicos, rellenamos con valores por defecto válidos
        while len(top_5_regulares) < 5:
            num_aleatorio = random.randint(1, 43)
            if num_aleatorio not in top_5_regulares:
                top_5_regulares.append(num_aleatorio)
                
        return sorted(top_5_regulares) + [top_sb]
    
    def actualizar_datos(self, nuevo_historico: List[Dict[str, int]]):
        """Re-entrena el DataFrame interno con los registros reales de PostgreSQL"""
        if nuevo_historico:
            self.historico = nuevo_historico
            self.df = pd.DataFrame(self.historico)

    def generar_combinacion_inteligente(self) -> Dict[str, str]:
        """
        Genera una predicción basada en pesos estadísticos de coaparición y frecuencia.
        Aplica distribución de probabilidad acumulada para simular el sorteo con IA.
        """
        # 1. Definir pesos base para todos los números posibles del Baloto (1 al 43)
        pesos_regulares = np.ones(43) # Peso base equitativo = 1
        
        if not self.df.empty:
            # Aumentamos el peso de los números que han salido históricamente para simular 'tendencia'
            todos_los_numeros = pd.concat([self.df['n1'], self.df['n2'], self.df['n3'], self.df['n4'], self.df['n5']])
            frecuencias = todos_los_numeros.value_counts()
            for num, freq in frecuencias.items():
                if 1 <= num <= 43:
                    pesos_regulares[num - 1] += freq * 1.5 # Multiplicador de peso por apariciones

        # Convertir pesos a probabilidades relativas distribuidas
        probabilidades = pesos_regulares / pesos_regulares.sum()
        
        # Selección inteligente de 5 números únicos sin repetición basados en la distribución probabilística
        numeros_seleccionados = sorted(np.random.choice(range(1, 44), size=5, replace=False, p=probabilidades))
        
        # 2. Definir pesos estadísticos para la Súper Balota (1 al 16)
        pesos_sb = np.ones(16)
        if not self.df.empty:
            frecuencias_sb = self.df['sb'].value_counts()
            for num, freq in frecuencias_sb.items():
                if 1 <= num <= 16:
                    pesos_sb[num - 1] += freq * 2.0
                    
        probabilidades_sb = pesos_sb / pesos_sb.sum()
        sb_seleccionada = int(np.random.choice(range(1, 17), p=probabilidades_sb))

        return {
            "n1": str(numeros_seleccionados[0]).zfill(2),
            "n2": str(numeros_seleccionados[1]).zfill(2),
            "n3": str(numeros_seleccionados[2]).zfill(2),
            "n4": str(numeros_seleccionados[3]).zfill(2),
            "n5": str(numeros_seleccionados[4]).zfill(2),
            "sb": str(sb_seleccionada).zfill(2)
        }