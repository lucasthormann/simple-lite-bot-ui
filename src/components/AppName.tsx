import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const AppName = ({ children }: Props) => {
  return <div className="lite-bot">{children}</div>;
};

export default AppName;
