<#
  sac-report.ps1 - Smart App Control block report for this machine.

  Shows what Smart App Control actually blocked in the Windows CodeIntegrity
  log, and which process tried to load it. Use it right after the
  "Smart App Control has blocked part of this app" notification appears.

  Examples:
    powershell -ExecutionPolicy Bypass -File scripts\windows\sac-report.ps1
    powershell -ExecutionPolicy Bypass -File scripts\windows\sac-report.ps1 -Minutes 5
    powershell -ExecutionPolicy Bypass -File scripts\windows\sac-report.ps1 -All
#>

[CmdletBinding()]
param(
    [int]$Minutes = 30,
    [switch]$All
)

$ErrorActionPreference = 'Stop'
$logName = 'Microsoft-Windows-CodeIntegrity/Operational'

function Get-SacState {
    $key = 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy'
    if (-not (Test-Path $key)) { return 'unknown' }
    $value = (Get-ItemProperty $key -Name VerifiedAndReputablePolicyState -ErrorAction SilentlyContinue).VerifiedAndReputablePolicyState
    switch ($value) {
        0 { 'OFF' }
        1 { 'ON (enforcement)' }
        2 { 'EVALUATION (will turn on automatically)' }
        default { "unknown ($value)" }
    }
}

function Get-VolumeMap {
    # \Device\HarddiskVolumeN -> "C:" via QueryDosDevice (no admin rights needed).
    if (-not ('SacNative' -as [type])) {
        Add-Type -Namespace '' -Name 'SacNative' -MemberDefinition @'
[DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
public static extern uint QueryDosDevice(string lpDeviceName, System.Text.StringBuilder lpTargetPath, int ucchMax);
'@
    }

    $map = @{}
    foreach ($code in 65..90) {
        $drive = ([char]$code).ToString() + ':'
        $buffer = New-Object System.Text.StringBuilder 1024
        if ([SacNative]::QueryDosDevice($drive, $buffer, $buffer.Capacity) -ne 0) {
            $map[$buffer.ToString().TrimEnd('\')] = $drive
        }
    }
    $map
}

function Resolve-DevicePath {
    param([string]$Path, [hashtable]$Map)
    if ($Path -match '^(\\Device\\HarddiskVolume\d+)\\(.*)$') {
        $device = $Matches[1]
        $rest = $Matches[2]
        if ($Map.ContainsKey($device)) {
            return ($Map[$device] + '\' + $rest)
        }
    }
    $Path
}

Write-Host ''
Write-Host 'Smart App Control report' -ForegroundColor Cyan
Write-Host ('  SAC state : ' + (Get-SacState)) -ForegroundColor Gray

if (-not (Get-WinEvent -ListLog $logName -ErrorAction SilentlyContinue)) {
    Write-Host "  Log '$logName' not available on this machine." -ForegroundColor Yellow
    return
}

$since = (Get-Date).AddMinutes(-$Minutes)
$filter = @{ LogName = $logName; Id = 3077, 3076, 3033 }
if (-not $All) { $filter.StartTime = $since }

$events = Get-WinEvent -FilterHashtable $filter -ErrorAction SilentlyContinue
if (-not $events) {
    $range = if ($All) { 'the whole log' } else { "the last $Minutes minutes" }
    Write-Host "  No blocks recorded in $range." -ForegroundColor Green
    return
}

$volumeMap = Get-VolumeMap
$rows = foreach ($event in $events) {
    $match = [regex]::Match($event.Message, 'process \((.+?)\) attempted to load (.+?) that did not meet')
    if (-not $match.Success) { continue }
    [pscustomobject]@{
        Time    = $event.TimeCreated
        Event   = $event.Id
        Process = Resolve-DevicePath -Path $match.Groups[1].Value -Map $volumeMap
        File    = Resolve-DevicePath -Path $match.Groups[2].Value -Map $volumeMap
    }
}

if (-not $rows) {
    Write-Host '  Blocks exist, but the event text could not be parsed.' -ForegroundColor Yellow
    return
}

Write-Host ('  Blocks    : ' + $rows.Count + ' (' + $rows[-1].Time + ' -> ' + $rows[0].Time + ')')
Write-Host ''

$rows |
    Group-Object File, Process |
    Sort-Object Count -Descending |
    ForEach-Object {
        $first = $_.Group[0]
        $processName = Split-Path $first.Process -Leaf
        $isDevTool = $processName -match '^(node|powershell|pwsh|npm|npx|cmd)\.exe$'
        $color = if ($isDevTool) { 'Gray' } else { 'Yellow' }
        Write-Host ('  ' + $_.Count + 'x  ' + $processName) -ForegroundColor $color
        Write-Host ('       file   : ' + $first.File) -ForegroundColor DarkGray
        Write-Host ('       process: ' + $first.Process) -ForegroundColor DarkGray
        Write-Host ('       latest : ' + $_.Group[0].Time) -ForegroundColor DarkGray
    }

Write-Host ''
$nonDev = $rows | Where-Object {
    (Split-Path $_.Process -Leaf) -notmatch '^(node|powershell|pwsh|npm|npx|cmd)\.exe$'
}
if ($nonDev) {
    Write-Host '  NOTE: blocks involved a process that is NOT a dev tool (see yellow entries).' -ForegroundColor Yellow
}
else {
    Write-Host '  All blocks came from local dev tooling (node/npm/powershell).' -ForegroundColor Green
}
Write-Host ''
