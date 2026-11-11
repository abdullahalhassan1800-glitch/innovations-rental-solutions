Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('D:\realestate\public\images\logo-dark.png')
$w = [int]$src.Width
$h = [int]$src.Height
Write-Output "Source: $w x $h"
$dst = New-Object System.Drawing.Bitmap($w, $h)
Write-Output "Dest created: $($dst.PixelFormat)"
$p = $dst.GetPixel(0,0)
Write-Output "Pixel(0,0): A=$($p.A) R=$($p.R) G=$($p.G) B=$($p.B)"
$src.Dispose()
$dst.Dispose()
