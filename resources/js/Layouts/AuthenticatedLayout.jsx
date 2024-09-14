import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {

    const [showNavigationDropDown, setShowNavigationDropDown] = useState(false);

    const fullNavigation = [
        { name: 'Home', href: route('dashboard'), current: route().current('dashboard') },
        { name: 'Reports', href: route('reports'), current: route().current('reports') },
        { name: 'Settings', href: route('settings'), current: route().current('settings') }
    ];

    const navigation = user.roles === 'Administrator' ? fullNavigation : fullNavigation.filter(item => item.name === 'Home' || item.name === 'Reports');

    const userNavigation = [
        { name: 'Profile', href: route('profile.edit'), current: route().current('profile.edit') },
        { name: 'Log Out', href: route('logout'), method: 'POST' }
    ];

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    return (
        <div className="min-h-full">
            <nav className='bg-gray-800'>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link href='/'>
                                    <ApplicationLogo className='block h-9 w-auto fill-current text-white' />
                                </Link>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-1">
                                    {navigation.map((item) => (
                                        <NavLink
                                            key={item.name}
                                            href={item.href}
                                            active={item.current}
                                            className={classNames(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'rounded-md px-3 py-2 text-base font-medium')}
                                        >
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <div className="text-white text-sm">{user.name}</div>
                                <div className='relative ml-3'>
                                    <button className='relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
                                        onClick={() => setShowNavigationDropDown(prev => !prev)}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <img src='https://cdn-icons-png.flaticon.com/512/149/149071.png' alt="" className="h-8 w-8 rounded-full" />
                                    </button>
                                    <Transition
                                        as={React.Fragment}
                                        show={showNavigationDropDown}
                                        enter='transition ease-out duration-100'
                                        enterFrom='transform opacity-0 scale-95'
                                        enterTo='transform opacity-100 scale-100'
                                        leave='transition ease-in duration-75'
                                        leaveFrom='transform opacity-100 scale-100'
                                        leaveTo='transform opacity-0 scale-95'
                                    >
                                        <div
                                            className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                                        >
                                            {userNavigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    method={item.method}
                                                    as={item.method === 'POST' ? 'button' : 'a'}
                                                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </Transition>
                                </div>
                            </div>
                        </div>

                        <div className="-mr-2 flex md:hidden">
                            <button
                                className='inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
                                onClick={() => setShowNavigationDropDown(prev => !prev)}
                            >
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon className={`block h-6 w-6 ${showNavigationDropDown ? 'hidden' : 'block'}`} aria-hidden='true' />
                                <XMarkIcon className={`block h-6 w-6 ${showNavigationDropDown ? 'block' : 'hidden'}`} aria-hidden='true' />
                            </button>
                        </div>
                    </div>
                </div >

                <Transition
                    as={React.Fragment}
                    show={showNavigationDropDown}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                >
                    <div className='md:hidden'>
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium')}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-gray-700 pb-3 pt-4">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <img src='https://cdn-icons-png.flaticon.com/512/149/149071.png' alt="" className="h-10 w-10 rounded-full" />
                                </div>
                                <div className="ml-3">
                                    <div className='text-base font-medium leading-none text-white'>{user.name}</div>
                                    <div className='text-sm font-medium leading-none text-gray-400'>{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        method={item.method}
                                        as={item.method === 'POST' ? 'button' : 'a'}
                                        className='block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white'
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </Transition>
            </nav >

            {
                header && (
                    <header className='bg-white shadow'>
                        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )
            }

            <main>
                <div className="bg-gray-100 mx-auto max-w-full py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div >
    );
}
