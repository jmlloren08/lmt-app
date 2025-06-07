<?php

use App\Http\Controllers\DataLmtListsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\StoreManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return redirect()->route('login');
});

// Authentication Routes
require __DIR__ . '/auth.php';

// Protected routes
Route::middleware(['auth', 'verified'])->group(function () {
    // No Authorization Route
    Route::get('/no-authorization', function () {
        return Inertia::render('NoAuthorization');
    })->name('no-authorization');

    // Routes that require a valid role
    Route::middleware(['role'])->group(function () {
        // Dashboard Route
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');
        // Priorities Route
        Route::get('/priorities', function () {
            return Inertia::render('Priorities');
        })->name('priorities');
        // Engaged Route
        Route::get('/engaged', function () {
            return Inertia::render('Engaged');
        })->name('engaged');
        // School list
        Route::get('/school-list', function () {
            return Inertia::render('Schools');
        })->name('schools');
        // Client list
        Route::get('/client-list', function () {
            return Inertia::render('Clients');
        })->name('clients');

        // User Management Routes (Role Assignment Only)
        Route::middleware(['role:administrator,division_leader,team_leader'])->group(function () {
            Route::get('/user-management', [UserManagementController::class, 'index'])->name('user-management');
            Route::get('/user-management/users', [UserManagementController::class, 'getUsers']);
            Route::patch('/users/{user}/assign-role', [UserManagementController::class, 'assignRole'])->name('users.assign-role');
            Route::delete('/users/{user}', [UserManagementController::class, 'delete'])->name('users.delete');
        });

        // Store Management Routes
        Route::middleware(['role:administrator,division_leader,team_leader'])->group(function () {
            Route::get('/store-management', [StoreManagementController::class, 'index'])->name('store-management');
            Route::get('/store-management/distinct-stores', [StoreManagementController::class, 'getDistinctStores']);
            Route::get('/store-management/areas/{storeName}', [StoreManagementController::class, 'getAreasForStore']);
            Route::patch('/users/{user}/assign-store', [StoreManagementController::class, 'assignStore'])->name('stores.assign-store');
            Route::delete('/stores/{store}', [StoreManagementController::class, 'delete'])->name('stores.delete');
        });

        // Data Retrieval Routes
        Route::controller(DataLmtListsController::class)->group(function () {
            Route::get('/get-filtered-data', 'getFilteredData');
            Route::get('/get-distinct-stores', 'getDistinctStore');
            Route::get('/get-distinct-districts', 'getDistinctDistrict');
            Route::get('/get-distinct-schools', 'getDistinctSchool');
            Route::get('/get-list-where-filters', 'getListWhereFilters');
            Route::get('/get-account-status-where-filters', 'getAccountStatusWhereFilters');
            Route::get('/get-count-borrowers-where-filters', 'getCountBorrowersWhereFilters');
            Route::get('/get-other-data/{id}', 'getOtherData');
            Route::get('/get-count-total-engaged', 'getCountTotalEngaged');
            Route::get('/get-count-priority-to-engage', 'getCountPriorityToEngage');
            Route::get('/get-list-for-total-engaged', 'getListForTotalEngaged');
            Route::get('/get-list-for-priority-to-engage', 'getListForPriorityToEngage');
        });

        // School and Client Routes
        Route::get('/get-list-of-all-schools', [SchoolController::class, 'index']);
        Route::get('/get-list-of-all-clients', [TeacherController::class, 'index']);
        Route::get('/get-school-profile/{id}', [SchoolController::class, 'show']);

        // Data Update Routes
        Route::patch('/save-engage-data/{id}', [DataLmtListsController::class, 'saveEngageData']);
        Route::patch('/update-priority-to-engage/{id}', [DataLmtListsController::class, 'updatePriorityToEngage']);
        Route::patch('/update-teacher-school/{id}', [TeacherController::class, 'update']);

        // Profile Routes
        Route::controller(ProfileController::class)->group(function () {
            Route::get('/profile', 'edit')->name('profile.edit');
            Route::patch('/profile', 'update')->name('profile.update');
            Route::delete('/profile', 'destroy')->name('profile.destroy');
        });

        // Data Upload Routes
        Route::controller(DataLmtListsController::class)->group(function () {
            Route::get('/data-lmt-list/upload', 'createUploadForm')->name('upload-form');
            Route::post('/data-lmt-list/upload', 'upload')->name('data-lmt-list.upload');
            Route::get('/data-lmt-list/current', 'getCurrentData');
            Route::get('/data-lmt-list/archived', 'getArchivedData');
        });
    });
});
