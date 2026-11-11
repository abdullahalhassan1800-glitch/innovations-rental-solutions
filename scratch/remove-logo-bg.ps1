Add-Type -AssemblyName System.Drawing

$in   = "D:\realestate\public\images\logo-dark.png"
$out  = "D:\realestate\public\images\logo-dark.png"
$tmp  = "D:\realestate\scratch\logo-dark.new.png"
$bak  = "D:\realestate\scratch\logo-backup\logo-dark.png.original"

$src = [System.Drawing.Bitmap]::FromFile($in)
$w = [int]$src.Width
$h = [int]$src.Height
Write-Output "Source: $w x $h"

# --- Step 1: estimate background gradient plane from outer border ring ---
$pad = 15
$border = @()
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        if ($x -lt $pad -or $x -ge $w-$pad -or $y -lt $pad -or $y -ge $h-$pad) {
            $p = $src.GetPixel($x, $y)
            $mx = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
            $border += @{x=$x; y=$y; v=[double]$mx}
        }
    }
}
$n = $border.Count
$sx=$sy=$sv=$sxx=$syy=$sxy=$sxv=$syv = 0.0
foreach ($s in $border) {
    $sx += $s.x; $sy += $s.y; $sv += $s.v
    $sxx += $s.x*$s.x; $syy += $s.y*$s.y; $sxy += $s.x*$s.y
    $sxv += $s.x*$s.v; $syv += $s.y*$s.v
}
$det = $n*($sxx*$syy - $sxy*$sxy) - $sx*($sx*$syy - $sxy*$sy) + $sy*($sx*$sxy - $sxx*$sy)
$c0 = ($sv*($sxx*$syy - $sxy*$sxy) - $sx*($sxv*$syy - $sxy*$syv) + $sy*($sxv*$sxy - $sxx*$syv)) / $det
$c1 = ($n*($sxv*$syy - $sxy*$syv) - $sv*($sx*$syy - $sxy*$sy) + $sy*($sx*$syv - $sxv*$sy)) / $det
$c2 = ($n*($sxx*$syv - $sxv*$sxy) - $sx*($sv*$sxy - $sxv*$sy) + $sy*($sv*$sxx - $sx*$sxv)) / $det
Write-Output "Background plane: v = $([Math]::Round($c0,2)) + $([Math]::Round($c1,6))*x + $([Math]::Round($c2,6))*y  (samples=$n)"

# --- Step 2: create destination with alpha ---
$dst = New-Object System.Drawing.Bitmap($w, $h)
$trans=$opaq=$part = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $src.GetPixel($x, $y)
        $mx = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        $bg = $c0 + $c1 * $x + $c2 * $y
        $excess = $mx - $bg
        $a = [Math]::Max(0, [Math]::Min(255, [int](($excess - 30) / 120 * 255)))
        $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $p.R, $p.G, $p.B))
        if ($a -eq 0) { $trans++ }
        elseif ($a -eq 255) { $opaq++ }
        else { $part++ }
    }
    if ($y % 100 -eq 0) { Write-Output "Row $y / $h" }
}
Write-Output "transparent=$trans  opaque=$opaq  partial=$part"

# --- Step 3: save to temp file ---
$dst.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
$src.Dispose()
Write-Output "Saved temp: $tmp"

# --- Step 4: verify temp file ---
$v = [System.Drawing.Bitmap]::FromFile($tmp)
$vw = [int]$v.Width; $vh = [int]$v.Height
Write-Output "Temp: $vw x $vh $($v.PixelFormat)"
$cx1 = $vw - 1; $cy1 = $vh - 1; $cmx = [int]($vw/2); $cmy = [int]($vh/2)
$pts = @(@(0,0),@($cx1,0),@(0,$cy1),@($cx1,$cy1),@($cmx,$cmy),@(5,5),@(20,20))
foreach ($pt in $pts) {
    $p = $v.GetPixel($pt[0], $pt[1])
    Write-Output "  ($($pt[0]),$($pt[1])) A=$($p.A) RGB=($($p.R),$($p.G),$($p.B))"
}
$v.Dispose()

# --- Step 5: replace original ---
if (Test-Path $bak) { Remove-Item $bak -Force }
Copy-Item $in $bak -Force
Copy-Item $tmp $out -Force
Write-Output "Replaced original. Backup at: $bak"

# --- Step 6: verify final ---
$f = [System.Drawing.Bitmap]::FromFile($out)
Write-Output "Final: $([int]$f.Width) x $([int]$f.Height) $($f.PixelFormat)"
$p1 = $f.GetPixel(0,0); $p2 = $f.GetPixel([int]($f.Width/2), [int]($f.Height/2))
Write-Output "  Corner A=$($p1.A)  Center A=$($p2.A)"
$f.Dispose()
