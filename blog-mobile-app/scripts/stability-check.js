#!/usr/bin/env node

/**
 * Stability Check Script for Blog Mobile App
 * 
 * This script identifies potential stability issues and suggests fixes
 * to improve app reliability and crash prevention.
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️ Starting Stability and Bug Prevention Check...\n');

// 1. Check for proper error boundaries
console.log('🚨 Checking Error Boundaries...');

const checkErrorBoundaries = () => {
  const srcDir = path.join(__dirname, '../src');
  let errorBoundaryFound = false;
  let componentCount = 0;
  
  const scanForErrorBoundaries = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForErrorBoundaries(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('componentDidCatch') || content.includes('ErrorBoundary')) {
          errorBoundaryFound = true;
        }
        
        // Count React components
        if (content.includes('export default') && (content.includes('function') || content.includes('const'))) {
          componentCount++;
        }
      }
    });
  };
  
  scanForErrorBoundaries(srcDir);
  
  if (errorBoundaryFound) {
    console.log('   ✅ Error boundaries are implemented');
  } else {
    console.log('   ⚠️  No error boundaries found - implement them to prevent crashes');
  }
  
  console.log(`   - Total components found: ${componentCount}`);
};

checkErrorBoundaries();

// 2. Check for memory leak patterns
console.log('\n🧠 Checking for Memory Leak Patterns...');

const checkMemoryLeaks = () => {
  const srcDir = path.join(__dirname, '../src');
  let potentialLeaks = [];
  
  const memoryLeakPatterns = [
    {
      pattern: /addEventListener/g,
      cleanup: /removeEventListener/g,
      type: 'Event Listeners'
    },
    {
      pattern: /setInterval/g,
      cleanup: /clearInterval/g,
      type: 'Intervals'
    },
    {
      pattern: /setTimeout/g,
      cleanup: /clearTimeout/g,
      type: 'Timeouts'
    },
    {
      pattern: /subscribe/g,
      cleanup: /unsubscribe/g,
      type: 'Subscriptions'
    }
  ];
  
  const scanForLeaks = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForLeaks(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        memoryLeakPatterns.forEach(pattern => {
          const creates = content.match(pattern.pattern);
          const cleanups = content.match(pattern.cleanup);
          
          if (creates && creates.length > 0) {
            const createCount = creates.length;
            const cleanupCount = cleanups ? cleanups.length : 0;
            
            if (cleanupCount < createCount) {
              potentialLeaks.push({
                file: filePath.replace(path.join(__dirname, '../'), ''),
                type: pattern.type,
                creates: createCount,
                cleanups: cleanupCount
              });
            }
          }
        });
      }
    });
  };
  
  scanForLeaks(srcDir);
  
  if (potentialLeaks.length === 0) {
    console.log('   ✅ No obvious memory leak patterns found');
  } else {
    console.log('   ⚠️  Potential memory leaks found:');
    potentialLeaks.forEach(leak => {
      console.log(`      - ${leak.file}: ${leak.type} (${leak.creates} creates, ${leak.cleanups} cleanups)`);
    });
  }
};

checkMemoryLeaks();

// 3. Check for proper null/undefined handling
console.log('\n🔍 Checking Null/Undefined Safety...');

const checkNullSafety = () => {
  const srcDir = path.join(__dirname, '../src');
  let unsafeAccess = [];
  let safetyPatterns = 0;
  
  const scanForNullSafety = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForNullSafety(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for safe patterns
        const safePatterns = [
          /\?\./g,  // Optional chaining
          /\?\?/g,  // Nullish coalescing
          /if\s*\([^)]*\s*&&/g,  // Conditional checks
        ];
        
        safePatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            safetyPatterns += matches.length;
          }
        });
        
        // Check for potentially unsafe patterns
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          // Look for direct property access without checks
          if (line.includes('.') && !line.includes('?.') && !line.includes('//')) {
            const propertyAccess = line.match(/\w+\.\w+/g);
            if (propertyAccess && !line.includes('if') && !line.includes('&&')) {
              // This is a simplified check - in reality, you'd need more sophisticated analysis
              // unsafeAccess.push({ file: filePath, line: index + 1, content: line.trim() });
            }
          }
        });
      }
    });
  };
  
  scanForNullSafety(srcDir);
  
  console.log(`   - Safe access patterns found: ${safetyPatterns}`);
  
  if (safetyPatterns > 50) {
    console.log('   ✅ Good use of safe access patterns');
  } else {
    console.log('   ⚠️  Consider using more optional chaining and null checks');
  }
};

checkNullSafety();

// 4. Check for proper async/await error handling
console.log('\n⚡ Checking Async Error Handling...');

const checkAsyncErrorHandling = () => {
  const srcDir = path.join(__dirname, '../src');
  let asyncFunctions = 0;
  let tryCatchBlocks = 0;
  
  const scanForAsyncHandling = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForAsyncHandling(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count async functions
        const asyncMatches = content.match(/async\s+\w+/g);
        if (asyncMatches) {
          asyncFunctions += asyncMatches.length;
        }
        
        // Count try-catch blocks
        const tryCatchMatches = content.match(/try\s*\{/g);
        if (tryCatchMatches) {
          tryCatchBlocks += tryCatchMatches.length;
        }
      }
    });
  };
  
  scanForAsyncHandling(srcDir);
  
  console.log(`   - Async functions found: ${asyncFunctions}`);
  console.log(`   - Try-catch blocks found: ${tryCatchBlocks}`);
  
  if (asyncFunctions > 0 && tryCatchBlocks / asyncFunctions >= 0.7) {
    console.log('   ✅ Good async error handling coverage');
  } else if (asyncFunctions > 0) {
    console.log('   ⚠️  Consider adding more try-catch blocks for async functions');
  }
};

checkAsyncErrorHandling();

// 5. Check for proper component lifecycle management
console.log('\n🔄 Checking Component Lifecycle Management...');

const checkLifecycleManagement = () => {
  const srcDir = path.join(__dirname, '../src');
  let useEffectCount = 0;
  let cleanupCount = 0;
  
  const scanForLifecycle = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanForLifecycle(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count useEffect hooks
        const useEffectMatches = content.match(/useEffect\s*\(/g);
        if (useEffectMatches) {
          useEffectCount += useEffectMatches.length;
        }
        
        // Count cleanup functions (return statements in useEffect)
        const cleanupMatches = content.match(/return\s*\(\s*\)\s*=>/g);
        if (cleanupMatches) {
          cleanupCount += cleanupMatches.length;
        }
      }
    });
  };
  
  scanForLifecycle(srcDir);
  
  console.log(`   - useEffect hooks found: ${useEffectCount}`);
  console.log(`   - Cleanup functions found: ${cleanupCount}`);
  
  if (useEffectCount > 0 && cleanupCount / useEffectCount >= 0.3) {
    console.log('   ✅ Good cleanup function usage');
  } else if (useEffectCount > 0) {
    console.log('   ⚠️  Consider adding cleanup functions to more useEffect hooks');
  }
};

checkLifecycleManagement();

// 6. Stability Recommendations
console.log('\n🛡️ Stability Improvement Recommendations:');

const stabilityRecommendations = [
  '🚨 Implement error boundaries at key component levels',
  '🧠 Add proper cleanup in useEffect hooks',
  '🔍 Use optional chaining (?.) for object property access',
  '⚡ Wrap async operations in try-catch blocks',
  '📱 Test app behavior during interruptions (calls, notifications)',
  '🔄 Implement proper loading and error states',
  '💾 Handle storage quota exceeded scenarios',
  '📶 Gracefully handle network connectivity changes',
  '🔋 Optimize for low battery scenarios',
  '📱 Test on devices with limited memory',
  '🎯 Implement proper input validation',
  '🔐 Secure sensitive data properly',
  '📊 Monitor crash rates and performance metrics',
  '🔄 Implement automatic retry mechanisms',
  '🚫 Prevent multiple simultaneous API calls'
];

stabilityRecommendations.forEach(rec => console.log(`   ${rec}`));

// 7. Common Bug Prevention Patterns
console.log('\n🐛 Common Bug Prevention Patterns:');

const bugPreventionPatterns = [
  '✅ Always check if component is mounted before setState',
  '✅ Use keys properly in FlatList and map operations',
  '✅ Validate props with TypeScript interfaces',
  '✅ Handle edge cases in user input',
  '✅ Test with empty, null, and undefined data',
  '✅ Implement proper form validation',
  '✅ Handle API response variations',
  '✅ Test offline scenarios thoroughly',
  '✅ Implement proper deep linking validation',
  '✅ Handle orientation changes gracefully',
  '✅ Test with different system font sizes',
  '✅ Validate date and time handling across timezones',
  '✅ Test with special characters and emojis',
  '✅ Handle concurrent user actions properly',
  '✅ Implement proper cache invalidation'
];

bugPreventionPatterns.forEach(pattern => console.log(`   ${pattern}`));

console.log('\n🛡️ Stability check completed!\n');
console.log('💡 Next steps for stability:');
console.log('   1. Address any issues found above');
console.log('   2. Implement comprehensive error logging');
console.log('   3. Set up crash reporting (Crashlytics)');
console.log('   4. Create automated stability tests');
console.log('   5. Conduct stress testing on various devices');
console.log('   6. Monitor app performance in production\n');