interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className = "", children }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-margin-mobile md:px-margin-desktop ${className}`}>
      {children}
    </div>
  );
}
