'use client'

import { useTransitionStore } from '@/app/store/transitionStore'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function GlobalTransition() {
    const { isActive, isRouting, finishTransition } = useTransitionStore()
    const pathname = usePathname()
    const [prevPath, setPrevPath] = useState(pathname)

    useEffect(() => {
        if (pathname !== prevPath) {
            setPrevPath(pathname);
            if (isRouting) {
                // Next.js has mounted the new page, wait a tiny bit to trigger open iris
                setTimeout(() => {
                    finishTransition();
                }, 50);
            }
        }
    }, [pathname, prevPath, isRouting, finishTransition]);

    // When isActive is true -> hole shrinks to 0 (closing black screen)
    // When isActive is false -> hole grows to 200vw (opening to show game)
    const irisSize = isActive ? '0vw' : '200vw';

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center overflow-hidden">
            <div
                className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[600ms] ease-in-out"
                style={{
                    boxShadow: '0 0 0 150vw #111827',
                    width: irisSize,
                    height: irisSize
                }}
            />
        </div>
    )
}
