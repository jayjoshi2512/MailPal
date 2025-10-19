import Landing from '@/components/Landing/Landing';
import Navbar from '@/components/Navbar';
import React from 'react'

const LandingPage = () =>{
    return (
        <div className='h-screen w-full px-[4%] md:px-[8%]'>
            <Navbar showConnectButton={true} />
            <Landing />
        </div>
    )
}

export default LandingPage;