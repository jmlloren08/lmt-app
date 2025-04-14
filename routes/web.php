<?php

use App\Http\Controllers\DataLmtListsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\TeacherController;
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
    // view pages / engaged
    Route::get('/reports/engaged', function () {
        return Inertia::render('Engaged');
    })->name('engaged');
    // view pages / priorities
    Route::get('/reports/priorities', function () {
        return Inertia::render('Priorities');
    })->name('priorities');
    // view pages / total conversion
    Route::get('/reports/target-conversion', function () {
        return Inertia::render('TargetConversion');
    })->name('target-conversion');
    // view pages / actual converted
    Route::get('/reports/actual-converted', function () {
        return Inertia::render('ActualConverted');
    })->name('actual-converted');
    // view page / upload form
    Route::get('/data-lmt-list/upload-form', function () {
        return Inertia::render('DataLmtList/UploadForm');
    })->name('upload-form');

    // view pages / users
    Route::middleware([CheckRoles::class])->group(function () {
        Route::get('/users', function () {
            return Inertia::render('Users');
        })->name('users');
        Route::get('/schools', function () {
            return Inertia::render('Schools');
        })->name('schools');
        Route::get('/teachers', function () {
            return Inertia::render('Teachers');
        })->name('teachers');
        Route::get('/get-users-list', [UserController::class, 'getUsers']);
    });

    // get data
    Route::get('/get-filtered-data', [DataLmtListsController::class, 'getFilteredData']);
    Route::get('/get-distinct-stores', [DataLmtListsController::class, 'getDistinctStore']);
    Route::get('/get-distinct-districts', [DataLmtListsController::class, 'getDistinctDistrict']);
    Route::get('/get-distinct-schools', [DataLmtListsController::class, 'getDistinctSchool']);
    Route::get('/get-list-where-filters', [DataLmtListsController::class, 'getListWhereFilters']);
    Route::get('/get-account-status-where-filters', [DataLmtListsController::class, 'getAccountStatusWhereFilters']);
    Route::get('/get-count-borrowers-where-filters', [DataLmtListsController::class, 'getCountBorrowersWhereFilters']);
    Route::get('/get-other-data/{id}', [DataLmtListsController::class, 'getOtherData']);
    Route::get('/get-count-total-engaged', [DataLmtListsController::class, 'getCountTotalEngaged']);
    Route::get('/get-count-priority-to-engage', [DataLmtListsController::class, 'getCountPriorityToEngage']);
    Route::get('/get-list-for-total-engaged', [DataLmtListsController::class, 'getListForTotalEngaged']);
    Route::get('/get-list-for-priority-to-engage', [DataLmtListsController::class, 'getListForPriorityToEngage']);
    Route::get('/get-list-of-all-schools', [SchoolController::class, 'index']);
    Route::get('/get-list-of-all-teachers', [TeacherController::class, 'index']);
    Route::get('/get-school-profile/{id}', [SchoolController::class, 'show']);
    // update data
    Route::patch('/update-user-role/{id}', [UserController::class, 'update']);
    Route::patch('/cancel-user-role/{id}', [UserController::class, 'cancel']);
    Route::patch('/assign-user-store/{id}', [UserController::class, 'assignStore']);
    Route::patch('/save-engage-data/{id}', [DataLmtListsController::class, 'saveEngageData']);
    Route::patch('/update-priority-to-engage/{id}', [DataLmtListsController::class, 'updatePriorityToEngage']);
    Route::patch('/update-teacher-school/{id}', [TeacherController::class, 'update']);
    // remove data
    Route::delete('/remove-user/{id}', [UserController::class, 'delete']);
    // profile information
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // upload csv
    Route::post('/data-lmt-list/upload', [DataLmtListsController::class, 'upload']);
    Route::get('/data-lmt-list/current', [DataLmtListsController::class, 'getCurrentData']);
    Route::get('/data-lmt-list/archived', [DataLmtListsController::class, 'getArchivedData']);
    Route::get('/check-limits', function() {
        return [
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
        ];
    });
});

require __DIR__ . '/auth.php';
