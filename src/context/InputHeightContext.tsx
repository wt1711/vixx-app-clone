import React, { createContext, useContext, ReactNode, useRef, useMemo } from 'react';
import { Animated } from 'react-native';

type InputHeightContextType = {
  // Shared animated value - both RoomInput and RoomTimeline use this same instance
  inputHeightAnim: Animated.Value;
};

const InputHeightContext = createContext<InputHeightContextType | undefined>(undefined);

type InputHeightProviderProps = {
  children: ReactNode;
};

export function InputHeightProvider({ children }: InputHeightProviderProps) {
  // Create the animated value once at provider level
  const inputHeightAnim = useRef(new Animated.Value(0)).current;

  const value: InputHeightContextType = useMemo(
    () => ({
      inputHeightAnim,
    }),
    [inputHeightAnim],
  );

  return <InputHeightContext.Provider value={value}>{children}</InputHeightContext.Provider>;
}

export function useInputHeight() {
  const context = useContext(InputHeightContext);
  if (context === undefined) {
    throw new Error('useInputHeight must be used within an InputHeightProvider');
  }
  return context;
}
