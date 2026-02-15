---
description: Compartir el sitio con una URL temporal usando Cloudflare Tunnel
---

# Compartir sitio con URL temporal

Usa este workflow para generar una URL pública temporal que cualquier persona pueda abrir para ver el sitio.

## Requisitos previos
- `cloudflared` instalado (`winget install Cloudflare.cloudflared`)

## Pasos

// turbo-all

1. Limpiar procesos previos, compilar, levantar servidor y túnel, y mostrar la URL:
```powershell
# Limpiar procesos previos
Get-Process -Name "node","cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Compilar
npm run build 2>&1 | Select-Object -Last 3

# Levantar servidor estático en background (npx serve en vez de Astro dev porque Vite bloquea hosts externos)
$serveJob = Start-Process -FilePath "npx" -ArgumentList "-y","serve","dist","-l","4321" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

# Lanzar cloudflared y capturar la URL del túnel desde su log
$logFile = "$env:TEMP\cloudflared_tunnel.log"
Remove-Item $logFile -ErrorAction SilentlyContinue
$cfProcess = Start-Process -FilePath 'C:\Users\V\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe' -ArgumentList 'tunnel','--url','http://localhost:4321' -RedirectStandardError $logFile -PassThru -WindowStyle Hidden

# Esperar hasta 30s a que aparezca la URL en el log
$url = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $match = Select-String -Path $logFile -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches | Select-Object -First 1
        if ($match) {
            $url = $match.Matches[0].Value
            break
        }
    }
}

if ($url) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  TUNNEL ACTIVO" -ForegroundColor Green
    Write-Host "  $url" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Comparte esta URL. Funciona mientras esta terminal este abierta."
    Write-Host "Para detener: Get-Process -Name 'node','cloudflared' | Stop-Process -Force"
} else {
    Write-Host "ERROR: No se pudo obtener la URL del tunel en 30 segundos." -ForegroundColor Red
    Write-Host "Revisa el log: $logFile"
    Get-Content $logFile | Select-Object -Last 10
}
```

## Notas
- La URL funciona **solo mientras los procesos estén corriendo**
- No requiere cuenta de Cloudflare
- Si hay cambios en el código, detener todo y volver a ejecutar el paso 1
- Para detener: `Get-Process -Name "node","cloudflared" | Stop-Process -Force`
