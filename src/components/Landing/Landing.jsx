import React from 'react'
import { Button } from '../components/ui/button';
import RotatingText from './RotatingText';

const Landing = () => {
    return (
        <div className="h-[100vh] flex justify-center flex-col-reverse md:flex-row md:items-center md:justify-between">
            {/* <HeroNavbar /> */}

            <div className='md:w-1/2 md:flex md:flex-col md:gap-2 '>
                <div className="text-6xl md:text-6xl font-bold font-maorin">Make Every <br /> Mail Count.</div>
                <div className="text-md md:text-3xl mt-4 flex font-maorin gap-2 items-center">We exist because every mail
                    <RotatingText
                        texts={['Counts', 'Matters', 'is Important']}
                        mainClassName=" px-2 md:px-4 py-1 flex items-center pt-1.5 font-bold bg-blue-600 text-white overflow-hidden justify-center rounded-lg"
                        staggerFrom={"first"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={2000}
                    /></div>
                <p className='hidden md:block'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt facere magni odio est sint maiores, quod suscipit maxime atque deserunt accusamus a dignissimos fugiat enim?</p>
                <Button className="mt-6 w-full md:w-max bg-blue-700 hover:bg-blue-600 text-white text-2xl font-bold py-6 px-6 rounded-lg font-maorin cursor-pointer">
                    Get Started
                </Button>
            </div>


            <div className='w-full flex md:w-1/2 md:h-auto md:flex md:justify-end'>
                <img
                    src="/Images/Hero.png"
                    alt="Hero"
                    className="h-full w-full dark:invert md:translate-x-10 dark:hue-rotate-200 dark:brightness-110"
                />

            </div>
        </div>
    )
}

export default Landing;