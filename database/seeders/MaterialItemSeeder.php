<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MaterialItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $items = [
            ['material' => 'ACCESSORY0000046 / 8 WAYS BUST EXPANDING ANCHOR, 5/8", CHANCE', 'cost' => 17],
            ['material' => 'ACCESSORY0000051 / BRACE, ALLEY ARM, 3/16"X1-1/2"X1-1/2"X7\', HDG', 'cost' => 11],
            ['material' => 'ACCESSORY0000052 / BRACE, ANGLE ARM (V-BRACE) - 1-1/2" X 1-1/2" X 3/16", 48" SPAN, HDG', 'cost' => 2],
            ['material' => 'ACCESSORY0000079 / EXTENSION ARM 3-1/2" X 2-1/2" X 5/16" X 44-1/2", GALV. STEEL CAT. NO.7921', 'cost' => 17],
            ['material' => 'ACCESSORY0000095 / FUSE LINK, 6AMPS, TYPE K, 15KV (CHANCE)', 'cost' => 3],
            ['material' => 'ACCESSORY0000098 / GROUND ROD, 5/8 X 8\', CONE POINT, HDG', 'cost' => 9],
            ['material' => 'ACCESSORY0000109 / POLE CLAMP MOUNTING, POLE BANDS, TYPE RL, SIZE (5 – 6), HDG (JFI)', 'cost' => 11],
            ['material' => 'ACCESSORY0000110 / POLE CLAMP MOUNTING, POLE BANDS, TYPE RL, SIZE (7 – 8), HDG (JFI)', 'cost' => 12],
            ['material' => 'ACCESSORY0000144 / CLEVIS, SWINGING (CHANCE)', 'cost' => 11],
            ['material' => 'ACCESSORY0000149 / WASHER ROUND, 1" OD X 14 GA., 7/16" HOLE DIA., GALV. (3.8" DIA. BOLT)', 'cost' => 4],
            ['material' => 'ACCESSORY0000150 / WASHER ROUND, 1"3/8" OD X 14 GA., 9/16" HOLE DIA., GALV. (1/2" DIA. BOLT)', 'cost' => 19],
            ['material' => 'ACCESSORY0000161 / THREE-BOLT GUY CLAMP, 1/2" HDG', 'cost' => 10],
            ['material' => 'ACCESSORY0000180 / INSULATOR, PIN PORCELAIN, 15KV-25KV INSULATION, DOUBLE PETTICOAT, ANSI 56-1', 'cost' => 19],
            ['material' => 'ACCESSORY0000187 / ANCHOR ROD, 5/8" X 8\', THIMBLE-EYE, HDG', 'cost' => 17],
            ['material' => 'ACCESSORY0000191 / WASHER, SQUARE, 1/2" DIA HOLE, GALV.', 'cost' => 10],
            ['material' => 'ACCESSORY0000195 / HOOK, GUY, 5/8", DIA, GALV', 'cost' => 17],
            ['material' => 'ACCESSORY0000210 / WASHER, SQUARE, 5/8 DIA HOLE, GALV', 'cost' => 223],
            ['material' => 'ACCESSORY0000227 / STEEL PIN LONG SHANK, 5/8 DIA, 13/8" NYLON THREAD FOR DOUBLE PETTICOAT PIN INSULATOR', 'cost' => 19],
            ['material' => 'ACCESSORY0000240 / BOLT, SPOOL, SINGLE-UPSET, 5/8" x 14"', 'cost' => 4],
            ['material' => 'ACCESSORY0000378 / CLUSTER MOUNTING BRACKETS FOR 15KV CUTOUT AND ARRESTER', 'cost' => 4],
            ['material' => 'CONSUMABLES00002 / ELECTRICAL TAPE BIG 3M', 'cost' => 35],
            ['material' => 'HRDWRE0000006 / BRACKET, SECONDARY RACK, 3-SPOOL, HEAVY DUTY, HDG', 'cost' => 38],
            ['material' => 'HRDWRE0000023 / CONNECTOR, COMPRESSION TYPE, ALUMINUM - COPPER, FOR NO. 3/0 - NO. 4/0 RUN AND No. 1 - No. 2/0 TAP', 'cost' => 9],
            ['material' => 'HRDWRE0000036 / CROSS ARM STEEL, 3" X 4" X 10\', HDG (JFI)', 'cost' => 13],
            ['material' => 'HRDWRE0000042 / FUSE CUT-OUT, 15KV, 100 AMP., PORCELAIN (CHANCE)', 'cost' => 5],
            ['material' => 'HRDWRE0000051 / FUSE LINK, 12 AMPS, TYPE K (CHANCE)', 'cost' => 1],
            ['material' => 'HRDWRE0000053 / FUSE LINK, 20 AMPS, TYPE K (CHANCE)', 'cost' => 2],
            ['material' => 'HRDWRE0000062 / GUY GRIP PREFORMED 3/8 IN, HDG', 'cost' => 76],
            ['material' => 'HRDWRE0000085 / LIGHTNING ARRESTER 9-10KV, POLYMER (OHIO BRASS)', 'cost' => 3],
            ['material' => 'HRDWRE0000095 / ALUMINUM BAIL CLAMP "STIRRUP" (CHANCE)', 'cost' => 5],
            ['material' => 'HRDWRE0000096 / TRANSFORMER CLUSTER HANGER', 'cost' => 6],
            ['material' => 'HRDWRE0000099 / WIRE ROPE CLIP, U-CLAMP ¾, HDG', 'cost' => 64],
            ['material' => 'HRDWRE0000100 / WIRE ROPE CLIP, U-CLAMP 5/8, HDG', 'cost' => 18],
            ['material' => 'HRDWRE0000108 / CONNECTOR, COMPRESSION TYPE, ALUMINUM - COPPER, FOR No. 6 - No. 2 RUN AND No. 6 - No. 2 TAP', 'cost' => 40],
            ['material' => 'HRDWRE0000109 / CONNECTOR, COMPRESSION TYPE, ALUMINUM - COPPER, FOR NO. 3/0 - NO. 4/0 RUN AND NO. 3/0 - 4/0 TAP', 'cost' => 46],
            ['material' => 'HRDWRE0000110 / BOLT, MACHINE, 5/8" X 8", HDG (JFI)', 'cost' => 32],
            ['material' => 'HRDWRE0000111 / BOLT, MACHINE, 5/8" X 10", HDG (JFI)', 'cost' => 54],
            ['material' => 'HRDWRE0000112 / BOLT, MACHINE, 5/8" X 12", HDG (JFI)', 'cost' => 17],
            ['material' => 'HRDWRE0000113 / BOLT, MACHINE, 5/8" X 14", HDG (JFI)', 'cost' => 9],
            ['material' => 'HRDWRE0000114 / BOLT, MACHINE, 1/2" X 12", HDG (JFI)', 'cost' => 5],
            ['material' => 'HRDWRE0000116 / BOLT, DOUBLE ARMING, 5/8" X 22", HDG (JFI)', 'cost' => 8],
            ['material' => 'HRDWRE0000118 / NUT, OVAL EYE, 5/8", HDG', 'cost' => 17],
            ['material' => 'HRDWRE0000119 / THREE-BOLT GUY CLAMP, 5/8", HDG (JFI)', 'cost' => 15],
            ['material' => 'HRDWRE0000120 / BOLT, EYE, 5/8" X 12", HDG (JFI)', 'cost' => 10],
            ['material' => 'HRDWRE0000121 / BOLT, EYE, 5/8" X 14", HDG (JFI)', 'cost' => 11],
            ['material' => 'HRDWRE0000122 / PERMAGRIP, CLAMP TAP, HDG (JFI)', 'cost' => 5],
            ['material' => 'HRDWRE0000127 / CONNECTOR, COMPRESSION TYPE, ALUMINUM - COPPER, FOR NO. 1/0 - NO. 2/0 RUN AND No. 6 - No. 2 TAP', 'cost' => 12],
            ['material' => 'HRDWRE0000128 / CONNECTOR, COMPRESSION TYPE, ALUMINUM - COPPER, FOR NO. 1/0 - NO. 2/0 RUN AND NO. 1/0 - 2/0 TAP', 'cost' => 41],
            ['material' => 'HRDWRE0000152 / CARRIAGE BOLT 3/8X6, HOT DIP GALVANIZED, JFI', 'cost' => 4],
            ['material' => 'HRDWRE0000153 / BOLT, DOUBLE ARMING, 5/8" X 18", HDG (JFI)', 'cost' => 6],
            ['material' => 'HRDWRE0000161 / BOLT, MACHINE, 1/2" X 6", HDG (JFI)', 'cost' => 21],
            ['material' => 'HRDWRE0000163 / BOLT, MACHINE, 1/2" X 14", HDG (JFI)', 'cost' => 3],
            ['material' => 'HRDWRE0000174 / BOLT, MACHINE, 5/8" X 18", HDG (JFI)', 'cost' => 2],
            ['material' => 'HRDWRE0000176 / BOLT, MACHINE, 5/8" X 22", HDG (JFI)', 'cost' => 3],
            ['material' => 'HRDWRE0000179 / POLE CLAMP MOUNTING, POLE BANDS, TYPE RL, SIZE (10 - 12), HDG (JFI)', 'cost' => 3],
            ['material' => 'HRDWRE0000180 / POLE CLAMP MOUNTING, POLE BANDS, TYPE RL, SIZE (8 - 10), HDG (JFI)', 'cost' => 1],
            ['material' => 'HRDWRE0000189 / INSULATOR, SPOOL, PORCELAIN FOR RACK BRACKET', 'cost' => 129],
            ['material' => 'HRDWRE0000306 / INSULATOR, STRAIN 504, PORCELAIN (CHANCE)', 'cost' => 19],
            ['material' => 'HRDWRE0000311 / STRAIN CLAMP, 2 U-BOLT FOR 1/0 ACSR (JFI)', 'cost' => 17],
            ['material' => 'HRDWRE0000357 / INSULATOR, SUSPENSION, POLYMER 15 KV, CLEVIS TYPE', 'cost' => 17],
            ['material' => 'POLE0000001 / POLE,  13.5 M. (45FT.), CONCRETE, CLASS 5, MIN. BREAKING LOAD AT TOP PULL 1000 KG.', 'cost' => 2],
            ['material' => 'POLE0000002 / POLE,  12.0 M. (40FT.), CONCRETE, CLASS 5, MIN. BREAKING LOAD AT TOP PULL 1000 KG.', 'cost' => 5],
            ['material' => 'POLE0000003 / POLE,  9.0 M. (30FT.), CONCRETE, CLASS 7A, MIN. BREAKING LOAD AT TOP PULL 500 KG.', 'cost' => 14],
            ['material' => 'POLE0000004 / POLE,  15.0 M (50FT.), CONCRETE, CLASS 5, MIN. BREAKING LOAD AT TOP PULL 1000 KG.', 'cost' => 2],
            ['material' => 'TRANSF0000053 / DISTRIBUTION TRANSFORMER, KP, 50KVA, SINGLE PHASE, 60HZ, 7620/13200-120/240 VOLTS, ADDITIVE', 'cost' => 3],
            ['material' => 'WIRE0000015 / WIRE, NO. 2 THHN CU., STRANDED INSULATED', 'cost' => 60],
            ['material' => 'WIRE0000018 / WIRE NO. 4/0 THHN COPPER STRANDED INSULATED HARRIX', 'cost' => 24],
            ['material' => 'WIRE0000025 / WIRE, NO. 8 AAC, DUPLEX, SOLID INSULATED', 'cost' => 70],
            ['material' => 'WIRE0000026 / WIRE, NO. 6 AAC, DUPLEX, STRANDED INSULATED', 'cost' => 570],
            ['material' => 'WIRE0000031 / WIRE, NO. 4/0 AAC, STRANDED INSULATED', 'cost' => 1200],
            ['material' => 'WIRE0000032 / WIRE, NO. 1/0 ACSR, BARE, STRANDED', 'cost' => 1120],
            ['material' => 'WIRE0000085 / WIRE, GUY, NO. 3/8, HDG', 'cost' => 290],
        ];

        foreach (array_chunk($items, 50) as $chunk) {
            DB::table('material_items')->insert(
                collect($chunk)->map(fn($row) => [
                    'material'      => $row['material'],
                    'cost'          => $row['cost'],
                    'created_at'    => $now,
                    'updated_at'    => $now
                ])->toArray()
            );
        }
    }
}
