# =====================================================
# update_footers.ps1
# Actualiza footers de TODOS los archivos del frontend
# para agregar links a Terminos/Privacidad + disclaimer
# "Comparador independiente"
# =====================================================
# USO: Colocar en C:\AppCompras\frontend\ y ejecutar:
#   .\update_footers.ps1
# =====================================================

$ErrorActionPreference = "Stop"

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "src\App.tsx")) {
    Write-Host "ERROR: Este script debe ejecutarse desde C:\AppCompras\frontend\" -ForegroundColor Red
    Write-Host "Ubicacion actual: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "===== Iniciando actualizacion de footers =====" -ForegroundColor Cyan

# ----- Crear backups primero -----
Write-Host "`n[1/3] Creando backups..." -ForegroundColor Yellow
$backupDir = "footer_backups_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$filesToBackup = @(
    "src\App.tsx",
    "public\login.html",
    "public\results.html",
    "public\infocompras.html",
    "public\results_super.html",
    "public\dashboard.html",
    "public\register.html"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $backupPath = Join-Path $backupDir (Split-Path $file -Leaf)
        Copy-Item $file $backupPath
        Write-Host "  Backup creado: $backupPath" -ForegroundColor Gray
    }
}

# ----- Funcion para reemplazar contenido -----
function Replace-InFile {
    param(
        [string]$Path,
        [string]$OldText,
        [string]$NewText,
        [string]$Description
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "  AVISO: $Path no existe, salto" -ForegroundColor Yellow
        return $false
    }
    
    $content = Get-Content $Path -Raw -Encoding UTF8
    
    if ($content -notlike "*$OldText*") {
        Write-Host "  AVISO: $Description no encontrado en $Path" -ForegroundColor Yellow
        return $false
    }
    
    $content = $content.Replace($OldText, $NewText)
    [System.IO.File]::WriteAllText((Resolve-Path $Path).Path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  OK: $Description en $Path" -ForegroundColor Green
    return $true
}

# ----- Aplicar cambios -----
Write-Host "`n[2/3] Aplicando cambios..." -ForegroundColor Yellow

# === App.tsx (los DOS footers tienen el mismo texto) ===
$appTsxOld = '🔒 ComprAhorro™ · Marca en proceso de registro · App en fase de pruebas</p>'
$appTsxNew = '🔒 ComprAhorro™ · Marca en proceso de registro · App en fase de pruebas · <a href="/terminos.html" style={{color:''inherit'',textDecoration:''underline''}}>Términos</a> · <a href="/privacidad.html" style={{color:''inherit'',textDecoration:''underline''}}>Privacidad</a><br/><span style={{opacity:0.7,fontSize:''10px''}}>Comparador independiente · No tenemos acuerdos con los comercios mostrados</span></p>'
Replace-InFile -Path "src\App.tsx" -OldText $appTsxOld -NewText $appTsxNew -Description "Footer App.tsx (2 instancias)"

# === login.html ===
$loginOld = '<footer class="footer">ComprAhorro 2026</footer>'
$loginNew = '<footer class="footer">ComprAhorro 2026 · <a href="/terminos.html" style="color:inherit;">Términos</a> · <a href="/privacidad.html" style="color:inherit;">Privacidad</a><br><small style="opacity:0.7;font-size:11px;">Comparador independiente · No tenemos acuerdos con los comercios mostrados</small></footer>'
Replace-InFile -Path "public\login.html" -OldText $loginOld -NewText $loginNew -Description "Footer login"

# === results.html (mismo footer que login) ===
Replace-InFile -Path "public\results.html" -OldText $loginOld -NewText $loginNew -Description "Footer results"

# === infocompras.html ===
$wazeOld = '<footer class="footer">ComprAhorro 2026 · El Waze del Shopping</footer>'
$wazeNew = '<footer class="footer">ComprAhorro 2026 · El Waze del Shopping · <a href="/terminos.html" style="color:inherit;">Términos</a> · <a href="/privacidad.html" style="color:inherit;">Privacidad</a><br><small style="opacity:0.7;font-size:11px;">Comparador independiente · No tenemos acuerdos con los comercios mostrados</small></footer>'
Replace-InFile -Path "public\infocompras.html" -OldText $wazeOld -NewText $wazeNew -Description "Footer infocompras"

# === results_super.html (mismo footer que infocompras) ===
Replace-InFile -Path "public\results_super.html" -OldText $wazeOld -NewText $wazeNew -Description "Footer results_super"

# === dashboard.html ===
$dashOld = '<footer class="footer">ComprAhorro · Compara, elige y ahorra 🐷<br><small style="opacity:0.7;font-size:11px;">🔒 Marca en proceso de registro · App en fase de pruebas</small></footer>'
$dashNew = '<footer class="footer">ComprAhorro · Compara, elige y ahorra 🐷 · <a href="/terminos.html" style="color:inherit;">Términos</a> · <a href="/privacidad.html" style="color:inherit;">Privacidad</a><br><small style="opacity:0.7;font-size:11px;">🔒 Marca en proceso de registro · App en fase de pruebas · Comparador independiente · No tenemos acuerdos con los comercios mostrados</small></footer>'
Replace-InFile -Path "public\dashboard.html" -OldText $dashOld -NewText $dashNew -Description "Footer dashboard"

# === register.html (agregar disclaimer al footer existente) ===
$regOld = '<footer class="footer">ComprAhorro 2026 · <a href="/terminos.html" style="color: var(--gray-text);">Términos</a> · <a href="/privacidad.html" style="color: var(--gray-text);">Privacidad</a></footer>'
$regNew = '<footer class="footer">ComprAhorro 2026 · <a href="/terminos.html" style="color: var(--gray-text);">Términos</a> · <a href="/privacidad.html" style="color: var(--gray-text);">Privacidad</a><br><small style="opacity:0.7;font-size:11px;">Comparador independiente · No tenemos acuerdos con los comercios mostrados</small></footer>'
Replace-InFile -Path "public\register.html" -OldText $regOld -NewText $regNew -Description "Footer register"

# ----- Resumen final -----
Write-Host "`n[3/3] Verificacion final..." -ForegroundColor Yellow
$expectedFiles = @("src\App.tsx", "public\login.html", "public\results.html", "public\infocompras.html", "public\results_super.html", "public\dashboard.html", "public\register.html")
$ok = 0
foreach ($f in $expectedFiles) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw -Encoding UTF8
        if ($c -like "*Comparador independiente*") {
            $ok++
            Write-Host "  OK: $f tiene disclaimer" -ForegroundColor Green
        } else {
            Write-Host "  FALTA: $f sin disclaimer" -ForegroundColor Red
        }
    }
}

Write-Host "`n===== Completado: $ok/$($expectedFiles.Count) archivos actualizados =====" -ForegroundColor Cyan
Write-Host "Backups en: $backupDir" -ForegroundColor Gray
Write-Host "`nProximo paso: cd a esta carpeta y ejecutar 'npm run build' para verificar." -ForegroundColor White
