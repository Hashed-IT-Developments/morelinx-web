<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'material'      => $this->material,
            'cost'          => $this->cost,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at
        ];
    }
}
