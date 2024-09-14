<?php

use App\Http\Controllers\DataLmtListsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckRoles;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    //view pages / priorities
    Route::get('/reports/priorities', function () {
        return Inertia::render('Priorities');
    })->name('priorities');

    // view pages / settings
    Route::middleware([CheckRoles::class])->group(function () {
        Route::get('/settings', function () {
            return Inertia::render('Settings');
        })->name('settings');
        Route::get('/get-users-list', [UserController::class, 'getUsers']);
    });

    // get data
    Route::get('/get-stores', [DataLmtListsController::class, 'getDistinctStore']);
    Route::get('/get-districts', [DataLmtListsController::class, 'getDistricts']);
    Route::get('/get-schools', [DataLmtListsController::class, 'getSchools']);
    Route::get('/get-list-where-school-is', [DataLmtListsController::class, 'getListWhereSchoolIS']);
    Route::get('/get-account-status-where-school-is', [DataLmtListsController::class, 'getAccountStatusWhereSchoolIs']);
    Route::get('/get-other-data/{id}', [DataLmtListsController::class, 'getOtherData']);
    Route::get('/get-count-total-engaged', [DataLmtListsController::class, 'getCountTotalEngaged']);
    Route::get('/get-count-priority-to-engage', [DataLmtListsController::class, 'getCountPriorityToEngage']);
    Route::get('/get-list-for-total-engaged', [DataLmtListsController::class, 'getListForTotalEngaged']);
    Route::get('/get-list-for-priority-to-engage', [DataLmtListsController::class, 'getListForPriorityToEngage']);
    // update data
    Route::patch('/update-user-role/{id}', [UserController::class, 'update']);
    Route::patch('/cancel-user-role/{id}', [UserController::class, 'cancel']);
    Route::patch('/assign-user-store/{id}', [UserController::class, 'assignStore']);
    Route::patch('/save-engage-data/{id}', [DataLmtListsController::class, 'saveEngageData']);
    Route::patch('/update-priority-to-engage/{id}', [DataLmtListsController::class, 'updatePriorityToEngage']);
    // remove data
    Route::delete('/remove-user/{id}', [UserController::class, 'delete']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
