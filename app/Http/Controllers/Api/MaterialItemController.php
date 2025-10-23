<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialItemRequest;
use App\Http\Requests\UpdateMaterialItemRequest;
use App\Http\Resources\MaterialItemResource;
use App\Models\MaterialItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MaterialItemController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum')
        ];
    }

    public function index(Request $request)
    {
        $items = MaterialItem::query()
        ->when(
            $request->filled('q'),
            fn($query) => $query->whereRaw('LOWER(material) LIKE ?', ['%' . strtolower($request->query('q')) . '%'])
        )->orderBy('material', 'asc')->get();

        return response()->json([
            'success'   => true,
            'data'      => MaterialItemResource::collection($items),
            'message'   => 'Material items retrieved.',
        ]);
    }

    public function show(MaterialItem $material)
    {
        return response()->json([
            'success'   => true,
            'data'      => new MaterialItemResource($material),
            'mmessage'  => 'Material item retrieved.'
        ]);
    }

    public function store(StoreMaterialItemRequest $request)
    {
        $item = MaterialItem::create($request->validated());

        return response()->json([
            'success'   => true,
            'data'      => new MaterialItemResource($item),
            'message'   => 'Material item created.'
        ]);
    }

    public function update(UpdateMaterialItemRequest $request, MaterialItem $material)
    {
        $material->update([
            'material'  => $request->material,
            'cost'      => $request->cost
        ]);

        return response()->json([
            'success'   => true,
            'data'      => new MaterialItemResource($material->fresh()),
            'message'   => 'Material item updated.'
        ]);
    }

    public function destroy(MaterialItem $material)
    {
        $material->delete();

        return response()->json([
            'success'   => true,
            'message'   => 'Material item deleted.'
        ]);
    }
}
