Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Users\nipon\.gemini\antigravity\brain\3d702a86-92d8-44a8-8d58-e35fee520aa1\.user_uploaded\media_1794462809180_8cfe1c8c.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.GetEntry('xl/sharedStrings.xml')
if ($entry) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    [xml]$xml = $content
    Write-Host "Total shared strings: " $xml.sst.si.Count
    for ($i = 0; $i -lt [Math]::Min(30, $xml.sst.si.Count); $i++) {
        $si = $xml.sst.si[$i]
        $text = if ($si.t) { $si.t } else { ($si.r | ForEach-Object { $_.t }) -join '' }
        Write-Host "[$i] $text"
    }
}
$zip.Dispose()
