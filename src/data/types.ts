export type Category =
  "AI" | "Simulations" | "Applications" | "Tools" | "Learning" | "Forks";
export interface Project {
  id: string;
  repo: string;
  name: string;
  summary: string;
  category: Category;
  tags: string[];
  sourceUrl: string;
  liveUrl?: string;
  embedUrl?: string;
  embedVerified: boolean;
  status:
    | "live"
    | "reference"
    | "mobile"
    | "source"
    | "landing"
    | "unavailable"
    | "empty"
    | "archived";
  featured?: number;
  image?: string;
  images?: string[];
  attribution?: string;
  updatedAt: string;
  stars: number;
  language?: string;
  caseStudy?: {
    intro: string;
    challenge: string;
    approach: string;
    outcome: string;
    limitations: string;
  };
}
