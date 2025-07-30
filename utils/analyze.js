class JSFileAnalyzer {
  constructor(keywords = [], weights = {}) {
    this.keywords = keywords;
    this.weights = weights;
    this.thresholds = {
      high: 0.7,
      medium: 0.4,
      low: 0.1
    };
  }

  // Modified to work with File objects in the browser
  async analyzeFile(file) {
    try {
      const content = await this.readFileContent(file);
      return this.analyzeContent(content, file.name);
    } catch (err) {
      return {
        error: `Error reading file: ${err.message}`,
        score: 0,
        confidence: 'none'
      };
    }
  }

  // Helper method to read file content in browser
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  analyzeContent(content, fileName = '') {
    const results = {
      fileName,
      keywordMatches: {},
      totalScore: 0,
      confidence: 'low'
    };

    this.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      
      results.keywordMatches[keyword] = count;
      results.totalScore += count * (this.weights[keyword] || 1);
    });

    const maxPossibleScore = this.keywords.reduce((sum, kw) => sum + (this.weights[kw] || 1), 0);
    const normalizedScore = maxPossibleScore > 0 ? results.totalScore / maxPossibleScore : 0;

    if (normalizedScore >= this.thresholds.high) {
      results.confidence = 'high';
    } else if (normalizedScore >= this.thresholds.medium) {
      results.confidence = 'medium';
    }

    results.normalizedScore = normalizedScore;
    
    return results;
  }
}

// Export options:

// Option 1: Export the class directly
export default JSFileAnalyzer;

// Option 2: Export a pre-configured instance
const defaultKeywords = ['eval', 'innerHTML', 'localStorage', 'XMLHttpRequest', 'postMessage'];
const defaultWeights = {
  'eval': 2,
  'innerHTML': 1.5,
  'localStorage': 1,
  'XMLHttpRequest': 1
};

export const defaultAnalyzer = new JSFileAnalyzer(defaultKeywords, defaultWeights);

// Option 3: Export helper functions
export async function analyzeFile(file, keywords, weights) {
  const analyzer = new JSFileAnalyzer(keywords, weights);
  return await analyzer.analyzeFile(file);
}