import React from 'react';


export const Navbar: React.FunctionComponent<React.HTMLAttributes<HTMLOrSVGElement>> = ({children, ...rest}) => {

    return(
        <div {...rest}>
            {children}
        </div>
    )
}