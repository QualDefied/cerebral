// Test the number formatting functions
const formatNumber = (num, options) => {
  if (options?.compact) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffixIndex = 0;
    let formattedNum = num;

    while (formattedNum >= 1000 && suffixIndex < suffixes.length - 1) {
      formattedNum /= 1000;
      suffixIndex++;
    }

    const decimals = options.decimals ?? 1;
    const formatted = formattedNum.toFixed(decimals);
    return formatted.replace(/\.0+$/, '') + suffixes[suffixIndex];
  }

  const decimals = options?.decimals ?? 2;
  if (options?.forceDecimals) {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
};

// Test cases
console.log('Testing number formatting:');
console.log('1000:', formatNumber(1000, { compact: true }));
console.log('1500000:', formatNumber(1500000, { compact: true }));
console.log('2500000000:', formatNumber(2500000000, { compact: true }));
console.log('500:', formatNumber(500, { compact: false, decimals: 2 }));
console.log('500000:', formatNumber(500000, { compact: true, decimals: 2 }));
console.log('500000000:', formatNumber(500000000, { compact: true, decimals: 2 }));
