interface HeadTitleProps {
  text: string;
  className?: string;
}

export default function HeadTitle({ text, className = "" }: HeadTitleProps) {
  return (
    <h4 className={`mb-8 text-2xl font-semibold ${className}`}>
      {text}
    </h4>
  );
}
