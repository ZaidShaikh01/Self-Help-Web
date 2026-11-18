import { Plus } from 'lucide-react';

type SecoundaryButtonProps = {
  content: string;
  onClick?: () => void;
  addPlus?: boolean;
};

const SecoundaryButton = ({
  content,
  addPlus,
  onClick,
}: SecoundaryButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
    >
      {addPlus && <Plus className='w-4 h-4' />} {content}
    </button>
  );
};

export default SecoundaryButton;
