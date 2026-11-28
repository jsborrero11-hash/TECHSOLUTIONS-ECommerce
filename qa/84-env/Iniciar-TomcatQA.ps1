param(
    [string]$TomcatHome = 'C:/tomcat/apache-tomcat-10.1.61',
    [string]$Base = (Join-Path ([IO.Path]::GetTempPath()) 'techsolutions-84-qa')
)
$ErrorActionPreference = 'Stop'
if ($env:TECHSOLUTIONS_DB_HOST -ne '127.0.0.1' -or $env:TECHSOLUTIONS_DB_PORT -ne '3306' -or
    $env:TECHSOLUTIONS_DB_NAME -ne 'techsolutions_test' -or !$env:TECHSOLUTIONS_DB_USER -or
    !$env:TECHSOLUTIONS_DB_PASSWORD -or !$env:TECHSOLUTIONS_CART_SIGNING_KEY) {
    throw 'Configura el entorno local de QA y la clave de carrito antes de iniciar Tomcat.'
}

if (netstat -ano -p tcp | Select-String ':8080\s+\S+\s+(LISTENING|ESCUCHANDO)') {
    throw 'El puerto 8080 esta ocupado. Deten el servidor de desarrollo identificado primero.'
}
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$webapps = Join-Path $Base 'webapps'
if (Test-Path -LiteralPath $Base) {
    throw 'Indica una base temporal nueva para preservar despliegues existentes.'
}
$war = Join-Path $repo 'backend-java/target/backend-java-1.0-SNAPSHOT.war'
if (!(Test-Path -LiteralPath $war)) { throw 'Empaqueta el WAR primero.' }
$clases = Join-Path $repo 'backend-java/target/backend-java-1.0-SNAPSHOT/WEB-INF'
$jdbc = & java -cp "$clases/classes;$clases/lib/*" com.techsolutions.ecommerce.conexion.PruebaConexion
if ($LASTEXITCODE -ne 0 -or $jdbc -notcontains 'Base de datos: techsolutions_test') {
    throw 'La conexion JDBC no selecciono techsolutions_test.'
}
'JDBC confirmado: techsolutions_test'
New-Item -ItemType Directory -Path $Base | Out-Null
foreach ($dir in 'conf','logs','temp','work','webapps') {
    New-Item -ItemType Directory -Path (Join-Path $Base $dir) | Out-Null
}
foreach ($file in 'catalina.properties','context.xml','logging.properties','web.xml') {
    Copy-Item (Join-Path $TomcatHome "conf/$file") (Join-Path $Base "conf/$file")
}
@'
<Server port="-1">
  <Service name="Catalina">
    <Connector address="127.0.0.1" port="8080" protocol="HTTP/1.1" />
    <Engine name="Catalina" defaultHost="localhost">
      <Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="false" />
    </Engine>
  </Service>
</Server>
'@ | Set-Content -LiteralPath (Join-Path $Base 'conf/server.xml') -Encoding ascii
$env:CATALINA_HOME = $TomcatHome
$env:CATALINA_BASE = $Base
Copy-Item -LiteralPath $war -Destination (Join-Path $webapps 'techsolutions-84.war')
$proceso = Start-Process -FilePath (Join-Path $TomcatHome 'bin/catalina.bat') -ArgumentList 'run' -WorkingDirectory $Base -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $Base 'logs/stdout.log') -RedirectStandardError (Join-Path $Base 'logs/stderr.log')
"CATALINA_BASE=$Base launcher=$($proceso.Id)"
