type PrimaryButtonProps ={
    content:string
    onClick?:()=>void;
}

const PrimaryButton = ({content,onClick}:PrimaryButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--border-strong)]"
    >
      {content}
    </button>
  );
};

export default PrimaryButton;
