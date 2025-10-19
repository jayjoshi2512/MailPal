import React from 'react'
import { Button } from '../components/ui/button';
import RotatingText from './RotatingText';
import CardSwap, { Card } from './CardSwap'

const Landing = () => {
    return (
        <div className="h-[100vh] flex justify-center flex-col-reverse md:flex-row md:items-center md:justify-between overflow-hidden">
            {/* <HeroNavbar /> */}

            <div className='md:w-1/2 md:flex md:flex-col md:gap-2 '>
                <div className="text-6xl md:text-8xl font-bold font-maorin">Make Every <br /> Mail Count.</div>
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
                        rotationInterval={4000}
                    /></div>
                <p className='hidden md:block'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt facere magni odio est sint maiores, quod suscipit maxime atque deserunt accusamus a dignissimos fugiat enim?</p>
                <Button className="mt-6 w-full md:w-max bg-blue-700 hover:bg-blue-600 text-white text-2xl font-bold py-6 px-6 rounded-lg font-maorin cursor-pointer">
                    Get Started
                </Button>
            </div>


            <div className='w-full flex md:w-1/2 md:h-auto md:flex md:justify-center md:items-center overflow-hidden'>
                <div className='relative w-[90%] h-[500px] md:h-[600px]'>
                    <CardSwap
                        cardDistance={60}
                        verticalDistance={70}
                        delay={4000}
                        pauseOnHover={false}
                    >
                        <Card className="flex flex-col p-0 overflow-hidden">
                            <div className="bg-blue-600/10 dark:bg-blue-600/20 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                                <i className="ri-briefcase-fill text-xl text-blue-600"></i>
                                <h3 className="font-bold font-maorin">Job Application</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">From:</span>
                                    <span className="font-medium">john.dev@gmail.com</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">To:</span>
                                    <span className="font-medium">hr@techstartup.com</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">Subject:</span>
                                    <span className="font-semibold">Application for Senior Developer Role</span>
                                </div>
                                <hr className="border-border/50 my-3" />
                                <div className="text-xs leading-relaxed space-y-2">
                                    <p>Dear Hiring Manager,</p>
                                    <p>I'm excited to apply for the Senior Developer position. With 5 years of experience in React and Node.js, I believe I'd be a great fit...</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2 text-xs">
                                        <i className="ri-attachment-2 text-muted-foreground"></i>
                                        <span className="text-muted-foreground">2 attachments</span>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1  rounded text-xs">
                                            <i className="ri-file-text-line text-sm"></i>
                                            <span>Resume.pdf</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1  rounded text-xs">
                                            {/* <i className="ri-file-text-line text-sm"></i> */}
                                            <span className='underline'>Portfolio</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="flex flex-col p-0 overflow-hidden">
                            <div className="bg-green-600/10 dark:bg-green-600/20 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                                <i className="ri-line-chart-fill text-xl text-green-600"></i>
                                <h3 className="font-bold font-maorin">Marketing Outreach</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">From:</span>
                                    <span className="font-medium">sales@growthco.io</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">To:</span>
                                    <span className="font-medium">marketing@ecommerce.com</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">Subject:</span>
                                    <span className="font-semibold">Boost Your Sales by 3x This Quarter</span>
                                </div>
                                <hr className="border-border/50 my-3" />
                                <div className="text-xs leading-relaxed space-y-2">
                                    <p>Hi Sarah,</p>
                                    <p>I noticed your recent product launch. We've helped similar e-commerce brands increase their conversion rates by 45%...</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2 text-xs">
                                        <i className="ri-attachment-2 text-muted-foreground"></i>
                                        <span className="text-muted-foreground">1 attachment</span>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1  rounded text-xs">
                                            <i className="ri-file-chart-line text-sm"></i>
                                            <span>CaseStudy.pdf</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="flex flex-col p-0 overflow-hidden">
                            <div className="bg-purple-600/10 dark:bg-purple-600/20 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                                <i className="ri-links-fill text-xl text-purple-600"></i>
                                <h3 className="font-bold font-maorin">Partnership Proposal</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">From:</span>
                                    <span className="font-medium">partnerships@saasapp.com</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">To:</span>
                                    <span className="font-medium">founder@innovate.io</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-muted-foreground w-12">Subject:</span>
                                    <span className="font-semibold">Collaboration Opportunity - Let's Grow Together</span>
                                </div>
                                <hr className="border-border/50 my-3" />
                                <div className="text-xs leading-relaxed space-y-2">
                                    <p>Hey Alex,</p>
                                    <p>Love what you're building with Innovate! Our tools could complement each other perfectly. How about we explore a partnership...</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2 text-xs">
                                        <i className="ri-attachment-2 text-muted-foreground"></i>
                                        <span className="text-muted-foreground">1 attachment</span>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1  rounded text-xs">
                                            <i className="ri-file-ppt-line text-sm"></i>
                                            <span>Proposal.pptx</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </CardSwap>
                </div>

            </div>
        </div>
    )
}

export default Landing;