$BASE = "http://localhost:3000/api"
function T($m,$p,$b,$l) {
    try {
        if ($m -eq "GET") {
            $r = Invoke-WebRequest "$BASE$p" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        } else {
            $json = $b | ConvertTo-Json -Depth 5
            $r = Invoke-WebRequest "$BASE$p" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        }
        Write-Host "PASS [$($r.StatusCode)] $m $p  -- $l"
        return $r.Content | ConvertFrom-Json
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "FAIL [$code] $m $p  -- $l"
        return $null
    }
}

Write-Host "=== AUTH ==="
T "POST" "/auth/login" @{username="patient"} "patient login" | Out-Null
T "POST" "/auth/login" @{username="paramedic"} "paramedic login" | Out-Null
T "POST" "/auth/login" @{username="driver"} "driver login" | Out-Null

Write-Host "`n=== DISPATCH - KNOWN PATIENT FULL FLOW ==="
$d = T "POST" "/dispatch/create" @{location=@{latitude=22.7196;longitude=75.8577};patientName="Rahul Sharma";patientIdentity="KNOWN";patientId="000000000000";requesterPatientId="000000000000";source="PATIENT_APP"} "create KNOWN dispatch"
$did = $d.dispatchId
Write-Host "  dispatchId = $did"
T "GET" "/dispatch/pending" $null "pending list" | Out-Null
T "GET" "/dispatch/$did" $null "get dispatch" | Out-Null
T "GET" "/dispatch/$did/timeline" $null "get timeline" | Out-Null
T "POST" "/dispatch/accept" @{dispatchId=$did;driverId="drv-001"} "accept dispatch" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="AMBULANCE_EN_ROUTE"} "en route" | Out-Null
T "GET" "/dispatch/active" $null "active dispatch (paramedic)" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="ARRIVED_AT_SCENE"} "arrived at scene" | Out-Null
T "POST" "/emergency/vitals" @{caseId=$did;vitals=@{heartRate="130";oxygenSaturation="92";bloodPressure="150/90";temperature="99";respiratoryRate="20"}} "vitals with dispatchId (KNOWN)" | Out-Null
T "POST" "/hospital/assign" @{caseId=$did;hospitalId="hosp02"} "assign hospital with dispatchId" | Out-Null
T "GET" "/hospital/assigned/$did" $null "get assigned hospital with dispatchId" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="EN_ROUTE_TO_HOSPITAL"} "en route to hospital" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="ARRIVED_AT_HOSPITAL"} "arrived at hospital" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did;status="HANDOFF_COMPLETE"} "handoff complete" | Out-Null

Write-Host "`n=== DISPATCH - UNKNOWN PATIENT FULL FLOW ==="
$d2 = T "POST" "/dispatch/create" @{location=@{latitude=22.725;longitude=75.865};patientName="Unknown Patient";patientIdentity="UNKNOWN";source="PATIENT_APP"} "create UNKNOWN dispatch"
$did2 = $d2.dispatchId
Write-Host "  dispatchId = $did2"
T "POST" "/dispatch/accept" @{dispatchId=$did2;driverId="drv-002"} "accept UNKNOWN dispatch" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="AMBULANCE_EN_ROUTE"} "en route" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="ARRIVED_AT_SCENE"} "arrived at scene" | Out-Null
$tc = T "POST" "/emergency/create-temp" @{dispatchId=$did2;patientName="Unknown Male";symptoms=@("trauma","unconscious");location=@{latitude=22.725;longitude=75.865}} "create temp case"
Write-Host "  tempCaseId = $($tc.tempCaseId)"
T "POST" "/emergency/vitals" @{caseId=$tc.tempCaseId;vitals=@{heartRate="140";oxygenSaturation="89";bloodPressure="90/60";temperature="97";respiratoryRate="24"}} "vitals with tempCaseId" | Out-Null
T "POST" "/hospital/assign" @{caseId=$tc.tempCaseId;hospitalId="hosp01"} "assign hospital to temp case" | Out-Null
T "GET" "/hospital/assigned/$($tc.tempCaseId)" $null "get assigned hospital for temp case" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="HOSPITAL_ASSIGNED"} "hospital assigned" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="EN_ROUTE_TO_HOSPITAL"} "en route to hospital" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="ARRIVED_AT_HOSPITAL"} "arrived at hospital" | Out-Null
T "POST" "/dispatch/status" @{dispatchId=$did2;status="HANDOFF_COMPLETE"} "handoff complete" | Out-Null

Write-Host "`n=== PATIENT RECORDS ==="
T "GET" "/patient/profile/000000000000" $null "demo patient profile" | Out-Null
T "GET" "/patient/records/000000000000" $null "demo patient records" | Out-Null
T "GET" "/patient/profile/123456789012" $null "Rahul Sharma profile" | Out-Null
T "GET" "/patient/records/123456789012" $null "Rahul Sharma records" | Out-Null

Write-Host "`n=== HOSPITAL ==="
T "POST" "/hospital/search" @{} $null "search all" | Out-Null
T "POST" "/hospital/search" @{capability="CARDIAC_CENTER"} $null "search cardiac" | Out-Null
T "POST" "/hospital/recommend" @{severity="CRITICAL";location=@{latitude=22.72;longitude=75.86}} $null "recommend" | Out-Null

Write-Host "`n=== AMBULANCE & TRIAGE ==="
T "POST" "/ambulance/location" @{caseId="CASE-DEMO-0001";latitude=22.721;longitude=75.861} $null "location update" | Out-Null
T "POST" "/triage/analyze" @{symptoms=@("chest pain");vitals=@{heartRate="135"}} $null "triage analyze" | Out-Null

Write-Host "`n=== DEMO SEEDS ==="
T "GET" "/dispatch/DISP-DEMO-0001" $null "DISP-DEMO-0001 (KNOWN)" | Out-Null
T "GET" "/dispatch/DISP-DEMO-0002" $null "DISP-DEMO-0002 (UNKNOWN)" | Out-Null
T "GET" "/dispatch/DISP-DEMO-0001/timeline" $null "DISP-DEMO-0001 timeline" | Out-Null
T "GET" "/dispatch/DISP-DEMO-0002/timeline" $null "DISP-DEMO-0002 timeline" | Out-Null
T "GET" "/emergency/active" $null "emergency active" | Out-Null

Write-Host "`n=== DONE ==="
