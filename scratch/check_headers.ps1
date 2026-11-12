Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Users\nipon\.gemini\antigravity\brain\3d702a86-92d8-44a8-8d58-e35fee520aa1\.user_uploaded\media_1794462809180_8cfe1c8c.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
[xml]$sheetXml = $content

$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$ssStream = $ssEntry.Open()
$ssReader = New-Object System.IO.StreamReader($ssStream)
[xml]$ssXml = $ssReader.ReadToEnd()
$ssReader.Close()
$ssStream.Close()
$zip.Dispose()

$sharedStrings = @()
foreach ($si in $ssXml.sst.si) {
    $t = if ($si.t) { $si.t } else { ($si.r | ForEach-Object { $_.t }) -join '' }
    $sharedStrings += $t
}

$rows = $sheetXml.worksheet.sheetData.row
Write-Host "Total rows in sheet: $($rows.Count)"
$headers = @()
foreach ($c in $rows[0].c) {
    if ($c.t -eq 's') {
        $idx = [int]$c.v
        $headers += $sharedStrings[$idx]
    } else {
        $headers += $c.v
    }
}
Write-Host "Extracted Headers:"
for ($i=0; $i -lt $headers.Count; $i++) {
    Write-Host "  [$i] $($headers[$i])"
}
