import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { position: [number, number] | null; setPosition: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

export function LocationPicker({ value, onChange, label = 'Location', required = false }: LocationPickerProps) {
    // Default center: Iloilo City, Philippines
    const defaultCenter: [number, number] = [10.7202, 122.5621];
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [manualLat, setManualLat] = useState<string>('');
    const [manualLng, setManualLng] = useState<string>('');
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

    // Parse existing value on mount
    useEffect(() => {
        if (value && value.includes(',')) {
            const [lat, lng] = value.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setPosition([lat, lng]);
                setManualLat(lat.toString());
                setManualLng(lng.toString());
                setMapCenter([lat, lng]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update form value when position changes
    useEffect(() => {
        if (position) {
            onChange(`${position[0]},${position[1]}`);
            setManualLat(position[0].toFixed(6));
            setManualLng(position[1].toFixed(6));
        }
    }, [position, onChange]);

    const handleManualUpdate = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (!isNaN(lat) && !isNaN(lng)) {
            setPosition([lat, lng]);
            setMapCenter([lat, lng]);
        }
    };

    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            // Check if we're on HTTPS or localhost
            const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

            if (!isSecure) {
                alert('Geolocation requires a secure connection (HTTPS). Please select the location manually on the map or enter coordinates.');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setPosition([lat, lng]);
                    setMapCenter([lat, lng]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Unable to get your location. ';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Location permission was denied. Please enable location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'The request to get your location timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                            break;
                    }

                    errorMessage += '\n\nPlease select manually on the map or enter coordinates.';
                    alert(errorMessage);
                },
            );
        } else {
            alert('Geolocation is not supported by your browser. Please select manually on the map or enter coordinates.');
        }
    };

    return (
        <FormItem>
            <FormLabel className={required ? 'after:ml-0.5 after:text-red-500 after:content-["*"]' : ''}>{label}</FormLabel>
            <FormControl>
                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-700">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {position ? 'Selected location:' : 'Click on the map to select a location'}
                            </p>
                            <Button type="button" size="sm" onClick={getCurrentLocation} variant="outline">
                                Use My Location
                            </Button>
                        </div>

                        {/* Map Container */}
                        <div className="h-[400px] w-full overflow-hidden rounded-md">
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                key={`${mapCenter[0]}-${mapCenter[1]}`}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition} />
                            </MapContainer>
                        </div>

                        {/* Coordinates Display and Manual Input */}
                        <div className="mt-4 space-y-3">
                            {position && (
                                <div className="rounded bg-green-50 p-3 text-sm dark:bg-green-900/20">
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                        Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    value={manualLat}
                                    onChange={(e) => setManualLat(e.target.value)}
                                    className="text-sm"
                                />
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    value={manualLng}
                                    onChange={(e) => setManualLng(e.target.value)}
                                    className="text-sm"
                                />
                                <Button type="button" onClick={handleManualUpdate} variant="secondary" size="sm">
                                    Update
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">You can also enter coordinates manually and click Update</p>
                        </div>
                    </div>
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}
