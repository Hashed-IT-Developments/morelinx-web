<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoutePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_name',
        'route_uri', 
        'route_method',
        'protection_type',
        'protection_value',
        'route_description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get active route permissions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get route permissions by protection type
     */
    public function scopeByProtectionType($query, $type)
    {
        return $query->where('protection_type', $type);
    }

    /**
     * Get route permissions for a specific route
     */
    public static function getRouteProtections($routeName)
    {
        return static::active()
            ->where('route_name', $routeName)
            ->get()
            ->groupBy('protection_type');
    }

    /**
     * Check if a route has any protection
     */
    public static function isRouteProtected($routeName)
    {
        return static::active()
            ->where('route_name', $routeName)
            ->exists();
    }

    /**
     * Get all protected routes grouped by protection type
     */
    public static function getAllProtections()
    {
        return static::active()
            ->get()
            ->groupBy(['route_name', 'protection_type']);
    }
}
