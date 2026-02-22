import { useDroppable } from '@dnd-kit/core';

export function DroppableArea({ stageId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-dark-500' : ''}`}
    >
      {children}
    </div>
  );
}
