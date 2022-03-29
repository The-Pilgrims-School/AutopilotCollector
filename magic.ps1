# Magic autopilot collect and push
# with some extracted content from Get-WindowsAutoPilotInfo.ps1 from PS Gallery

$session = New-CimSession
$serial = (Get-CimInstance -CimSession $session -Class Win32_BIOS).SerialNumber

$product = ""
$devDetail = (Get-CimInstance -CimSession $session -Namespace root/cimv2/mdm/dmmap -Class MDM_DevDetail_Ext01 -Filter "InstanceID='Ext' AND ParentID='./DevDetail'")
if ($devDetail -and (-not $Force))
{
    $hash = $devDetail.DeviceHardwareData
}
else
{
    $bad = $true
    $hash = ""
}

$identity = @{
    "DeviceSerialNumber" = $serial
    "WindowsProductID" = $product
    "HardwareHash" = $hash
}

#TODO: replace with real web service endpoint!
Invoke-WebRequest -Uri http://0.0.0.0:13337/ -Body ($identity | ConvertTo-Json) -Method Post