# DataChance CO 🇨🇴

> Plataforma web Fintech de inteligencia probabilística y análisis estadístico e híbrido de loterías, chances y Baloto en Colombia.

---

## 🚀 Stack Tecnológico

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Canvas Confetti.
* **Backend:** NestJS, TypeScript, Prisma ORM, SQLite, @nestjs/schedule (Cron jobs en zona horaria `America/Bogota`), Cheerio, Axios.
* **Estilo Visual:** Dark Mode Fintech (`#0B0F19`, `#151C2C`), Glassmorphism con bordes sutiles, acentos verde esmeralda neón (`#10B981`) y dorado (`#F59E0B`).

---

## 🎯 Módulos y Funcionalidades

1. **Dashboard Principal:**
   * Filtros por categoría: *Chances Diarios*, *Loterías Tradicionales*, *Especiales (Súper Astro)* y *Baloto / Revancha*.
   * Filtro por jornada: *Mañana*, *Tarde*, *Noche* y buscador en tiempo real.
   * Tarjetas con 4 cifras, serie de 3 dígitos, signo zodiacal o 5 balotas + Superbalota dorada con acumulado en millones.
2. **Analizador Estadístico Visual:**
   * Termómetro de números calientes y fríos.
   * Matriz de calor posicional (probabilidad 0-9 para 1ª, 2ª, 3ª y 4ª cifra).
   * Gráfico Donut de frecuencia zodiacal para Súper Astro.
   * Mapa interactivo de frecuencia de balotas (01 al 43) y ranking histórico de la Superbalota (01 al 16).
3. **Generador Híbrido ("IA Predictor & Pirámide"):**
   * **Modo 100% Estadístico:** Frecuencias de SQLite con balance par/impar.
   * **Pirámide Numerológica Interactiva:** Reducción modular (módulo 10) con fecha dinámica, extrayendo diagonales y cúspide.
   * **Fusión Inteligente:** Cruce de la pirámide con dígitos calientes de SQLite y cálculo de confianza.
   * Botón de copiado con confeti visual.
4. **Calculadora Oficial de Premios Colombia:**
   * Soporte para todos los **Chances Tradicionales** (4.500x directo, 208x combinado, 400x pata, 50x uña según Ley 643/2001).
   * Soporte para **Súper Astro** (42.000x en 4 cifras + signo, 1.000x en 3 cifras, 100x en 2 cifras, con opción de 1 signo o los 12 signos del zodiaco).
   * Retención en la fuente automática del 20% cuando el premio supera las 48 UVT (~$2.390.352 COP).
5. **Aviso Legal:** Plataforma estrictamente estadística e informativa; promueve el juego responsable.

---

## 💻 Puesta en Marcha Local

### Backend (NestJS + Prisma + SQLite)
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start
# Servidor escuchando en http://localhost:3001/api
```

### Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
# Servidor disponible en http://localhost:5173
```
