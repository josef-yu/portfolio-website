import React from 'react';
import { Welcome, Construction } from '../';

export const Main = () => {
    const [animationFinished, setAnimationFinished] = React.useState(false);

    return(
        <div className='Main'>
            {animationFinished === false ? <Welcome setAnimationFinished={setAnimationFinished}/> : <Construction />}
        </div>
    );
}