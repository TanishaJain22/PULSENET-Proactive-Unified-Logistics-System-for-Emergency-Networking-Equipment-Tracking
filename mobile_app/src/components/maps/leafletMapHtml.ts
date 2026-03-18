/**
 * Exports the HTML string for the Leaflet map environment.
 * Loaded from CDN and handled inside a React Native WebView.
 */
export const leafletMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Production Tracking Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; background: #f8fafc; }
        .ambulance-icon {
            font-size: 24px;
            text-align: center;
            line-height: 24px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
        // --- Configuration & State ---
        let map, routeLine, ambulanceMarker, patientMarker, hospitalMarker;
        let animationInterval;
        let currentRoute = [];
        let animationIndex = 0;
        let mapMode = 'dispatch'; // 'dispatch' or 'tracking'
        
        const INDORE_COORDS = [22.7196, 75.8577];

        // --- Initialization ---
        function initMap() {
            map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView(INDORE_COORDS, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }

        const ambulanceIcon = L.divIcon({
            html: '<div class="ambulance-icon">🚑</div>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // --- Pure Rendering Logic ---
        function renderMap(data) {
            const { mode, ambulance, patient, hospital, route, color } = data;
            mapMode = mode;

            if (ambulance) {
                if (!ambulanceMarker) {
                    ambulanceMarker = L.marker([ambulance.latitude, ambulance.longitude], { icon: ambulanceIcon }).addTo(map);
                } else {
                    ambulanceMarker.setLatLng([ambulance.latitude, ambulance.longitude]);
                }
            }

            if (patient && mode === 'dispatch') {
                if (!patientMarker) {
                    patientMarker = L.marker([patient.latitude, patient.longitude]).addTo(map);
                } else {
                    patientMarker.setLatLng([patient.latitude, patient.longitude]);
                }
            }

            if (hospital) {
                if (!hospitalMarker) {
                    hospitalMarker = L.marker([hospital.latitude, hospital.longitude]).addTo(map);
                    hospitalMarker.on('click', () => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'HOSPITAL_SELECTED',
                            payload: hospital
                        }));
                    });
                } else {
                    hospitalMarker.setLatLng([hospital.latitude, hospital.longitude]);
                }
            }

            if (route && route.length > 0) {
                const routeString = JSON.stringify(route);
                if (this._lastRoute !== routeString) {
                    if (routeLine) map.removeLayer(routeLine);
                    routeLine = L.polyline(route, {
                        color: color || '#2563eb',
                        weight: 5,
                        opacity: 0.8
                    }).addTo(map);
                    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
                    this._lastRoute = routeString;
                }
            }

            // Cleanup patient marker if mode shifts to tracking
            if (mode === 'tracking' && patientMarker) {
                map.removeLayer(patientMarker);
                patientMarker = null;
            }
        }

        // --- Animation logic (client-side smoothing) ---
        function interpolate(p1, p2, steps) {
            const points = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                points.push([p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t]);
            }
            return points;
        }

        function animateAmbulance(newLocation) {
            if (!ambulanceMarker) return;
            const start = [ambulanceMarker.getLatLng().lat, ambulanceMarker.getLatLng().lng];
            const end = [newLocation.latitude, newLocation.longitude];
            
            if (animationInterval) clearInterval(animationInterval);
            
            const steps = 15;
            const smoothPath = interpolate(start, end, steps);
            let stepIndex = 0;

            animationInterval = setInterval(() => {
                if (stepIndex >= smoothPath.length) {
                    clearInterval(animationInterval);
                    return;
                }
                ambulanceMarker.setLatLng(smoothPath[stepIndex]);
                stepIndex++;
            }, 10); // 150ms total animation spread
        }

        // --- External API ---
        window.updateMap = (data) => {
            if (!map) initMap();
            renderMap(data);
        };

        window.animateTo = (location) => {
            animateAmbulance(location);
        };

        window.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'UPDATE') window.updateMap(data.payload);
                if (data.type === 'ANIMATE') window.animateTo(data.payload);
            } catch (e) {}
        });

    </script>
</body>
</html>
`;
