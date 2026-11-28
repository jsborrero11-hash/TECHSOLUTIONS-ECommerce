param(
    [Parameter(Mandatory=$true)][string]$UsuarioMigracion,
    [Parameter(Mandatory=$true)][string]$ArchivoDpapi,
    [string]$Mysql = 'C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe'
)
$ErrorActionPreference = 'Stop'
$ErrorView = 'CategoryView'
if (Test-Path -LiteralPath $ArchivoDpapi) { throw 'El destino protegido ya existe.' }
$argumentos = @('--no-defaults','--protocol=TCP','--host=127.0.0.1','--port=3306',
    "--user=$UsuarioMigracion",'--batch','--skip-column-names')
$identidad = "SELECT CONCAT(@@port,':',SCHEMA_NAME) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='techsolutions_test'" |
    & $Mysql @argumentos
if ($LASTEXITCODE -ne 0 -or $identidad -ne '3306:techsolutions_test') { throw 'Instancia QA sin verificar.' }
$existe = "SELECT COUNT(*) FROM mysql.user WHERE User='techsolutions_qa84'" | & $Mysql @argumentos
if ($LASTEXITCODE -ne 0 -or $existe -ne '0') { throw 'La cuenta existe o no pudo verificarse.' }

$bytes = New-Object byte[] 32
$generador = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $generador.GetBytes($bytes) } finally { $generador.Dispose() }
$clave = [BitConverter]::ToString($bytes).Replace('-','')
if ($clave -notmatch '\A[0-9A-F]{64}\z') { throw 'No se genero una clave valida.' }
$protegida = ConvertTo-SecureString -String $clave -AsPlainText -Force | ConvertFrom-SecureString
$protegida | Set-Content -LiteralPath $ArchivoDpapi -Encoding ascii
try {
    $sql = "CREATE USER 'techsolutions_qa84'@'127.0.0.1' IDENTIFIED BY '$clave'; " +
        "GRANT SELECT, INSERT, UPDATE, DELETE ON techsolutions_test.* TO 'techsolutions_qa84'@'127.0.0.1';"
    $sql | & $Mysql @argumentos 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Aprovisionamiento incompleto. Conserva el archivo protegido y revisa la cuenta.' }
} finally {
    Remove-Variable sql,clave -ErrorAction SilentlyContinue
    [Array]::Clear($bytes, 0, $bytes.Length)
}
'Cuenta operativa QA aprovisionada.'
