<?php

namespace App\Contracts;

use Illuminate\Database\Eloquent\Model;

/**
 * Interface for models that require automatic approval flow initialization
 * 
 * Models implementing this interface MUST:
 * 1. Use the HasApprovalFlow trait
 * 2. Implement the getApprovalModule() method to return the module name
 * 3. Have a booted() method that automatically initializes approval flow on creation
 */
interface RequiresApprovalFlow
{
    /**
     * Get the module name for approval flow initialization
     * 
     * @return string The module name that corresponds to an ApprovalFlow
     */
    public function getApprovalModule(): string;

    /**
     * Get the department ID for approval flow (optional)
     * 
     * @return int|null Department ID for filtering approval flows, null for no department filter
     */
    public function getApprovalDepartmentId(): ?int;

    /**
     * Determine if approval flow should be automatically initialized
     * Override this method to add conditions when approval flow should NOT be initialized
     * 
     * @return bool True if approval flow should be initialized, false otherwise
     */
    public function shouldInitializeApprovalFlow(): bool;
}