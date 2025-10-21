#!/usr/bin/env node

/**
 * UI/UX Polish Script for Blog Mobile App
 * 
 * This script checks and suggests improvements for UI/UX elements
 * to ensure a polished user experience.
 */

const fs = require('fs');
const path = require('path');

console.log('✨ Starting UI/UX Polish Check...\n');

// 1. Check for consistent styling
console.log('🎨 Checking Style Consistency...');

const checkStyleConsistency = () => {
  const themePath = path.join(__dirname, '../src/constants/themes.ts');
  const commonStylesPath = path.join(__dirname, '../src/constants/commonStyles.ts');
  
  let issues = [];
  
  if (!fs.existsSync(themePath)) {
    issues.push('Theme file not found - ensure consistent theming');
  }
  
  if (!fs.existsSync(commonStylesPath)) {
    issues.push('Common styles file not found - ensure style reusability');
  }
  
  // Check for inline styles in components (should be minimal)
  const srcDir = path.join(__dirname, '../src');
  const checkInlineStyles = (dir) => {
    const files = fs.readdirSync(dir);
    let inlineStyleCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        inlineStyleCount += checkInlineStyles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const inlineStyleMatches = content.match(/style=\{\{[^}]+\}\}/g);
        if (inlineStyleMatches) {
          inlineStyleCount += inlineStyleMatches.length;
        }
      }
    });
    
    return inlineStyleCount;
  };
  
  const inlineStyleCount = checkInlineStyles(srcDir);
  
  if (issues.length === 0) {
    console.log('   ✅ Style structure looks good');
  } else {
    issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
  }
  
  if (inlineStyleCount > 20) {
    console.log(`   ⚠️  Found ${inlineStyleCount} inline styles - consider moving to StyleSheet`);
  } else {
    console.log(`   ✅ Inline style usage is reasonable (${inlineStyleCount} found)`);
  }
};

checkStyleConsistency();

// 2. Check for accessibility improvements
console.log('\n♿ Checking Accessibility Features...');

const checkAccessibility = () => {
  const accessibilityChecks = [
    {
      pattern: /accessibilityLabel/g,
      message: 'Accessibility labels found',
      required: true
    },
    {
      pattern: /accessibilityHint/g,
      message: 'Accessibility hints found',
      required: false
    },
    {
      pattern: /accessibilityRole/g,
      message: 'Accessibility roles found',
      required: true
    }
  ];
  
  const srcDir = path.join(__dirname, '../src');
  let accessibilityFeatures = {};
  
  const scanForAccessibility = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForAccessibility(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        accessibilityChecks.forEach(check => {
          const matches = content.match(check.pattern);
          if (matches) {
            accessibilityFeatures[check.message] = (accessibilityFeatures[check.message] || 0) + matches.length;
          }
        });
      }
    });
  };
  
  scanForAccessibility(srcDir);
  
  console.log('   Accessibility features found:');
  Object.entries(accessibilityFeatures).forEach(([feature, count]) => {
    console.log(`   - ${feature}: ${count} instances`);
  });
  
  if (Object.keys(accessibilityFeatures).length === 0) {
    console.log('   ⚠️  No accessibility features found - consider adding them');
  } else {
    console.log('   ✅ Accessibility features are implemented');
  }
};

checkAccessibility();

// 3. Check for loading states and error handling
console.log('\n⏳ Checking Loading States and Error Handling...');

const checkLoadingAndErrors = () => {
  const srcDir = path.join(__dirname, '../src');
  let loadingStates = 0;
  let errorStates = 0;
  let emptyStates = 0;
  
  const scanForStates = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForStates(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for loading states
        if (content.includes('loading') || content.includes('Loading') || content.includes('isLoading')) {
          loadingStates++;
        }
        
        // Check for error states
        if (content.includes('error') || content.includes('Error') || content.includes('hasError')) {
          errorStates++;
        }
        
        // Check for empty states
        if (content.includes('empty') || content.includes('Empty') || content.includes('no data') || content.includes('No data')) {
          emptyStates++;
        }
      }
    });
  };
  
  scanForStates(srcDir);
  
  console.log(`   - Loading states found in ${loadingStates} files`);
  console.log(`   - Error states found in ${errorStates} files`);
  console.log(`   - Empty states found in ${emptyStates} files`);
  
  if (loadingStates < 5) {
    console.log('   ⚠️  Consider adding more loading states for better UX');
  }
  
  if (errorStates < 3) {
    console.log('   ⚠️  Consider adding more error handling for better UX');
  }
  
  if (emptyStates < 2) {
    console.log('   ⚠️  Consider adding empty states for better UX');
  }
  
  if (loadingStates >= 5 && errorStates >= 3 && emptyStates >= 2) {
    console.log('   ✅ Good coverage of UI states');
  }
};

checkLoadingAndErrors();

// 4. Check for animation and transitions
console.log('\n🎬 Checking Animations and Transitions...');

const checkAnimations = () => {
  const srcDir = path.join(__dirname, '../src');
  let animationCount = 0;
  
  const scanForAnimations = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForAnimations(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for animations
        const animationPatterns = [
          /Animated\./g,
          /useSharedValue/g,
          /withTiming/g,
          /withSpring/g,
          /useAnimatedStyle/g,
          /Transition/g
        ];
        
        animationPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            animationCount += matches.length;
          }
        });
      }
    });
  };
  
  scanForAnimations(srcDir);
  
  console.log(`   - Animation implementations found: ${animationCount}`);
  
  if (animationCount === 0) {
    console.log('   ⚠️  No animations found - consider adding subtle animations for better UX');
  } else if (animationCount < 5) {
    console.log('   ⚠️  Limited animations - consider adding more for polish');
  } else {
    console.log('   ✅ Good use of animations');
  }
};

checkAnimations();

// 5. UI/UX Recommendations
console.log('\n💡 UI/UX Polish Recommendations:');

const recommendations = [
  '🎨 Ensure consistent spacing using a design system (8pt grid)',
  '🔤 Use consistent typography hierarchy throughout the app',
  '🎯 Implement proper touch targets (minimum 44pt on iOS, 48dp on Android)',
  '⚡ Add micro-interactions for button presses and state changes',
  '🌙 Consider implementing dark mode support',
  '📱 Ensure responsive design works on all screen sizes',
  '🔄 Add pull-to-refresh where appropriate',
  '📊 Implement skeleton screens for better perceived performance',
  '🎭 Use consistent iconography throughout the app',
  '🚨 Ensure error messages are helpful and actionable',
  '📝 Add empty states with clear calls-to-action',
  '🔍 Implement proper search functionality with suggestions',
  '📲 Add haptic feedback for important interactions',
  '🎪 Use progressive disclosure to avoid overwhelming users',
  '🔐 Provide clear feedback for all user actions'
];

recommendations.forEach(rec => console.log(`   ${rec}`));

// 6. Performance UX Checks
console.log('\n⚡ Performance UX Considerations:');

const performanceUX = [
  '📱 App should start in under 3 seconds',
  '🔄 Lists should scroll smoothly at 60fps',
  '🖼️ Images should load progressively with placeholders',
  '📶 Offline functionality should be clearly indicated',
  '🔄 Background sync should be seamless',
  '💾 Cache management should be transparent to users',
  '🔋 Battery usage should be optimized',
  '📊 Data usage should be minimized',
  '🎯 Touch responses should be immediate (<100ms)',
  '🔄 State changes should be smooth and predictable'
];

performanceUX.forEach(perf => console.log(`   ${perf}`));

console.log('\n✨ UI/UX Polish check completed!\n');
console.log('💡 Next steps:');
console.log('   1. Review the recommendations above');
console.log('   2. Test the app on different devices and screen sizes');
console.log('   3. Conduct user testing sessions');
console.log('   4. Implement accessibility testing with screen readers');
console.log('   5. Performance test on lower-end devices');
console.log('   6. Review and update the design system documentation\n');