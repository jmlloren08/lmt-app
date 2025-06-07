<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $userRole = strtolower($request->user()->roles);
        $validRoles = ['administrator', 'division_leader', 'team_leader', 'loan_specialist'];

        // Check if user has a valid role
        if (!in_array($userRole, $validRoles)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No valid role assigned'], 403);
            }
            return redirect()->route('no-authorization');
        }

        // If no specific roles are provided, just check if the user has a valid role
        if (empty($roles)) {
            return $next($request);
        }

        // Check if user has any of the required roles
        $allowedRoles = array_map('strtolower', $roles);
        if (!in_array($userRole, $allowedRoles)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
