import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { Search } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

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

    // Debounced search effect - search while typing
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
                );
                const data = await response.json();
                setSearchResults(data);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms delay after user stops typing

        return () => {
            clearTimeout(timeoutId);
            setIsSearching(false);
        };
    }, [searchQuery]);

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

    const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setShowResults(false);
        setSearchQuery('');
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
                        {/* Search Bar */}
                        <div className="mb-4 space-y-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search for a place (e.g., 'Iloilo City Hall')"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setShowResults(false);
                                            }
                                        }}
                                        className="pr-10"
                                    />
                                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                <Button type="button" size="sm" onClick={getCurrentLocation} variant="outline">
                                    Use My Location
                                </Button>
                            </div>

                            {/* Search Results Dropdown */}
                            {isSearching && searchQuery.trim() && (
                                <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                    Searching...
                                </div>
                            )}

                            {showResults && searchResults.length > 0 && !isSearching && (
                                <div className="max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectSearchResult(result)}
                                            className="w-full border-b border-gray-200 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 last:border-b-0 dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{result.display_name}</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showResults && searchResults.length === 0 && !isSearching && (
                                <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                    No results found. Try a different search term.
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {position ? 'Selected location:' : 'Click on the map to select a location'}
                            </p>
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
