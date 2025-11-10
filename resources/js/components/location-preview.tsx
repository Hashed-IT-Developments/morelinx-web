import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

interface LeafletIconPrototype {
    _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPreviewProps {
    coordinates: string;
    height?: string;
    className?: string;
}

export function LocationPreview({ coordinates, height = '300px', className = '' }: LocationPreviewProps) {
    if (!coordinates || !coordinates.includes(',')) {
        return (
            <div className={`flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 ${className}`} style={{ height }}>
                <p className="text-sm text-gray-500">No location data available</p>
            </div>
        );
    }

    const [lat, lng] = coordinates.split(',').map(Number);

    if (isNaN(lat) || isNaN(lng)) {
        return (
            <div className={`flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 ${className}`} style={{ height }}>
                <p className="text-sm text-gray-500">Invalid location coordinates</p>
            </div>
        );
    }

    const position: [number, number] = [lat, lng];

    return (
        <div className={`overflow-hidden rounded-lg border border-gray-300 ${className}`} style={{ height, position: 'relative', zIndex: 0 }}>
            <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        <div className="text-sm">
                            <p className="font-semibold">Location</p>
                            <p className="text-xs text-gray-600">
                                Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
