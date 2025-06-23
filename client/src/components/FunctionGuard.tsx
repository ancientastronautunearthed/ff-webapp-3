import React from 'react';
import { useCompanionAccess } from '@/hooks/useCompanionAccess';
import { FunctionGate } from './DynamicFunctionGating';

interface FunctionGuardProps {
  requiredTier: number;
  functionName: string;
  description: string;
  icon: React.ElementType;
  category?: 'health' | 'analysis' | 'recommendations' | 'advanced';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FunctionGuard: React.FC<FunctionGuardProps> = ({
  requiredTier,
  functionName,
  description,
  icon,
  category,
  children,
  fallback
}) => {
  const { hasAccess } = useCompanionAccess();

  if (hasAccess(requiredTier)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <FunctionGate
      functionName={functionName}
      requiredTier={requiredTier}
      description={description}
      icon={icon}
      category={category}
    >
      {children}
    </FunctionGate>
  );
};

// Higher-order component version
export const withFunctionGating = <P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: number,
  functionName: string,
  description: string,
  icon: React.ElementType,
  category?: 'health' | 'analysis' | 'recommendations' | 'advanced'
) => {
  return (props: P) => (
    <FunctionGuard
      requiredTier={requiredTier}
      functionName={functionName}
      description={description}
      icon={icon}
      category={category}
    >
      <Component {...props} />
    </FunctionGuard>
  );
};

// Hook for conditional rendering based on access
export const useConditionalRender = (requiredTier: number) => {
  const { hasAccess, getFunctionStatus } = useCompanionAccess();
  
  return {
    canRender: hasAccess(requiredTier),
    status: getFunctionStatus(requiredTier)
  };
};