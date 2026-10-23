import { getDb } from '@/lib/db';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  tags: string[];
  availability: string;
  actionUrl: string;
}

export interface RecommendationMatch {
  item: CatalogItem;
  matchScore: number;
  reasons: string[];
}

export class CatalogService {
  /**
   * Retrieves active catalog items for a tenant
   */
  static getActiveCatalog(tenantId: string): CatalogItem[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, name, category, price, price_display, description, features, tags, availability, action_url
      FROM catalog_items
      WHERE tenant_id = ? AND is_active = 1
      ORDER BY price ASC
    `).all(tenantId) as Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      price_display: string;
      description: string;
      features: string;
      tags: string;
      availability: string;
      action_url: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: r.price,
      priceDisplay: r.price_display,
      description: r.description,
      features: JSON.parse(r.features || '[]'),
      tags: JSON.parse(r.tags || '[]'),
      availability: r.availability,
      actionUrl: r.action_url
    }));
  }

  /**
   * Generates grounded, structured recommendations based on visitor query or stated requirements
   */
  static getRecommendations(tenantId: string, query: string, budgetMax?: number): RecommendationMatch[] {
    const catalog = this.getActiveCatalog(tenantId);
    const normalizedQuery = query.toLowerCase();
    const matches: RecommendationMatch[] = [];

    for (const item of catalog) {
      let score = 0;
      const reasons: string[] = [];

      // Category / Name match
      if (normalizedQuery.includes(item.category.toLowerCase()) || normalizedQuery.includes(item.name.toLowerCase())) {
        score += 40;
        reasons.push(`Direct match with your focus on ${item.category}`);
      }

      // Feature keywords
      for (const feature of item.features) {
        const featureWords = feature.toLowerCase().split(' ');
        for (const word of featureWords) {
          if (word.length > 3 && normalizedQuery.includes(word)) {
            score += 15;
            reasons.push(`Provides verified feature: "${feature}"`);
            break;
          }
        }
      }

      // Tag keywords
      for (const tag of item.tags) {
        if (normalizedQuery.includes(tag.toLowerCase())) {
          score += 20;
          reasons.push(`Matches specified requirement tag: #${tag}`);
        }
      }

      // Budget evaluation
      if (budgetMax !== undefined && budgetMax > 0) {
        if (item.price <= budgetMax) {
          score += 25;
          reasons.push(`Fits within stated budget ceiling of $${budgetMax}`);
        } else {
          score -= 30; // Exceeds budget
        }
      }

      // If general intent with high relevance, add to matches
      if (score >= 20 || (matches.length === 0 && score > 0)) {
        matches.push({
          item,
          matchScore: score,
          reasons: Array.from(new Set(reasons))
        });
      }
    }

    // Sort by relevance score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // If query was generic (e.g. "what packages do you have?"), return top catalog items
    if (matches.length === 0 && catalog.length > 0) {
      return catalog.map((item) => ({
        item,
        matchScore: 50,
        reasons: [`Verified package in ${item.category}`]
      }));
    }

    return matches;
  }
}
