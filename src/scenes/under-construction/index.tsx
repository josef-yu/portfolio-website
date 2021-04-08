import React from 'react';
import anime, { AnimeInstance } from 'animejs';

export const Construction = () => {
    const AnimationRef = React.useRef<AnimeInstance>();
    React.useEffect(() => {
        AnimationRef.current = anime({
            targets: '.under-construction',
            easing: 'easeInOutSine',
            opacity: [0, 1],
            duration: 2000,
        })
    }, []);

    return(
        <div className="under-construction">
            <h1 className="site-word">SITE</h1>
            <h1 className="under-word">UNDER</h1>
            <h1 className="construction-word">CONSTRUCTION</h1>
            <h3 className="contact-info">Email me: info@josefyu.com</h3>
        </div>
    )
}