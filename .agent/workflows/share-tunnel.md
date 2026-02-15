---
description: Compartir el sitio con una URL temporal usando Cloudflare Tunnel
---

# Compartir sitio con URL temporal

Usa este workflow para generar una URL pública temporal que cualquier persona pueda abrir para ver el sitio.

## Requisitos previos
- `cloudflared` instalado (`winget install Cloudflare.cloudflared`)
- Proyecto ya compilado (`npm run build`)

## Pasos

// turbo-all

1. Detener procesos previos de node y cloudflared:
```powershell
Get-Process -Name "node","cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
```

2. Servir los archivos estáticos compilados (carpeta `dist/`) en el puerto 4321:
```powershell
npx -y serve dist -l 4321
```
> **IMPORTANTE**: Se usa `npx serve` en vez de `npm run dev` porque el dev server de Vite/Astro bloquea hosts externos.

3. En otra terminal, crear el túnel de Cloudflare apuntando al puerto 4321:
```powershell
& 'C:\Users\V\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe' tunnel --url http://localhost:4321 2>&1
```

4. Copiar la URL generada (aparece como `https://xxxx.trycloudflare.com`) y compartirla.

## Notas
- La URL funciona **solo mientras ambas terminales estén abiertas**
- No requiere cuenta de Cloudflare
- Si hay cambios en el código, ejecutar `npm run build` y reiniciar el paso 2
- Para detener todo: cerrar ambas terminales o ejecutar el paso 1
