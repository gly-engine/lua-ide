import React, { useState, useRef } from 'react';
import Keyboard, { KeyboardReactInterface } from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import { ansiLayout, compactLayout } from '@/lib/keyboard-layouts';
import { IDESettings } from '@/lib/settings';
import eventBus from '@/lib/event-bus';
import { useTheme } from '@/components/theme-provider';

interface VirtualKeyboardProps {
  settings: IDESettings;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ settings }) => {
  const [layoutName, setLayoutName] = useState('default');
  const keyboard = useRef<KeyboardReactInterface['keyboard']>();
  const { actualTheme } = useTheme();

  const layouts = {
    ansi: ansiLayout,
    compact: compactLayout,
  };

  const handleKeyPress = (button: string) => {
    if (settings.keyboard.hapticFeedback) {
      navigator.vibrate?.(10);
    }

    eventBus.emit('keypress', button);

    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    }
  };

  const keyboardTheme = actualTheme === 'dark'
    ? "hg-theme-default hg-theme-dark"
    : "hg-theme-default";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Keyboard
        keyboardRef={r => (keyboard.current = r)}
        layoutName={layoutName}
        layout={layouts[settings.keyboard.layout]}
        onKeyPress={handleKeyPress}
        theme={keyboardTheme}
        display={{
          '{bksp}': '⌫',
          '{enter}': 'enter',
          '{shift}': '⇧',
          '{lock}': '⇪',
          '{tab}': '⇥',
          '{space}': ' ',
          '{arrowup}': '↑',
          '{arrowdown}': '↓',
          '{arrowleft}': '←',
          '{arrowright}': '→'
        }}
      />
    </div>
  );
};

export default VirtualKeyboard;
