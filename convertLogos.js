// convertLogos.js
// Run this script to convert your logo images to base64 strings
// Usage: node convertLogos.js

const fs = require('fs');
const path = require('path');

console.log('\n🔄 Converting logos to base64...\n');

try {
  const logo1Path = path.join(__dirname, 'public', 'logo1.png');
  const logo2Path = path.join(__dirname, 'public', 'logo2.png');

  // Check if files exist
  if (!fs.existsSync(logo1Path)) {
    console.error('❌ Error: logo1.png not found in public folder');
    console.log('   Expected path:', logo1Path);
    process.exit(1);
  }

  if (!fs.existsSync(logo2Path)) {
    console.error('❌ Error: logo2.png not found in public folder');
    console.log('   Expected path:', logo2Path);
    process.exit(1);
  }

  // Read and convert to base64
  const logo1Base64 = fs.readFileSync(logo1Path).toString('base64');
  const logo2Base64 = fs.readFileSync(logo2Path).toString('base64');

  console.log('✅ Logo1 size:', Math.round(logo1Base64.length / 1024), 'KB');
  console.log('✅ Logo2 size:', Math.round(logo2Base64.length / 1024), 'KB');

  // Generate the logoUtils.js content
  const output = `// src/utils/logoUtils.js
// Auto-generated logo base64 strings - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

/**
 * Logo utility for handling logos in both browser and Electron environments
 * These logos are embedded as base64 to ensure they work in all environments
 */

export const LOGO_BASE64 = {
  // Primary logo (logo2.png)
  primary: 'data:image/png;base64,${logo2Base64}',
  
  // Secondary logo (logo1.png)
  secondary: 'data:image/png;base64,${logo1Base64}'
};

/**
 * Get logo URL - works in both browser and Electron
 * @param {string} logoType - 'primary' or 'secondary'
 * @returns {string} Logo URL (base64 data URI)
 */
export const getLogoUrl = (logoType = 'primary') => {
  return LOGO_BASE64[logoType] || LOGO_BASE64.primary;
};

/**
 * Check if logos are properly configured
 * @returns {boolean} True if logos are base64 encoded
 */
export const areLogosEmbedded = () => {
  return true; // Auto-generated file always has embedded logos
};

/**
 * Get logo configuration status
 * @returns {object} Status object with details
 */
export const getLogoStatus = () => {
  return {
    embedded: true,
    message: 'Logos are embedded as base64 (recommended)',
    primarySize: '${Math.round(logo2Base64.length / 1024)} KB',
    secondarySize: '${Math.round(logo1Base64.length / 1024)} KB',
    generatedAt: '${new Date().toISOString()}'
  };
};

export default { getLogoUrl, LOGO_BASE64, areLogosEmbedded, getLogoStatus };
`;

  // Ensure src/utils directory exists
  const utilsDir = path.join(__dirname, 'src', 'utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log('📁 Created src/utils directory');
  }

  // Write to file
  const outputPath = path.join(utilsDir, 'logoUtils.js');
  fs.writeFileSync(outputPath, output);

  console.log('\n✅ SUCCESS! Logos converted and saved to src/utils/logoUtils.js');
  console.log('\n📋 Next steps:');
  console.log('   1. Import in your components: import { getLogoUrl } from "../../utils/logoUtils";');
  console.log('   2. Use in HTML: <img src="${getLogoUrl(\'primary\')}" />');
  console.log('   3. Test in browser and Electron');
  console.log('\n✨ Your logos are now embedded and will work everywhere!\n');

} catch (error) {
  console.error('\n❌ Error converting logos:', error.message);
  console.log('\nMake sure:');
  console.log('  1. You have logo1.png and logo2.png in the public folder');
  console.log('  2. The files are readable');
  console.log('  3. You have write permissions\n');
  process.exit(1);
}