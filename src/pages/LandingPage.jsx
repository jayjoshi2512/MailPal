import LandingNavbar from '@/components/Landing/LandingNavbar';
import Landing from '@/components/Landing/Landing';
import React from 'react'

const LandingPage = () =>{
    return (
        <div className='h-screen w-full px-[8%]'>
            <LandingNavbar />
            <Landing />
        </div>
    )
}

export default LandingPage;