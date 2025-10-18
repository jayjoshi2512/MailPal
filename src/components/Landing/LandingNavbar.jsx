import React from 'react'
import { ModeToggle } from '../mode-toggle';

const LandingNavbar = () => {
    return (
        <div className="w-full flex justify-between items-center pt-4">
            <div className='text-2xl font-bold tracking-wide items-center font-maorin'>
                {/* Cold Mailer */}
                <i className="ri-send-plane-fill flex gap-2 items-end flex-row"><span className="font-bold font-maorin text-2xl">Cold Mailer</span></i>
            </div>
            <div>
                <ModeToggle />
            </div>
        </div>
    )
}

export default LandingNavbar;