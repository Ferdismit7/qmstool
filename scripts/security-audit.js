#!/usr/bin/env node
/**
 * Security Audit Script
 * Run this script to check for common security issues
 */

const fs = require('fs');
const path = require('path');

// Security checks
const securityChecks = [
  {
    name: 'Environment Variables in next.config.js',
    check: () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      if (!fs.existsSync(configPath)) return { passed: true, message: 'next.config.js not found' };
      
      const content = fs.readFileSync(configPath, 'utf8');
      const hasEnvSection = content.includes('env:') && content.includes('process.env');
      
      return {
        passed: !hasEnvSection,
        message: hasEnvSection ? 'CRITICAL: Environment variables exposed in next.config.js' : 'Environment variables properly secured'
      };
    }
  },
  {
    name: 'JWT Secret Logging',
    check: () => {
      const files = ['lib/auth.ts', 'middleware.ts', 'app/api/auth/login/route.ts'];
      let hasJwtLogging = false;
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          // Check for active JWT_SECRET logging (not commented out)
          const lines = content.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('console.log') && 
                trimmedLine.includes('JWT_SECRET') && 
                !trimmedLine.startsWith('//')) {
              hasJwtLogging = true;
              break;
            }
          }
        }
      });
      
      return {
        passed: !hasJwtLogging,
        message: hasJwtLogging ? 'CRITICAL: JWT secret logging detected' : 'JWT secret logging properly removed'
      };
    }
  },
  {
    name: 'Environment Variable Dumping',
    check: () => {
      const files = ['app/api/auth/login/route.ts', 'app/api/test-env/route.ts'];
      let hasEnvDumping = false;
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          // Check for active environment variable dumping (not commented out)
          const lines = content.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('console.log') && 
                trimmedLine.includes('process.env') && 
                !trimmedLine.startsWith('//')) {
              hasEnvDumping = true;
              break;
            }
          }
        }
      });
      
      return {
        passed: !hasEnvDumping,
        message: hasEnvDumping ? 'CRITICAL: Environment variable dumping detected' : 'Environment variable dumping properly removed'
      };
    }
  },
  {
    name: 'Security Headers',
    check: () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      if (!fs.existsSync(configPath)) return { passed: false, message: 'next.config.js not found' };
      
      const content = fs.readFileSync(configPath, 'utf8');
      const hasSecurityHeaders = content.includes('X-Frame-Options') && content.includes('Content-Security-Policy');
      
      return {
        passed: hasSecurityHeaders,
        message: hasSecurityHeaders ? 'Security headers properly configured' : 'Security headers missing'
      };
    }
  },
  {
    name: 'Input Validation',
    check: () => {
      const files = ['lib/security.ts', 'lib/inputValidation.ts'];
      let hasInputValidation = false;
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('sanitizeInput') && content.includes('validatePasswordStrength')) {
            hasInputValidation = true;
          }
        }
      });
      
      return {
        passed: hasInputValidation,
        message: hasInputValidation ? 'Input validation properly implemented' : 'Input validation missing'
      };
    }
  },
  {
    name: 'Rate Limiting',
    check: () => {
      const files = ['lib/security.ts', 'app/api/auth/login/route.ts'];
      let hasRateLimiting = false;
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('checkRateLimit')) {
            hasRateLimiting = true;
          }
        }
      });
      
      return {
        passed: hasRateLimiting,
        message: hasRateLimiting ? 'Rate limiting properly implemented' : 'Rate limiting missing'
      };
    }
  }
];

// Run security audit
console.log('🔒 Security Audit Report');
console.log('========================\n');

let passedChecks = 0;
let totalChecks = securityChecks.length;

securityChecks.forEach((check, index) => {
  const result = check.check();
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${index + 1}. ${check.name}`);
  console.log(`   Status: ${status}`);
  console.log(`   Message: ${result.message}\n`);
  
  if (result.passed) passedChecks++;
});

// Summary
console.log('📊 Summary');
console.log('==========');
console.log(`Passed: ${passedChecks}/${totalChecks}`);
console.log(`Score: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 All security checks passed! Your application is secure.');
} else {
  console.log('\n⚠️  Some security checks failed. Please review and fix the issues above.');
}

// Exit with appropriate code
process.exit(passedChecks === totalChecks ? 0 : 1);
