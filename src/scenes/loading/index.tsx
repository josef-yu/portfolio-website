import React, { SetStateAction, Dispatch } from 'react';
import anime, { AnimeInstance } from 'animejs';

interface LoadingProps {
    isLoaded: boolean;
    onChange: Dispatch<SetStateAction<boolean>>;
}

export const Loading = ({isLoaded, onChange}: LoadingProps) => {
    const AnimationRef = React.useRef<AnimeInstance>();
    const [isChanged, setIsChanged] = React.useState(false);

    const sleep = (ms: number) => {
        return new Promise(r => window.setTimeout(r, ms));
    }

    React.useEffect(() => {
        if(!isLoaded && !isChanged) {
        AnimationRef.current = anime({
            targets: '.loading .lines path',
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInQuad',
            duration: 3800,
            delay: function(el, i) {
                return i*250;
            },
            update: function() {
                if(document.readyState === 'complete' && !isChanged) {
                    setIsChanged(true);
                }
            },
            complete: function(animation) {
                anime({
                    targets: '.loading .lines path',
                    opacity: [1, 0],
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    complete: function() {
                        onChange(true);
                    }
                })
                
            }
        });

        return 
    }
        
    });

    React.useEffect(() => {
        if(isChanged) {
            (async () => {
                await sleep(500);
                const seekTime = 3800 * 0.9;                
                AnimationRef?.current?.seek(seekTime);
            })();
        }

    },[isChanged]);

    return (
        <div className="loading">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 838.5 809.5">
                <g fill="none" fillRule="evenodd" strokeLinecap="round" strokeWidth="20" strokeMiterlimit="10" className="lines">
                <path fill="#fbad3b" stroke="#fbad3b" strokeWidth="25" d="M280.25,404.25A140,140 0,1,1 560.25,404.25A140,140 0,1,1 280.25,404.25" className="circle"></path>
                </g>
            </svg> 
        </div>
    )
}