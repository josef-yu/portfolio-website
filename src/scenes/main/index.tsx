import React from 'react';
import { Welcome, Construction } from '../';

export const Main = () => {
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        if(index < 2) {
            setTimeout(() => setIndex(index + 1), 3000);
        }

    }, [index]);

    return(
        <div className='Main'>
            {index === 0 ? <Welcome /> : <Construction />}
        </div>
    );
}