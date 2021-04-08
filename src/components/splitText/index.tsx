import React from 'react';

interface SplitTextProps {
    text: string;
    className: string;
}

export const SplitText = ({text, className}: SplitTextProps) => {
    

    return (
        <React.Fragment>
        {text.split("").map(function(char: string, index: number){
            return <span className={className} key={index}>{char}</span>;
        })}
        </React.Fragment>
    )
}