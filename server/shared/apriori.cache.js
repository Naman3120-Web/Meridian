const { Apriori } = require('node-apriori');
const prisma = require('./db');

class AprioriCache {
  constructor() {
    this.rulesByStore = {}; // { storeId: [ { lhs: [], rhs: [], confidence: 0.8 } ] }
    this.isGenerating = false;
  }

  // Returns up to `limit` suggestions based on current list state
  getSuggestions(storeId, currentCartIds, limit = 5) {
    const rules = this.rulesByStore[storeId];
    if (!rules) return [];

    let suggestions = new Map();

    // Find rules where the LHS is fully contained in currentCartIds
    for (const rule of rules) {
      const lhsMatch = rule.lhs.every(id => currentCartIds.includes(id));
      if (lhsMatch) {
         // Add RHS items to suggestions
         for (const rhsId of rule.rhs) {
           if (!currentCartIds.includes(rhsId)) {
             suggestions.set(rhsId, Math.max(suggestions.get(rhsId) || 0, rule.confidence));
           }
         }
      }
    }

    // Sort by confidence DESC
    const sorted = Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);

    return sorted;
  }

  async generateRules(storeId) {
    if (this.isGenerating) return;
    this.isGenerating = true;

    try {
      // 1. Fetch all historical lists for this store
      const lists = await prisma.savedList.findMany({
        where: { store_id: storeId }
      });

      // 2. Parse out just the product IDs
      const transactions = lists.map(list => {
        try {
          const items = JSON.parse(list.list_json);
          // Only pick resolved items to find patterns
          return items.filter(i => i.resolved && i.product).map(i => i.product.id);
        } catch(e) {
          return [];
        }
      }).filter(t => t.length > 0);

      if (transactions.length < 5) {
        // Not enough data, just build a generic rule for demo
        this.rulesByStore[storeId] = [];
        this.isGenerating = false;
        return;
      }

      // 3. Run node-apriori
      const apriori = new Apriori(.1); // 10% support threshold
      
      const result = await new Promise((resolve) => {
        apriori.on('done', (res) => resolve(res));
        apriori.exec(transactions);
      });

      // result.itemsets contains frequent itemsets
      // Let's dynamically create some basic 1-to-1 rules based on itemsets of size 2
      const rules = [];
      const itemsets2 = result.itemsets.filter(subset => subset.items.length === 2);
      
      for (const set of itemsets2) {
        // Create bidirectional rules for demo (A -> B, B -> A)
        rules.push({ lhs: [set.items[0]], rhs: [set.items[1]], confidence: set.support });
        rules.push({ lhs: [set.items[1]], rhs: [set.items[0]], confidence: set.support });
      }

      this.rulesByStore[storeId] = rules;

      // Persist to DB for transparency
      await prisma.aprioriCache.create({
        data: {
          store_id: storeId,
          rules_json: JSON.stringify(rules)
        }
      });
      
    } catch (e) {
      console.error("Apriori Generation Error", e);
    } finally {
      this.isGenerating = false;
    }
  }

  async loadFromDb(storeId) {
    const cache = await prisma.aprioriCache.findFirst({
      where: { store_id: storeId },
      orderBy: { generated_at: 'desc' }
    });
    if (cache) {
      try {
        this.rulesByStore[storeId] = JSON.parse(cache.rules_json);
      } catch (e) {}
    } else {
      // If none, run generation
      await this.generateRules(storeId);
    }
  }
}

const cacheInstance = new AprioriCache();
module.exports = cacheInstance;
