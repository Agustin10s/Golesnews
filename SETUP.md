# GolesNews — Next.js — Guía de Setup

## 1. Obtener la API Key de api-football.com

1. Ir a [dashboard.api-football.com](https://dashboard.api-football.com/)
2. Crear cuenta (plan gratuito: 100 requests/día)
3. Copiar la API key

## 2. Configurar variables de entorno

Editar el archivo `.env.local`:

```env
# API Football (OBLIGATORIO para datos reales)
FOOTBALL_API_KEY=tu_key_aqui

# URL del backend CMS Flask (para noticias)
CMS_API_URL=https://tu-backend.railway.app
```

## 3. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 4. Deploy en Railway

### Frontend (este proyecto Next.js):
1. Subir a un repo de GitHub
2. Crear nuevo proyecto en Railway desde GitHub
3. Agregar las variables de entorno:
   - `FOOTBALL_API_KEY` = tu key
   - `CMS_API_URL` = URL del backend Flask
4. Railway detecta Next.js automáticamente

### Backend CMS (el Flask original):
- Mantenerlo deployado por separado en Railway
- Apunta a él con `CMS_API_URL`

## 5. APIs disponibles

| Endpoint | Descripción |
|----------|-------------|
| `/api/football/live` | Partidos en vivo (sin caché) |
| `/api/football/fixtures?section=all-today` | Partidos de hoy |
| `/api/football/fixtures?league=128&next=10` | Próximos 10 partidos de la LPF |
| `/api/football/standings?league=128` | Tabla de la LPF |
| `/api/football/scorers?league=128` | Goleadores de la LPF |
| `/api/news` | Noticias del CMS Flask |

## 6. IDs de ligas usadas

| Liga | ID |
|------|----|
| Liga Profesional Argentina | 128 |
| Copa Argentina | 130 |
| Premier League | 39 |
| La Liga | 140 |
| Champions League | 2 |
| Copa Libertadores | 13 |
| Copa Sudamericana | 11 |
| Mundial 2026 | 1 |
| Serie A | 135 |
| Bundesliga | 78 |

## 7. Actualización automática

- Partidos en vivo: **cada 60 segundos** (cliente)
- Fixtures/tablas: caché de 5-30 minutos (servidor)
- Noticias: caché de 2 minutos

No necesitás hacer nada manual. Todo se actualiza solo.

## 8. CMS de noticias

El CMS de Flask sigue funcionando en `/cms`. Las noticias que publiques ahí aparecen automáticamente en el portal.
