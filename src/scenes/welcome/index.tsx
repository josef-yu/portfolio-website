import React, { Dispatch, SetStateAction } from 'react';
import anime, { AnimeTimelineInstance } from 'animejs';
import {SplitText} from '../../components'

import logo from '../../assets/images/brand-logo-min.svg';

interface WelcomeProps {
    setAnimationFinished: Dispatch<SetStateAction<boolean>>;
}

export const Welcome = ({setAnimationFinished}: WelcomeProps) => {
    const AnimationRef = React.useRef<AnimeTimelineInstance>();
    const [imgSrc] = React.useState(logo);

    React.useEffect(() => {

        AnimationRef.current = anime.timeline({
            easing: 'easeInOutSine',
            duration: 2000,
        });

        AnimationRef.current.add({
            targets: '.welcome-logo',
            opacity: [0, 1],
            translateX: ['1em', 0],
        }, 0).add({
            targets: '.letter',
            translateX: ['-0.75rem', 0],
            translateZ: 0,
            opacity: [0, 1],
            easing: 'easeOutExpo',
            delay: (el, i) => 500 + 30 * i,
        }, 0).add({
            targets: '.welcome',
            opacity: [1, 0],
            duration: 1000,
            complete: function() {
                setAnimationFinished(true);
            },
        }, 2000)
    }, [setAnimationFinished]);

    return(
        <div className="welcome" >
            <img src={imgSrc} className="welcome-logo" alt="logo"/>
            <h1 className='welcome-text'>
                <SplitText text="WELCOME" className="letter"/>
            </h1>
        </div>
    )
}