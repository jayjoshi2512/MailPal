import React from 'react'
import { ModeToggle } from '../mode-toggle';

const LandingNavbar = () => {
    return (
        <div className="h-max w-full py-4 z-50 bg-bg-white dark:bg-black  fixed top-0 left-0 px-[4%] md:px-[8%]">
            <div className='text-2xl flex justify-between items-center font-bold tracking-wide items-center font-maorin'>
                
                <i className="ri-send-plane-fill flex gap-2 items-end flex-row"><span className="font-bold font-maorin text-2xl">Sendify</span></i>
                <ModeToggle />
            </div>

        </div>
    )
}

export default LandingNavbar;