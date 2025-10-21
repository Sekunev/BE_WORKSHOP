import { Platform } from 'react-native';

// Accessibility role mappings
export const AccessibilityRoles = {
  BUTTON: 'button' as const,
  LINK: 'link' as const,
  TEXT: 'text' as const,
  HEADING: 'header' as const,
  IMAGE: 'image' as const,
  LIST: 'list' as const,
  LIST_ITEM: 'listitem' as const,
  SEARCH: 'search' as const,
  TAB: 'tab' as const,
  TAB_LIST: 'tablist' as const,
  MENU: 'menu' as const,
  MENU_ITEM: 'menuitem' as const,
  ALERT: 'alert' as const,
  CHECKBOX: 'checkbox' as const,
  RADIO: 'radio' as const,
  SWITCH: 'switch' as const,
  SLIDER: 'slider' as const,
  PROGRESS_BAR: 'progressbar' as const,
  NONE: 'none' as const,
} as const;

// Accessibility state types
export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

// Accessibility action types
export const AccessibilityActions = {
  ACTIVATE: 'activate' as const,
  INCREMENT: 'increment' as const,
  DECREMENT: 'decrement' as const,
  SCROLL_UP: 'scrollUp' as const,
  SCROLL_DOWN: 'scrollDown' as const,
  SCROLL_LEFT: 'scrollLeft' as const,
  SCROLL_RIGHT: 'scrollRight' as const,
  PAGE_UP: 'pageUp' as const,
  PAGE_DOWN: 'pageDown' as const,
  ESCAPE: 'escape' as const,
  DISMISS: 'dismiss' as const,
  LONG_PRESS: 'longpress' as const,
  MAGIC_TAP: 'magicTap' as const,
} as const;

// Helper functions for accessibility
export const AccessibilityHelpers = {
  // Create accessibility label for blog post
  createBlogPostLabel: (title: string, author: string, readingTime: number, likeCount: number) => {
    return `Blog yazısı: ${title}, Yazar: ${author}, Okuma süresi: ${readingTime} dakika, ${likeCount} beğeni`;
  },

  // Create accessibility label for button with state
  createButtonLabel: (text: string, state?: { loading?: boolean; disabled?: boolean }) => {
    let label = text;
    if (state?.loading) {
      label += ', yükleniyor';
    }
    if (state?.disabled) {
      label += ', devre dışı';
    }
    return label;
  },

  // Create accessibility hint for actions
  createActionHint: (action: string) => {
    const hints: Record<string, string> = {
      'tap': 'Dokunarak etkinleştirin',
      'double_tap': 'Çift dokunarak etkinleştirin',
      'long_press': 'Uzun basarak menüyü açın',
      'swipe_left': 'Sola kaydırarak silin',
      'swipe_right': 'Sağa kaydırarak işaretleyin',
      'scroll': 'Kaydırarak daha fazla içerik görün',
    };
    return hints[action] || action;
  },

  // Create accessibility label for form field
  createFormFieldLabel: (label: string, required?: boolean, error?: string) => {
    let accessibilityLabel = label;
    if (required) {
      accessibilityLabel += ', zorunlu alan';
    }
    if (error) {
      accessibilityLabel += `, hata: ${error}`;
    }
    return accessibilityLabel;
  },

  // Create accessibility label for navigation
  createNavigationLabel: (screenName: string, isActive?: boolean) => {
    let label = screenName;
    if (isActive) {
      label += ', aktif sekme';
    }
    return label;
  },

  // Create accessibility label for list items
  createListItemLabel: (position: number, total: number, content: string) => {
    return `${position}. öğe, toplam ${total} öğeden, ${content}`;
  },

  // Create accessibility label for progress
  createProgressLabel: (current: number, total: number, unit: string = '') => {
    const percentage = Math.round((current / total) * 100);
    return `İlerleme: ${current}${unit} / ${total}${unit}, %${percentage} tamamlandı`;
  },

  // Create accessibility label for rating
  createRatingLabel: (rating: number, maxRating: number = 5) => {
    return `${maxRating} üzerinden ${rating} puan`;
  },

  // Create accessibility label for date
  createDateLabel: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Create accessibility label for time
  createTimeLabel: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

// Accessibility props builder
export const buildAccessibilityProps = (config: {
  role?: keyof typeof AccessibilityRoles;
  label?: string;
  hint?: string;
  state?: AccessibilityState;
  actions?: Array<keyof typeof AccessibilityActions>;
  value?: string | number;
  liveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}) => {
  const props: any = {};

  if (config.role) {
    props.accessibilityRole = AccessibilityRoles[config.role];
  }

  if (config.label) {
    props.accessibilityLabel = config.label;
  }

  if (config.hint) {
    props.accessibilityHint = config.hint;
  }

  if (config.state) {
    props.accessibilityState = config.state;
  }

  if (config.value !== undefined) {
    props.accessibilityValue = { text: String(config.value) };
  }

  if (config.liveRegion) {
    props.accessibilityLiveRegion = config.liveRegion;
  }

  if (config.importantForAccessibility) {
    props.importantForAccessibility = config.importantForAccessibility;
  }

  if (config.actions && config.actions.length > 0) {
    props.accessibilityActions = config.actions.map(action => ({
      name: AccessibilityActions[action],
    }));
  }

  return props;
};

// Platform-specific accessibility helpers
export const PlatformAccessibility = {
  // iOS specific accessibility traits
  ios: {
    traits: {
      BUTTON: 'button',
      LINK: 'link',
      HEADER: 'header',
      SEARCH_FIELD: 'searchField',
      IMAGE: 'image',
      SELECTED: 'selected',
      PLAYS_SOUND: 'playsSound',
      KEYBOARD_KEY: 'keyboardKey',
      STATIC_TEXT: 'staticText',
      SUMMARY_ELEMENT: 'summaryElement',
      NOT_ENABLED: 'notEnabled',
      UPDATES_FREQUENTLY: 'updatesFrequently',
      STARTS_MEDIA_SESSION: 'startsMediaSession',
      ADJUSTABLE: 'adjustable',
      ALLOWS_DIRECT_INTERACTION: 'allowsDirectInteraction',
      CAUSES_PAGE_TURN: 'causesPageTurn',
    },
  },

  // Android specific accessibility properties
  android: {
    importantForAccessibility: {
      AUTO: 'auto',
      YES: 'yes',
      NO: 'no',
      NO_HIDE_DESCENDANTS: 'no-hide-descendants',
    },
    liveRegion: {
      NONE: 'none',
      POLITE: 'polite',
      ASSERTIVE: 'assertive',
    },
  },
};

// Gesture accessibility helpers
export const GestureAccessibility = {
  // Create swipe gesture accessibility props
  createSwipeProps: (direction: 'left' | 'right' | 'up' | 'down', action: string) => {
    return {
      accessibilityActions: [
        {
          name: 'activate',
          label: `${direction} yönünde kaydırarak ${action}`,
        },
      ],
    };
  },

  // Create long press accessibility props
  createLongPressProps: (action: string) => {
    return {
      accessibilityActions: [
        {
          name: 'longpress',
          label: `Uzun basarak ${action}`,
        },
      ],
    };
  },

  // Create double tap accessibility props
  createDoubleTapProps: (action: string) => {
    return {
      accessibilityActions: [
        {
          name: 'activate',
          label: `Çift dokunarak ${action}`,
        },
      ],
    };
  },
};

// Focus management helpers
export const FocusManagement = {
  // Set focus to next element
  focusNext: (refs: React.RefObject<any>[]) => {
    // Implementation for focusing next element in sequence
  },

  // Set focus to previous element
  focusPrevious: (refs: React.RefObject<any>[]) => {
    // Implementation for focusing previous element in sequence
  },

  // Trap focus within a container
  trapFocus: (containerRef: React.RefObject<any>) => {
    // Implementation for focus trapping
  },
};