import React from 'react';
import { useWalkthrough } from '../../hooks/useWalkthrough';
import { walkthroughConfigs } from '../../lib/walkthroughConfigs';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { WalkthroughId } from '../../types/app/walkthrough';

interface WalkthroughDebugProps {
  show?: boolean;
}

export const WalkthroughDebug: React.FC<WalkthroughDebugProps> = ({ show = false }) => {
  const {
    startWalkthroughById,
    resetWalkthrough,
    resetAllWalkthroughs,
    isCompleted,
    isSkipped,
    getState,
    getCurrentConfig,
  } = useWalkthrough();

  if (!show) return null;

  const state = getState();
  const currentConfig = getCurrentConfig();

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50 bg-white shadow-lg border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🔧 Walkthrough Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Current State */}
        <div>
          <h4 className="font-semibold mb-1">Current State:</h4>
          <div className="bg-gray-100 p-2 rounded">
            <div>Active: {state.isActive ? '✅' : '❌'}</div>
            <div>Step: {state.currentStepIndex + 1}</div>
            <div>Config: {currentConfig?.id ?? 'None'}</div>
            <div>Title: {currentConfig?.title ?? 'N/A'}</div>
          </div>
        </div>

        {/* Available Configurations */}
        <div>
          <h4 className="font-semibold mb-1">Available Configs:</h4>
          {Object.entries(walkthroughConfigs).map(([id, config]) => (
            <div key={id} className="bg-gray-50 p-2 rounded mb-1">
              <div className="font-medium">{config.title}</div>
              <div className="text-gray-600">ID: {id}</div>
              <div className="text-gray-600">Steps: {config.steps.length}</div>
              <div className="text-gray-600">
                Status: {isCompleted(id as WalkthroughId) ? '✅ Completed' : 
                  isSkipped(id as WalkthroughId) ? '⏭️ Skipped' : 
                    '⏸️ Not started'}
              </div>
              <div className="flex gap-1 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startWalkthroughById(id as WalkthroughId)}
                  className="text-xs h-6 px-2"
                >
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetWalkthrough(id as WalkthroughId)}
                  className="text-xs h-6 px-2"
                >
                  Reset
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-semibold mb-1">Actions:</h4>
          <div className="space-y-1">
            <Button
              size="sm"
              variant="destructive"
              onClick={resetAllWalkthroughs}
              className="text-xs h-7 w-full"
            >
              Reset All Walkthroughs
            </Button>
          </div>
        </div>

        {/* Current Step Details */}
        {currentConfig && state.isActive && (
          <div>
            <h4 className="font-semibold mb-1">Current Step:</h4>
            <div className="bg-blue-50 p-2 rounded">
              <div>Title: {currentConfig.steps[state.currentStepIndex]?.title}</div>
              <div>Target: {currentConfig.steps[state.currentStepIndex]?.targetSelector}</div>
              <div>Position: {currentConfig.steps[state.currentStepIndex]?.position}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 