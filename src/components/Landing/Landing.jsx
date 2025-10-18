import React from 'react'
import { Button } from '../components/ui/button';

const Landing = () => {
    return (
        <div>
            <div className="h-full w-full">
                {/* <HeroNavbar /> */}
                <div className='flex items-center justify-between gap-24'>
                    <div className='pl-1'>
                        <div className="text-6xl font-bold font-maorin">Make Every <br /> Email Count.</div>
                        {/* <div className="text-6xl font-bold pl-32 font-maorin">Build Real Connections.</div> */}
                        {/* <div className="text-3xl font-bold pl-32 mt-6 font-maorin">Connect With Your Ideal Clients Effortlesslly.</div> */}
                        <div className="text-2xl mt-6 font-maorin">Make every mail count.</div>
                        <div className="text-2xl font-maorin">We exist because every mail matters.</div>
                        <Button className="mt-6 bg-blue-700 hover:bg-blue-600 text-white text-2xl font-bold py-6 px-6 rounded-lg font-maorin cursor-pointer">
                            Get Started
                        </Button>
                    </div>
                    <img
                        src="/Images/Hero.png"
                        alt="Hero"
                        className="dark:invert translate-x-8 dark:hue-rotate-200 dark:brightness-110 h-1/2 w-1/2"
                    />
                </div>
            </div>
        </div>
    )
}

export default Landing;