import ThreadList from "./ThreadList";

type Props = {
  onClose: () => void;
};

export default function ThreadOverlay({ onClose }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(10,18,13,0.55)]"
        aria-label="Close threads overlay"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-[min(18rem,85vw)] flex-col border-r border-border bg-card">
        <ThreadList onClose={onClose} />
      </aside>
    </div>
  );
}
