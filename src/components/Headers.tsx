import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const Headers = ({ children }: Props) => {
  return <div>{children}</div>;
};

export default Headers;

