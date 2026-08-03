' ========================================
' CREAR ACCESO DIRECTO - PHASE 5A
' ========================================
' Este script crea un acceso directo en tu escritorio
' para acceder al portal Phase 5A
'
' Uso: Doble-click en este archivo
' ========================================

Set objShell = CreateObject("WScript.Shell")

' Obtener la ruta del escritorio
strDesktop = objShell.SpecialFolders("Desktop")

' Crear el acceso directo
Set objLink = objShell.CreateShortcut(strDesktop & "\Phase 5A - Portal Privado.lnk")

' Configurar el acceso directo para abrir la URL
objLink.TargetPath = "http://localhost:3000/knowledge-system/phase5a-private?token=phase5a-victor-2026"

' Configurar para abrir en el navegador por defecto (Chrome, Edge, etc.)
objLink.Arguments = ""
objLink.Description = "PHASE 5A - Portal Privado para Victor"
objLink.IconLocation = "C:\Windows\System32\url.dll,0"

' Guardar
objLink.Save

' Mostrar confirmación
MsgBox "✓ Acceso directo creado en el escritorio" & vbCrLf & vbCrLf & _
        "Nombre: Phase 5A - Portal Privado.lnk" & vbCrLf & _
        "Ubicación: " & strDesktop & vbCrLf & vbCrLf & _
        "Ahora puedes hacer doble-click para abrir el portal", , _
        "PHASE 5A - Acceso Directo Creado"
