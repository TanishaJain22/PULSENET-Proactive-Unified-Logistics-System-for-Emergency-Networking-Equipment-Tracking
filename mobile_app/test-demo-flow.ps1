$BASE = "http://localhost:3000/api"
function T($m,$p,$b,$l) {
    try {
        if ($m -eq "GET") { $r = Invoke-WebRequest "$BASE$p" -Method GET -UseBasicParsing -TimeoutSec 5 -EA Stop }
        else { $r = Invoke-WebRequest "$BASE$p" -Method POST -Body ($b|ConvertTo-Json -Depth 5) -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 -EA Stop }
        Write-Host "PASS [$($r.StatusCode)] $m $p  $l"
        return $r.Content | ConvertFrom-Json
    } catch { Write-Host "FAIL [$($_.Exception.Response.StatusCode.value__)] $m $p  $l"; return $null }
}

Write-Host "=== LOGIN NAMES ==="
$p  = T "POST" "/auth/login" @{username="patient"} ""
Write-Host "  patient   -> name='$($p.user.name)'  id='$($p.user.id)'"
$pa = T "POST" "/auth/login" @{username="paramedic"} ""
Write-Host "  paramedic -> name='$($pa.user.name)'"
$dr = T "POST" "/auth/login" @{username="driver"} ""
Write-Host "  driver    -> name='$($dr.user.name)'"

Write-Host "`n=== DEMO FLOW: KNOWN PATIENT ==="
$d = T "POST" "/dispatch/create" @{location=@{latitude=22.7196;longitude=75.8577};patientName=$p.user.name;patientId=$p.user.id;patientIdentity="KNOWN";requesterPatientId=$p.user.id;source="PATIENT_APP"} "patient SOS (KNOWN)"
$did = $d.dispatchId
Write-Host "  dispatchId=$did  patientName='$($d.patientName)'"

T "POST" "/dispatch/accept" @{dispatchId=$did;driverId=$dr.user.id} "driver accepts" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="AMBULANCE_EN_ROUTE"} "en route" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="ARRIVED_AT_SCENE"} "arrived at scene" | Out-Null

$active = T "GET" "/dispatch/active" $null "paramedic: GET /dispatch/active"
Write-Host "  -> patientName='$($active.patientName)'  identity='$($active.patientIdentity)'  status='$($active.status)'"
if ($active.dispatchId -eq $did) { Write-Host "  CORRECT: matches patient dispatch" } else { Write-Host "  WRONG: got $($active.dispatchId) not $did" }

$profile = T "GET" "/patient/profile/$($active.requesterPatientId)" $null "load patient profile"
Write-Host "  profile -> name='$($profile.name)'  blood='$($profile.bloodGroup)'  allergies=$($profile.allergies -join ', ')"
$recs = T "GET" "/patient/records/$($active.requesterPatientId)" $null "load patient records"
Write-Host "  records -> $($recs.Count) records"

Write-Host "`nDone."
