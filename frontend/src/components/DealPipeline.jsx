import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { DroppableArea } from './DroppableArea';

const pipelineStages = [
  { id: 'prospecting', label: 'Prospecting', color: 'amber' },
  { id: 'evaluating', label: 'Evaluating', color: 'blue' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'purple' },
  { id: 'ready_to_invest', label: 'Ready to Invest', color: 'green' }
];

export function DealPipeline() {
  const [deals, setDeals] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/deals`);
      const data = await response.json();

      // Initialize pipeline by status
      const staged = {};
      pipelineStages.forEach(stage => {
        staged[stage.id] = [];
      });

      data.forEach(deal => {
        const status = deal.status || 'prospecting';
        if (staged[status]) {
          staged[status].push(deal);
        } else {
          staged.prospecting.push(deal);
        }
      });

      setDeals(data);
      setPipeline(staged);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const dealId = active.id;
    const newStage = over.id;

    // Update local state
    const updatedPipeline = { ...pipeline };
    Object.keys(updatedPipeline).forEach(stage => {
      updatedPipeline[stage] = updatedPipeline[stage].filter(d => d.id !== dealId);
    });
    updatedPipeline[newStage]?.push(
      deals.find(d => d.id === dealId)
    );
    setPipeline(updatedPipeline);

    // Update backend
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${baseUrl}/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStage })
      });
    } catch (error) {
      console.error('Error updating deal status:', error);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading pipeline...</p>;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {pipelineStages.map(stage => (
          <div key={stage.id} className="bg-dark-700 rounded-lg border border-dark-600 p-4">
            <h3 className={`text-sm font-bold text-${stage.color}-500 mb-4`}>
              {stage.label} ({pipeline[stage.id]?.length || 0})
            </h3>

            <DroppableArea stageId={stage.id}>
              <div className="space-y-2 min-h-96">
                {pipeline[stage.id]?.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    className="bg-dark-600 rounded p-3 cursor-move hover:bg-dark-500 transition-colors border border-dark-500"
                  >
                    <p className="font-semibold text-white text-sm">{deal.company_name}</p>
                    <p className="text-xs text-slate-400 mt-1">{deal.funding_type}</p>
                    {deal.founders?.length > 0 && (
                      <p className="text-xs text-amber-400 mt-1">👤 {deal.founders[0].name}</p>
                    )}
                  </div>
                ))}
              </div>
            </DroppableArea>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
