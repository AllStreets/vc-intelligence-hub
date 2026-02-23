import { useState, useEffect, memo } from 'react';
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DroppableArea } from './DroppableArea';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { fetchDealsWithCache, getApiBaseUrl } from '../services/dataCache';

const pipelineStages = [
  { id: 'prospecting', label: 'Prospecting', color: 'amber' },
  { id: 'evaluating', label: 'Evaluating', color: 'blue' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'purple' },
  { id: 'ready_to_invest', label: 'Ready to Invest', color: 'green' }
];

// Cities for founder generation
const US_CITIES = [
  { name: 'Chicago', state: 'IL' },
  { name: 'San Francisco', state: 'CA' },
  { name: 'Cary', state: 'NC' },
  { name: 'Seattle', state: 'WA' },
  { name: 'New York', state: 'NY' },
  { name: 'Miami', state: 'FL' }
];

// Founder titles - varied and realistic
const FOUNDER_TITLES = ['CEO', 'CTO', 'CFO', 'Founder', 'Chairman', 'President', 'VP Engineering', 'VP Product', 'VC Manager', 'Partner'];

// Generate fake founder data with city information
const generateFakeFounders = (dealId) => {
  const founderCount = Math.floor(Math.random() * 4) + 1; // 1-4 founders
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew', 'Blake', 'Sage', 'Cameron'];
  const lastNames = ['Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

  const founders = [];
  for (let i = 0; i < founderCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
    const title = FOUNDER_TITLES[Math.floor(Math.random() * FOUNDER_TITLES.length)];

    founders.push({
      id: `founder-${dealId}-${i}`,
      name: `${firstName} ${lastName}`,
      title: title,
      city: `${city.name}, ${city.state}`,
      twitter: `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      angellist: `https://angel.co/${firstName.toLowerCase()}${lastName.toLowerCase()}`
    });
  }

  return founders;
};

function DraggableDealCard({ deal, stageId, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: { dealId: deal.id, stageId }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-dark-600 rounded p-3 cursor-move hover:bg-dark-500 transition-colors border border-dark-500 flex justify-between items-start group ${
        isDragging ? 'opacity-50 ring-2 ring-amber-400' : ''
      }`}
    >
      <div className="flex-1">
        <p className="font-semibold text-white text-sm">{deal.company_name}</p>
        <p className="text-xs text-slate-400 mt-1">{deal.funding_type}</p>
        {deal.founders?.length > 0 && (
          <>
            <p className="text-xs text-amber-400 mt-1">👤 {deal.founders[0].name}</p>
            {deal.founders[0].title && (
              <p className="text-xs text-amber-300 mt-0.5">{deal.founders[0].title}</p>
            )}
            {deal.founders[0].city && (
              <p className="text-xs text-slate-500 mt-0.5">📍 {deal.founders[0].city}</p>
            )}
          </>
        )}
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[DELETE] Button clicked for deal:', deal.id);
          onDelete(stageId, deal.id);
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="ml-2 p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
        title="Delete deal"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

const DealPipeline = memo(function DealPipeline() {
  const [deals, setDeals] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    funding_type: 'Seed',
    status: 'prospecting',
    founders: ''
  });

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8, // 8px threshold before drag starts
    })
  );

  useEffect(() => {
    fetchDeals();
  }, []);

  const savePipelineToStorage = (updatedPipeline) => {
    try {
      localStorage.setItem('vc-custom-deals', JSON.stringify(updatedPipeline));
    } catch (error) {
      console.error('Error saving pipeline:', error);
    }
  };

  const loadCustomDeals = () => {
    try {
      const saved = localStorage.getItem('vc-custom-deals');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading custom deals:', error);
    }
    return null;
  };

  const isHighQualityDeal = (deal) => {
    // Filter out low-quality news-based "deals"
    // Real deals should have meaningful company names
    const companyName = deal.company_name || '';

    // Reject single-word company names or generic titles (likely extracted from news headlines)
    if (companyName.length < 3) return false;
    if (/^(The|What|Can|Where|How|Why|When|Who|Which|Why|This|That|It|Is|Are|Be|Will|Would|Could|Should|Has|Have|Does|Did|Do|Being)$/i.test(companyName)) return false;

    // Accept deals with any funding type (we'll enrich with fake founders anyway)
    const fundingType = deal.funding_type || '';
    if (fundingType === '') return false;

    return true;
  };

  const fetchDeals = async () => {
    try {
      const dealsData = await fetchDealsWithCache();
      let data = dealsData.deals || [];

      // Filter to high-quality deals only
      data = data.filter(isHighQualityDeal);

      // Enrich deals with fake founder data
      data = data.map((deal, idx) => {
        const enrichedDeal = {
          ...deal,
          founders: deal.founders && deal.founders.length > 0 ? deal.founders : generateFakeFounders(deal.id)
        };
        // Debug: log sample founder data
        if (idx === 0 && enrichedDeal.founders?.length > 0) {
          console.log('[DealPipeline] First deal:', {
            company: enrichedDeal.company_name,
            founder: enrichedDeal.founders[0].name,
            title: enrichedDeal.founders[0].title,
            city: enrichedDeal.founders[0].city
          });
        }
        return enrichedDeal;
      });

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

      // Load custom deals from localStorage
      const customDeals = loadCustomDeals();
      if (customDeals) {
        Object.keys(customDeals).forEach(stageId => {
          staged[stageId] = [...(staged[stageId] || []), ...customDeals[stageId]];
        });
      }

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

    if (!over) {
      console.debug('No drop target found');
      return;
    }

    const dealId = active.id;
    const newStage = over.id;
    const oldStage = active.data?.stageId;

    console.debug('Drag ended:', { dealId, oldStage, newStage });

    if (oldStage === newStage) {
      console.debug('Same stage, no change');
      return;
    }

    if (!oldStage) {
      console.error('Old stage not found in active.data');
      return;
    }

    // Update local state
    const updatedPipeline = { ...pipeline };
    const movedDeal = updatedPipeline[oldStage]?.find(d => d.id === dealId);

    if (movedDeal) {
      updatedPipeline[oldStage] = updatedPipeline[oldStage].filter(d => d.id !== dealId);
      if (!updatedPipeline[newStage]) {
        updatedPipeline[newStage] = [];
      }
      updatedPipeline[newStage].push(movedDeal);
      setPipeline(updatedPipeline);
      savePipelineToStorage(updatedPipeline);

      // Update backend
      try {
        const baseUrl = getApiBaseUrl();
        await fetch(`${baseUrl}/api/deals/${dealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStage })
        });
      } catch (error) {
        console.error('Error updating deal status:', error);
      }
    } else {
      console.error('Moved deal not found in old stage', { dealId, oldStage, deals: updatedPipeline[oldStage] });
    }
  };

  const handleDeleteDeal = (stageId, dealId) => {
    console.log('[DELETE] Before:', { stageId, dealId, stageCount: pipeline[stageId]?.length });
    const updatedPipeline = { ...pipeline };
    const dealsInStage = updatedPipeline[stageId] || [];
    updatedPipeline[stageId] = dealsInStage.filter(d => d.id !== dealId);
    console.log('[DELETE] After:', { stageId, newCount: updatedPipeline[stageId].length });
    setPipeline(updatedPipeline);
    savePipelineToStorage(updatedPipeline);
  };

  const handleAddDeal = async (e) => {
    e.preventDefault();

    try {
      // Create deal with local ID
      const newDeal = {
        id: Date.now().toString(),
        company_name: formData.company_name,
        funding_type: formData.funding_type,
        status: formData.status,
        founders: formData.founders ? [{ name: formData.founders }] : []
      };

      // Update local state
      setDeals([...deals, newDeal]);
      const updatedPipeline = { ...pipeline };
      if (!updatedPipeline[formData.status]) {
        updatedPipeline[formData.status] = [];
      }
      updatedPipeline[formData.status].push(newDeal);
      setPipeline(updatedPipeline);
      savePipelineToStorage(updatedPipeline);

      // Try to sync with backend if available
      try {
        const baseUrl = getApiBaseUrl();
        const dealPayload = {
          company_name: formData.company_name,
          funding_type: formData.funding_type,
          status: formData.status,
          founders: formData.founders ? [{ name: formData.founders }] : []
        };

        await fetch(`${baseUrl}/api/deals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dealPayload)
        });
      } catch (backendError) {
        console.warn('Backend sync failed, using local storage:', backendError);
      }

      // Reset form
      setFormData({
        company_name: '',
        funding_type: 'Seed',
        status: 'prospecting',
        founders: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding deal:', error);
      alert('Failed to add deal. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <p className="text-slate-400">Loading pipeline...</p>;
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Deal
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div className="grid grid-cols-4 gap-4">
          {pipelineStages.map(stage => (
            <div key={stage.id} className="bg-dark-700 rounded-lg border border-dark-600 p-4">
              <h3 className={`text-sm font-bold text-${stage.color}-500 mb-4`}>
                {stage.label} ({pipeline[stage.id]?.length || 0})
              </h3>

              <DroppableArea stageId={stage.id}>
                <div className="space-y-2 min-h-96">
                  {pipeline[stage.id]?.map(deal => (
                    <DraggableDealCard
                      key={deal.id}
                      deal={deal}
                      stageId={stage.id}
                      onDelete={handleDeleteDeal}
                    />
                  ))}
                </div>
              </DroppableArea>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Add Deal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg border border-dark-600 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Deal</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Funding Type
                </label>
                <select
                  name="funding_type"
                  value={formData.funding_type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded text-white focus:outline-none focus:border-amber-500"
                >
                  <option>Seed</option>
                  <option>Series A</option>
                  <option>Series B</option>
                  <option>Series C</option>
                  <option>Series D+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Pipeline Stage
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded text-white focus:outline-none focus:border-amber-500"
                >
                  {pipelineStages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Lead Founder (Optional)
                </label>
                <input
                  type="text"
                  name="founders"
                  value={formData.founders}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Enter founder name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold transition-colors"
                >
                  Add Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

export { DealPipeline };
