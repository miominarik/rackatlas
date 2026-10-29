<?php

return [
    /*
     * Who runs RackAtlas. Shown on the privacy policy page (GDPR art. 13). Fill these in .env before launch;
     * fields left empty are not shown.
     */
    'operator' => [
        'name' => env('LEGAL_OPERATOR_NAME'),
        'address' => env('LEGAL_OPERATOR_ADDRESS'),
        'company_id' => env('LEGAL_OPERATOR_ID'),
        'email' => env('LEGAL_CONTACT_EMAIL'),
    ],

    'updated_at' => '2026-10-29',
];
