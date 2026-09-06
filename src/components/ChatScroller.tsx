import React, { ReactNode, useEffect, useRef } from 'react';

interface Props {
  children: ReactNode;
}

const ChatScroller = ({ children }: Props) => {
 
  const outerDiv = useRef(null);
  const innerDiv = useRef(null);

  // start the container at the bottom
  useEffect(() => {
    const outerHeight = outerDiv.current.clientHeight;
    const innerHeight = innerDiv.current.clientHeight;

    outerDiv.current.scrollTo({
      top: innerHeight - outerHeight,
      left: 0
    });
  }, []);
 
  // scroll smoothly on change of children
  useEffect(() => {
    const outerHeight = outerDiv.current.clientHeight;
    const innerHeight = innerDiv.current.clientHeight;

    outerDiv.current.scrollTo({
      top: innerHeight - outerHeight,
      left: 0,
      behavior: "smooth"
    });
  }, [children]);
  
  return (
    <div
      ref={outerDiv}
      style={{
        position: "relative", 
        height: "100%",
        overflow: "scroll"
       }}
    >
      <div
        ref={innerDiv}
        style={{
          position: "relative"
        }}
      >
        {children}
      </div>
    </div>
  )
};

export default ChatScroller;
