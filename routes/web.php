<?php

use App\Http\Controllers\DataLmtListsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckRoles;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::middleware(['auth', 'verified'])->group(function () {
    // view pages
    // view pages / dashboard
    Route::get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    // view pages / reports
    Route::get('/reports', function () {
        return Inertia::render('Reports');
    })->name('reports');
    // view pages / settings

    Route::middleware([CheckRoles::class])->group(function () {
        Route::get('/settings', function () {
            return Inertia::render('Settings');
        })->name('settings');
        Route::get('/get-users-list', [UserController::class, 'getUsers']);
    });

    // get data
    Route::get('/get-offices', [DataLmtListsController::class, 'getDistinctOffice']);
    Route::get('/get-lists', [DataLmtListsController::class, 'getLists']);
    Route::get('/get-account-status', [DataLmtListsController::class, 'getAccountStatus']);
    Route::get('/get-other-data/{id}', [DataLmtListsController::class, 'getOtherData']);
    // update data
    Route::patch('/update-user-role/{id}', [UserController::class, 'update']);
    Route::patch('/cancel-user-role/{id}', [UserController::class, 'cancel']);
    // remove data
    Route::delete('/remove-user/{id}', [UserController::class, 'delete']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
